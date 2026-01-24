/**
 * Analytics Service
 * Tracks user events and behaviors
 */

import { getConfig, isIntegrationEnabled } from '../config/integrations';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

class AnalyticsService {
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private userId: string | null = null;

  /**
   * Initialize analytics
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Google Analytics if enabled
      if (isIntegrationEnabled('googleAnalytics')) {
        await this.initializeGA();
      }

      // Initialize Mixpanel if enabled
      if (isIntegrationEnabled('mixpanel')) {
        await this.initializeMixpanel();
      }

      this.initialized = true;

      // Process queued events
      this.processQueue();

      console.log('✅ Analytics initialized');
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  /**
   * Initialize Google Analytics
   */
  private async initializeGA() {
    const config = getConfig('googleAnalytics');
    if (!config.apiKey) return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.apiKey}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = function(...args: any[]) {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', config.apiKey, config.options || {});
  }

  /**
   * Initialize Mixpanel
   */
  private async initializeMixpanel() {
    const config = getConfig('mixpanel');
    if (!config.apiKey) return;

    // In production, load Mixpanel SDK
    console.log('Mixpanel initialized with token:', config.apiKey);
  }

  /**
   * Process queued events
   */
  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event.name, event.properties);
      }
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      // Queue event until initialized
      this.queue.push({ name: eventName, properties, timestamp: Date.now() });
      return;
    }

    const eventData = {
      ...properties,
      timestamp: Date.now(),
      userId: this.userId
    };

    // Send to Google Analytics
    if (isIntegrationEnabled('googleAnalytics') && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }

    // Send to Mixpanel
    if (isIntegrationEnabled('mixpanel') && (window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, eventData);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', eventName, eventData);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string) {
    this.userId = userId;

    if ((window as any).gtag) {
      (window as any).gtag('config', getConfig('googleAnalytics').apiKey, {
        user_id: userId
      });
    }

    if ((window as any).mixpanel) {
      (window as any).mixpanel.identify(userId);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', properties);
    }

    if ((window as any).mixpanel) {
      (window as any).mixpanel.people.set(properties);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string) {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }

  /**
   * Track ride events
   */
  trackRideRequested(destination: string, price: number) {
    this.trackEvent('ride_requested', { destination, price });
  }

  trackRideAccepted(driverId: string, driverName: string) {
    this.trackEvent('ride_accepted', { driverId, driverName });
  }

  trackRideCompleted(rideId: string, duration: number, distance: number) {
    this.trackEvent('ride_completed', { rideId, duration, distance });
  }

  trackRideCancelled(reason?: string) {
    this.trackEvent('ride_cancelled', { reason });
  }

  /**
   * Track payment events
   */
  trackPaymentInitiated(amount: number, method: string) {
    this.trackEvent('payment_initiated', { amount, method });
  }

  trackPaymentCompleted(amount: number, method: string, transactionId: string) {
    this.trackEvent('payment_completed', { amount, method, transactionId });
  }

  trackPaymentFailed(amount: number, method: string, error: string) {
    this.trackEvent('payment_failed', { amount, method, error });
  }

  /**
   * Track user engagement
   */
  trackFeatureUsed(featureName: string, metadata?: Record<string, any>) {
    this.trackEvent('feature_used', { feature: featureName, ...metadata });
  }

  trackSearchPerformed(query: string, resultsCount: number) {
    this.trackEvent('search_performed', { query, resultsCount });
  }

  trackShareInitiated(shareMethod: string) {
    this.trackEvent('share_initiated', { shareMethod });
  }

  /**
   * Track errors
   */
  trackError(errorName: string, errorMessage: string, errorStack?: string) {
    this.trackEvent('error', {
      error_name: errorName,
      error_message: errorMessage,
      error_stack: errorStack
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit: string) {
    this.trackEvent('performance', {
      metric,
      value,
      unit
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
