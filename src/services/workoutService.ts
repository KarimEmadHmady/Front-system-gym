import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import type { WorkoutPlan, Exercise, PaginationParams, PaginatedResponse } from '@/types';

export class WorkoutService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.workoutPlans.list);
  }

  // Get all workout plans
  async getAllWorkoutPlans(params?: PaginationParams & { trainerId?: string }): Promise<PaginatedResponse<WorkoutPlan>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.trainerId) queryParams.append('trainerId', params.trainerId);
    const qs = queryParams.toString();
    return this.apiCall<PaginatedResponse<WorkoutPlan>>(`${qs ? `?${qs}` : ''}`);
  }

  // Get workout plan by ID
  async getWorkoutPlan(id: string): Promise<WorkoutPlan> {
    return this.apiCall<WorkoutPlan>(`/plan/${id}`);
  }

  // Create new workout plan
  async createWorkoutPlan(userId: string, workoutData: Partial<WorkoutPlan> & { trainerId?: string }): Promise<WorkoutPlan> {
    // تحضير البيانات للرسالة
    const dataToSend = { ...workoutData };
    
    // معالجة التمارين - تحويل الصور من File إلى null مؤقتاً
    if (dataToSend.exercises) {
      dataToSend.exercises = dataToSend.exercises.map(exercise => {
        const processedExercise = { ...exercise };
        // إذا كان هناك ملف صورة، نحذفه من البيانات ونرسله بشكل منفصل لاحقاً
        if (exercise.image && typeof exercise.image !== 'string') {
          delete processedExercise.image;
        }
        return processedExercise;
      });
    }
    
    console.log('Sending workout data:', dataToSend);
    
    // إرسال البيانات كـ JSON دائماً
    return this.apiCall<WorkoutPlan>(`/${userId}`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update workout plan
  async updateWorkoutPlan(id: string, workoutData: Partial<WorkoutPlan> & { trainerId?: string }): Promise<WorkoutPlan> {
    return this.apiCall<WorkoutPlan>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  }

  // Delete workout plan
  async deleteWorkoutPlan(id: string): Promise<void> {
    await this.apiCall<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get workout plans for specific user
  async getUserWorkoutPlans(userId: string, params?: PaginationParams): Promise<PaginatedResponse<WorkoutPlan>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    const qs = queryParams.toString();
    return this.apiCall<PaginatedResponse<WorkoutPlan>>(`/${userId}${qs ? `?${qs}` : ''}`);
  }

  // Add exercise to workout plan
  async addExerciseToPlan(planId: string, exercise: Partial<Exercise> & { image?: any }): Promise<WorkoutPlan> {
    let options: RequestInit;
    if (exercise.image && typeof exercise.image !== 'string') {
      // إذا الصورة عبارة عن ملف (File) - استخدم FormData
      const form = new FormData();
      Object.entries(exercise).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && typeof value !== 'string') {
            // إرسال الملف مباشرة
            form.append(key, value);
          } else {
            // إرسال النصوص كـ string
            form.append(key, String(value));
          }
        }
      });
      options = {
        method: 'POST',
        body: form,
      };
    } else {
      // إرسال JSON عادي
      options = {
        method: 'POST',
        body: JSON.stringify(exercise),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return this.apiCall<WorkoutPlan>(`/${planId}/exercises`, options);
  }

  // Get exercises by plan id
  async getExercisesByPlanId(planId: string): Promise<Exercise[]> {
    return this.apiCall<Exercise[]>(`/${planId}/exercises`);
  }

  // Get exercise by id
  async getExerciseById(planId: string, exerciseId: string): Promise<Exercise> {
    return this.apiCall<Exercise>(`/${planId}/exercises/${exerciseId}`);
  }

  // Update exercise in workout plan
  async updateExerciseInPlan(planId: string, exerciseId: string, exercise: Partial<Exercise> & { image?: any }): Promise<WorkoutPlan> {
    let options: RequestInit;
    if (exercise.image && typeof exercise.image !== 'string') {
      // إذا الصورة عبارة عن ملف (File) - استخدم FormData
      const form = new FormData();
      Object.entries(exercise).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && typeof value !== 'string') {
            // إرسال الملف مباشرة
            form.append(key, value);
          } else {
            // إرسال النصوص كـ string
            form.append(key, String(value));
          }
        }
      });
      options = {
        method: 'PUT',
        body: form,
      };
    } else {
      // إرسال JSON عادي
      options = {
        method: 'PUT',
        body: JSON.stringify(exercise),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return this.apiCall<WorkoutPlan>(`/${planId}/exercises/${exerciseId}`, options);
  }

  // Remove exercise from workout plan
  async removeExerciseFromPlan(planId: string, exerciseId: string): Promise<WorkoutPlan> {
    return this.apiCall<WorkoutPlan>(`/${planId}/exercises/${exerciseId}`, {
      method: 'DELETE',
    });
  }

  // دالة مساعدة لإضافة تمارين مع صور بعد إنشاء الخطة
  async addExercisesWithImagesToPlan(planId: string, exercises: Array<Partial<Exercise> & { image?: any }>): Promise<WorkoutPlan> {
    let updatedPlan: WorkoutPlan;
    
    // إضافة كل تمرين مع صورته
    for (const exercise of exercises) {
      if (exercise.image && typeof exercise.image !== 'string') {
        // تمرين مع صورة - استخدم addExerciseToPlan
        updatedPlan = await this.addExerciseToPlan(planId, exercise);
      }
    }
    
    return updatedPlan!;
  }
}
