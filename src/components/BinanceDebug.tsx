'use client';

import React, { useState } from 'react';
import { binanceClient } from '@/lib/binance';

export default function BinanceDebug() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await binanceClient.testConnectivity();
      setTestResult({ type: 'connectivity', ...result });
    } catch (error) {
      setTestResult({ type: 'connectivity', success: false, error: error });
    }
    setIsLoading(false);
  };

  const handleTestCredentials = async () => {
    setIsLoading(true);
    try {
      const result = await binanceClient.testApiCredentials();
      setTestResult({ type: 'credentials', ...result });
    } catch (error) {
      setTestResult({ type: 'credentials', success: false, error: error });
    }
    setIsLoading(false);
  };

  const handleTestAccountInfo = async () => {
    setIsLoading(true);
    try {
      const result = await binanceClient.getAccountInfo();
      setTestResult({ type: 'account', ...result });
    } catch (error) {
      setTestResult({ type: 'account', success: false, error: error });
    }
    setIsLoading(false);
  };

  // Check environment variables (safely)
  const hasApiKey = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_BINANCE_API_KEY && 
    process.env.NEXT_PUBLIC_BINANCE_API_KEY.length > 0 &&
    process.env.NEXT_PUBLIC_BINANCE_API_KEY !== 'your_binance_api_key_here';
  
  // Note: BINANCE_API_SECRET is not accessible in browser for security reasons
  // We'll test this on the server side
  const secretNote = "Server-side only (configured in .env.local)";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Binance API Debug</h3>
      
      {/* Environment Check */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Environment Variables:</h4>
        <div className="space-y-1 text-sm">
          <div className={`flex items-center ${hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-2">{hasApiKey ? '✓' : '✗'}</span>
            NEXT_PUBLIC_BINANCE_API_KEY: {hasApiKey ? 'Set and configured' : 'Missing or using placeholder'}
          </div>
          <div className="flex items-center text-blue-600">
            <span className="mr-2">ℹ</span>
            BINANCE_API_SECRET: {secretNote}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>
        <button
          onClick={handleTestCredentials}
          disabled={isLoading || !hasApiKey}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Credentials
        </button>
        <button
          onClick={handleTestAccountInfo}
          disabled={isLoading || !hasApiKey}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Account Info
        </button>
      </div>

      {/* Results */}
      {testResult && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Result ({testResult.type}):</h4>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Note:</strong> Make sure your .env.local file contains:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>NEXT_PUBLIC_BINANCE_API_KEY=your_api_key</li>
          <li>BINANCE_API_SECRET=your_secret_key</li>
        </ul>
        <p className="mt-2">And that your Binance API key has futures trading permissions enabled.</p>
      </div>
    </div>
  );
}
