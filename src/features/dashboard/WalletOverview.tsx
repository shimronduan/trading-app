'use client';

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency, formatPercentage, cn } from '@/utils';
import { BinanceAccountInfo } from '@/types';

interface WalletOverviewProps {
  accountInfo: BinanceAccountInfo;
}

export function WalletOverview({ accountInfo }: WalletOverviewProps) {
  const totalBalance = parseFloat(accountInfo.totalWalletBalance);
  const unrealizedPnl = parseFloat(accountInfo.totalUnrealizedPnl);
  const marginBalance = parseFloat(accountInfo.totalMarginBalance);
  const availableBalance = parseFloat(accountInfo.availableBalance);
  
  const pnlPercentage = totalBalance > 0 ? (unrealizedPnl / totalBalance) * 100 : 0;
  const marginUtilization = totalBalance > 0 ? ((totalBalance - availableBalance) / totalBalance) * 100 : 0;

  const stats = [
    {
      title: 'Total Wallet Balance',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Unrealized PnL',
      value: formatCurrency(unrealizedPnl),
      subtitle: formatPercentage(pnlPercentage),
      icon: unrealizedPnl >= 0 ? TrendingUp : TrendingDown,
      color: unrealizedPnl >= 0 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400',
      bgColor: unrealizedPnl >= 0 
        ? 'bg-green-100 dark:bg-green-900/20' 
        : 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'Margin Balance',
      value: formatCurrency(marginBalance),
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Available Balance',
      value: formatCurrency(availableBalance),
      subtitle: `${formatPercentage(100 - marginUtilization)} free`,
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className={cn('text-sm font-medium', stat.color)}>
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
