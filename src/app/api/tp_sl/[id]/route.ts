import { NextResponse } from 'next/server';

const AZURE_API_BASE_URL = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || 'https://trading-bot-app-v3.azurewebsites.net/api';
const AZURE_API_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY || 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;
    
    console.log('Updating ATR multiple:', id, data);

    const atrMultipleData = {
      PartitionKey: data.PartitionKey,
      RowKey: id,
      atr_multiple: data.atr_multiple,
      close_fraction: data.close_fraction,
    };

    // Call Azure Function to update the record using PUT to tp_sl/{id} endpoint
    const response = await fetch(`${AZURE_API_BASE_URL}/tp_sl/${id}?code=${AZURE_API_KEY}`, {
      method: 'PUT',
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
          error: `Failed to update ATR multiple: ${response.status} ${response.statusText} - ${errorText}` 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Azure API Update Response:', result);

    // Transform the response
    const transformedData = {
      ...result,
      id: result.RowKey,
      row: parseInt(result.RowKey, 10),
      created_at: result.created_at || result.Timestamp,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error: unknown) {
    console.error('Update Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update ATR multiple: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('Deleting ATR multiple:', id);

    // Call Azure Function to delete the record using DELETE to tp_sl/{id} endpoint
    const response = await fetch(`${AZURE_API_BASE_URL}/tp_sl/${id}?code=${AZURE_API_KEY}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TradingApp/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Azure API Error:', response.status, response.statusText);
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to delete ATR multiple: ${response.status} ${response.statusText} - ${errorText}` 
        },
        { status: response.status }
      );
    }

    console.log('Azure API Delete Response: Success');

    return NextResponse.json({
      success: true,
      data: null,
    });

  } catch (error: unknown) {
    console.error('Delete Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to delete ATR multiple: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}
