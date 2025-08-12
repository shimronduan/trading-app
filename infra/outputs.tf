output "web_app_name" {
  value = azurerm_linux_web_app.main.name
}

output "web_app_default_hostname" {
  value = azurerm_linux_web_app.main.default_hostname
}
