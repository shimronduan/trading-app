// Binance API Types
export interface BinanceAccountInfo {
  feeTier: number;
  canTrade: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  updateTime: number;
  totalWalletBalance: string;
  totalUnrealizedPnl: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  totalCrossWalletBalance: string;
  totalCrossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  assets: BinanceAsset[];
  positions: BinancePosition[];
}

export interface BinanceAsset {
  asset: string;
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
  maintMargin: string;
  initialMargin: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  marginAvailable: boolean;
  updateTime: number;
}

export interface BinancePosition {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedProfit: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: boolean;
  entryPrice: string;
  markPrice: string;
  maxNotional: string;
  positionSide: string;
  positionAmt: string;
  notional: string;
  isolatedWallet: string;
  updateTime: number;
  bidNotional: string;
  askNotional: string;
}

export interface BinanceTrade {
  symbol: string;
  id: number;
  orderId: number;
  side: 'BUY' | 'SELL';
  qty: string;
  price: string;
  commission: string;
  commissionAsset: string;
  time: number;
  positionSide: string;
  buyer: boolean;
  maker: boolean;
  realizedPnl: string;
}

export interface BinanceIncomeHistory {
  symbol: string;
  incomeType: string;
  income: string;
  asset: string;
  info: string;
  time: number;
  tranId: number;
  tradeId: string;
}

export interface BinanceOrder {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  reduceOnly: boolean;
  closePosition: boolean;
  side: 'BUY' | 'SELL';
  positionSide: string;
  stopPrice: string;
  workingType: string;
  priceProtect: boolean;
  origType: string;
  time: number;
  updateTime: number;
}

// ATR Multiples Types
export interface AtrMultiple {
  id?: string;
  PartitionKey: string;
  RowKey: string;
  atr_multiple: number;
  close_fraction: number;
  Timestamp: string;
  // Legacy fields for backward compatibility
  row?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AtrMultiplesResponse {
  records: AtrMultiple[];
  count: number;
}

export interface CreateAtrMultipleRequest {
  atr_multiple: number;
  close_fraction: number;
  PartitionKey: string;
}

export interface UpdateAtrMultipleRequest {
  atr_multiple?: number;
  close_fraction?: number;
  PartitionKey?: string;
}

// Dashboard Data Types
export interface DashboardData {
  accountInfo: BinanceAccountInfo;
  dailyPnl: DailyPnlData[];
  recentTrades: BinanceTrade[];
  incomeHistory: BinanceIncomeHistory[];
}

export interface DailyPnlData {
  date: string;
  pnl: number;
  cumulativePnl: number;
}

// UI Types
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface AtrMultipleFormData {
  atr_multiple: number;
  close_fraction: number;
  PartitionKey: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PortfolioChartData {
  date: string;
  balance: number;
  pnl: number;
}

// Statistics Types
export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
}
