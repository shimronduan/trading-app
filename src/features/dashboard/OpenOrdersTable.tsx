'use client';

import React from 'react';
import { Clock, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatCurrency, formatPercentage, cn, safeParseFloat } from '@/utils';
import { BinanceOrder } from '@/types';

interface OpenOrdersTableProps {
  orders: BinanceOrder[];
  isLoading?: boolean;
}

export function OpenOrdersTable({ orders, isLoading }: OpenOrdersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open Orders
            </h3>
          </div>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open Orders
            </h3>
          </div>
          <EmptyState
            title="No Open Orders"
            description="You have no open orders at the moment."
            icon={<Clock className="h-12 w-12 text-gray-400" />}
          />
        </div>
      </Card>
    );
  }

  const getOrderTypeIcon = (side: string, type: string) => {
    if (side === 'BUY') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'partially_filled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'filled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatOrderType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Open Orders
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => {
                  const quantity = safeParseFloat(order.origQty);
                  const executedQty = safeParseFloat(order.executedQty);
                  const price = safeParseFloat(order.price);
                  const fillPercentage = quantity > 0 ? (executedQty / quantity) * 100 : 0;
                  
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.positionSide}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatOrderType(order.type)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.timeInForce}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getOrderTypeIcon(order.side, order.type)}
                          <span className={cn(
                            "text-sm font-medium",
                            order.side === 'BUY' 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-red-600 dark:text-red-400"
                          )}>
                            {order.side}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {quantity.toFixed(4)}
                        </div>
                        {executedQty > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Filled: {formatPercentage(fillPercentage)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {price > 0 ? formatCurrency(price, 'USD', 2) : 'Market'}
                        </div>
                        {order.stopPrice && safeParseFloat(order.stopPrice) > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Stop: {formatCurrency(safeParseFloat(order.stopPrice), 'USD', 2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                          getStatusColor(order.status)
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
