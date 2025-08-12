# Trading App - Azure Deployment Setup

This guide will help you deploy your Next.js trading application to Azure using GitHub Actions in a cost-effective manner.

## Architecture Overview

- **Azure App Service** (Free F1 tier) - **COMPLETELY FREE** hosting for Next.js app
- **Application Insights** (Free tier) - **FREE** application monitoring (1GB/month included)
- **Log Analytics Workspace** (Free tier) - **FREE** centralized logging (5GB/month included)
- **User-Assigned Managed Identity** - **FREE** secure access to Azure resources

**Total Monthly Cost**: **$0 USD** (Free tier only!)

## Prerequisites

1. Azure subscription
2. GitHub repository
3. Azure CLI and Azure Developer CLI
4. Terraform CLI

## Setup Instructions

### 1. Azure Service Principal Setup

You need to create a service principal for GitHub Actions to deploy to Azure.

#### Option A: Using Azure CLI (Recommended)

```bash
# Login to Azure
az login

# Set your subscription (replace with your subscription ID)
az account set --subscription "your-subscription-id"

# Create a service principal with contributor role
az ad sp create-for-rbac \
  --name "trading-app-github-actions" \
  --role contributor \
  --scopes /subscriptions/your-subscription-id \
  --sdk-auth

# For federated credentials (more secure), run this instead:
az ad sp create-for-rbac \
  --name "trading-app-github-actions" \
  --role contributor \
  --scopes /subscriptions/your-subscription-id
```

#### Option B: Using Azure Portal

1. Go to Azure Active Directory > App registrations
2. Create a new registration named "trading-app-github-actions"
3. Go to Certificates & secrets > Create a new client secret
4. Go to your subscription > Access control (IAM) > Add role assignment
5. Assign "Contributor" role to your app registration

### 2. GitHub Repository Configuration

#### Repository Variables (Settings > Secrets and variables > Actions > Variables)

Add these **Repository Variables**:

```
AZURE_CLIENT_ID=your-service-principal-client-id
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id
AZURE_ENV_NAME=trading-app-prod (or your preferred environment name)
AZURE_LOCATION=eastus (or your preferred Azure region)
```

#### Repository Secrets (Settings > Secrets and variables > Actions > Secrets)

Add these **Repository Secrets**:

```
AZURE_CLIENT_SECRET=your-service-principal-client-secret
NEXT_PUBLIC_BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
NEXT_PUBLIC_AZURE_API_BASE_URL=your-azure-api-url
NEXT_PUBLIC_AZURE_API_KEY=your-azure-api-key
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3. Environment Variables Guide

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_BINANCE_API_KEY` | Your Binance API key for futures trading | `abc123...` | Yes |
| `BINANCE_API_SECRET` | Your Binance API secret (keep this secure!) | `secret123...` | Yes |
| `NEXT_PUBLIC_AZURE_API_BASE_URL` | Base URL for your Azure API | `https://your-api.azurewebsites.net/api` | Optional |
| `NEXT_PUBLIC_AZURE_API_KEY` | API key for your Azure services | `key123...` | Optional |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Use mock data instead of real API calls | `false` | Optional |

### 4. Deploy the Application

Once you've configured the repository secrets and variables:

1. **Push to main branch** - This will trigger the deployment workflow automatically
2. **Manual deployment** - Go to Actions tab > "Deploy Trading App to Azure" > "Run workflow"

### 5. Monitoring and Management

After deployment, you can:

- **View your app**: The deployment will output the app URL
- **Monitor performance**: Check Application Insights in Azure Portal
- **View logs**: Access logs through Azure Portal > App Service > Log stream
- **Scale if needed**: Upgrade the App Service Plan for more performance

## Cost Optimization Features (FREE TIER!)

1. **Free F1 Tier**: Completely free App Service hosting
2. **Windows App Service**: Required for Free tier (no cost difference)
3. **AlwaysOn disabled**: Required for Free tier (reduces resource usage)
4. **7-day log retention**: Optimized for free tier limits
5. **No site extensions**: Simplified deployment for free tier
6. **Free Application Insights**: 1GB/month telemetry included
7. **Free Log Analytics**: 5GB/month log ingestion included

### Free Tier Limitations
- **CPU time**: 60 minutes per day
- **Bandwidth**: 165MB per day outbound
- **Storage**: 1GB
- **Custom domains**: Not supported (use *.azurewebsites.net)
- **SSL certificates**: Free SSL for *.azurewebsites.net only
- **Deployment slots**: Not available

## Security Features

1. **HTTPS enforced**: All traffic redirected to HTTPS
2. **User-assigned managed identity**: Secure access to Azure resources
3. **Application Insights**: Monitor for security issues
4. **Secrets management**: Sensitive data stored as environment variables

## Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version compatibility (using Node 18 LTS)
2. **Deployment fails**: Verify service principal permissions
3. **App doesn't start**: Check environment variables are set correctly
4. **API calls fail**: Verify Binance API credentials and permissions

### Checking Logs

```bash
# Using Azure CLI
az webapp log tail --name your-app-name --resource-group your-resource-group

# Or view in Azure Portal
# App Service > Monitoring > Log stream
```

## Manual Deployment (Alternative)

If you prefer to deploy manually instead of using GitHub Actions:

```bash
# Install Azure Developer CLI
# https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd

# Install Terraform
# https://learn.hashicorp.com/tutorials/terraform/install-cli

# Clone and navigate to your repository
git clone your-repo-url
cd trading-app

# Initialize AZD
azd init

# Provision Azure resources (FREE TIER with Terraform!)
azd provision

# Deploy the application
azd deploy
```

## Free Tier Considerations

### Daily Limits
- **CPU Minutes**: 60 minutes per day (resets at midnight UTC)
- **Bandwidth**: 165MB outbound per day
- If you exceed these limits, your app will be stopped until the next day

### Performance
- **Shared infrastructure**: Your app shares resources with other free tier apps
- **Cold starts**: App may take longer to respond after periods of inactivity
- **No SLA**: Free tier doesn't include service level agreements

### Scaling Options
If you need more resources later, you can easily upgrade:
- **Shared D1**: ~$9.49/month (shared CPU, no daily limits)
- **Basic B1**: ~$13.14/month (dedicated CPU, custom domains)
- **Standard S1**: ~$73.00/month (auto-scaling, deployment slots)

## Support

For issues with:
- **Azure services**: Check Azure Portal > Support + troubleshooting
- **GitHub Actions**: Check the Actions tab for detailed logs
- **Application errors**: Review Application Insights logs
- **Binance API**: Verify API key permissions and rate limits
