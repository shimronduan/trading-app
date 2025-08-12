#!/bin/bash
# Setup Terraform Remote State Backend in Azure
# Run this script once to create the storage account for Terraform state

set -e

# Configuration
RESOURCE_GROUP_NAME="tfstate-rg"
STORAGE_ACCOUNT_NAME="tfstatesa17329"
CONTAINER_NAME="trading-app"
LOCATION="East US"

echo "🚀 Setting up Terraform remote state backend..."
echo "Resource Group: $RESOURCE_GROUP_NAME"
echo "Storage Account: $STORAGE_ACCOUNT_NAME"
echo "Container: $CONTAINER_NAME"
echo "Location: $LOCATION"
echo ""

# Check if logged in to Azure
if ! az account show > /dev/null 2>&1; then
    echo "❌ Please log in to Azure first: az login"
    exit 1
fi

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "📋 Using subscription: $SUBSCRIPTION_ID"

# Create resource group
echo "📁 Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP_NAME" \
    --location "$LOCATION" \
    --tags purpose=terraform-state environment=shared

# Create storage account
echo "💾 Creating storage account..."
az storage account create \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$STORAGE_ACCOUNT_NAME" \
    --sku Standard_LRS \
    --encryption-services blob \
    --https-only true \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access false

# Get storage account key
echo "🔑 Getting storage account key..."
ACCOUNT_KEY=$(az storage account keys list \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --query '[0].value' -o tsv)

# Create container
echo "📦 Creating blob container..."
az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$ACCOUNT_KEY" \
    --public-access off

echo ""
echo "✅ Terraform state backend setup complete!"
echo ""
echo "📋 Backend Configuration:"
echo "=========================="
echo "Resource Group:    $RESOURCE_GROUP_NAME"
echo "Storage Account:   $STORAGE_ACCOUNT_NAME" 
echo "Container:         $CONTAINER_NAME"
echo "Subscription ID:   $SUBSCRIPTION_ID"
echo ""
echo "🔧 Next Steps:"
echo "1. Update infra/main.tf with the backend configuration:"
echo ""
echo "terraform {"
echo "  backend \"azurerm\" {"
echo "    resource_group_name  = \"$RESOURCE_GROUP_NAME\""
echo "    storage_account_name = \"$STORAGE_ACCOUNT_NAME\""
echo "    container_name       = \"$CONTAINER_NAME\""
echo "    key                  = \"trading-app.terraform.tfstate\""
echo "  }"
echo "}"
echo ""
echo "2. Add these secrets to your GitHub repository:"
echo ""
echo "ARM_CLIENT_ID:       $(echo '${{ secrets.AZURE_CREDENTIALS }}' | jq -r .clientId)"
echo "ARM_CLIENT_SECRET:   $(echo '${{ secrets.AZURE_CREDENTIALS }}' | jq -r .clientSecret)"
echo "ARM_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "ARM_TENANT_ID:       $(echo '${{ secrets.AZURE_CREDENTIALS }}' | jq -r .tenantId)"
echo ""
echo "3. Run 'terraform init' to migrate to remote state"
echo ""
echo "💡 Save this information - you'll need it for GitHub Actions!"
