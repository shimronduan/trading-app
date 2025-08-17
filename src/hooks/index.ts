import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { binanceClient, mockBinanceData } from '@/lib/binance';
import { azureApiClient, mockAtrMultiples, mockTradingConfigs } from '@/lib/azure';
import { safeParseFloat } from '@/utils';
import { 
  BinanceAccountInfo, 
  BinanceTrade, 
  DailyPnlData,
  AtrMultiple,
  CreateAtrMultipleRequest,
  UpdateAtrMultipleRequest,
  TradingConfig,
  CreateTradingConfigRequest,
  UpdateTradingConfigRequest
} from '@/types';

// Query keys
export const queryKeys = {
  binance: {
    accountInfo: ['binance', 'accountInfo'] as const,
    trades: ['binance', 'trades'] as const,
    orders: ['binance', 'orders'] as const,
    dailyPnl: (days: number) => ['binance', 'dailyPnl', days] as const,
    incomeHistory: ['binance', 'incomeHistory'] as const,
  },
  atr: {
    all: ['atr'] as const,
    multiples: ['atr', 'multiples'] as const,
    multiple: (id: string) => ['atr', 'multiple', id] as const,
  },
  tradingConfigs: {
    all: ['tradingConfigs'] as const,
    configs: ['tradingConfigs', 'configs'] as const,
    config: (symbol: string) => ['tradingConfigs', 'config', symbol] as const,
  },
} as const;

// Environment flag for using mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Binance hooks
export function useBinanceAccountInfo() {
  return useQuery({
    queryKey: queryKeys.binance.accountInfo,
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { success: true, data: mockBinanceData.accountInfo };
      }
      return await binanceClient.getAccountInfo();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useBinanceTrades(symbol?: string, limit: number = 50) {
  return useQuery({
    queryKey: [...queryKeys.binance.trades, symbol, limit],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { success: true, data: mockBinanceData.recentTrades };
      }
      return await binanceClient.getUserTrades(symbol, limit);
    },
    staleTime: 60000, // 1 minute
  });
}

export function useBinanceOpenOrders(symbol?: string) {
  return useQuery({
    queryKey: [...queryKeys.binance.orders, symbol],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const mockOrders = [
          { orderId: 1, symbol: 'BTCUSDT', price: '49000', origQty: '0.1', side: 'BUY', status: 'NEW', time: Date.now() - 5000 },
          { orderId: 2, symbol: 'ETHUSDT', price: '3100', origQty: '1', side: 'SELL', status: 'NEW', time: Date.now() - 15000 },
        ];
        return { success: true, data: mockOrders };
      }
      return await binanceClient.getOpenOrders(symbol);
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useBinanceDailyPnl(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.binance.dailyPnl(days),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { success: true, data: mockBinanceData.dailyPnl };
      }
      return await binanceClient.getDailyPnl(days);
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useBinanceIncomeHistory(
  symbol?: string,
  incomeType?: string,
  startTime?: number,
  endTime?: number,
  limit: number = 100
) {
  return useQuery({
    queryKey: [...queryKeys.binance.incomeHistory, symbol, incomeType, startTime, endTime, limit],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { success: true, data: [] };
      }
      return await binanceClient.getIncomeHistory(symbol, incomeType, startTime, endTime, limit);
    },
    staleTime: 300000, // 5 minutes
  });
}

// ATR Multiples hooks
export function useAtrMultiples() {
  return useQuery({
    queryKey: queryKeys.atr.multiples,
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { success: true, data: mockAtrMultiples };
      }
      return await azureApiClient.getAtrMultiples();
    },
    staleTime: 60000, // 1 minute
  });
}

export function useAtrMultiple(id: string) {
  return useQuery({
    queryKey: queryKeys.atr.multiple(id),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const multiple = mockAtrMultiples.find(m => m.id === id);
        return { success: true, data: multiple };
      }
      return await azureApiClient.getAtrMultiple(id);
    },
    enabled: !!id,
  });
}

export function useCreateAtrMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAtrMultipleRequest) => {
      if (USE_MOCK_DATA) {
        const newMultiple: AtrMultiple = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          RowKey: Math.random().toString(36).substr(2, 9),
          Timestamp: new Date().toISOString(),
        };
        return { success: true, data: newMultiple };
      }
      return await azureApiClient.createAtrMultiple(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atr.multiples });
    },
  });
}

export function useUpdateAtrMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAtrMultipleRequest }) => {
      if (USE_MOCK_DATA) {
        const existing = mockAtrMultiples.find(m => m.id === id);
        if (!existing) throw new Error('ATR multiple not found');
        
        const updated = {
          ...existing,
          ...data,
          updated_at: new Date().toISOString(),
        };
        return { success: true, data: updated };
      }
      return await azureApiClient.updateAtrMultiple(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atr.multiples });
      queryClient.invalidateQueries({ queryKey: queryKeys.atr.multiple(id) });
    },
  });
}

