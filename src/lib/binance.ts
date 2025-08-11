import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { 
  BinanceAccountInfo, 
  BinanceTrade, 
  BinanceIncomeHistory,
  ApiResponse 
} from '@/types';

class BinanceClient {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseURL = 'https://fapi.binance.com';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (config.url?.includes('/fapi/')) {
        const timestamp = Date.now();
        const queryString = new URLSearchParams({
          ...config.params,
          timestamp: timestamp.toString(),
        }).toString();

        const signature = crypto
          .createHmac('sha256', this.apiSecret)
          .update(queryString)
          .digest('hex');

        config.params = {
          ...config.params,
          timestamp,
          signature,
        };

        config.headers['X-MBX-APIKEY'] = this.apiKey;
      }
      return config;
    });
  }

  /**
   * Get futures account information
   */
  async getAccountInfo(): Promise<ApiResponse<BinanceAccountInfo>> {
    try {
      const response = await this.client.get('/fapi/v2/account');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching account info:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch account information',
      };
    }
  }

  /**
   * Get user trades for a specific symbol or all symbols
   */
  async getUserTrades(symbol?: string, limit: number = 100): Promise<ApiResponse<BinanceTrade[]>> {
    try {
      const params: any = { limit };
      if (symbol) params.symbol = symbol;

      const response = await this.client.get('/fapi/v1/userTrades', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching user trades:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user trades',
      };
    }
  }

  /**
   * Get income history (PnL, commission, etc.)
   */
  async getIncomeHistory(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<ApiResponse<BinanceIncomeHistory[]>> {
    try {
      const params: any = { limit };
      if (symbol) params.symbol = symbol;
      if (incomeType) params.incomeType = incomeType;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const response = await this.client.get('/fapi/v1/income', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching income history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch income history',
      };
    }
  }

  /**
   * Get daily PnL for the last N days
   */
  async getDailyPnl(days: number = 30): Promise<ApiResponse<any[]>> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);

      const incomeResponse = await this.getIncomeHistory(
        undefined,
        'REALIZED_PNL',
        startTime,
        endTime,
        1000
      );

      if (!incomeResponse.success || !incomeResponse.data) {
        return {
          success: false,
          error: 'Failed to fetch income data',
        };
      }

      // Group by date and calculate daily PnL
      const dailyPnl = new Map<string, number>();
      
      incomeResponse.data.forEach((income) => {
        const date = new Date(income.time).toISOString().split('T')[0];
        const pnl = parseFloat(income.income);
        dailyPnl.set(date, (dailyPnl.get(date) || 0) + pnl);
      });

      const result = Array.from(dailyPnl.entries())
        .map(([date, pnl]) => ({ date, pnl }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Error calculating daily PnL:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate daily PnL',
      };
    }
  }

  /**
   * Test connectivity to Binance API
   */
  async testConnectivity(): Promise<ApiResponse<boolean>> {
    try {
      await this.client.get('/fapi/v1/ping');
      return {
        success: true,
        data: true,
      };
    } catch (error: any) {
      console.error('Binance connectivity test failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to Binance API',
      };
    }
  }
}

// Singleton instance
export const binanceClient = new BinanceClient();

// Mock data for development
export const mockBinanceData = {
  accountInfo: {
    feeTier: 0,
    canTrade: true,
    canDeposit: true,
    canWithdraw: true,
    updateTime: Date.now(),
    totalWalletBalance: '12500.50',
    totalUnrealizedPnl: '250.75',
    totalMarginBalance: '12751.25',
    totalPositionInitialMargin: '2500.00',
    totalOpenOrderInitialMargin: '0.00',
    totalCrossWalletBalance: '12500.50',
    totalCrossUnPnl: '250.75',
    availableBalance: '10000.50',
    maxWithdrawAmount: '10000.50',
    assets: [
      {
        asset: 'USDT',
        walletBalance: '12500.50',
        unrealizedProfit: '250.75',
        marginBalance: '12751.25',
        maintMargin: '125.00',
        initialMargin: '2500.00',
        positionInitialMargin: '2500.00',
        openOrderInitialMargin: '0.00',
        crossWalletBalance: '12500.50',
        crossUnPnl: '250.75',
        availableBalance: '10000.50',
        maxWithdrawAmount: '10000.50',
        marginAvailable: true,
        updateTime: Date.now(),
      },
    ],
    positions: [
      {
        symbol: 'BTCUSDT',
        initialMargin: '1000.00',
        maintMargin: '50.00',
        unrealizedProfit: '150.25',
        positionInitialMargin: '1000.00',
        openOrderInitialMargin: '0.00',
        leverage: '10',
        isolated: false,
        entryPrice: '42000.50',
        markPrice: '42150.75',
        maxNotional: '50000',
        positionSide: 'LONG',
        positionAmt: '0.5',
        notional: '21075.375',
        isolatedWallet: '0',
        updateTime: Date.now(),
        bidNotional: '0',
        askNotional: '0',
      },
      {
        symbol: 'ETHUSDT',
        initialMargin: '750.00',
        maintMargin: '37.50',
        unrealizedProfit: '100.50',
        positionInitialMargin: '750.00',
        openOrderInitialMargin: '0.00',
        leverage: '5',
        isolated: false,
        entryPrice: '2500.00',
        markPrice: '2540.10',
        maxNotional: '25000',
        positionSide: 'LONG',
        positionAmt: '3.0',
        notional: '7620.30',
        isolatedWallet: '0',
        updateTime: Date.now(),
        bidNotional: '0',
        askNotional: '0',
      },
    ],
  } as BinanceAccountInfo,

  recentTrades: [
    {
      symbol: 'BTCUSDT',
      id: 1,
      orderId: 12345,
      side: 'BUY' as const,
      qty: '0.5',
      price: '42000.50',
      commission: '4.20',
      commissionAsset: 'USDT',
      time: Date.now() - 3600000,
      positionSide: 'LONG',
      buyer: true,
      maker: false,
      realizedPnl: '0.00',
    },
    {
      symbol: 'ETHUSDT',
      id: 2,
      orderId: 12346,
      side: 'BUY' as const,
      qty: '3.0',
      price: '2500.00',
      commission: '3.75',
      commissionAsset: 'USDT',
      time: Date.now() - 7200000,
      positionSide: 'LONG',
      buyer: true,
      maker: true,
      realizedPnl: '0.00',
    },
  ] as BinanceTrade[],

  dailyPnl: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pnl: Math.random() * 400 - 200, // Random PnL between -200 and +200
  })),
};
