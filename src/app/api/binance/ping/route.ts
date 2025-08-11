import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connectivity to Binance
    const response = await fetch('https://fapi.binance.com/fapi/v1/ping', {
      method: 'GET',
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: true,
        message: 'Binance API is reachable'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Binance API unreachable: ${response.status} ${response.statusText}`
      }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Connectivity test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to connect to Binance API'
    }, { status: 500 });
  }
}
