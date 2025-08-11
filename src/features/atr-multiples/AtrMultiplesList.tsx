'use client';

import React, { useState } from 'react';
import { Plus, Search, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Card, Button, Badge, Modal, EmptyState, LoadingSpinner, useToast } from '@/components/ui';
import { cn, debounce } from '@/utils';
import { useAtrMultiples, useDeleteAtrMultiple } from '@/hooks';
import { AtrMultiple } from '@/types';
import { AtrMultipleForm } from './AtrMultipleForm';

type SortField = 'row' | 'atr_multiple' | 'close_fraction' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function AtrMultiplesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('row');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedMultiple, setSelectedMultiple] = useState<AtrMultiple | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [multipleToDelete, setMultipleToDelete] = useState<AtrMultiple | null>(null);

  const { data: multiplesResponse, isLoading, isError } = useAtrMultiples();
  const deleteMultiple = useDeleteAtrMultiple();
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
      multiple.row.toString().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
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
    setMultipleToDelete(multiple);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!multipleToDelete?.id) return;

    try {
      const result = await deleteMultiple.mutateAsync(multipleToDelete.id);
      if (result.success) {
        showToast('ATR multiple deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete ATR multiple', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete ATR multiple', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setMultipleToDelete(null);
    }
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
          <p className="text-gray-500 dark:text-gray-400">
            Failed to load ATR multiples. Please try again.
          </p>
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
            Manage your ATR multiple settings for trading bot configuration.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add ATR Multiple
        </Button>
      </div>

      {/* Search and Stats */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by multiple, fraction, or row..."
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
            description={searchTerm ? "No multiples match your search criteria." : "Get started by adding your first ATR multiple."}
            icon={<Plus className="h-12 w-12" />}
            action={
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add ATR Multiple
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="row">Row</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="atr_multiple">ATR Multiple</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="close_fraction">Close Fraction</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="created_at">Created</SortButton>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedMultiples.map((multiple) => (
                  <tr key={multiple.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="default">
                        {multiple.row}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {multiple.atr_multiple}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {multiple.close_fraction}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {multiple.created_at 
                        ? new Date(multiple.created_at).toLocaleDateString()
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
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(multiple)}
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
        )}
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedMultiple ? 'Edit ATR Multiple' : 'Add ATR Multiple'}
          size="md"
        >
          <AtrMultipleForm
            multiple={selectedMultiple}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && multipleToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete ATR Multiple"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this ATR multiple? This action cannot be undone.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Row:</span> {multipleToDelete.row}
              </p>
              <p className="text-sm">
                <span className="font-medium">ATR Multiple:</span> {multipleToDelete.atr_multiple}
              </p>
              <p className="text-sm">
                <span className="font-medium">Close Fraction:</span> {multipleToDelete.close_fraction}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                isLoading={deleteMultiple.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
