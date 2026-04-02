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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/notify` : '/notify';

class WhatsAppService {
  private getAuthHeaders(): Record<string, string> {
    // Get token from localStorage using the same key as AuthService
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // 1. POST /api/notify/send-single - إرسال رسالة فردية
  async sendSingleMessage(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/send-single`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // 2. POST /api/notify/send-broadcast - إرسال رسالة عامة
  async sendBroadcast(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/send-broadcast`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // 3. POST /api/notify/send-expiring - إرسال إشعارات انتهاء الاشتراك
  async sendExpiringNotifications(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/send-expiring`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // 4. GET /api/notify/status - حالة WhatsApp
  async getWhatsAppStatus(): Promise<WhatsAppStatusResponse> {
    const response = await fetch(`${BASE_URL}/status`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 5. POST /api/notify/auto/check-expiry - تشغيل فحص انتهاء الاشتراكات (Queue System)
  async triggerExpiryCheck(data?: TriggerExpiryCheckRequest): Promise<TriggerExpiryCheckResponse> {
    const response = await fetch(`${BASE_URL}/auto/check-expiry`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });
    return await response.json();
  }

  // Old method (keep for backward compatibility)
  async runAutoExpiryCheck(data?: AutoCheckExpiryRequest): Promise<AutoCheckExpiryResponse> {
    const response = await fetch(`${BASE_URL}/auto/check-expiry`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });
    return await response.json();
  }

  // 6. PUT /api/notify/auto/expiry-message - تحديث رسالة الانتهاء
  async updateExpiryMessage({ message }: ExpiryMessageUpdate): Promise<ExpiryMessageUpdateResponse> {
    const response = await fetch(`${BASE_URL}/auto/expiry-message`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return await response.json();
  }

  // 7. GET /api/notify/auto/expiry-message - عرض رسالة الانتهاء الحالية
  async getExpiryMessage(): Promise<ExpiryMessageResponse> {
    const response = await fetch(`${BASE_URL}/auto/expiry-message`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 8. GET /api/notify/auto/status - حالة النظام التلقائي
  async getAutoStatus(): Promise<AutoStatusResponse> {
    const response = await fetch(`${BASE_URL}/auto/status`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 9. POST /api/notify/clear-session - مسح جلسة WhatsApp
  async clearSession(): Promise<any> {
    const response = await fetch(`${BASE_URL}/clear-session`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 10. GET /api/notify/qr - جلب QR Code
  async getQRCode(): Promise<QRCodeResponse> {
    const response = await fetch(`${BASE_URL}/qr`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 11. GET /api/notify/queue-status - حالة الـ Queue
  async getQueueStatus(): Promise<any> {
    const response = await fetch(`${BASE_URL}/queue-status`, {
      headers: this.getAuthHeaders(),
    });
    return await response.json();
  }

  // 12. PUT /api/notify/queue-limit - تحديث حد الطابور
  async updateQueueLimit(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/queue-limit`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getWhatsAppStatus();
      return status.data.isConnected;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }

  async initializeConnection(): Promise<QRCodeResponse> {
    try {
      // First clear session
      await this.clearSession();
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
        whatsapp: whatsappStatus.data.isConnected,
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
