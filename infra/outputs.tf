# Outputs
output "RESOURCE_GROUP_ID" {
  description = "The ID of the resource group"
  value       = azurerm_resource_group.main.id
}

output "AZURE_LOCATION" {
  description = "The Azure location where resources are deployed"
  value       = azurerm_resource_group.main.location
}

output "SERVICE_TRADING_APP_IDENTITY_PRINCIPAL_ID" {
  description = "The principal ID of the managed identity"
  value       = azurerm_user_assigned_identity.main.principal_id
}

output "SERVICE_TRADING_APP_NAME" {
  description = "The name of the App Service"
  value       = azurerm_windows_web_app.main.name
}

output "SERVICE_TRADING_APP_URI" {
  description = "The URI of the deployed App Service"
  value       = "https://${azurerm_windows_web_app.main.default_hostname}"
}

output "APPLICATIONINSIGHTS_CONNECTION_STRING" {
  description = "The connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}
