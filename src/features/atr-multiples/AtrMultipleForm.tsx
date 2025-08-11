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
    .max(1, 'Close fraction must be at most 1'),
  row: z.number()
    .int('Row must be an integer')
    .min(1, 'Row must be at least 1'),
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
      close_fraction: multiple?.close_fraction || 0.25,
      row: multiple?.row || 1,
    },
  });

  const onSubmit = async (data: AtrMultipleFormData) => {
    try {
      let result;
      
      if (isEditing && multiple?.id) {
        result = await updateMultiple.mutateAsync({
          id: multiple.id,
          data,
        });
      } else {
        result = await createMultiple.mutateAsync(data);
      }

      if (result.success) {
        showToast(
          isEditing ? 'ATR multiple updated successfully' : 'ATR multiple created successfully',
          'success'
        );
        onSuccess();
      } else {
        showToast(result.error || 'Operation failed', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row */}
      <div>
        <label htmlFor="row" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Row
        </label>
        <input
          type="number"
          id="row"
          min="1"
          step="1"
          {...register('row', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter row number"
        />
        {errors.row && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.row.message}
          </p>
        )}
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
          Close Fraction
        </label>
        <input
          type="number"
          id="close_fraction"
          min="0.01"
          max="1"
          step="0.01"
          {...register('close_fraction', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter close fraction (e.g., 0.25)"
        />
        {errors.close_fraction && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.close_fraction.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Fraction of position to close when profit target is reached (0.01 - 1.0)
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
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
          variant="ghost"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? 'Update' : 'Create'} ATR Multiple
        </Button>
      </div>
    </form>
  );
}
