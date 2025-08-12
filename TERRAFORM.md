# 🔧 Terraform Infrastructure Guide

Your trading app now uses **Terraform** for infrastructure as code! Here's what you need to know.

## 📁 Terraform Files Structure

```
infra/
├── main.tf           # Main infrastructure definition
├── outputs.tf        # Output values
└── main.tfvars.json  # Variable values (populated by AZD)
```

## 🏗️ Infrastructure Components

### Terraform Resources Created

| Resource | Purpose | Free Tier Limits |
|----------|---------|------------------|
| `azurerm_resource_group` | Container for all resources | Free |
| `azurerm_service_plan` | F1 Free App Service Plan | 60 CPU min/day, 165MB bandwidth/day |
| `azurerm_windows_web_app` | Hosts your Next.js app | 1GB storage |
| `azurerm_application_insights` | Application monitoring | 1GB/month telemetry |
| `azurerm_log_analytics_workspace` | Centralized logging | 5GB/month ingestion |
| `azurerm_user_assigned_identity` | Secure Azure access | Free |
| `azurerm_monitor_diagnostic_setting` | App logs to Log Analytics | Free |

### Resource Naming Convention

All resources use **Azure CAF (Cloud Adoption Framework)** naming with the `azurecaf` provider:

- **Pattern**: `{service}-{environment_name}-{random_suffix}`
- **Example**: `app-trading-prod-a1b2c3`

## 🚀 Deployment Methods

### 1. Automatic (GitHub Actions)
- Push to `main` branch
- GitHub Actions runs `azd up` which uses Terraform

### 2. Manual (Local)
```bash
# Prerequisites
az login
azd auth login

# Deploy
azd init
azd provision  # Runs terraform apply
azd deploy     # Deploys your app
```

### 3. Pure Terraform (Advanced)
```bash
cd infra/

# Initialize
terraform init

# Plan (optional)
terraform plan -var-file="main.tfvars.json"

# Apply
terraform apply -var-file="main.tfvars.json"
```

## 🔧 Terraform Provider Versions

- **AzureRM**: `>= 4.0` (Latest features and free tier support)
- **AzureCAF**: `~> 1.2` (Consistent resource naming)

## 📊 Cost Optimization Features

### Terraform-Specific Optimizations

```hcl
# Free F1 App Service Plan
resource "azurerm_service_plan" "main" {
  sku_name = "F1"      # Free tier
  os_type  = "Windows" # Required for F1
}

# Reduced log retention for free tier
resource "azurerm_log_analytics_workspace" "main" {
  retention_in_days = 7  # Minimized for free tier
}

# Always off for free tier
site_config {
  always_on = false  # Required for F1
}
```

## 🔍 Monitoring Your Infrastructure

### Terraform State
- Managed by Azure Developer CLI
- State stored locally (for this setup)
- Use `terraform show` to view current state

### Resource Status
```bash
# Check deployment status
azd show

# View Terraform state
cd infra && terraform show

# List all resources
az resource list --resource-group rg-your-env-name
```

## 🛠️ Customization

### Adding Resources

1. **Edit `infra/main.tf`**:
```hcl
# Example: Add Azure Key Vault
resource "azurecaf_name" "key_vault" {
  name          = var.environment_name
  resource_type = "azurerm_key_vault"
}

resource "azurerm_key_vault" "main" {
  name                = azurecaf_name.key_vault.result
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
}
```

2. **Update `outputs.tf`** if needed
3. **Run `azd provision`** to apply changes

### Environment Variables

Variables are automatically populated from environment variables:

```json
{
  "environment_name": "${AZURE_ENV_NAME}",
  "binance_api_key": "${NEXT_PUBLIC_BINANCE_API_KEY}",
  // ... etc
}
```

## 🚨 Troubleshooting

### Common Terraform Issues

1. **Provider Version Conflicts**:
   ```bash
   cd infra
   terraform init -upgrade
   ```

2. **State Lock Issues**:
   ```bash
   # If deployment fails midway
   cd infra
   terraform force-unlock <lock-id>
   ```

3. **Resource Naming Conflicts**:
   - Change `environment_name` variable
   - Resource names are globally unique

### Debugging Commands

```bash
# Check Terraform version
terraform version

# Validate configuration
cd infra && terraform validate

# Check what will be created
cd infra && terraform plan -var-file="main.tfvars.json"

# Show current state
cd infra && terraform show
```

## 🔄 Upgrading

### From Free to Paid Tier

Edit `infra/main.tf`:

```hcl
resource "azurerm_service_plan" "main" {
  # Change from F1 to B1 for $13/month
  sku_name = "B1"
  os_type  = "Linux"  # Can use Linux with paid tiers
}

resource "azurerm_linux_web_app" "main" {
  # Change to Linux app for better performance
  # Update site_config accordingly
}
```

Then run: `azd provision` to apply changes.

## 📚 Learn More

- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure CAF Naming](https://registry.terraform.io/providers/aztfmod/azurecaf/latest/docs)
- [Azure Developer CLI with Terraform](https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/)

---

Your infrastructure is now managed as code with Terraform! 🎉
