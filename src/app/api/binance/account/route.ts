import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side Binance client
class ServerBinanceClient {
  private apiKey: string;
  private apiSecret: string;
  private baseURL = 'https://fapi.binance.com';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
  }

  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  async getAccountInfo() {
    try {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('Binance API credentials are not configured');
      }

      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);

      const url = `${this.baseURL}/fapi/v2/account?${queryString}&signature=${signature}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Binance API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        
        throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Binance API response structure:', {
        totalWalletBalance: data.totalWalletBalance,
        totalUnrealizedPnl: data.totalUnrealizedPnl,
        availableBalance: data.availableBalance,
        keys: Object.keys(data).slice(0, 10) // Show first 10 keys
      });
      return { success: true, data };
    } catch (error: any) {
      console.error('Server Binance client error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch account information',
      };
    }
  }
}

const binanceClient = new ServerBinanceClient();

export async function GET() {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const mockAccountInfo = {
      totalWalletBalance: '10000',
      totalUnrealizedPnl: '500',
      availableBalance: '8000',
      assets: [
        { asset: 'USDT', walletBalance: '10000', unrealizedProfit: '500', availableBalance: '8000' },
        { asset: 'BUSD', walletBalance: '2000', unrealizedProfit: '0', availableBalance: '2000' },
      ],
      positions: [
        { symbol: 'BTCUSDT', initialMargin: '1000', unrealizedProfit: '200', positionSide: 'LONG' },
        { symbol: 'ETHUSDT', initialMargin: '500', unrealizedProfit: '50', positionSide: 'SHORT' },
      ]
    };
    return NextResponse.json({ success: true, data: mockAccountInfo });
  }

  try {
    const result = await binanceClient.getAccountInfo();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
