import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side Binance client for income history
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

  async getIncomeHistory(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit: number = 1000
  ) {
    try {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('Binance API credentials are not configured');
      }

      const timestamp = Date.now();
      const params = new URLSearchParams();
      params.append('timestamp', timestamp.toString());
      params.append('limit', limit.toString());
      
      if (symbol) {
        params.append('symbol', symbol);
      }
      if (incomeType) {
        params.append('incomeType', incomeType);
      }
      if (startTime) {
        params.append('startTime', startTime.toString());
      }
      if (endTime) {
        params.append('endTime', endTime.toString());
      }

      const queryString = params.toString();
      const signature = this.generateSignature(queryString);

      const url = `${this.baseURL}/fapi/v1/income?${queryString}&signature=${signature}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Binance Income API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        
        throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} income records from Binance API`);
      return { success: true, data };
    } catch (error: any) {
      console.error('Server Binance income client error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch income history',
      };
    }
  }
}

const binanceClient = new ServerBinanceClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const incomeType = searchParams.get('incomeType') || undefined;
    const startTime = searchParams.get('startTime') ? parseInt(searchParams.get('startTime')!) : undefined;
    const endTime = searchParams.get('endTime') ? parseInt(searchParams.get('endTime')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '1000');

    const result = await binanceClient.getIncomeHistory(symbol, incomeType, startTime, endTime, limit);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Income API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
