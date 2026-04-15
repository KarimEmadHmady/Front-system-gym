import { 
  WhatsAppStatusResponse, 
  QueueStatusResponse, 
  AutoStatusResponse, 
  TriggerExpiryCheckRequest,
  TriggerExpiryCheckResponse,
  AutoCheckExpiryRequest, 
  AutoCheckExpiryResponse, 
  ExpiryMessageUpdate, 
  ExpiryMessageResponse,
  ExpiryMessageUpdateResponse,
  QRCodeResponse
} from '@/types/whatsapp';

const WA_GATEWAY_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'https://whatsapp-service-livid.vercel.app/notification';
const MAIN_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class WhatsAppService {
  private getAuthHeaders(): Record<string, string> {
    // Standalone WhatsApp server doesn't require authentication
    return {
      'Content-Type': 'application/json',
    };
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${WA_GATEWAY_URL.replace('/notification', '')}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result = await response.json();
      return response.ok && result.success !== false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // 0. POST /api/notify/send-direct - إرسال رسالة مباشرة لأي رقم (Gateway Only)
  async sendDirectMessage(phone: string, message: string, useQueue = true): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/send-direct`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phone, message, useQueue }),
    });
    return await response.json();
  }

  // 1. POST /api/whatsapp/single - إرسال رسالة فردية (Main Backend)
  async sendSingleMessage(data: any): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/single`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // 2. POST /api/whatsapp/broadcast - إرسال رسالة عامة (Main Backend)
  async sendBroadcast(data: any): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/broadcast`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // 3. POST /api/whatsapp/trigger-expiry - إرسال إشعارات انتهاء الاشتراك (Main Backend)
  async sendExpiringNotifications(data: any): Promise<any> {
    const response = await fetch(`${WA_GATEWAY_URL}/whatsapp/trigger-expiry`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  }

  // 4. GET Gateway Status - حالة WhatsApp
  async getWhatsAppStatus(): Promise<WhatsAppStatusResponse> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/status`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          success: true,
          data: {
            isConnected: result.data.connected || false,
            requiresQR: !result.data.connected || false,
            mockMode: result.data.mockMode || false,
            connectionAttempts: 0,
            isReady: result.data.connected || false,
            status: result.data.status || 'unknown',
            qrCode: result.data.qrCode || null
          }
        }
      };
    }
    
    return result;
  }

  // 5. POST Trigger Expiry Check - تشغيل فحص انتهاء الاشتراكات
  async triggerExpiryCheck(data?: TriggerExpiryCheckRequest): Promise<TriggerExpiryCheckResponse> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/trigger-expiry`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });
    return await response.json();
  }

  async runAutoExpiryCheck(data?: AutoCheckExpiryRequest): Promise<AutoCheckExpiryResponse> {
    return this.triggerExpiryCheck(data as any) as any;
  }

  // 6. PUT Update Expiry Message - تحديث رسالة الانتهاء
  async updateExpiryMessage({ message }: ExpiryMessageUpdate): Promise<ExpiryMessageUpdateResponse> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/settings/expiry-message`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return await response.json();
  }

  // 7. GET Expiry Message - عرض رسالة الانتهاء الحالية
  async getExpiryMessage(): Promise<ExpiryMessageResponse> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/settings/expiry-message`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 8. POST Reset expiry message (Mock, no longer needed directly)
  async resetExpiryMessage(): Promise<any> {
    return { success: true, message: "Use the UI to update the message manually." };
  }

  // 9. GET Auto status (Mock, queue handles automatically)
  async getAutoStatus(): Promise<any> {
    return { success: true, data: { isRunning: true } };
  }

  // 10. POST Clear QR Session (Gateway)
  async clearSession(): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/clear-session`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 10.5. POST Reconnect (Gateway)
  async reconnectSession(): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/reconnect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return await response.json();
  }

  // 11. GET QR Code (Gateway)
  async getQRCode(): Promise<QRCodeResponse> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/qr`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 12. GET Queue Status (Gateway)
  async getQueueStatus(): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/queue-status`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 13. PUT Update Queue Rate Limits (Gateway)
  async updateQueueLimit(data: any): Promise<any> {
    const response = await fetch(`${MAIN_API_URL}/whatsapp/rate-limit`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getWhatsAppStatus();
      return status.data.data.isConnected;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }

  async initializeConnection(): Promise<QRCodeResponse> {
    try {
      // Then get QR code
      return await this.getQRCode();
    } catch (error) {
      console.error('Error initializing connection:', error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<{
    whatsapp: boolean;
    queue: boolean;
    auto: boolean;
  }> {
    try {
      const [whatsappStatus, queueStatus, autoStatus] = await Promise.all([
        this.getWhatsAppStatus(),
        this.getQueueStatus(),
        this.getAutoStatus()
      ]);

      return {
        whatsapp: whatsappStatus.data.data.isConnected,
        queue: queueStatus.data.isProcessing,
        auto: autoStatus.data.isRunning
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        whatsapp: false,
        queue: false,
        auto: false
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
