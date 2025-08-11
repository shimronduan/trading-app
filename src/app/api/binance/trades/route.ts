import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side Binance client for trades
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

  async getUserTrades(symbol?: string, limit: number = 50) {
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
      params.append('limit', limit.toString());

      const queryString = params.toString();
      const signature = this.generateSignature(queryString);

      const url = `${this.baseURL}/fapi/v1/userTrades?${queryString}&signature=${signature}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Binance Trades API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        
        throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} trades from Binance API`);
      return { success: true, data };
    } catch (error: any) {
      console.error('Server Binance trades client error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch trades',
      };
    }
  }
}

const binanceClient = new ServerBinanceClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await binanceClient.getUserTrades(symbol, limit);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Trades API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
