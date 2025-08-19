'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, useToast } from '@/components/ui';
import { useCreateTradingConfig, useUpdateTradingConfig } from '@/hooks';
import { TradingConfig, TradingConfigFormData } from '@/types';

const tradingConfigSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .regex(/^[A-Z]+USDT$/, 'Symbol must be in format like "BTCUSDT", "ETHUSDT"'),
  leverage: z.number()
    .min(1, 'Leverage must be at least 1x')
    .max(125, 'Leverage must be at most 125x'),
  wallet_allocation: z.number()
    .min(0.01, 'Wallet allocation must be at least 1%')
    .max(1, 'Wallet allocation must be at most 100%'),
  chart_time_interval: z.string()
    .min(1, 'Chart time interval is required'),
  atr_candles: z.number()
    .min(1, 'ATR candles must be at least 1')
    .max(100, 'ATR candles must be at most 100'),
});

interface TradingConfigFormProps {
  config?: TradingConfig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const timeIntervals = [
  { value: '1m', label: '1 minute' },
  { value: '3m', label: '3 minutes' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '2h', label: '2 hours' },
  { value: '4h', label: '4 hours' },
  { value: '6h', label: '6 hours' },
  { value: '8h', label: '8 hours' },
  { value: '12h', label: '12 hours' },
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' },
];

export function TradingConfigForm({ config, onSuccess, onCancel }: TradingConfigFormProps) {
  const isEditing = !!config;
  const createConfig = useCreateTradingConfig();
  const updateConfig = useUpdateTradingConfig();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TradingConfigFormData>({
    resolver: zodResolver(tradingConfigSchema),
    defaultValues: {
      symbol: config?.RowKey || '',
      leverage: config?.leverage || 10,
      wallet_allocation: config?.wallet_allocation || 0.1,
      chart_time_interval: config?.chart_time_interval || '15m',
      atr_candles: config?.atr_candles || 14,
    },
  });

  const onSubmit = async (data: TradingConfigFormData) => {
    try {
      if (isEditing) {
        // Update existing record
        const result = await updateConfig.mutateAsync({
          symbol: config.RowKey,
          data: {
            leverage: data.leverage,
            wallet_allocation: data.wallet_allocation,
            chart_time_interval: data.chart_time_interval,
            atr_candles: data.atr_candles,
          },
        });

        if (result.success) {
          showToast('Trading configuration updated successfully!', 'success');
          onSuccess();
        } else {
          showToast(result.error || 'Failed to update trading configuration', 'error');
        }
      } else {
        // Create new record
        const result = await createConfig.mutateAsync({
          symbol: data.symbol.toUpperCase(),
          leverage: data.leverage,
          wallet_allocation: data.wallet_allocation,
          chart_time_interval: data.chart_time_interval,
          atr_candles: data.atr_candles,
        });

        if (result.success) {
          showToast('Trading configuration created successfully!', 'success');
          onSuccess();
        } else {
          showToast(result.error || 'Failed to create trading configuration', 'error');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showToast('An unexpected error occurred', 'error');
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Symbol */}
      <div>
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Trading Symbol
        </label>
        <input
          id="symbol"
          type="text"
          placeholder="e.g., DOGEUSDT, BTCUSDT"
          disabled={isEditing} // Can't change symbol when editing
          {...register('symbol')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.symbol && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.symbol.message}
          </p>
        )}
        {!isEditing && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter the trading pair symbol (must end with USDT)
          </p>
        )}
      </div>

      {/* Leverage */}
      <div>
        <label htmlFor="leverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Leverage
        </label>
        <input
          id="leverage"
          type="number"
          min="1"
          max="125"
          step="1"
          {...register('leverage', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.leverage && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.leverage.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Trading leverage (1x to 125x)
        </p>
      </div>

      {/* Wallet Allocation */}
      <div>
        <label htmlFor="wallet_allocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wallet Allocation
        </label>
        <input
          id="wallet_allocation"
          type="number"
          min="0.01"
          max="1"
          step="0.01"
          {...register('wallet_allocation', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.wallet_allocation && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.wallet_allocation.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Percentage of wallet to allocate (0.01 = 1%, 1 = 100%)
        </p>
      </div>

      {/* Chart Time Interval */}
      <div>
        <label htmlFor="chart_time_interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chart Time Interval
        </label>
        <select
          id="chart_time_interval"
          {...register('chart_time_interval')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {timeIntervals.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label}
            </option>
          ))}
        </select>
        {errors.chart_time_interval && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.chart_time_interval.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Timeframe for chart analysis
        </p>
      </div>

      {/* ATR Candles */}
      <div>
        <label htmlFor="atr_candles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ATR Calculation Period
        </label>
        <input
          id="atr_candles"
          type="number"
          min="1"
          max="100"
          step="1"
          {...register('atr_candles', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.atr_candles && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.atr_candles.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Number of candles for ATR calculation (typically 14)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update Configuration' : 'Create Configuration')
          }
        </Button>
      </div>
    </form>
  );
}
