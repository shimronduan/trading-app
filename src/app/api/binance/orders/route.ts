import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side Binance client for open orders
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

  async getOpenOrders(symbol?: string) {
    try {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('Binance API credentials are not configured');
      }

      const timestamp = Date.now();
      const params = new URLSearchParams();
      params.append('timestamp', timestamp.toString());
      
      if (symbol) {
        params.append('symbol', symbol);
      }

      const queryString = params.toString();
      const signature = this.generateSignature(queryString);

      const url = `${this.baseURL}/fapi/v1/openOrders?${queryString}&signature=${signature}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Binance Open Orders API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        
        throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} open orders from Binance API`);
      return { success: true, data };
    } catch (error: any) {
      console.error('Server Binance open orders client error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch open orders',
      };
    }
  }
}

const binanceClient = new ServerBinanceClient();

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const mockOrders = [
      { orderId: 1, symbol: 'BTCUSDT', price: '49000', origQty: '0.1', side: 'BUY', status: 'NEW', time: Date.now() - 5000, type: 'LIMIT' },
      { orderId: 2, symbol: 'ETHUSDT', price: '3100', origQty: '1', side: 'SELL', status: 'NEW', time: Date.now() - 15000, type: 'MARKET' },
    ];
    return NextResponse.json({ success: true, data: mockOrders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;

    const result = await binanceClient.getOpenOrders(symbol);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Open Orders API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
