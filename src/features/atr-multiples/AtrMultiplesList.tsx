'use client';

import React, { useState } from 'react';
import { Plus, Search, ArrowUpDown, Edit, Eye } from 'lucide-react';
import { Card, Button, Badge, Modal, EmptyState, LoadingSpinner, useToast } from '@/components/ui';
import { cn, debounce } from '@/utils';
import { useAtrMultiples } from '@/hooks';
import { AtrMultiple } from '@/types';
import { AtrMultipleForm } from './AtrMultipleForm';

type SortField = 'RowKey' | 'atr_multiple' | 'close_fraction' | 'Timestamp';
type SortDirection = 'asc' | 'desc';

export function AtrMultiplesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('RowKey');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedMultiple, setSelectedMultiple] = useState<AtrMultiple | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: multiplesResponse, isLoading, isError } = useAtrMultiples();
  const { showToast } = useToast();

  const multiples = multiplesResponse?.data || [];

  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Filter and sort multiples
  const filteredAndSortedMultiples = React.useMemo(() => {
    let filtered = multiples.filter(multiple => 
      multiple.atr_multiple.toString().includes(searchTerm) ||
      multiple.close_fraction.toString().includes(searchTerm) ||
      (multiple.RowKey && multiple.RowKey.toString().includes(searchTerm)) ||
      (multiple.PartitionKey && multiple.PartitionKey.includes(searchTerm))
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'Timestamp') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (sortField === 'RowKey') {
        aValue = parseInt(aValue, 10) || 0;
        bValue = parseInt(bValue, 10) || 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [multiples, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (multiple: AtrMultiple) => {
    setSelectedMultiple(multiple);
    setIsFormOpen(true);
  };

  const handleDelete = (multiple: AtrMultiple) => {
    showToast('This data source is read-only. ATR multiples cannot be deleted.', 'error');
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMultiple(null);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <span>{children}</span>
      <ArrowUpDown className={cn(
        'h-3 w-3 transition-opacity',
        sortField === field ? 'opacity-100' : 'opacity-40'
      )} />
    </button>
  );

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading ATR Multiples
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Failed to load ATR multiples from Azure endpoint. This might be due to network connectivity or CORS issues.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 text-left max-w-md mx-auto">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Troubleshooting:</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify the Azure endpoint is accessible</li>
              <li>• Ensure the API key is correct</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="primary"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ATR Multiples
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View ATR multiple settings from your Azure trading bot configuration (Read-only).
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Data Source: Azure Functions
          </span>
        </div>
      </div>

      {/* Search and Stats */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by multiple, fraction, type, or row..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="info">
              {filteredAndSortedMultiples.length} of {multiples.length} multiples
            </Badge>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {filteredAndSortedMultiples.length === 0 ? (
          <EmptyState
            title="No ATR multiples found"
            description={searchTerm ? "No multiples match your search criteria." : "No ATR multiples are currently available from the Azure endpoint."}
            icon={<Search className="h-12 w-12" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="RowKey">Row</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="atr_multiple">ATR Multiple</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="close_fraction">Close Fraction (%)</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="Timestamp">Updated</SortButton>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedMultiples.map((multiple) => (
                  <tr key={multiple.id || multiple.RowKey} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="default">
                        {multiple.RowKey}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={multiple.PartitionKey === 'tp' ? 'success' : 'warning'}>
                        {multiple.PartitionKey === 'tp' ? 'Take Profit' : 'Trailing Stop'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {multiple.atr_multiple}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {multiple.close_fraction}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {multiple.Timestamp 
                        ? new Date(multiple.Timestamp).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(multiple)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title="View ATR Multiple"
          size="md"
        >
          <AtrMultipleForm
            multiple={selectedMultiple}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </Modal>
      )}
    </div>
  );
}
