import { NextResponse } from 'next/server';

const AZURE_API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || 'https://trading-bot-app-v3.azurewebsites.net/api';
const AZURE_API_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY || 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

export async function PUT(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const body = await request.json();
    const symbol = params.symbol;
    
    console.log('Proxying PUT request to Azure Functions for trading config:', symbol, body);

    const response = await fetch(`${AZURE_API_BASE_URL}/trading_configs/${symbol}?code=${AZURE_API_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      body: JSON.stringify({
        PartitionKey: symbol,
        RowKey: symbol,
        ...body,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API Error:', response.status, response.statusText, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to update trading configuration: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Update response:', data);

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
    console.error('Proxy PUT error:', error);
    
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
        error: error.message || 'Failed to update trading configuration' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    
    console.log('Proxying DELETE request to Azure Functions for trading config:', symbol);

    const response = await fetch(`${AZURE_API_BASE_URL}/trading_configs/${symbol}?code=${AZURE_API_KEY}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API Delete Error:', response.status, response.statusText, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to delete trading configuration: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Delete response:', data);

    return NextResponse.json({
      success: true,
      data: data,
    });

  } catch (error: any) {
    console.error('Proxy DELETE error:', error);
    
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
        error: error.message || 'Failed to delete trading configuration' 
      },
      { status: 500 }
    );
  }
}
