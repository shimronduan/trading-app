import { NextResponse } from 'next/server';

const AZURE_API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || 'https://trading-bot-app-v3.azurewebsites.net/api';
const AZURE_API_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY || 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

interface AzureRecord {
  RowKey: string;
  [key: string]: unknown;
}

// Trading configs API returns array directly, not wrapped in records
type AzureResponse = AzureRecord[] | { records: AzureRecord[] };

export async function GET() {
  try {
    console.log('Trading configs API: Starting request');
    console.log('Trading configs API: Azure URL:', `${AZURE_API_BASE_URL}/trading_configs?code=${AZURE_API_KEY}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${AZURE_API_BASE_URL}/trading_configs?code=${AZURE_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('Trading configs API: Response status:', response.status);

    if (!response.ok) {
      console.error('Trading configs API: Azure API Error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Azure API returned ${response.status}: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json() as AzureResponse;
    console.log('Trading configs API: Azure API Response received:', data);

    // Handle different response formats - trading_configs returns array directly
    let records: AzureRecord[] = [];
    
    if (Array.isArray(data)) {
      // Direct array response
      records = data;
      console.log('Trading configs API: Received direct array with', records.length, 'records');
    } else if (data && 'records' in data && Array.isArray(data.records)) {
      // Wrapped in records property
      records = data.records;
      console.log('Trading configs API: Received wrapped records with', records.length, 'records');
    }

    // Transform the data to include id and backward compatibility fields
    if (records.length > 0) {
      const transformedData = records.map((record: AzureRecord) => ({
        ...record,
        id: record.RowKey,
        created_at: record.Timestamp,
        updated_at: record.Timestamp,
      }));

      console.log('Trading configs API: Returning', transformedData.length, 'transformed records');
      return NextResponse.json({
        success: true,
        data: transformedData,
        count: transformedData.length,
      });
    }

    console.log('Trading configs API: No records found, returning empty array');
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
    });

  } catch (error: any) {
    console.error('Trading configs API: Proxy error:', error);
    
    // Check if it's a timeout error
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout - Azure API is taking too long to respond' 
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch trading configurations from Azure API' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Proxying POST request to Azure Functions for trading configs:', body);

    const response = await fetch(`${AZURE_API_BASE_URL}/trading_configs?code=${AZURE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      body: JSON.stringify({
        PartitionKey: body.symbol,
        RowKey: body.symbol,
        leverage: body.leverage,
        wallet_allocation: body.wallet_allocation,
        chart_time_interval: body.chart_time_interval,
        atr_candles: body.atr_candles,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API Error:', response.status, response.statusText, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create trading configuration: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Create response:', data);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        id: data.RowKey,
        created_at: data.Timestamp,
        updated_at: data.Timestamp,
      },
    });

  } catch (error: any) {
    console.error('Proxy POST error:', error);
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout - Azure API is taking too long to respond' 
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create trading configuration' 
      },
      { status: 500 }
    );
  }
}
