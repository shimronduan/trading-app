'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ArrowUpDown, Edit, Trash2, Settings } from 'lucide-react';
import { Card, Button, Badge, Modal, EmptyState, LoadingSpinner, useToast } from '@/components/ui';
import { cn, debounce } from '@/utils';
import { useDeleteTradingConfig } from '@/hooks';
import { TradingConfig } from '@/types';
import { TradingConfigForm } from './TradingConfigForm';
import { azureApiClient } from '@/lib/azure';

type SortField = 'RowKey' | 'leverage' | 'wallet_allocation' | 'chart_time_interval' | 'Timestamp';
type SortDirection = 'asc' | 'desc';

export function TradingConfigsList() {
  // All hooks must be called at the top level, unconditionally
  const [isClient, setIsClient] = useState(false);
  const [configs, setConfigs] = useState<TradingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('RowKey');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedConfig, setSelectedConfig] = useState<TradingConfig | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const deleteConfigMutation = useDeleteTradingConfig();
  const { showToast } = useToast();

  // Filter and sort configs - must be declared before early return
  const filteredAndSortedConfigs = useMemo(() => {
    let filtered = configs.filter(config => 
      config.RowKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.PartitionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.leverage.toString().includes(searchTerm) ||
      config.wallet_allocation.toString().includes(searchTerm) ||
      config.chart_time_interval.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.atr_candles.toString().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'Timestamp') {
        const dateA = new Date(aValue || 0);
        const dateB = new Date(bValue || 0);
        // Handle invalid dates by putting them at the end
        aValue = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        bValue = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [configs, searchTerm, sortField, sortDirection]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;
    
    const fetchConfigs = async () => {
      console.log('TradingConfigsList: Fetching configs with direct approach');
      try {
        setIsLoading(true);
        setError(null);
        const response = await azureApiClient.getTradingConfigs();
        console.log('TradingConfigsList: Direct fetch response =', response);
        if (response.success && response.data) {
          setConfigs(response.data);
          console.log('TradingConfigsList: Set configs =', response.data);
        } else {
          setError('Failed to fetch trading configurations');
        }
      } catch (err) {
        console.error('TradingConfigsList: Fetch error =', err);
        setError('Error loading trading configurations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfigs();
  }, [isClient]);
  
  console.log('TradingConfigsList: Component rendered, isClient =', isClient, 'configs =', configs, 'isLoading =', isLoading);

  // Refetch function for updating data
  const refetchConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await azureApiClient.getTradingConfigs();
      if (response.success && response.data) {
        setConfigs(response.data);
      }
    } catch (err) {
      console.error('Refetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until we're on the client side
  if (!isClient) {
    return <LoadingSpinner />;
  }

  // Helper function to format timestamps safely
  const formatTimestamp = (timestamp: string | number | undefined | null): string => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle various timestamp formats
      let date: Date;
      
      // If it's a valid date string
      if (typeof timestamp === 'string') {
        // Handle Azure's malformed timestamp format with both timezone offset and Z
        let cleanedTimestamp = timestamp;
        
        // Fix Azure's format: '2025-08-10T11:57:46.323396+00:00Z' -> '2025-08-10T11:57:46.323396+00:00'
        if (timestamp.includes('+') && timestamp.endsWith('Z')) {
          cleanedTimestamp = timestamp.slice(0, -1); // Remove the trailing 'Z'
        }
        
        // Try parsing as ISO string first (Azure Table Storage format)
        date = new Date(cleanedTimestamp);
        
        // If parsing failed, try other common formats
        if (isNaN(date.getTime())) {
          // Try parsing as timestamp number if it's a string of numbers
          if (/^\d+$/.test(timestamp)) {
            date = new Date(parseInt(timestamp, 10));
          } else {
            // Try the original timestamp if cleaning didn't work
            date = new Date(timestamp);
          }
        }
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'N/A';
      }
      
      // Final check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp format:', timestamp);
        return 'N/A';
      }
      
      // Return formatted date with time for better UX
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'N/A';
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (config: TradingConfig) => {
    console.log('Opening modal for config:', config); // Debug log
    setSelectedConfig(config);
    setIsFormOpen(true);
  };

  const handleDelete = async (config: TradingConfig) => {
    if (window.confirm(`Are you sure you want to delete the trading configuration for ${config.RowKey}? This action cannot be undone.`)) {
      try {
        const result = await deleteConfigMutation.mutateAsync(config.RowKey);
        
        if (result.success) {
          showToast('Trading configuration deleted successfully!', 'success');
          // Refetch the data to update the list
          refetchConfigs();
        } else {
          showToast(result.error || 'Failed to delete trading configuration', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        showToast('An error occurred while deleting', 'error');
      }
    }
  };

  const handleFormClose = () => {
    console.log('Closing modal'); // Debug log
    setIsFormOpen(false);
    setSelectedConfig(null);
    // Refetch data to ensure we have the latest
    refetchConfigs();
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

  const formatWalletAllocation = (allocation: number): string => {
    return `${(allocation * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
          <div className="ml-4">Loading trading configurations...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Trading Configurations
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Failed to load trading configurations from Azure endpoint. This might be due to network connectivity or CORS issues.
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

  // Debug: Show raw data
  if (configs.length === 0 && !isLoading && !error) {
    return (
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Debug: Trading Configs Response</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
            {JSON.stringify({ configs, isLoading, error }, null, 2)}
          </pre>
          <div className="mt-4">
            <p>Configs count: {configs.length}</p>
            <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Trading Configurations
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage trading bot configurations for different symbols and their parameters.
            </p>
          </div>
          <div className="flex flex-col space-y-3 w-full">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Data Source: Azure Table Storage
              </span>
            </div>
            <Button
              onClick={() => {
                setSelectedConfig(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search configurations..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Total: {configs.length}</span>
              <span>Filtered: {filteredAndSortedConfigs.length}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredAndSortedConfigs.length === 0 ? (
          <EmptyState
            icon={<Settings className="h-12 w-12" />}
            title="No trading configurations found"
            description={searchTerm 
              ? "No configurations match your search criteria. Try adjusting your search terms."
              : "You haven't created any trading configurations yet. Create your first configuration to get started."
            }
            action={
              !searchTerm ? (
                <Button
                  onClick={() => {
                    setSelectedConfig(null);
                    setIsFormOpen(true);
                  }}
                  variant="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Configuration
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <SortButton field="RowKey">Symbol</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <SortButton field="leverage">Leverage</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <SortButton field="wallet_allocation">Allocation</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <SortButton field="chart_time_interval">Timeframe</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left">
                      ATR Candles
                    </th>
                    <th className="px-6 py-3 text-left">
                      <SortButton field="Timestamp">Last Updated</SortButton>
                    </th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedConfigs.map((config) => (
                    <tr key={config.RowKey} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Badge variant="default" className="text-xs font-mono">
                            {config.RowKey}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={config.leverage >= 10 ? "warning" : "default"}
                          className="text-xs"
                        >
                          {config.leverage}x
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatWalletAllocation(config.wallet_allocation)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default" className="text-xs">
                          {config.chart_time_interval}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {config.atr_candles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(config.Timestamp)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredAndSortedConfigs.map((config) => (
                <div key={config.RowKey} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default" className="text-sm font-mono">
                      {config.RowKey}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Leverage
                      </label>
                      <div className="mt-1">
                        <Badge 
                          variant={config.leverage >= 10 ? "warning" : "default"}
                          className="text-xs"
                        >
                          {config.leverage}x
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Allocation
                      </label>
                      <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {formatWalletAllocation(config.wallet_allocation)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timeframe
                      </label>
                      <div className="mt-1">
                        <Badge variant="default" className="text-xs">
                          {config.chart_time_interval}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ATR Candles
                      </label>
                      <div className="mt-1 text-sm text-gray-900 dark:text-white">
                        {config.atr_candles}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </label>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(config.Timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={selectedConfig ? 'Edit Trading Configuration' : 'Create Trading Configuration'}
        size="lg"
      >
        <TradingConfigForm
          config={selectedConfig}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>
    </div>
  );
}
