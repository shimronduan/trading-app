variable "resource_group_name" {
  description = "The name of the existing Azure Resource Group."
  type        = string
}

variable "location" {
  description = "The Azure region for resources."
  type        = string
}

variable "app_service_plan_name" {
  description = "The name of the App Service Plan."
  type        = string
  default     = "trading-bot-app-v3-plan"
}

variable "web_app_name" {
  description = "The name of the Web App."
  type        = string
  default     = "trading-bot-v3-webapp"
}

variable "linux_fx_version" {
  description = "The runtime stack for the Web App."
  type        = string
  default     = "NODE|20-lts"
}
