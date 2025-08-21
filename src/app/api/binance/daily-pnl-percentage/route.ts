import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Utility function to get UTC date string (YYYY-MM-DD)
function getUTCDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

// Server-side Binance client for percentage-based daily P&L
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

  async getUserTrades(symbol?: string, startTime?: number, endTime?: number, limit: number = 1000) {
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
      if (startTime) {
        params.append('startTime', startTime.toString());
      }
      if (endTime) {
        params.append('endTime', endTime.toString());
      }

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
      console.log(`Fetched ${data.length} trades from Binance API for percentage P&L calculation`);
      return { success: true, data };
    } catch (error: any) {
      console.error('Server Binance trades client error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch trades',
      };
    }
  }

  async calculatePercentageDailyPnl(days: number = 30) {
    try {
      console.log('Calculating percentage-based daily PnL from trade data...');
      
      // Binance API has a maximum of 7 days per request, so we need to chunk our requests
      const allTrades: any[] = [];
      const endTime = Date.now();
      const maxDaysPerRequest = 7;
      
      // Calculate how many requests we need
      const requestCount = Math.ceil(days / maxDaysPerRequest);
      
      for (let i = 0; i < requestCount; i++) {
        const chunkEndTime = endTime - (i * maxDaysPerRequest * 24 * 60 * 60 * 1000);
        const chunkStartTime = Math.max(
          chunkEndTime - (maxDaysPerRequest * 24 * 60 * 60 * 1000),
          endTime - (days * 24 * 60 * 60 * 1000)
        );
        
        console.log(`Fetching trades chunk ${i + 1}/${requestCount}: ${new Date(chunkStartTime).toISOString()} to ${new Date(chunkEndTime).toISOString()}`);
        
        const tradesResponse = await this.getUserTrades(undefined, chunkStartTime, chunkEndTime, 1000);
        
        if (tradesResponse.success && tradesResponse.data) {
          allTrades.push(...tradesResponse.data);
        } else {
          console.error(`Failed to fetch trades chunk ${i + 1}:`, tradesResponse.error);
        }
        
        // Add a small delay to avoid rate limiting
        if (i < requestCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (allTrades.length === 0) {
        console.log('No trades found for the specified period, returning zero UTC dates');
        return {
          success: true,
          data: Array.from({ length: days }, (_, i) => ({
            date: getUTCDateString(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000),
            pnl: 0,
            percentagePnl: 0,
            tradeCount: 0,
          })),
        };
      }

      // Calculate percentage-based daily P&L
      const dailyPercentagePnl = new Map<string, { 
        percentageSum: number, 
        absolutePnl: number, 
        tradeCount: number 
      }>();

      allTrades.forEach((trade: any) => {
        // Convert trade timestamp to UTC date string (YYYY-MM-DD)
        const date = getUTCDateString(trade.time);
        const realizedPnl = parseFloat(trade.realizedPnl);
        const qty = parseFloat(trade.qty);
        const price = parseFloat(trade.price);
        
        // Calculate the initial investment amount for this specific trade execution
        const initialInvestment = qty * price;
        
        // Calculate percentage P&L for this individual trade execution
        // Each order execution (including partial fills) is treated separately
        let tradePercentage = 0;
        
        if (realizedPnl !== 0 && initialInvestment > 0) {
          // Percentage = (Realized P&L / Initial Investment) * 100
          tradePercentage = (realizedPnl / initialInvestment) * 100;
          
          // Log individual trade calculations for debugging
          console.log(`Trade ${trade.id}: ${trade.symbol} - Qty: ${qty}, Price: ${price}, Investment: ${initialInvestment}, PnL: ${realizedPnl}, Percentage: ${tradePercentage.toFixed(4)}%`);
        }

        // Initialize daily data if not exists
        if (!dailyPercentagePnl.has(date)) {
          dailyPercentagePnl.set(date, {
            percentageSum: 0,
            absolutePnl: 0,
            tradeCount: 0
          });
        }

        // Add this trade's percentage to the daily sum
        const dailyData = dailyPercentagePnl.get(date)!;
        dailyData.percentageSum += tradePercentage;
        dailyData.absolutePnl += realizedPnl;
        dailyData.tradeCount += 1;
      });

      // Create array for the requested number of days using UTC
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        // Generate UTC date strings for consistent timezone handling
        const date = getUTCDateString(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayData = dailyPercentagePnl.get(date) || { 
          percentageSum: 0, 
          absolutePnl: 0, 
          tradeCount: 0 
        };
        
        result.push({
          date,
          pnl: dayData.absolutePnl, // Keep original for backward compatibility
          percentagePnl: dayData.percentageSum,
          tradeCount: dayData.tradeCount
        });

        // Log daily summary for debugging
        if (dayData.tradeCount > 0) {
          console.log(`Daily Summary ${date}: ${dayData.tradeCount} trades, Total Percentage P&L: ${dayData.percentageSum.toFixed(4)}%, Absolute P&L: ${dayData.absolutePnl}`);
        }
      }

      console.log(`Calculated percentage-based daily PnL for ${result.length} days from ${allTrades.length} trades`);
      
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Error calculating percentage-based daily PnL:', error);
      
      // Fallback to zero data with UTC dates if there's an error
      return {
        success: true,
        data: Array.from({ length: days }, (_, i) => ({
          date: getUTCDateString(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000),
          pnl: 0,
          percentagePnl: 0,
          tradeCount: 0,
        })),
      };
    }
  }
}

const binanceClient = new ServerBinanceClient();

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    // Mock percentage-based daily P&L data with UTC dates
    const mockData = Array.from({ length: 30 }, (_, i) => {
      const percentagePnl = (Math.random() - 0.5) * 10; // Random between -5% and +5%
      return {
        date: getUTCDateString(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        pnl: percentagePnl * 1000, // Mock absolute value
        percentagePnl: percentagePnl,
        tradeCount: Math.floor(Math.random() * 10) + 1
      };
    });
    return NextResponse.json({ success: true, data: mockData });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const result = await binanceClient.calculatePercentageDailyPnl(days);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Percentage Daily PnL API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
