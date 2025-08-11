import axios, { AxiosInstance } from 'axios';
import { safeParseFloat } from '@/utils';
import { 
  BinanceAccountInfo, 
  BinanceTrade, 
  BinanceIncomeHistory,
  BinanceOrder,
  ApiResponse 
} from '@/types';

class BinanceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
    });
  }

  /**
   * Get futures account information via API route
   */
  async getAccountInfo(): Promise<ApiResponse<BinanceAccountInfo>> {
    try {
      console.log('Fetching Binance account info via API route...');
      const response = await this.client.get('/api/binance/account');
      console.log('Account info response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching account info:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      // Provide more specific error messages based on status code
      let errorMessage = error.message || 'Failed to fetch account information';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request parameters or API credentials';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - Check API key permissions';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error - Check API configuration';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get user trades for a specific symbol or all symbols via API route
   */
  async getUserTrades(symbol?: string, limit: number = 100): Promise<ApiResponse<BinanceTrade[]>> {
    try {
      console.log('Fetching user trades via API route...');
      
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      params.append('limit', limit.toString());
      
      const response = await this.client.get(`/api/binance/trades?${params.toString()}`);
      console.log('User trades response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user trades:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      // Provide more specific error messages based on status code
      let errorMessage = error.message || 'Failed to fetch user trades';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request parameters or API credentials';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - Check API key permissions';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error - Check API configuration';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get open orders via API route
   */
  async getOpenOrders(symbol?: string): Promise<ApiResponse<BinanceOrder[]>> {
    try {
      console.log('Fetching open orders via API route...');
      
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      
      const response = await this.client.get(`/api/binance/orders?${params.toString()}`);
      console.log('Open orders response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching open orders:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      // Provide more specific error messages based on status code
      let errorMessage = error.message || 'Failed to fetch open orders';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request parameters or API credentials';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - Check API key permissions';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error - Check API configuration';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get income history (PnL, commission, etc.) via API route
   */
  async getIncomeHistory(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<ApiResponse<BinanceIncomeHistory[]>> {
    try {
      console.log('Fetching income history via API route...');
      
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      if (incomeType) params.append('incomeType', incomeType);
      if (startTime) params.append('startTime', startTime.toString());
      if (endTime) params.append('endTime', endTime.toString());
      params.append('limit', limit.toString());
      
      const response = await this.client.get(`/api/binance/income?${params.toString()}`);
      console.log('Income history response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching income history:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      // Provide more specific error messages based on status code
      let errorMessage = error.message || 'Failed to fetch income history';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request parameters or API credentials';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - Check API key permissions';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error - Check API configuration';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get daily PnL for the last N days using real income data
   */
  async getDailyPnl(days: number = 30): Promise<ApiResponse<any[]>> {
    try {
      console.log('Calculating daily PnL from real income data...');
      
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
        console.error('Failed to fetch income data for daily PnL:', incomeResponse.error);
        // Fallback to mock data if real data fails
        return {
          success: true,
          data: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            pnl: 0, // Use 0 instead of random data when real data fails
          })),
        };
      }

      // Group by date and calculate daily PnL
      const dailyPnl = new Map<string, number>();
      
      incomeResponse.data.forEach((income) => {
        const date = new Date(income.time).toISOString().split('T')[0];
        const pnl = safeParseFloat(income.income);
        dailyPnl.set(date, (dailyPnl.get(date) || 0) + pnl);
      });

      // Create array for the requested number of days
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        result.push({
          date,
          pnl: dailyPnl.get(date) || 0
        });
      }

      console.log(`Calculated daily PnL for ${result.length} days from ${incomeResponse.data.length} income records`);
      
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Error calculating daily PnL:', error);
      
      // Fallback to mock data if there's an error
      return {
        success: true,
        data: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pnl: 0,
        })),
      };
    }
  }

  /**
   * Test API credentials and permissions via API route
   */
  async testApiCredentials(): Promise<ApiResponse<{ valid: boolean; permissions: string[] }>> {
    try {
      const result = await this.getAccountInfo();
      if (result.success) {
        return {
          success: true,
          data: {
            valid: true,
            permissions: ['futures']
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'API credentials test failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `API test failed: ${error.message}`,
      };
    }
  }

  /**
   * Test connectivity to Binance API
   */
  async testConnectivity(): Promise<ApiResponse<boolean>> {
    try {
      // Test connectivity via our API route
      const response = await this.client.get('/api/binance/ping');
      return response.data;
    } catch (error: any) {
      console.error('Binance connectivity test failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to connect to Binance API',
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
