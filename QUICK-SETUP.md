# 🚀 Quick GitHub Setup Guide (Production Environment)

Since you're using GitHub Environments, here's exactly what you need to configure:

## 📋 Required GitHub Environment Configuration

### Environment Setup
1. Go to **Settings > Environments**
2. Make sure you have an environment named **"production"**
3. Add the variables and secrets below to the **production** environment

### Environment Variables (in production environment)

Add these **2 variables**:

```
AZURE_ENV_NAME=trading-app-prod
AZURE_LOCATION=eastus
```

### Environment Secrets (in production environment)

Add these **6 secrets** to the **production** environment:

**Azure Authentication (your complete JSON):**
```
AZURE_CREDENTIALS={"clientId":"********-****-****-****-************","clientSecret":"********************************","subscriptionId":"********-****-****-****-************","tenantId":"********-****-****-****-************","activeDirectoryEndpointUrl":"https://login.microsoftonline.com","resourceManagerEndpointUrl":"https://management.azure.com/","activeDirectoryGraphResourceId":"https://graph.windows.net/","sqlManagementEndpointUrl":"https://management.core.windows.net:8443/","galleryEndpointUrl":"https://gallery.azure.com/","managementEndpointUrl":"https://management.core.windows.net/"}
```

**Application Environment Variables:**
```
NEXT_PUBLIC_BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
NEXT_PUBLIC_AZURE_API_BASE_URL=your-azure-api-url (optional)
NEXT_PUBLIC_AZURE_API_KEY=your-azure-api-key (optional)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## ✅ What's Already Done

- ✅ Service principal created
- ✅ GitHub workflow updated for environment-based deployment
- ✅ Production environment configured in workflow
- ✅ Terraform infrastructure configured
- ✅ Free tier optimized

## 🚀 Next Steps

1. **Add the variables and secrets above to your "production" environment**
2. **Push to main branch** - Deployment will start automatically!
3. **Monitor the deployment** in GitHub Actions tab

## 🔍 Deployment Process

1. **Build**: Compiles your Next.js app
2. **Deploy**: Uses production environment variables
3. **Provision**: Creates Azure resources with Terraform (FREE!)
4. **Deploy**: Uploads your app to Azure App Service

Your app will be available at: `https://your-app-name.azurewebsites.net`

## 🔒 Environment Benefits

- **Environment Protection**: Can add approval rules for production deployments
- **Environment-Specific Variables**: Different values for staging/production
- **Better Security**: Environment secrets are isolated
- **Deployment History**: Track deployments per environment

## 🆘 Need Help?

If the deployment fails, check:
- All secrets are correctly copied (no extra spaces)
- Service principal has Contributor role on your subscription
- Environment name is unique (change `AZURE_ENV_NAME` if needed)

That's it! Your trading app will deploy to Azure completely free! 🎉
