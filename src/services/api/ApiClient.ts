/**
 * Centralized API Client for DirhamFlow
 * Handles token authentication, headers, error handling, and JSON payload serialization
 * to communicate with the backend API (Laravel Sanctum / custom API server).
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
    this.token = localStorage.getItem('dirhamflow_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('dirhamflow_auth_token', token);
    } else {
      localStorage.removeItem('dirhamflow_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async post<T = any>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          data: json.data || null,
          message: json.message || `HTTP Error ${response.status}`,
          errors: json.errors
        };
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message
      };
    } catch (error: any) {
      console.error(`ApiClient POST ${endpoint} failed:`, error);
      return {
        success: false,
        data: null as any,
        message: error.message || 'Network communication failure'
      };
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          data: json.data || null,
          message: json.message || `HTTP Error ${response.status}`
        };
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message
      };
    } catch (error: any) {
      console.error(`ApiClient GET ${endpoint} failed:`, error);
      return {
        success: false,
        data: null as any,
        message: error.message || 'Network communication failure'
      };
    }
  }
}

export const apiClient = new ApiClient();
