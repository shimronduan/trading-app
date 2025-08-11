'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { TodaysPnL } from '@/features/dashboard/TodaysPnL';
import { WalletOverview } from '@/features/dashboard/WalletOverview';
import { PerformanceCharts } from '@/features/dashboard/PerformanceCharts';
import { OpenPositionsTable } from '@/features/dashboard/OpenPositionsTable';
import { OpenOrdersTable } from '@/features/dashboard/OpenOrdersTable';
import { RecentTradesTable } from '@/features/dashboard/RecentTradesTable';
import { useDashboardData } from '@/hooks';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Today's Performance Skeleton */}
        <Card>
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Wallet Overview Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <EmptyState
          title="Failed to Load Dashboard Data"
          description="There was an error loading your trading data. Please check your API configuration and try again."
          icon={<AlertCircle className="h-12 w-12 text-red-500" />}
          action={
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const { accountInfo, recentTrades, openOrders, dailyPnl } = data;

  if (!accountInfo) {
    return (
      <Card>
        <EmptyState
          title="No Account Data Available"
          description="Unable to fetch account information. Please verify your API keys and connection."
          icon={<AlertCircle className="h-12 w-12 text-orange-500" />}
          action={
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Performance - Primary focus */}
      <TodaysPnL accountInfo={accountInfo} dailyPnl={dailyPnl} />

      {/* Wallet Overview - Secondary metrics */}
      <WalletOverview accountInfo={accountInfo} />

      {/* Performance Charts - Growth tracking */}
      {dailyPnl.length > 0 && (
        <PerformanceCharts dailyPnl={dailyPnl} />
      )}

      {/* Current Trading Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Current Positions */}
        <div className="lg:col-span-1">
          <OpenPositionsTable positions={accountInfo.positions || []} />
        </div>

        {/* Open Orders */}
        <div className="lg:col-span-1">
          <OpenOrdersTable orders={openOrders} />
        </div>
      </div>

      {/* Recent Trading History */}
      <div className="grid grid-cols-1">
        <RecentTradesTable trades={recentTrades} />
      </div>

      {/* Refresh Controls */}
      <div className="flex justify-center pt-4">
        <Button
          variant="secondary"
          onClick={() => refetch()}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </Button>
      </div>
    </div>
  );
}
