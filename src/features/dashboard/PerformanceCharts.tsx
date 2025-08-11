'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from '@/components/ui';
import { PeriodSelector, TimePeriod, filterDataByPeriod } from '@/components/PeriodSelector';
import { formatCurrency, formatPercentage } from '@/utils';
import { DailyPnlData } from '@/types';

interface PerformanceChartsProps {
  dailyPnl: DailyPnlData[];
}

export function PerformanceCharts({ dailyPnl }: PerformanceChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');

  // Filter data based on selected period
  const filteredData = useMemo(() => 
    filterDataByPeriod(dailyPnl, selectedPeriod), 
    [dailyPnl, selectedPeriod]
  );
  // Calculate cumulative PnL for portfolio growth chart using filtered data
  const portfolioData = useMemo(() => {
    return filteredData.map((item, index) => {
      const cumulativePnl = filteredData
        .slice(0, index + 1)
        .reduce((sum, day) => sum + day.pnl, 0);
      
      return {
        date: item.date,
        pnl: item.pnl,
        cumulativePnl,
        formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      };
    });
  }, [filteredData]);

  const totalPnl = portfolioData[portfolioData.length - 1]?.cumulativePnl || 0;
  const profitableDays = filteredData.filter(day => day.pnl > 0).length;
  const totalDays = filteredData.length;
  const winRate = totalDays > 0 ? (profitableDays / totalDays) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the original date from the payload data
      const originalDate = payload[0]?.payload?.date;
      const displayDate = originalDate 
        ? new Date(originalDate).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })
        : label; // fallback to the formatted label if no original date

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {displayDate}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Performance Analytics
        </h2>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily P&L Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily P&L
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatPercentage(winRate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400">Trading Days</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {totalDays}
                </p>
              </div>
            </div>
          </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6B7280"
                fontSize={12}
                tickMargin={8}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value, 'USD', 0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="pnl" 
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Portfolio Growth Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Growth
          </h3>
          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400">Total P&L</p>
            <p className={`font-semibold ${totalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalPnl)}
            </p>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#6B7280"
                fontSize={12}
                tickMargin={8}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value, 'USD', 0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cumulativePnl" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>
    </div>
  );
}
