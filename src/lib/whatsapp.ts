import { MessageVariable, MessageTemplate, WhatsAppFormData } from '@/types/whatsapp';

// Message Templates
export const DEFAULT_EXPIRY_MESSAGE = 'عزيزي {name}، اشتراكك سينتهي غداً {endDate}. جدد الآن!';
export const DEFAULT_WELCOME_MESSAGE = 'مرحباً {name}،欢迎使用 النظام!';
export const DEFAULT_PROMOTION_MESSAGE = 'عرض خاص لـ {name}: خصم 20% على جميع الاشتراكات!';

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'expiry-reminder',
    name: 'تذكير انتهاء الاشتراك',
    content: 'عزيزي {name}، اشتراكك في {planName} سينتهي غداً {endDate}. جدد الآن!',
    variables: ['name', 'planName', 'endDate'],
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'welcome',
    name: 'رسالة ترحيب',
    content: 'مرحباً {name}،欢迎使用 النظام! اشتراكك {planName} فعال حتى {endDate}.',
    variables: ['name', 'planName', 'endDate'],
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'promotion',
    name: 'عرض ترويجي',
    content: 'عرض خاص لـ {name}: خصم {discount}% على {planName}! العرض ينتهي {offerEnd}.',
    variables: ['name', 'discount', 'planName', 'offerEnd'],
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'payment-reminder',
    name: 'تذكير بالدفع',
    content: 'عزيزي {name}، موعد دفع اشتراكك {planName} قريب {dueDate}. المبلغ: {amount}.',
    variables: ['name', 'planName', 'dueDate', 'amount'],
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'class-reminder',
    name: 'تذكير بالحصة',
    content: 'عزيزي {name}، لديك حصة {className} غداً {classTime} مع المدرب {trainer}.',
    variables: ['name', 'className', 'classTime', 'trainer'],
    createdAt: new Date().toISOString(),
    usageCount: 0
  }
];

// Validation Functions
export function validatePhoneNumber(phone: string): boolean {
  // Egyptian phone number validation
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s\-\+]/g, ''));
}

