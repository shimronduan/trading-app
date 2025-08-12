provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "trading-bot-v3-rg"
}

# Find the existing Linux App Service Plan
data "azurerm_service_plan" "asp" {
  name                = "trading-bot-app-v3-plan"
  resource_group_name = data.azurerm_resource_group.rg.name
}

  
resource "azurerm_linux_web_app" "main" {
  name                = var.web_app_name
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  service_plan_id     = data.azurerm_service_plan.asp.id
  site_config {
    linux_fx_version = var.linux_fx_version
  }
}
