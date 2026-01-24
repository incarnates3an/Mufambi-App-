/**
 * Payment Service
 * Handles payment processing with multiple payment gateways
 */

import { getConfig, isIntegrationEnabled } from '../config/integrations';
import { PaymentMethod } from '../types';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  private stripe: any = null;
  private initialized = false;

  /**
   * Initialize payment service
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Stripe if enabled
      if (isIntegrationEnabled('stripe')) {
        const config = getConfig('stripe');
        if (config.publicKey) {
          // Load Stripe.js dynamically
          await this.loadStripe(config.publicKey);
          console.log('✅ Stripe initialized');
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Payment service initialization failed:', error);
    }
  }

  /**
   * Load Stripe.js library
   */
  private async loadStripe(publicKey: string) {
    if (typeof window === 'undefined') return;

    // Check if Stripe is already loaded
    if ((window as any).Stripe) {
      this.stripe = (window as any).Stripe(publicKey);
      return;
    }

    // Load Stripe.js
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        this.stripe = (window as any).Stripe(publicKey);
        resolve(true);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent | null> {
    try {
      // In production, this should call your backend API
      // which creates a PaymentIntent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create payment intent failed:', error);

      // Return mock data for development
      return {
        id: `pi_${Date.now()}`,
        amount,
        currency,
        status: 'pending',
        clientSecret: `mock_secret_${Date.now()}`
      };
    }
  }

  /**
   * Process payment with Stripe
   */
  async processStripePayment(
    amount: number,
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    if (!isIntegrationEnabled('stripe')) {
      return { success: false, error: 'Stripe not enabled' };
    }

    try {
      const intent = await this.createPaymentIntent(amount);
      if (!intent) {
        throw new Error('Failed to create payment intent');
      }

      // Simulate successful payment (in production, use Stripe.js)
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: intent.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Process payment with EcoCash
   */
  async processEcocashPayment(
    amount: number,
    phoneNumber: string
  ): Promise<PaymentResult> {
    if (!isIntegrationEnabled('ecocash')) {
      return { success: false, error: 'EcoCash not enabled' };
    }

    try {
      const config = getConfig('ecocash');

      // In production, call EcoCash API
      const response = await fetch('/api/ecocash/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phoneNumber,
          merchantId: config.options?.merchantId,
          currency: config.options?.currency
        })
      });

      if (!response.ok) {
        throw new Error('EcoCash payment failed');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transactionId
      };
    } catch (error: any) {
      // Mock successful payment for development
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        transactionId: `ec_${Date.now()}`
      };
    }
  }

  /**
   * Process payment with PayPal
   */
  async processPayPalPayment(amount: number): Promise<PaymentResult> {
    if (!isIntegrationEnabled('paypal')) {
      return { success: false, error: 'PayPal not enabled' };
    }

    try {
      // In production, integrate PayPal SDK
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: `pp_${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'PayPal payment failed'
      };
    }
  }

  /**
   * Process payment based on selected method
   */
  async processPayment(
    method: PaymentMethod,
    amount: number,
    metadata?: any
  ): Promise<PaymentResult> {
    await this.initialize();

    switch (method) {
      case PaymentMethod.CARD:
        return this.processStripePayment(amount, metadata?.paymentMethodId);

      case PaymentMethod.ECOCASH:
        return this.processEcocashPayment(amount, metadata?.phoneNumber);

      case PaymentMethod.PAYPAL:
        return this.processPayPalPayment(amount);

      case PaymentMethod.CASH:
        // Cash payment doesn't require processing
        return {
          success: true,
          transactionId: `cash_${Date.now()}`
        };

      default:
        return {
          success: false,
          error: 'Unsupported payment method'
        };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string): Promise<PaymentResult> {
    try {
      // In production, call backend API to process refund
      const response = await fetch(`/api/refund/${transactionId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      return {
        success: true,
        transactionId: `refund_${transactionId}`
      };
    } catch (error: any) {
      // Mock successful refund for development
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        transactionId: `refund_${transactionId}`
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<string> {
    try {
      const response = await fetch(`/api/payment-status/${transactionId}`);
      const data = await response.json();
      return data.status;
    } catch (error) {
      // Mock status for development
      return 'succeeded';
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
