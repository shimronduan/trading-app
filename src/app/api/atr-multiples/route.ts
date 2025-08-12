import { NextRequest, NextResponse } from 'next/server';

const AZURE_API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || 'https://trading-bot-app-v3.azurewebsites.net/api';
const AZURE_API_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY || 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

export async function GET() {
  try {
    console.log('Proxying request to Azure Functions...');
    console.log('URL:', `${AZURE_API_BASE_URL}/tp_sl?code=${AZURE_API_KEY}`);
    
    const response = await fetch(`${AZURE_API_BASE_URL}/tp_sl?code=${AZURE_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      console.error('Azure API Error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Azure API returned ${response.status}: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Azure API Response received:', data);

    // Transform the data to include id and backward compatibility fields
    if (data && data.records) {
      const transformedData = data.records.map((record: any) => ({
        ...record,
        id: record.RowKey,
        row: parseInt(record.RowKey, 10),
        created_at: record.Timestamp,
        updated_at: record.Timestamp,
      }));

      return NextResponse.json({
        success: true,
        data: transformedData,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid response format from Azure endpoint',
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout - Azure endpoint took too long to respond' 
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch data from Azure endpoint' 
      },
      { status: 500 }
    );
  }
}
