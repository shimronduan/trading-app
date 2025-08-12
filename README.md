# Trading Bot Dashboard

A modern Next.js dashboard for managing futures trading with Binance integration and ATR multiples management.

## 🚀 Quick Deploy to Azure (FREE)

Deploy this app to Azure using Terraform infrastructure as code - **completely free with Azure Free Tier!**

1. **Setup Terraform state**: `./setup-terraform-state.sh`
2. **Configure GitHub environment** (see [TERRAFORM-DEPLOYMENT.md](TERRAFORM-DEPLOYMENT.md))
3. **Push to main branch** - Automatic deployment via GitHub Actions!

📚 **[Complete Deployment Guide →](TERRAFORM-DEPLOYMENT.md)**  
🔧 **[Terraform State Guide →](TERRAFORM-STATE.md)**

## Features

### 📊 Dashboard
- Real-time futures wallet balance and performance metrics
- Live positions table with P&L tracking
- Historical trades and performance charts
- Win rate and trading statistics

### ⚙️ ATR Multiples Management
- Create, edit, and delete ATR multiples
- Sortable and searchable table interface
- Form validation and error handling

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Mobile-responsive design
- Loading states and smooth animations

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Azure App Service with Terraform
- **CI/CD**: GitHub Actions

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create your GitHub environment with these secrets:

```
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
NEXT_PUBLIC_AZURE_API_BASE_URL=https://your-app.azurewebsites.net
NEXT_PUBLIC_AZURE_API_KEY=your_azure_api_key
NEXT_PUBLIC_USE_MOCK_DATA=false
```

And these variables:
```
AZURE_ENV_NAME=your-environment-name
AZURE_LOCATION=East US
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for Binance integration
│   ├── atr-multiples/     # ATR multiples management page
│   └── settings/          # Settings page
├── components/            # Reusable UI components
├── features/              # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions

infra/                     # Terraform infrastructure code
├── main.tf               # Main infrastructure configuration
├── outputs.tf            # Output definitions
└── main.tfvars.json      # Variables file

.github/workflows/        # GitHub Actions CI/CD
└── azure-deploy.yml      # Deployment workflow
```

## License

MIT License - see [LICENSE](LICENSE) for details.
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── atr-multiples/     # ATR multiples management page
│   ├── settings/          # Settings and configuration page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Dashboard home page
├── components/            # Reusable UI components
│   ├── Layout.tsx         # Main app layout with navigation
│   └── ui.tsx             # Common UI components (Button, Card, Modal, etc.)
├── features/              # Feature-specific components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── WalletOverview.tsx
│   │   ├── PerformanceCharts.tsx
│   │   ├── OpenPositionsTable.tsx
│   │   └── RecentTradesTable.tsx
│   └── atr-multiples/     # ATR management components
│       ├── AtrMultiplesList.tsx
│       └── AtrMultipleForm.tsx
├── hooks/                 # Custom React hooks and React Query hooks
├── lib/                   # API clients and utilities
│   ├── binance.ts         # Binance Futures API client
│   ├── azure.ts           # Azure Functions API client
│   ├── providers.tsx      # React Query provider
│   └── theme.tsx          # Theme context and provider
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── globals.css           # Global styles and Tailwind imports
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Binance Futures API key and secret (for live data)
- Azure Functions endpoint (for ATR multiples management)

### 1. Clone and Install
```bash
git clone <repository-url>
cd trading-app
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
```

Required environment variables:
```env
# For live Binance data (optional during development)
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_secret

# For ATR multiples API (optional during development)
NEXT_PUBLIC_AZURE_API_BASE_URL=https://your-function-app.azurewebsites.net
NEXT_PUBLIC_AZURE_API_KEY=your_function_key

# Use mock data for development (set to 'false' for live APIs)
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Integration

### Binance Futures API
The app integrates with Binance Futures API to fetch:
- Account information and balances
- Open positions
- Trading history
- Income/PnL data

**Required Permissions**: 
- Futures Trading (for account info and positions)
- Read-only permissions are sufficient

**Security**: API secret is only used server-side and never exposed to the client.

### Azure Functions API
For ATR multiples management, the app expects these endpoints:

```
GET    /api/atr-multiples       # List all ATR multiples
GET    /api/atr-multiples/:id   # Get specific multiple
POST   /api/atr-multiples       # Create new multiple
PUT    /api/atr-multiples/:id   # Update existing multiple
DELETE /api/atr-multiples/:id   # Delete multiple
```

**Request/Response Format**:
```typescript
interface AtrMultiple {
  id?: string;
  atr_multiple: number;    // 0.1 - 10.0
  close_fraction: number;  // 0.01 - 1.0
  row: number;            // Integer >= 1
  created_at?: string;
  updated_at?: string;
}
```

## Mock Data for Development

The app includes comprehensive mock data for development:
- Sample trading account with positions
- Historical P&L data for charts
- Recent trades examples
- ATR multiples test data

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in your `.env.local` to use mock data.

## Mobile-First Design

The dashboard is designed mobile-first with:
- **Responsive Grid**: Adapts from 1 column on mobile to 4 columns on desktop
- **Mobile Navigation**: Bottom tab navigation on mobile, sidebar on desktop
- **Touch-Friendly**: Appropriately sized buttons and interactive elements
- **Readable Text**: Optimized typography and spacing for mobile screens
- **Fast Loading**: Optimized for mobile network conditions

## Build & Deploy

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms
The app is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers
- Any Node.js hosting provider

## Environment Variables for Production

For production deployment, set these environment variables:

```env
NEXT_PUBLIC_BINANCE_API_KEY=your_production_binance_key
BINANCE_API_SECRET=your_production_binance_secret
NEXT_PUBLIC_AZURE_API_BASE_URL=your_production_azure_url
NEXT_PUBLIC_AZURE_API_KEY=your_production_azure_key
NEXT_PUBLIC_USE_MOCK_DATA=false
NODE_ENV=production
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Binance Secret**: Only used server-side, never exposed to client
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Use secure environment variable management
5. **API Permissions**: Use minimal required permissions on Binance API

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check existing issues for similar problems
- Review the documentation and setup guide

## Roadmap

- [ ] Real-time WebSocket updates for live price data
- [ ] Advanced charting with technical indicators
- [ ] Portfolio analytics and risk metrics
- [ ] Trade execution interface
- [ ] Alert system for price movements
- [ ] Export functionality for trading data
- [ ] Multi-exchange support
- [ ] Advanced filtering and search capabilities
