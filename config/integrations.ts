/**
 * Integration Configuration
 * Central configuration for all third-party integrations
 */

export interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  publicKey?: string;
  secretKey?: string;
  options?: Record<string, any>;
}

export interface IntegrationsConfig {
  // Payment Gateway
  stripe: IntegrationConfig;
  paypal: IntegrationConfig;
  ecocash: IntegrationConfig;

  // Analytics
  googleAnalytics: IntegrationConfig;
  mixpanel: IntegrationConfig;

  // Authentication
  googleAuth: IntegrationConfig;
  facebookAuth: IntegrationConfig;

  // Maps
  googleMaps: IntegrationConfig;
  mapbox: IntegrationConfig;

  // Communication
  twilio: IntegrationConfig;
  sendgrid: IntegrationConfig;

  // Push Notifications
  firebase: IntegrationConfig;
  oneSignal: IntegrationConfig;

  // Real-time
  websocket: IntegrationConfig;
  pusher: IntegrationConfig;

  // Backend API
  api: IntegrationConfig;
}

// Default configuration
const defaultConfig: IntegrationsConfig = {
  stripe: {
    enabled: true,
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    options: {
      currency: 'usd',
      locale: 'en'
    }
  },

  paypal: {
    enabled: false,
    publicKey: import.meta.env.VITE_PAYPAL_CLIENT_ID || ''
  },

  ecocash: {
    enabled: true,
    apiKey: import.meta.env.VITE_ECOCASH_API_KEY || '',
    options: {
      currency: 'ZWL',
      merchantId: import.meta.env.VITE_ECOCASH_MERCHANT_ID || ''
    }
  },

  googleAnalytics: {
    enabled: true,
    apiKey: import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX',
    options: {
      anonymizeIp: true,
      cookieFlags: 'SameSite=None;Secure'
    }
  },

  mixpanel: {
    enabled: false,
    apiKey: import.meta.env.VITE_MIXPANEL_TOKEN || ''
  },

  googleAuth: {
    enabled: true,
    publicKey: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    options: {
      scopes: ['email', 'profile']
    }
  },

  facebookAuth: {
    enabled: false,
    publicKey: import.meta.env.VITE_FACEBOOK_APP_ID || ''
  },

  googleMaps: {
    enabled: true,
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    options: {
      libraries: ['places', 'geometry']
    }
  },

  mapbox: {
    enabled: false,
    apiKey: import.meta.env.VITE_MAPBOX_TOKEN || ''
  },

  twilio: {
    enabled: false,
    apiKey: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    secretKey: import.meta.env.VITE_TWILIO_AUTH_TOKEN || ''
  },

  sendgrid: {
    enabled: false,
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || ''
  },

  firebase: {
    enabled: true,
    options: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    }
  },

  oneSignal: {
    enabled: false,
    apiKey: import.meta.env.VITE_ONESIGNAL_APP_ID || ''
  },

  websocket: {
    enabled: true,
    options: {
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
      reconnect: true,
      reconnectInterval: 5000
    }
  },

  pusher: {
    enabled: false,
    apiKey: import.meta.env.VITE_PUSHER_KEY || '',
    options: {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1'
    }
  },

  api: {
    enabled: true,
    options: {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      retries: 3
    }
  }
};

// Get integration config
export const getIntegrationConfig = (): IntegrationsConfig => {
  return defaultConfig;
};

// Check if integration is enabled
export const isIntegrationEnabled = (integration: keyof IntegrationsConfig): boolean => {
  return defaultConfig[integration].enabled;
};

// Get specific integration config
export const getConfig = <K extends keyof IntegrationsConfig>(
  integration: K
): IntegrationsConfig[K] => {
  return defaultConfig[integration];
};

export default defaultConfig;
