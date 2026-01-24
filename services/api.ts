/**
 * API Client
 * Handles all HTTP requests to the backend
 */

import { getConfig } from '../config/integrations';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private authToken: string | null = null;

  constructor() {
    const config = getConfig('api');
    this.baseURL = config.options?.baseURL || '';
    this.defaultTimeout = config.options?.timeout || 30000;
    this.defaultRetries = config.options?.retries || 3;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token;

    // Store in localStorage
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Get default headers
   */
  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async requestWithRetry<T>(
    url: string,
    config: RequestConfig,
    retries: number = this.defaultRetries
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        config.timeout || this.defaultTimeout
      );

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: this.getHeaders(config.headers),
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data
      };
    } catch (error: any) {
      // Retry on network errors
      if (retries > 0 && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`);
        await this.delay(1000);
        return this.requestWithRetry(url, config, retries - 1);
      }

      return {
        success: false,
        error: error.message || 'Request failed'
      };
    }
  }

  /**
   * Check if error should trigger retry
   */
  private shouldRetry(error: any): boolean {
    // Retry on network errors and 5xx server errors
    return (
      error.name === 'TypeError' ||
      error.name === 'AbortError' ||
      (error.message && error.message.includes('5'))
    );
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * HTTP GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, params);
    return this.requestWithRetry<T>(url, { method: 'GET' });
  }

  /**
   * HTTP POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.requestWithRetry<T>(url, { method: 'POST', body });
  }

  /**
   * HTTP PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.requestWithRetry<T>(url, { method: 'PUT', body });
  }

  /**
   * HTTP PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.requestWithRetry<T>(url, { method: 'PATCH', body });
  }

  /**
   * HTTP DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.requestWithRetry<T>(url, { method: 'DELETE' });
  }

  // ========== Ride Endpoints ==========

  /**
   * Request a ride
   */
  async requestRide(destination: any, price: number) {
    return this.post('/rides/request', { destination, price });
  }

  /**
   * Cancel a ride
   */
  async cancelRide(rideId: string, reason?: string) {
    return this.post(`/rides/${rideId}/cancel`, { reason });
  }

  /**
   * Get ride status
   */
  async getRideStatus(rideId: string) {
    return this.get(`/rides/${rideId}/status`);
  }

  /**
   * Complete a ride
   */
  async completeRide(rideId: string, rating: number, feedback?: string) {
    return this.post(`/rides/${rideId}/complete`, { rating, feedback });
  }

  // ========== Driver Endpoints ==========

  /**
   * Get nearby drivers
   */
  async getNearbyDrivers(lat: number, lng: number, radius: number = 5) {
    return this.get('/drivers/nearby', {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString()
    });
  }

  /**
   * Accept ride (driver)
   */
  async acceptRide(rideId: string) {
    return this.post(`/rides/${rideId}/accept`);
  }

  /**
   * Update driver location
   */
  async updateDriverLocation(lat: number, lng: number) {
    return this.post('/drivers/location', { lat, lng });
  }

  // ========== User Endpoints ==========

  /**
   * Get user profile
   */
  async getUserProfile() {
    return this.get('/user/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: any) {
    return this.put('/user/profile', data);
  }

  /**
   * Get user ride history
   */
  async getRideHistory(limit: number = 20, offset: number = 0) {
    return this.get('/user/rides', {
      limit: limit.toString(),
      offset: offset.toString()
    });
  }

  // ========== Payment Endpoints ==========

  /**
   * Get wallet balance
   */
  async getWalletBalance() {
    return this.get('/wallet/balance');
  }

  /**
   * Add funds to wallet
   */
  async addFunds(amount: number, paymentMethod: string) {
    return this.post('/wallet/add-funds', { amount, paymentMethod });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory() {
    return this.get('/wallet/transactions');
  }

  // ========== Analytics Endpoints ==========

  /**
   * Track event (send to backend)
   */
  async trackEvent(eventName: string, properties?: any) {
    return this.post('/analytics/track', { event: eventName, properties });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
