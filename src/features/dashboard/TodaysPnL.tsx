'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency, formatPercentage, cn, safeParseFloat } from '@/utils';
import { BinanceAccountInfo, DailyPnlData } from '@/types';

interface TodaysPnLProps {
  accountInfo: BinanceAccountInfo;
  dailyPnl: DailyPnlData[];
}

export function TodaysPnL({ accountInfo, dailyPnl }: TodaysPnLProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Find today's P&L from the daily data
  const todaysPnlData = dailyPnl.find(day => day.date === today);
  const todaysPnlAmount = todaysPnlData?.pnl || 0;
  
  // Calculate today's P&L percentage based on account balance
  const totalBalance = safeParseFloat(accountInfo.totalWalletBalance);

  // The portfolio value at the start of the day is the current balance minus today's P&L.
  const portfolioValueStartOfDay = totalBalance - todaysPnlAmount;

  // Calculate today's return based on the portfolio value at the start of the day.
  const todaysReturnPercentage =
    portfolioValueStartOfDay > 0
      ? (todaysPnlAmount / portfolioValueStartOfDay) * 100
      : 0;

  const isPositive = todaysPnlAmount >= 0;
  const isPercentagePositive = todaysReturnPercentage >= 0;

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Performance
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Today's P&L Amount */}
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-lg",
              isPositive 
                ? "bg-green-100 dark:bg-green-900/20" 
                : "bg-red-100 dark:bg-red-900/20"
            )}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Today's P&L
              </p>
              <p className={cn(
                "text-2xl font-bold",
                isPositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {isPositive ? '+' : ''}{formatCurrency(todaysPnlAmount)}
              </p>
            </div>
          </div>

          {/* Today's P&L Percentage */}
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-lg",
              isPercentagePositive 
                ? "bg-green-100 dark:bg-green-900/20" 
                : "bg-red-100 dark:bg-red-900/20"
            )}>
              <Percent className={cn(
                "h-6 w-6",
                isPercentagePositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Today's Return
              </p>
              <p className={cn(
                "text-2xl font-bold",
                isPercentagePositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {formatPercentage(todaysReturnPercentage)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Portfolio Value Start of Day</span>
            <span>{formatCurrency(portfolioValueStartOfDay)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>Current Portfolio Value</span>
            <span>{formatCurrency(totalBalance)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
