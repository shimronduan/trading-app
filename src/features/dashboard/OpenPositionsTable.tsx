'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { formatCurrency, formatPercentage, formatPositionSize, getPnlColor, cn, safeParseFloat } from '@/utils';
import { BinancePosition } from '@/types';

interface OpenPositionsTableProps {
  positions: BinancePosition[];
}

export function OpenPositionsTable({ positions }: OpenPositionsTableProps) {
  // Filter out positions with zero amounts
  const activePositions = positions.filter(pos => safeParseFloat(pos.positionAmt) !== 0);

  if (activePositions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Open Positions
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any open positions at the moment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Open Positions
        </h3>
        <Badge variant="info">
          {activePositions.length} position{activePositions.length !== 1 ? 's' : ''}
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
                Size
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mark Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PnL
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Leverage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {activePositions.map((position, index) => {
              const positionAmt = safeParseFloat(position.positionAmt);
              const entryPrice = safeParseFloat(position.entryPrice);
              const markPrice = safeParseFloat(position.markPrice);
              const unrealizedProfit = safeParseFloat(position.unrealizedProfit);
              const leverage = safeParseFloat(position.leverage);
              
              const pnlPercentage = entryPrice > 0 
                ? ((markPrice - entryPrice) / entryPrice) * 100 * (positionAmt > 0 ? 1 : -1)
                : 0;

              const isLong = positionAmt > 0;
              
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {position.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={isLong ? 'success' : 'danger'}>
                      {isLong ? 'LONG' : 'SHORT'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatPositionSize(Math.abs(positionAmt))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(entryPrice)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(markPrice)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex flex-col items-end">
                      <span className={cn('font-medium', getPnlColor(unrealizedProfit))}>
                        {formatCurrency(unrealizedProfit)}
                      </span>
                      <span className={cn('text-xs', getPnlColor(pnlPercentage))}>
                        {formatPercentage(pnlPercentage)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {leverage}x
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
            Total Unrealized PnL:
          </span>
          <span className={cn(
            'font-semibold',
            getPnlColor(activePositions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedProfit), 0))
          )}>
            {formatCurrency(activePositions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedProfit), 0))}
          </span>
        </div>
      </div>
    </Card>
  );
}
