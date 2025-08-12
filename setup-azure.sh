#!/bin/bash

# Trading App - Azure Deployment Setup Script
echo "🚀 Trading App - Azure Deployment Setup"
echo "======================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Azure CLI
if command -v az &> /dev/null; then
    echo "✅ Azure CLI found: $(az version --query '"azure-cli"' -o tsv)"
else
    echo "❌ Azure CLI not found. Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check Azure Developer CLI
if command -v azd &> /dev/null; then
    echo "✅ Azure Developer CLI found: $(azd version)"
else
    echo "❌ Azure Developer CLI not found. Please install: https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd"
    exit 1
fi

# Check Terraform
if command -v terraform &> /dev/null; then
    echo "✅ Terraform found: $(terraform version | head -n1)"
else
    echo "❌ Terraform not found. Please install: https://learn.hashicorp.com/tutorials/terraform/install-cli"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18 or later."
    exit 1
fi

echo ""
echo "🔧 Environment Setup"
echo "===================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values before deploying!"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔐 Required Environment Variables for GitHub"
echo "==========================================="
echo ""
echo "Repository Variables (public):"
echo "- AZURE_CLIENT_ID"
echo "- AZURE_TENANT_ID" 
echo "- AZURE_SUBSCRIPTION_ID"
echo "- AZURE_ENV_NAME (e.g., 'trading-app-prod')"
echo "- AZURE_LOCATION (e.g., 'eastus')"
echo ""
echo "Repository Secrets (private):"
echo "- AZURE_CLIENT_SECRET"
echo "- NEXT_PUBLIC_BINANCE_API_KEY"
echo "- BINANCE_API_SECRET"
echo "- NEXT_PUBLIC_AZURE_API_BASE_URL"
echo "- NEXT_PUBLIC_AZURE_API_KEY"
echo "- NEXT_PUBLIC_USE_MOCK_DATA"
echo ""

# Check if user is logged into Azure
echo "🔑 Azure Authentication"
echo "======================="
if az account show &> /dev/null; then
    echo "✅ Logged into Azure:"
    az account show --query "{Name:name, SubscriptionId:id, TenantId:tenantId}" -o table
else
    echo "❌ Not logged into Azure. Please run: az login"
    exit 1
fi

echo ""
echo "🎯 Next Steps"
echo "============"
echo "1. Configure GitHub repository secrets and variables (see DEPLOYMENT.md)"
echo "2. Push to main branch to trigger automatic deployment"
echo "3. Or run manual deployment: azd up"
echo ""
echo "📚 For detailed setup instructions, see DEPLOYMENT.md"
echo ""
echo "💰 Estimated monthly cost: **$0 USD** (FREE TIER ONLY!)"
echo ""
echo "⚠️  Free Tier Limitations:"
echo "   - 60 CPU minutes per day"
echo "   - 165MB bandwidth per day"
echo "   - Shared infrastructure"
echo "   - *.azurewebsites.net domain only"
echo ""
