// WhatsApp Notification Types

export interface WhatsAppMessage {
  identifier: string;
  isPhone: boolean;
  message: string;
  useQueue?: boolean;
}

export interface WhatsAppBroadcast {
  message: string;
  useQueue?: boolean;
}

export interface ExpiringNotificationRequest {
  message: string;
}

export interface WhatsAppStatusResponse {
  success: boolean;
  data: {
    isConnected: boolean;
    qrCode: string | null;
    requiresQR: boolean;
    mockMode: boolean;
    connectionAttempts: number;
  };
}

export interface MessageResult {
  success: boolean;
  phone: string;
  message: string;
  mock: boolean;
  error?: string;
}

export interface ExpiringNotificationResponse {
  success: boolean;
  data: {
    total: number;
    sent: number;
    failed: number;
    results: MessageResult[];
  };
}

export interface QueueStatus {
  queueLength: number;
  isProcessing: boolean;
  sentCount: number;
  pendingCount: number;
  processingCount: number;
}

export interface QueueStatusResponse {
  success: boolean;
  data: QueueStatus & {
    rateLimit: RateLimit;
  };
}

export interface RateLimit {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
  batchSize: number;
  batchDelay: number;
}

export interface RateLimitUpdate {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
  batchSize: number;
  batchDelay: number;
}

export interface SingleMessageResponse {
  success: boolean;
  message: string;
  queueStatus: QueueStatus;
}

export interface BroadcastResponse {
  success: boolean;
  message: string;
  queueStatus: QueueStatus;
}

export interface AutoCheckExpiryRequest {
  useQueue?: boolean;
}

export interface AutoCheckExpiryResponse {
  success: boolean;
  message: string;
  queueStatus: QueueStatus;
}

export interface ExpiryMessageUpdate {
  message: string;
}

export interface ExpiryMessageResponse {
  success: boolean;
  data: {
    message: string;
    isDefault: boolean;
  };
}

export interface ExpiryMessageUpdateResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
    defaultMessage?: string;
  };
}

export interface AutoStatusResponse {
  success: boolean;
  data: {
    isRunning: boolean;
    lastCheck: string;
  };
}

// Trigger Expiry Check Request
export interface TriggerExpiryCheckRequest {
  useQueue?: boolean;           // optional - default true
  messageTemplate?: string;     // optional - default message
}

// Queue Response (when useQueue: true)
export interface TriggerExpiryCheckQueueResponse {
  success: boolean;
  message: string;
  queueStatus: {
    queue: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

// Direct Response (when useQueue: false)
export interface TriggerExpiryCheckDirectResponse {
  success: boolean;
  data: {
    sent: number;
    total: number;
    failed: number;
  };
}

// Combined Response Type
export type TriggerExpiryCheckResponse = 
  | TriggerExpiryCheckQueueResponse 
  | TriggerExpiryCheckDirectResponse;

export interface ClearSessionResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface QRCodeResponse {
  success: boolean;
  data: {
    qrCode: string;
    message: string;
  };
}

export interface RateLimitUpdateResponse {
  success: boolean;
  message: string;
  data: {
    queueLength: number;
    isProcessing: boolean;
    rateLimit: RateLimit;
  };
}

// WhatsApp Notification Types for UI
export interface WhatsAppNotification {
  id: string;
  type: 'single' | 'broadcast' | 'expiring' | 'auto';
  recipient?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'processing';
  timestamp: string;
  error?: string;
}

export interface WhatsAppStats {
  totalSent: number;
  totalFailed: number;
  pendingCount: number;
  processingCount: number;
  isConnected: boolean;
  mockMode: boolean;
  lastActivity: string;
}

export interface WhatsAppFormData {
  recipient: string;
  message: string;
  useQueue: boolean;
  isPhone: boolean;
}

export interface WhatsAppBroadcastFormData {
  message: string;
  useQueue: boolean;
}

export interface WhatsAppExpiryFormData {
  message: string;
}

export interface WhatsAppRateLimitFormData {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
  batchSize: number;
  batchDelay: number;
}

// API Error Types
export interface WhatsAppError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

// Message Template Types
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: string;
  usageCount: number;
}

export interface MessageVariable {
  name: string;
  value: string;
  description?: string;
}

// Notification History Types
export interface NotificationHistory {
  id: string;
  type: 'single' | 'broadcast' | 'expiring';
  message: string;
  recipients: number;
  sent: number;
  failed: number;
  timestamp: string;
  duration?: number;
  status: 'completed' | 'processing' | 'failed';
}

// WhatsApp Settings Types
export interface WhatsAppSettings {
  mockMode: boolean;
  autoNotifications: boolean;
  defaultExpiryMessage: string;
  rateLimit: RateLimit;
  businessProfile?: {
    name: string;
    phone: string;
    description: string;
  };
}
