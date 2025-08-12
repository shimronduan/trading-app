# Terraform Azure Deployment Guide

This project uses pure Terraform for Azure deployment without Azure Developer CLI (azd).

## Architecture Overview

- **Azure App Service** (F1 Free tier) - Hosts the Next.js trading application
- **Application Insights** (Free tier) - Application monitoring and logging  
- **Log Analytics Workspace** (Free tier, 7-day retention) - Centralized logging
- **User-Assigned Managed Identity** - Secure authentication between services

## Prerequisites

1. **Azure Account**: Free tier subscription
2. **GitHub Repository**: With production environment configured
3. **Service Principal**: For GitHub Actions authentication

## GitHub Environment Setup

### Required Repository Variables

In your GitHub repository, go to Settings → Environments → production and add:

```
AZURE_ENV_NAME=trading-app-prod  # Your environment name
AZURE_LOCATION=East US           # Azure region
```

### Required Repository Secrets

Add these secrets to the production environment:

```
AZURE_CREDENTIALS={
  "clientId": "your-service-principal-client-id",
  "clientSecret": "your-service-principal-client-secret", 
  "subscriptionId": "your-azure-subscription-id",
  "tenantId": "your-azure-tenant-id"
}

NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
NEXT_PUBLIC_AZURE_API_BASE_URL=https://your-app.azurewebsites.net
NEXT_PUBLIC_AZURE_API_KEY=your_azure_api_key
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Deployment Process

1. **Push to main branch** - Triggers the GitHub Actions workflow
2. **Build phase** - Installs dependencies and builds the Next.js app
3. **Deploy phase** - Uses Terraform to provision Azure resources and deploys the app

## Manual Deployment (Local)

If you want to deploy manually from your local machine:

### 1. Install Prerequisites

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io/downloads
```

### 2. Set Environment Variables

```bash
export TF_VAR_environment_name="your-env-name"
export TF_VAR_location="East US"
export TF_VAR_binance_api_key="your_binance_api_key"
export TF_VAR_binance_api_secret="your_binance_api_secret"
export TF_VAR_azure_api_base_url="https://your-app.azurewebsites.net"
export TF_VAR_azure_api_key="your_azure_api_key"
export TF_VAR_use_mock_data="false"
```

### 3. Azure Login

```bash
az login
az account set --subscription "your-subscription-id"
```

### 4. Terraform Deployment

```bash
cd infra

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply

# Get the app name for deployment
APP_NAME=$(terraform output -raw SERVICE_TRADING_APP_NAME)
```

### 5. Deploy Application

```bash
# Build the Next.js app
npm run build

# Create deployment package
zip -r app.zip .next package.json package-lock.json public

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group rg-your-env-name \
  --name $APP_NAME \
  --src app.zip
```

## Infrastructure Files

- `infra/main.tf` - Main Terraform configuration with all Azure resources
- `infra/outputs.tf` - Output values from Terraform deployment
- `infra/main.tfvars.json` - Variable definitions (empty for GitHub Actions)

## Cost Optimization

This deployment uses only **FREE TIER** resources:

- **App Service F1**: Free (1 GB storage, 1 GB RAM, 60 CPU minutes/day)
- **Application Insights**: Free (1 GB data/month, 90-day retention)
- **Log Analytics**: Free (7-day retention, limited queries)
- **User-Assigned Identity**: Free

**Total estimated cost: $0/month** (within free tier limits)

## Monitoring and Troubleshooting

### View Application Logs

```bash
# Get app name from Terraform
APP_NAME=$(cd infra && terraform output -raw SERVICE_TRADING_APP_NAME)

# Stream logs
az webapp log tail --name $APP_NAME --resource-group rg-your-env-name
```

### Check Application Insights

1. Go to Azure Portal
2. Navigate to your Application Insights resource
3. View application performance, errors, and usage metrics

## Cleanup

To remove all resources:

```bash
cd infra
terraform destroy
```

This will delete all Azure resources and stop any charges.

## GitHub Actions Workflow

The deployment is automated via `.github/workflows/azure-deploy.yml`:

1. **Trigger**: Push to main branch
2. **Build Job**: Node.js 18, npm install, npm run build
3. **Deploy Job**: Terraform provision + app deployment
4. **Environment**: Uses production environment variables and secrets

## Troubleshooting

### Common Issues

1. **Terraform Authentication**: Ensure AZURE_CREDENTIALS is properly formatted JSON
2. **App Service Build**: Check that Node.js version matches (18.x)
3. **Environment Variables**: Verify all required secrets are set in GitHub
4. **Free Tier Limits**: Monitor usage to stay within free tier quotas

### Debug Commands

```bash
# Check Terraform state
terraform show

# Validate configuration
terraform validate

# Check app service logs
az webapp log show --name $APP_NAME --resource-group rg-your-env-name
```
