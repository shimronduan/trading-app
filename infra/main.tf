terraform {
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
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Data sources
data "azurerm_client_config" "current" {}

# Variables
variable "environment_name" {
  description = "Name of the environment that can be used as part of naming resource convention"
  type        = string
}

variable "location" {
  description = "Primary location for all resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = ""
}

variable "binance_api_key" {
  description = "Binance API Key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "binance_api_secret" {
  description = "Binance API Secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "azure_api_base_url" {
  description = "Azure API Base URL"
  type        = string
  default     = ""
}

variable "azure_api_key" {
  description = "Azure API Key"
  type        = string
  default     = ""
}

variable "use_mock_data" {
  description = "Use mock data for development"
  type        = string
  default     = "false"
}

# Local values
locals {
  resource_group_name = var.resource_group_name != "" ? var.resource_group_name : "rg-${var.environment_name}"
  tags = {
    "azd-env-name" = var.environment_name
  }
}

# Resource Group
resource "azurecaf_name" "resource_group" {
  name          = var.environment_name
  resource_type = "azurerm_resource_group"
}

resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location
  tags     = local.tags
}

# Log Analytics Workspace (Free tier - 5GB/month included)
resource "azurecaf_name" "log_analytics" {
  name          = var.environment_name
  resource_type = "azurerm_log_analytics_workspace"
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = azurecaf_name.log_analytics.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 7 # Reduced to 7 days for free tier
  tags                = local.tags

  allow_resource_only_permissions = false
  daily_quota_gb                  = -1
  internet_ingestion_enabled      = true
  internet_query_enabled          = true
}

# Application Insights (Free tier - 1GB/month included)
resource "azurecaf_name" "app_insights" {
  name          = var.environment_name
  resource_type = "azurerm_application_insights"
}

resource "azurerm_application_insights" "main" {
  name                = azurecaf_name.app_insights.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  tags                = local.tags
}

# User-assigned managed identity (Free)
resource "azurecaf_name" "managed_identity" {
  name          = var.environment_name
  resource_type = "azurerm_user_assigned_identity"
}

resource "azurerm_user_assigned_identity" "main" {
  name                = azurecaf_name.managed_identity.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

# App Service Plan (Free F1 tier - completely free!)
resource "azurecaf_name" "app_service_plan" {
  name          = var.environment_name
  resource_type = "azurerm_service_plan"
}

resource "azurerm_service_plan" "main" {
  name                = azurecaf_name.app_service_plan.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Windows" # Required for Free tier
  sku_name            = "F1"      # Free tier
  tags                = local.tags
}

# App Service (Free tier)
resource "azurecaf_name" "app_service" {
  name          = var.environment_name
  resource_type = "azurerm_windows_web_app"
}

resource "azurerm_windows_web_app" "main" {
  name                = azurecaf_name.app_service.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  tags = merge(local.tags, {
    "azd-service-name" = "trading-app"
  })

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.main.id]
  }

  site_config {
    always_on = false # Must be false for Free tier

    application_stack {
      node_version = "~18"
    }

    cors {
      allowed_origins     = ["*"]
      support_credentials = false
    }
  }

  app_settings = {
    "NEXT_PUBLIC_BINANCE_API_KEY"           = var.binance_api_key
    "BINANCE_API_SECRET"                    = var.binance_api_secret
    "NEXT_PUBLIC_AZURE_API_BASE_URL"        = var.azure_api_base_url
    "NEXT_PUBLIC_AZURE_API_KEY"             = var.azure_api_key
    "NEXT_PUBLIC_USE_MOCK_DATA"             = var.use_mock_data
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "WEBSITE_NODE_DEFAULT_VERSION"          = "~18"
    "SCM_DO_BUILD_DURING_DEPLOYMENT"        = "true"
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
