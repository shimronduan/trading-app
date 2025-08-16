'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, useToast } from '@/components/ui';
import { useCreateAtrMultiple, useUpdateAtrMultiple } from '@/hooks';
import { AtrMultiple, AtrMultipleFormData } from '@/types';

const atrMultipleSchema = z.object({
  atr_multiple: z.number()
    .min(0.1, 'ATR multiple must be at least 0.1')
    .max(10, 'ATR multiple must be at most 10'),
  close_fraction: z.number()
    .min(0.01, 'Close fraction must be at least 0.01')
    .max(100, 'Close fraction must be at most 100'),
  PartitionKey: z.string()
    .min(1, 'Partition key is required')
    .regex(/^(tp|tsl)$/, 'Partition key must be either "tp" or "tsl"'),
});

interface AtrMultipleFormProps {
  multiple?: AtrMultiple | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AtrMultipleForm({ multiple, onSuccess, onCancel }: AtrMultipleFormProps) {
  const isEditing = !!multiple;
  const createMultiple = useCreateAtrMultiple();
  const updateMultiple = useUpdateAtrMultiple();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AtrMultipleFormData>({
    resolver: zodResolver(atrMultipleSchema),
    defaultValues: {
      atr_multiple: multiple?.atr_multiple || 1.5,
      close_fraction: multiple?.close_fraction || 25,
      PartitionKey: multiple?.PartitionKey || 'tp',
    },
  });

  const onSubmit = async (data: AtrMultipleFormData) => {
    try {
      if (isEditing) {
        // Update existing record
        const result = await updateMultiple.mutateAsync({
          id: multiple.RowKey,
          data: {
            atr_multiple: data.atr_multiple,
            close_fraction: data.close_fraction,
            PartitionKey: data.PartitionKey,
          },
        });

        if (result.success) {
          showToast('ATR multiple updated successfully!', 'success');
          onSuccess();
        } else {
          showToast(result.error || 'Failed to update ATR multiple', 'error');
        }
      } else {
        // Create new record
        const result = await createMultiple.mutateAsync({
          atr_multiple: data.atr_multiple,
          close_fraction: data.close_fraction,
          PartitionKey: data.PartitionKey,
        });

        if (result.success) {
          showToast('ATR multiple created successfully!', 'success');
          onSuccess();
        } else {
          showToast(result.error || 'Failed to create ATR multiple', 'error');
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
      {/* Partition Key */}
      <div>
        <label htmlFor="PartitionKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          id="PartitionKey"
          {...register('PartitionKey')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="tp">Take Profit (tp)</option>
          <option value="tsl">Trailing Stop Loss (tsl)</option>
        </select>
        {errors.PartitionKey && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.PartitionKey.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Select the type of ATR multiple configuration.
        </p>
      </div>

      {/* ATR Multiple */}
      <div>
        <label htmlFor="atr_multiple" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ATR Multiple
        </label>
        <input
          type="number"
          id="atr_multiple"
          min="0.1"
          max="10"
          step="0.1"
          {...register('atr_multiple', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter ATR multiple (e.g., 1.5)"
        />
        {errors.atr_multiple && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.atr_multiple.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Multiplier for Average True Range calculation (0.1 - 10.0)
        </p>
      </div>

      {/* Close Fraction */}
      <div>
        <label htmlFor="close_fraction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Close Fraction (%)
        </label>
        <input
          type="number"
          id="close_fraction"
          min="0"
          max="100"
          step="1"
          {...register('close_fraction', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter close fraction percentage (e.g., 25)"
        />
        {errors.close_fraction && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.close_fraction.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Percentage of position to close when profit target is reached (0 - 100%)
        </p>
      </div>

      {/* Information notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Azure Table Storage Integration
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {isEditing 
                ? 'Edit and save changes to your ATR multiple configuration in Azure Table Storage.'
                : 'Create a new ATR multiple configuration that will be saved to Azure Table Storage.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
          >
            Reset
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {isEditing ? 'Update ATR Multiple' : 'Create ATR Multiple'}
        </Button>
      </div>
    </form>
  );
}
