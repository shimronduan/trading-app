import { TradingConfigsList } from '@/features/trading-configs/TradingConfigsList';

export default function TradingConfigsPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <TradingConfigsList />
    </div>
  );
}

export const metadata = {
  title: 'Trading Configurations - Trading Bot Dashboard',
  description: 'Manage trading bot configurations for different symbols and their parameters.',
};
