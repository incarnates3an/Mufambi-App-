/**
 * WebSocket Service
 * Handles real-time communication with the server
 */

import { getConfig, isIntegrationEnabled } from '../config/integrations';

export type WebSocketEventType =
  | 'driver_location_updated'
  | 'ride_status_changed'
  | 'ride_accepted'
  | 'ride_cancelled'
  | 'driver_arrived'
  | 'ride_completed'
  | 'new_message'
  | 'payment_received';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: number;
}

export type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private connectionId: string | null = null;

  constructor() {
    this.config = getConfig('websocket');
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId?: string) {
    if (!isIntegrationEnabled('websocket')) {
      console.warn('WebSocket is disabled');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = this.config.options?.url || 'ws://localhost:8080';
      const url = userId ? `${wsUrl}?userId=${userId}` : wsUrl;

      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Handle connection open
   */
  private handleOpen() {
    console.log('✅ WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connectionId = `ws_${Date.now()}`;

    // Send authentication if needed
    this.send('authenticate', {
      timestamp: Date.now()
    });
  }

  /**
   * Handle connection close
   */
  private handleClose() {
    console.log('🔌 WebSocket disconnected');
    this.isConnecting = false;
    this.ws = null;

    if (this.config.options?.reconnect) {
      this.handleReconnect();
    }
  }

  /**
   * Handle connection error
   */
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Log in development
      if (import.meta.env.DEV) {
        console.log('📨 WebSocket message:', message);
      }

      // Trigger event handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error(`Handler error for ${message.type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Send message to server
   */
  send(type: string, data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    const message = {
      type,
      data,
      timestamp: Date.now(),
      connectionId: this.connectionId
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to an event
   */
  on(eventType: WebSocketEventType, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: WebSocketEventType, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Unsubscribe from all events
   */
  offAll(eventType?: WebSocketEventType) {
    if (eventType) {
      this.eventHandlers.delete(eventType);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Subscribe to driver location updates
   */
  onDriverLocationUpdate(handler: (location: { lat: number; lng: number }) => void) {
    return this.on('driver_location_updated', handler);
  }

  /**
   * Subscribe to ride status changes
   */
  onRideStatusChanged(handler: (status: string) => void) {
    return this.on('ride_status_changed', handler);
  }

  /**
   * Subscribe to new messages
   */
  onNewMessage(handler: (message: any) => void) {
    return this.on('new_message', handler);
  }

  /**
   * Send driver location update
   */
  sendDriverLocation(lat: number, lng: number) {
    this.send('driver_location', { lat, lng });
  }

  /**
   * Send ride status update
   */
  sendRideStatus(rideId: string, status: string) {
    this.send('ride_status', { rideId, status });
  }

  /**
   * Send chat message
   */
  sendMessage(rideId: string, message: string) {
    this.send('chat_message', { rideId, message });
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
