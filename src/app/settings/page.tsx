'use client';

import React, { useState } from 'react';
import { Key, Database, Globe, Bell, Save } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { useTheme } from '@/lib/theme';

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    binanceApiKey: process.env.NEXT_PUBLIC_BINANCE_API_KEY || '',
    azureApiUrl: process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || '',
    refreshInterval: '60',
    notifications: true,
  });

  const handleSave = () => {
    // In a real app, you would save these to localStorage or a backend
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your trading bot dashboard and API connections.
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Configuration
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="binanceApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Binance API Key
            </label>
            <input
              type="password"
              id="binanceApiKey"
              value={settings.binanceApiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, binanceApiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your Binance API key"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Required for live Binance data. Keep this secure and never share it.
            </p>
          </div>

          <div>
            <label htmlFor="azureApiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Azure API Base URL
            </label>
            <input
              type="url"
              id="azureApiUrl"
              value={settings.azureApiUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, azureApiUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://your-function-app.azurewebsites.net"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Base URL for your Azure Functions API.
            </p>
          </div>
        </div>
      </Card>

      {/* App Configuration */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            App Configuration
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Refresh Interval (seconds)
            </label>
            <select
              id="refreshInterval"
              value={settings.refreshInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Push Notifications
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive notifications for important trading events
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Theme Configuration */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Appearance
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Development Mode Notice */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Development Mode
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The app is currently using mock data for development.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set NEXT_PUBLIC_USE_MOCK_DATA=false in your .env.local file to use live APIs.
            </p>
          </div>
          <Badge variant="warning">
            Mock Data
          </Badge>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
