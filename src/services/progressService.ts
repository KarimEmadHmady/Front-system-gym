import { apiRequest } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { ClientProgress } from '@/types/models';

export class ProgressService {
  async getAll(): Promise<ClientProgress[]> {
    const res = await apiRequest(API_ENDPOINTS.progress.list);
    return res.json();
  }

  async getUserProgress(userId: string): Promise<ClientProgress[]> {
    const res = await apiRequest(API_ENDPOINTS.progress.user(userId));
    return res.json();
  }

  async getTrainerProgress(trainerId: string): Promise<ClientProgress[]> {
    const res = await apiRequest(API_ENDPOINTS.progress.trainer(trainerId));
    return res.json();
  }

  async create(data: Omit<ClientProgress, '_id' | 'createdAt' | 'updatedAt'>, imageFile?: File | null): Promise<ClientProgress> {
    const formData = new FormData();
    
    console.log('Creating progress with data:', data);
    console.log('Image file:', imageFile);
    
    // إضافة البيانات الأساسية
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'date' && value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
        console.log(`Added to FormData: ${key} = ${value}`);
      }
    });
    
    // إضافة الصورة إذا كانت موجودة
    if (imageFile) {
      formData.append('image', imageFile);
      console.log('Added image to FormData');
    }
    
    // طباعة محتويات FormData للتشخيص
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const res = await apiRequest(API_ENDPOINTS.progress.create, {
      method: 'POST',
      body: formData,
    });
    console.log('API Response:', res);
    return res.json();
  }

  async update(id: string, data: Partial<ClientProgress>, imageFile?: File | null, oldImagePublicId?: string): Promise<ClientProgress> {
    const formData = new FormData();
    
    // إضافة البيانات الأساسية
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'date' && value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // إضافة معرف الصورة القديمة إذا كانت موجودة
    if (oldImagePublicId) {
      formData.append('oldImagePublicId', oldImagePublicId);
    }
    
    // إضافة الصورة الجديدة إذا كانت موجودة
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const res = await apiRequest(API_ENDPOINTS.progress.update(id), {
      method: 'PUT',
      body: formData,
    });
    return res.json();
  }

  async delete(id: string): Promise<void> {
    await apiRequest(API_ENDPOINTS.progress.delete(id), {
      method: 'DELETE',
    });
  }

  async getLatestProgress(userId: string): Promise<ClientProgress | null> {
    const list = await this.getUserProgress(userId);
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }
}
