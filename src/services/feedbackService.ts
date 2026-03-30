import { apiRequest } from '@/lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Feedback } from '../types/models';

export const getAllFeedback = async (): Promise<Feedback[]> => {
  const res = await apiRequest(API_ENDPOINTS.feedback.list);
  return await res.json();
};

export const getFeedbackForUser = async (userId: string): Promise<Feedback[]> => {
  const res = await apiRequest(API_ENDPOINTS.feedback.user(userId));
  return await res.json();
};

export const createFeedback = async (data: Omit<Feedback, '_id' | 'createdAt' | 'updatedAt' | 'date'> & { date?: Date }): Promise<Feedback> => {
  const res = await apiRequest(API_ENDPOINTS.feedback.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateFeedback = async (id: string, data: Partial<Feedback>): Promise<Feedback> => {
  const res = await apiRequest(API_ENDPOINTS.feedback.update(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const deleteFeedback = async (id: string): Promise<void> => {
  await apiRequest(API_ENDPOINTS.feedback.delete(id), {
    method: 'DELETE',
  });
};
