# Variables for environment configuration
variable "environment_name" {
  description = "Name of the environment"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "binance_api_key" {
  description = "Binance API Key"
  type        = string
  sensitive   = true
}

variable "binance_api_secret" {
  description = "Binance API Secret"
  type        = string
  sensitive   = true
}

variable "azure_api_base_url" {
  description = "Azure API Base URL"
  type        = string
  sensitive   = true
}

variable "azure_api_key" {
  description = "Azure API Key"
  type        = string
  sensitive   = true
}

variable "use_mock_data" {
  description = "Use mock data flag"
  type        = string
  default     = "false"
}

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0"
    }
    azurecaf = {
      source  = "aztfmod/azurecaf"
      version = "~>1.2"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstatesa17329"
    container_name       = "trading-app"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

# Naming convention using azurecaf
locals {
  environment_name = var.environment_name
  location         = var.location
}

resource "azurecaf_name" "resource_group" {
  name          = local.environment_name
  resource_type = "azurerm_resource_group"
}

resource "azurecaf_name" "app_service_plan" {
  name          = local.environment_name
  resource_type = "azurerm_service_plan"
}

resource "azurecaf_name" "web_app" {
  name          = "trading-app"
  resource_type = "azurerm_windows_web_app"
  suffixes      = [local.environment_name]
}

resource "azurecaf_name" "log_analytics" {
  name          = local.environment_name
  resource_type = "azurerm_log_analytics_workspace"
}

resource "azurecaf_name" "app_insights" {
  name          = local.environment_name
  resource_type = "azurerm_application_insights"
}

resource "azurecaf_name" "user_assigned_identity" {
  name          = local.environment_name
  resource_type = "azurerm_user_assigned_identity"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = azurecaf_name.resource_group.result
  location = local.location

  tags = {
    environment      = local.environment_name
    "azd-env-name"  = local.environment_name
  }
}

# Log Analytics Workspace (Free tier - 7 day retention)
resource "azurerm_log_analytics_workspace" "main" {
  name                = azurecaf_name.log_analytics.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Free"
  retention_in_days   = 7

  tags = {
    environment = local.environment_name
  }
}

# Application Insights (Free tier)
resource "azurerm_application_insights" "main" {
  name                = azurecaf_name.app_insights.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  sampling_percentage = 100

  tags = {
    environment = local.environment_name
  }
}

# User Assigned Managed Identity
resource "azurerm_user_assigned_identity" "main" {
  name                = azurecaf_name.user_assigned_identity.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    environment = local.environment_name
  }
}

# App Service Plan (Free F1 tier)
resource "azurerm_service_plan" "main" {
  name                = azurecaf_name.app_service_plan.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Windows"
  sku_name            = "F1"

  tags = {
    environment = local.environment_name
  }
}

# Windows Web App (Free tier compatible)
resource "azurerm_windows_web_app" "main" {
  name                = azurecaf_name.web_app.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.main.id]
  }

  site_config {
    always_on         = false # Free tier doesn't support always_on
    http2_enabled     = true
    minimum_tls_version = "1.2"
    
    application_stack {
      node_version = "~18"
    }

    cors {
      allowed_origins = ["*"]
      support_credentials = false
    }
  }

  app_settings = {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.main.instrumentation_key
    "NEXT_PUBLIC_BINANCE_API_KEY"          = var.binance_api_key
    "BINANCE_API_SECRET"                    = var.binance_api_secret
    "NEXT_PUBLIC_AZURE_API_BASE_URL"       = var.azure_api_base_url
    "NEXT_PUBLIC_AZURE_API_KEY"            = var.azure_api_key
    "NEXT_PUBLIC_USE_MOCK_DATA"            = var.use_mock_data
    "SCM_DO_BUILD_DURING_DEPLOYMENT"      = "true"
    "WEBSITE_NODE_DEFAULT_VERSION"         = "~18"
  }

  tags = {
    environment = local.environment_name
  }
}

# Diagnostic Settings for App Service
resource "azurerm_monitor_diagnostic_setting" "app_service" {
  name                       = "${azurerm_windows_web_app.main.name}-diagnostics"
  target_resource_id         = azurerm_windows_web_app.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }

  enabled_log {
    category = "AppServiceConsoleLogs"
  }

  enabled_log {
    category = "AppServiceAppLogs"
  }
}