export function validateWhatsAppMessage(message: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!message || message.trim().length === 0) {
    errors.push('الرسالة لا يمكن أن تكون فارغة');
  }
  
  if (message.length > 1000) {
    errors.push('الرسالة طويلة جداً (الحد الأقصى 1000 حرف)');
  }
  
  if (message.includes('{') && message.includes('}')) {
    // Check for valid variables
    const variables = extractVariables(message);
    const validVariables = ['name', 'planName', 'endDate', 'discount', 'className', 'classTime', 'trainer', 'amount', 'dueDate', 'offerEnd'];
    
    variables.forEach(variable => {
      if (!validVariables.includes(variable)) {
        errors.push(`متغير غير صالح: {${variable}}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateWhatsAppFormData(data: WhatsAppFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate recipient
  if (!data.recipient || data.recipient.trim().length === 0) {
    errors.push('المستلم لا يمكن أن يكون فارغاً');
  }
  
  if (data.isPhone && !validatePhoneNumber(data.recipient)) {
    errors.push('رقم الهاتف غير صالح');
  }
  
  // Validate message
  const messageValidation = validateWhatsAppMessage(data.message);
  if (!messageValidation.isValid) {
    errors.push(...messageValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Message Processing
export function extractVariables(message: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(message)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

export function replaceVariables(message: string, variables: Record<string, string>): string {
  let processedMessage = message;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processedMessage = processedMessage.replace(regex, value || '');
  });
  
  return processedMessage;
}

export function previewMessage(message: string): string {
  const sampleVariables: Record<string, string> = {
    name: 'أحمد محمد',
    planName: 'باقة برو',
    endDate: '31/12/2026',
    discount: '20',
    className: 'كمال أجسام',
    classTime: '10:00 ص',
    trainer: 'محمد علي',
    amount: '500 جنيه',
    dueDate: '1/1/2027',
    offerEnd: '31/12/2026'
  };
  
  return replaceVariables(message, sampleVariables);
}

// Rate Limiting Helpers
export const DEFAULT_RATE_LIMIT = {
  messagesPerSecond: 1,
  messagesPerMinute: 30,
  messagesPerHour: 1000,
  batchSize: 10,
  batchDelay: 5000
};

export function calculateEstimatedTime(totalMessages: number, rateLimit: typeof DEFAULT_RATE_LIMIT): number {
  const { messagesPerMinute, batchSize, batchDelay } = rateLimit;
  const batches = Math.ceil(totalMessages / batchSize);
  const totalDelay = (batches - 1) * batchDelay;
  const messageTime = (totalMessages / messagesPerMinute) * 60 * 1000; // Convert to milliseconds
  return totalDelay + messageTime;
}

export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} ساعة و ${minutes % 60} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة و ${seconds % 60} ثانية`;
  } else {
    return `${seconds} ثانية`;
  }
}

// Queue Management
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createQueueItem(message: string, recipient: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  return {
    id: generateMessageId(),
    message,
    recipient,
    priority,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: 3,
    status: 'pending' as const
  };
}

// Status Helpers
export function getStatusColor(status: string): string {
  switch (status) {
    case 'connected':
    case 'sent':
    case 'completed':
      return '#10b981'; // green
    case 'connecting':
    case 'processing':
    case 'pending':
      return '#f59e0b'; // amber
    case 'disconnected':
    case 'failed':
    case 'error':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

export function getStatusText(status: string, language: 'ar' | 'en' = 'ar'): string {
  const statusTexts = {
    ar: {
      connected: 'متصل',
      disconnected: 'غير متصل',
      connecting: 'جاري الاتصال',
      sent: 'تم الإرسال',
      failed: 'فشل الإرسال',
      processing: 'قيد المعالجة',
      pending: 'في الانتظار',
      completed: 'مكتمل',
      error: 'خطأ'
    },
    en: {
      connected: 'Connected',
      disconnected: 'Disconnected',
      connecting: 'Connecting',
      sent: 'Sent',
      failed: 'Failed',
      processing: 'Processing',
      pending: 'Pending',
      completed: 'Completed',
      error: 'Error'
    }
  };
  
  return statusTexts[language][status as keyof typeof statusTexts.ar] || status;
}

// Formatting Helpers
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add Egypt country code if missing
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `2${cleaned}`;
  }
  
  return cleaned;
}

export function truncateMessage(message: string, maxLength: number = 50): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Error Handling
export function getWhatsAppErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'حدث خطأ غير متوقع';
}

export function isWhatsAppError(error: any): boolean {
  return error && typeof error === 'object' && 'success' in error && error.success === false;
}

// Analytics Helpers
export function calculateSuccessRate(sent: number, failed: number): number {
  const total = sent + failed;
  return total === 0 ? 0 : Math.round((sent / total) * 100);
}

export function calculateAverageDeliveryTime(messages: Array<{ timestamp: string; deliveredAt?: string }>): number {
  const deliveredMessages = messages.filter(msg => msg.deliveredAt);
  if (deliveredMessages.length === 0) return 0;
  
  const totalTime = deliveredMessages.reduce((total, msg) => {
    const start = new Date(msg.timestamp).getTime();
    const end = new Date(msg.deliveredAt!).getTime();
    return total + (end - start);
  }, 0);
  
  return totalTime / deliveredMessages.length;
}

// Export all utilities
export const whatsappUtils = {
  validatePhoneNumber,
  validateWhatsAppMessage,
  validateWhatsAppFormData,
  extractVariables,
  replaceVariables,
  previewMessage,
  generateMessageId,
  createQueueItem,
  getStatusColor,
  getStatusText,
  formatPhoneNumber,
  truncateMessage,
  formatFileSize,
  getWhatsAppErrorMessage,
  isWhatsAppError,
  calculateSuccessRate,
  calculateAverageDeliveryTime,
  calculateEstimatedTime,
  formatTimeRemaining
};
