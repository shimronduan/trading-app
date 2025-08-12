# Terraform State Management Guide

## Current State Status

❌ **No remote state backend configured** - Your Terraform state is currently stored locally as `terraform.tfstate` files.

## Why You Need Remote State

### Problems with Local State:
- **Lost on CI/CD**: GitHub Actions runners are ephemeral, state gets lost
- **No Collaboration**: Multiple developers can't share state
- **No Locking**: Risk of concurrent modifications corrupting state
- **No Backup**: State loss means manual resource tracking

### Benefits of Remote State:
- ✅ **Persistent Storage**: State survives across deployments
- ✅ **Team Collaboration**: Shared state for all developers
- ✅ **State Locking**: Prevents concurrent modifications
- ✅ **Versioning**: Track state changes over time
- ✅ **Security**: Encrypted state storage

## Setup Remote State Backend

### Option 1: Automated Setup (Recommended)

Run the provided script to automatically create the Azure Storage Account:

```bash
# Make sure you're logged into Azure
az login

# Run the setup script
./setup-terraform-state.sh
```

The script will:
1. Create a resource group for Terraform state
2. Create an Azure Storage Account with a unique name
3. Create a blob container for state files
4. Output the configuration you need

### Option 2: Manual Setup

1. **Create Resource Group**:
```bash
az group create \
  --name "rg-terraform-state" \
  --location "East US"
```

2. **Create Storage Account**:
```bash
# Replace 'yourname' with something unique
STORAGE_ACCOUNT="tfstateyourname$(date +%s)"

az storage account create \
  --resource-group "rg-terraform-state" \
  --name "$STORAGE_ACCOUNT" \
  --sku Standard_LRS \
  --encryption-services blob
```

3. **Create Blob Container**:
```bash
az storage container create \
  --name "tfstate" \
  --account-name "$STORAGE_ACCOUNT"
```

## Configure Terraform Backend

After creating the storage account, update `infra/main.tf`:

```hcl
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
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "YOUR_STORAGE_ACCOUNT_NAME"  # From setup script
    container_name       = "tfstate"
    key                  = "trading-app.terraform.tfstate"
  }
}
```

## Migrate Existing State

If you already have local state files:

```bash
# Initialize with the new backend
cd infra
terraform init

# Terraform will ask if you want to migrate - say yes
# This copies your local state to the remote backend
```

## GitHub Actions Configuration

Your workflow is already configured to handle remote state authentication via these environment variables:
- `ARM_CLIENT_ID`
- `ARM_CLIENT_SECRET` 
- `ARM_SUBSCRIPTION_ID`
- `ARM_TENANT_ID`

These are automatically extracted from your `AZURE_CREDENTIALS` secret.

## State File Locations

### Before Remote Backend:
```
infra/
├── terraform.tfstate          # Current state (local)
├── terraform.tfstate.backup   # Previous state (local)
└── .terraform/                 # Provider cache
```

### After Remote Backend:
```
Azure Storage Account: tfstatesa17329
├── Resource Group: tfstate-rg
├── Container: trading-app
    └── terraform.tfstate  # Remote state file
```

Local directory only contains:
```
infra/
└── .terraform/                 # Provider cache and backend config
```

## Security Considerations

### State File Contents:
- Contains **all resource information**
- May include **sensitive values** (API keys, passwords)
- Shows **resource relationships** and metadata

### Protection Measures:
- ✅ Storage account has **private access only**
- ✅ State is **encrypted at rest** in Azure Storage
- ✅ Access controlled via **Azure RBAC**
- ✅ **HTTPS-only** communication
- ✅ **TLS 1.2** minimum encryption

## Troubleshooting

### Common Issues:

1. **"Backend initialization required"**
   ```bash
   cd infra
   terraform init
   ```

2. **"State lock acquisition failed"**
   ```bash
   # If process was interrupted, force unlock
   terraform force-unlock LOCK_ID
   ```

3. **"Storage account not found"**
   - Verify storage account name in backend config
   - Check if storage account exists: `az storage account show --name ACCOUNT_NAME`

4. **"Authentication failed"**
   - Verify service principal has Storage Blob Data Contributor role
   - Check ARM_* environment variables are set

### Verification Commands:

```bash
# Check current backend configuration
terraform init
terraform state list

# Verify remote state location
az storage blob list \
  --container-name tfstate \
  --account-name YOUR_STORAGE_ACCOUNT

# Check state file size and modification date
az storage blob show \
  --container-name tfstate \
  --name trading-app.terraform.tfstate \
  --account-name YOUR_STORAGE_ACCOUNT
```

## Cost Impact

### Azure Storage Account Costs:
- **Storage**: ~$0.02/month for state files (typically < 1MB)
- **Transactions**: ~$0.01/month for read/write operations
- **Total**: < $0.05/month (well within free tier allowances)

The remote state storage cost is negligible compared to the benefits of proper state management.

## Next Steps

1. ✅ Run `./setup-terraform-state.sh` 
2. ✅ Update `infra/main.tf` with backend configuration
3. ✅ Run `terraform init` to migrate state
4. ✅ Commit changes to Git
5. ✅ Test deployment via GitHub Actions

After completing these steps, your Terraform deployments will be much more reliable and suitable for production use.