export function useDeleteAtrMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK_DATA) {
        return { success: true };
      }
      return await azureApiClient.deleteAtrMultiple(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.atr.multiples });
    },
  });
}

// Custom hook for dashboard data
export function useDashboardData() {
  const accountInfo = useBinanceAccountInfo();
  const trades = useBinanceTrades(undefined, 20);
  const openOrders = useBinanceOpenOrders();
  const dailyPnl = useBinanceDailyPnl(30);

  const isLoading = accountInfo.isLoading || trades.isLoading || openOrders.isLoading || dailyPnl.isLoading;
  const isError = accountInfo.isError || trades.isError || openOrders.isError || dailyPnl.isError;

  const data = {
    accountInfo: accountInfo.data?.data,
    recentTrades: trades.data?.data || [],
    openOrders: openOrders.data?.data || [],
    dailyPnl: dailyPnl.data?.data || [],
  };

  return {
    data,
    isLoading,
    isError,
    refetch: () => {
      accountInfo.refetch();
      trades.refetch();
      openOrders.refetch();
      dailyPnl.refetch();
    },
  };
}

// Custom hook for trading statistics
export function useTradingStats() {
  const trades = useBinanceTrades(undefined, 1000);
  const incomeHistory = useBinanceIncomeHistory();

  const calculateStats = () => {
    if (!trades.data?.data || !incomeHistory.data?.data) {
      return null;
    }

    const tradesData = trades.data.data;
    const realizedPnl = incomeHistory.data.data
      .filter(income => income.incomeType === 'REALIZED_PNL')
      .map(income => safeParseFloat(income.income));

    const totalTrades = tradesData.length;
    const winningTrades = realizedPnl.filter(pnl => pnl > 0).length;
    const losingTrades = realizedPnl.filter(pnl => pnl < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalPnl = realizedPnl.reduce((sum, pnl) => sum + pnl, 0);
    
    const wins = realizedPnl.filter(pnl => pnl > 0);
    const losses = realizedPnl.filter(pnl => pnl < 0);
    
    const averageWin = wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length : 0;
    const averageLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;
    
    const grossProfit = wins.reduce((sum, win) => sum + win, 0);
    const grossLoss = Math.abs(losses.reduce((sum, loss) => sum + loss, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses) : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnl,
      averageWin,
      averageLoss,
      profitFactor,
      largestWin,
      largestLoss,
    };
  };

  return {
    stats: calculateStats(),
    isLoading: trades.isLoading || incomeHistory.isLoading,
    isError: trades.isError || incomeHistory.isError,
  };
}

// Trading Configurations hooks
export function useTradingConfigs() {
  console.log('useTradingConfigs: Hook called');
  
  const result = useQuery({
    queryKey: queryKeys.tradingConfigs.configs,
    queryFn: async () => {
      console.log('useTradingConfigs: queryFn executed');
      if (USE_MOCK_DATA) {
        console.log('useTradingConfigs: Using mock data');
        return { success: true, data: mockTradingConfigs };
      }
      console.log('useTradingConfigs: Calling Azure API');
      const result = await azureApiClient.getTradingConfigs();
      console.log('useTradingConfigs: API result =', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Disable React 19 experimental features
    enabled: true,
    throwOnError: false,
  });
  
  console.log('useTradingConfigs: Query result =', result);
  return result;
}

export function useTradingConfig(symbol: string) {
  return useQuery({
    queryKey: queryKeys.tradingConfigs.config(symbol),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const config = mockTradingConfigs.find(c => c.RowKey === symbol);
        return { success: true, data: config };
      }
      return await azureApiClient.getTradingConfig(symbol);
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateTradingConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTradingConfigRequest) => {
      return await azureApiClient.createTradingConfig(data);
    },
    onSuccess: () => {
      // Invalidate and refetch trading configs
      queryClient.invalidateQueries({ queryKey: queryKeys.tradingConfigs.all });
    },
  });
}

export function useUpdateTradingConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ symbol, data }: { symbol: string; data: UpdateTradingConfigRequest }) => {
      return await azureApiClient.updateTradingConfig(symbol, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch trading configs
      queryClient.invalidateQueries({ queryKey: queryKeys.tradingConfigs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tradingConfigs.config(variables.symbol) });
    },
  });
}

export function useDeleteTradingConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (symbol: string) => {
      return await azureApiClient.deleteTradingConfig(symbol);
    },
    onSuccess: () => {
      // Invalidate and refetch trading configs
      queryClient.invalidateQueries({ queryKey: queryKeys.tradingConfigs.all });
    },
  });
}
