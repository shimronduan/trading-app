import axios, { AxiosInstance } from 'axios';
import { 
  AtrMultiple, 
  AtrMultiplesResponse,
  CreateAtrMultipleRequest, 
  UpdateAtrMultipleRequest,
  ApiResponse 
} from '@/types';

class AzureApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Use localhost for Next.js API proxy
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication (not needed for proxy)
    this.client.interceptors.request.use((config) => {
      // No authentication needed when using Next.js API proxy
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Azure API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all ATR multiples using Next.js API proxy
   */
  async getAtrMultiples(): Promise<ApiResponse<AtrMultiple[]>> {
    try {
      // Use Next.js API route as proxy to avoid CORS issues
      const response = await this.client.get('/api/atr-multiples');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Failed to fetch ATR multiples',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch ATR multiples',
      };
    }
  }

  /**
   * Get a specific ATR multiple by ID (RowKey) using Next.js API proxy
   */
  async getAtrMultiple(id: string): Promise<ApiResponse<AtrMultiple>> {
    try {
      // Use the same proxy endpoint and filter client-side
      const response = await this.client.get('/api/atr-multiples');
      
      if (response.data.success && response.data.data) {
        const record = response.data.data.find((r: any) => r.RowKey === id);
        
        if (record) {
          return {
            success: true,
            data: record,
          };
        } else {
          return {
            success: false,
            error: 'ATR multiple not found',
          };
        }
      }
      
      return {
        success: false,
        error: response.data.error || 'Failed to fetch ATR multiple',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch ATR multiple',
      };
    }
  }

  /**
   * Create a new ATR multiple (Read-only endpoint - not supported)
   */
  async createAtrMultiple(data: CreateAtrMultipleRequest): Promise<ApiResponse<AtrMultiple>> {
    return {
      success: false,
      error: 'Create operation not supported by this Azure endpoint. This is a read-only data source.',
    };
  }

  /**
   * Update an existing ATR multiple (Read-only endpoint - not supported)
   */
  async updateAtrMultiple(id: string, data: UpdateAtrMultipleRequest): Promise<ApiResponse<AtrMultiple>> {
    return {
      success: false,
      error: 'Update operation not supported by this Azure endpoint. This is a read-only data source.',
    };
  }

  /**
   * Delete an ATR multiple (Read-only endpoint - not supported)
   */
  async deleteAtrMultiple(id: string): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: 'Delete operation not supported by this Azure endpoint. This is a read-only data source.',
    };
  }

  /**
   * Test connectivity to Azure API
   */
  async testConnectivity(): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.client.get('/api/health');
      return {
        success: true,
        data: response.status === 200,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect to Azure API',
      };
    }
  }
}

// Singleton instance
export const azureApiClient = new AzureApiClient();

// Mock data for development
export const mockAtrMultiples: AtrMultiple[] = [
  {
    id: '1',
    PartitionKey: 'tp',
    RowKey: '1',
    atr_multiple: 1.5,
    close_fraction: 0.25,
    Timestamp: new Date().toISOString(),
    row: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    PartitionKey: 'tp',
    RowKey: '2',
    atr_multiple: 2.0,
    close_fraction: 0.5,
    Timestamp: new Date().toISOString(),
    row: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    PartitionKey: 'tp',
    RowKey: '3',
    atr_multiple: 2.5,
    close_fraction: 0.75,
    Timestamp: new Date().toISOString(),
    row: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    PartitionKey: 'tsl',
    RowKey: '4',
    atr_multiple: 3.0,
    close_fraction: 1.0,
    Timestamp: new Date().toISOString(),
    row: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
