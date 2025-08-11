'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, Badge } from '@/components/ui';
import { formatCurrency, formatPositionSize, cn, safeParseFloat } from '@/utils';
import { BinanceTrade } from '@/types';

interface RecentTradesTableProps {
  trades: BinanceTrade[];
}

export function RecentTradesTable({ trades }: RecentTradesTableProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Recent Trades
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No trading activity found.
          </p>
        </div>
      </Card>
    );
  }

  // Sort trades by time (most recent first)
  const sortedTrades = [...trades].sort((a, b) => b.time - a.time);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Trades
        </h3>
        <Badge variant="info">
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Realized PnL
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTrades.map((trade, index) => {
              const qty = safeParseFloat(trade.qty);
              const price = safeParseFloat(trade.price);
              const commission = safeParseFloat(trade.commission);
              const realizedPnl = safeParseFloat(trade.realizedPnl);
              const isBuy = trade.side === 'BUY';
              
              return (
                <tr key={`${trade.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {trade.symbol}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={isBuy ? 'success' : 'danger'}>
                      {trade.side}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatPositionSize(qty)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(commission)} {trade.commissionAsset}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <span className={cn(
                      'font-medium',
                      realizedPnl > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : realizedPnl < 0 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {formatCurrency(realizedPnl)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-end">
                      <span>
                        {format(new Date(trade.time), 'MMM dd')}
                      </span>
                      <span className="text-xs">
                        {format(new Date(trade.time), 'HH:mm')}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Total Realized PnL:
          </span>
          <span className={cn(
            'font-semibold',
            sortedTrades.reduce((sum, trade) => sum + safeParseFloat(trade.realizedPnl), 0) > 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {formatCurrency(sortedTrades.reduce((sum, trade) => sum + safeParseFloat(trade.realizedPnl), 0))}
          </span>
        </div>
      </div>
    </Card>
  );
}
