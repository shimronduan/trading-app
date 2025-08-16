import { NextResponse } from 'next/server';

const AZURE_API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || 'https://trading-bot-app-v3.azurewebsites.net/api';
const AZURE_API_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY || 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

interface AzureRecord {
  RowKey: string;
  [key: string]: unknown;
}

interface AzureResponse {
  records: AzureRecord[];
}

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

    const data = await response.json() as AzureResponse;
    console.log('Azure API Response received:', data);

    // Transform the data to include id and backward compatibility fields
    if (data && data.records) {
      const transformedData = data.records.map((record: AzureRecord) => ({
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

  } catch (error: unknown) {
    console.error('Proxy Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    if (errorName === 'TimeoutError') {
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
        error: `Failed to fetch from Azure endpoint: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating ATR multiple:', data);

    // First, fetch existing records to determine the next RowKey
    const existingResponse = await fetch(`${AZURE_API_BASE_URL}/tp_sl?code=${AZURE_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    let nextRowKey = 1;
    if (existingResponse.ok) {
      const existingData = await existingResponse.json() as AzureResponse;
      if (existingData && existingData.records && existingData.records.length > 0) {
        // Find the highest RowKey for the same PartitionKey
        const samePartitionRecords = existingData.records.filter(
          record => record.PartitionKey === data.PartitionKey
        );
        if (samePartitionRecords.length > 0) {
          const maxRowKey = Math.max(...samePartitionRecords.map(record => parseInt(record.RowKey, 10) || 0));
          nextRowKey = maxRowKey + 1;
        }
      }
    }

    const atrMultipleData = {
      PartitionKey: data.PartitionKey,
      RowKey: nextRowKey.toString(),
      atr_multiple: data.atr_multiple,
      close_fraction: data.close_fraction,
    };

    console.log('Creating ATR multiple with RowKey:', atrMultipleData);

    // Call Azure Function to create the record using POST to tp_sl endpoint
    const response = await fetch(`${AZURE_API_BASE_URL}/tp_sl?code=${AZURE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      body: JSON.stringify(atrMultipleData),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Azure API Error:', response.status, response.statusText);
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create ATR multiple: ${response.status} ${response.statusText} - ${errorText}` 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Azure API Create Response:', result);

    // Transform the response
    const transformedData = {
      ...result,
      id: result.RowKey,
      row: parseInt(result.RowKey, 10),
      created_at: result.Timestamp,
      updated_at: result.Timestamp,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error: unknown) {
    console.error('Create Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create ATR multiple: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}
