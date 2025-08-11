import axios, { AxiosInstance } from 'axios';
import { 
  AtrMultiple, 
  CreateAtrMultipleRequest, 
  UpdateAtrMultipleRequest,
  ApiResponse 
} from '@/types';

class AzureApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AZURE_API_BASE_URL || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication if needed
    this.client.interceptors.request.use((config) => {
      const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY;
      if (apiKey) {
        config.headers['x-functions-key'] = apiKey;
      }
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
   * Get all ATR multiples
   */
  async getAtrMultiples(): Promise<ApiResponse<AtrMultiple[]>> {
    try {
      const response = await this.client.get('/api/atr-multiples');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch ATR multiples',
      };
    }
  }

  /**
   * Get a specific ATR multiple by ID
   */
  async getAtrMultiple(id: string): Promise<ApiResponse<AtrMultiple>> {
    try {
      const response = await this.client.get(`/api/atr-multiples/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch ATR multiple',
      };
    }
  }

  /**
   * Create a new ATR multiple
   */
  async createAtrMultiple(data: CreateAtrMultipleRequest): Promise<ApiResponse<AtrMultiple>> {
    try {
      const response = await this.client.post('/api/atr-multiples', data);
      return {
        success: true,
        data: response.data,
        message: 'ATR multiple created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create ATR multiple',
      };
    }
  }

  /**
   * Update an existing ATR multiple
   */
  async updateAtrMultiple(id: string, data: UpdateAtrMultipleRequest): Promise<ApiResponse<AtrMultiple>> {
    try {
      const response = await this.client.put(`/api/atr-multiples/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'ATR multiple updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update ATR multiple',
      };
    }
  }

  /**
   * Delete an ATR multiple
   */
  async deleteAtrMultiple(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`/api/atr-multiples/${id}`);
      return {
        success: true,
        message: 'ATR multiple deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete ATR multiple',
      };
    }
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
    atr_multiple: 1.5,
    close_fraction: 0.25,
    row: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    atr_multiple: 2.0,
    close_fraction: 0.5,
    row: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    atr_multiple: 2.5,
    close_fraction: 0.75,
    row: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    atr_multiple: 3.0,
    close_fraction: 1.0,
    row: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
