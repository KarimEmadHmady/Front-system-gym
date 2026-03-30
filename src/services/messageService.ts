import { BaseService } from './baseService';
import { apiRequest } from '@/lib/api';
import type { Message, ApiResponse } from '@/types';

export class MessageService extends BaseService {
  constructor() {
    super('/messages');
  }

  // إرسال رسالة جديدة
  async createMessage(data: {
    userId: string; // المستلم
    fromUserId: string; // المرسل
    message: string; // نص الرسالة
    content?: string; // محتوى الرسالة
    subject?: string; // موضوع الرسالة
  }): Promise<Message> {
    const messageData = {
      userId: data.userId,
      fromUserId: data.fromUserId,
      message: data.content || data.message,
      content: data.content || data.message,
      subject: data.subject
    };
    const response = await apiRequest(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    return response.json();
  }

  // جلب جميع الرسائل
  async getAllMessages(): Promise<Message[]> {
    const response = await apiRequest(this.baseEndpoint);
    return response.json();
  }

  // جلب الرسائل الخاصة بمستخدم معين (كمستلم أو كمرسل)
  async getMessagesForUser(userId: string): Promise<Message[]> {
    const response = await apiRequest(`${this.baseEndpoint}/${userId}`);
    return response.json();
  }

  // تحديث حالة قراءة الرسالة (قيمة مخصصة)
  async updateMessageStatus(messageId: string, readStatus: boolean): Promise<Message> {
    const response = await apiRequest(`${this.baseEndpoint}/${messageId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ read: readStatus }),
    });
    return response.json();
  }

  // تحديد الرسالة كمقروءة (عند فتح الرسالة)
  async markMessageAsRead(messageId: string): Promise<ApiResponse<Message>> {
    const response = await apiRequest(`${this.baseEndpoint}/${messageId}/mark-read`, {
      method: 'PATCH',
    });
    return response.json();
  }

  // حذف رسالة
  async deleteMessage(messageId: string): Promise<void> {
    await apiRequest(`${this.baseEndpoint}/${messageId}`, {
      method: 'DELETE',
    });
  }

  // جلب الرسائل غير المقروءة لمستخدم معين
  async getUnreadMessages(userId: string): Promise<Message[]> {
    const messages = await this.getMessagesForUser(userId);
    return messages.filter(message => !message.read && message.userId === userId);
  }

  // جلب الرسائل المرسلة من مستخدم معين
  async getSentMessages(userId: string): Promise<Message[]> {
    const messages = await this.getMessagesForUser(userId);
    return messages.filter(message => message.fromUserId === userId);
  }

  // جلب الرسائل المستلمة لمستخدم معين
  async getReceivedMessages(userId: string): Promise<Message[]> {
    const messages = await this.getMessagesForUser(userId);
    return messages.filter(message => message.userId === userId);
  }

  // عد الرسائل غير المقروءة لمستخدم معين
  async getUnreadCount(userId: string): Promise<number> {
    const unreadMessages = await this.getUnreadMessages(userId);
    return unreadMessages.length;
  }

  // تحديث رسالة
  async updateMessage(messageId: string, data: {
    content?: string;
    subject?: string;
  }): Promise<Message> {
    const response = await apiRequest(`${this.baseEndpoint}/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: data.content,
        content: data.content,
        subject: data.subject
      }),
    });
    return response.json();
  }

  // تحديد كمقروءة (alias for markMessageAsRead)
  async markAsRead(messageId: string): Promise<ApiResponse<Message>> {
    return this.markMessageAsRead(messageId);
  }
}
