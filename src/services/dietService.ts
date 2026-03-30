import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest } from '@/lib/api';
import type { DietPlan, Meal, PaginationParams, PaginatedResponse } from '@/types';

export class DietService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.dietPlans.list);
  }

  // Get all diet plans
  async getDietPlans(params?: PaginationParams & { trainerId?: string }): Promise<PaginatedResponse<DietPlan>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.trainerId) queryParams.append('trainerId', params.trainerId);
    const qs = queryParams.toString();
    return this.apiCall<PaginatedResponse<DietPlan>>(`${qs ? `?${qs}` : ''}`);
  }

  // Get diet plan by ID
  async getDietPlan(id: string): Promise<DietPlan> {
    return this.getById<DietPlan>(id);
  }

  // Create new diet plan
  async createDietPlan(dietData: Partial<DietPlan> & { trainerId?: string }): Promise<DietPlan> {
    return this.create<DietPlan>(dietData);
  }

  // Update diet plan
  async updateDietPlan(id: string, dietData: Partial<DietPlan> & { trainerId?: string }): Promise<DietPlan> {
    return this.update<DietPlan>(id, dietData);
  }

  // Delete diet plan
  async deleteDietPlan(id: string): Promise<void> {
    return this.delete(id);
  }

  // Get diet plans for specific user
  async getUserDietPlans(userId: string, params?: PaginationParams): Promise<PaginatedResponse<DietPlan>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall<PaginatedResponse<DietPlan>>(`/user/${userId}?${queryParams.toString()}`);
  }

  // Get active diet plan for user
  async getActiveDietPlan(userId: string): Promise<DietPlan | null> {
    return this.apiCall<DietPlan | null>(`/user/${userId}/active`);
  }

  // Add meal to diet plan
  async addMealToPlan(planId: string, meal: Partial<Meal>): Promise<DietPlan> {
    return this.apiCall<DietPlan>(`/${planId}/meals`, {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  // Update meal in diet plan
  async updateMealInPlan(planId: string, mealId: string, meal: Partial<Meal>): Promise<DietPlan> {
    return this.apiCall<DietPlan>(`/${planId}/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    });
  }

  // Remove meal from diet plan
  async removeMealFromPlan(planId: string, mealId: string): Promise<DietPlan> {
    // This endpoint returns 204 No Content, so don't parse JSON
    await apiRequest(`${this.baseEndpoint}/${planId}/meals/${mealId}`, {
      method: 'DELETE',
    });
    // Return the updated plan by refetching to keep caller logic simple
    return this.getDietPlan(planId);
  }

  // Get daily meal plan
  async getDailyMealPlan(userId: string, date: Date): Promise<Meal[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('date', date.toISOString());

    return this.apiCall<Meal[]>(`/user/${userId}/daily?${queryParams.toString()}`);
  }

  // Calculate daily calories
  async calculateDailyCalories(userId: string, date: Date): Promise<{
    totalCalories: number;
    meals: Array<{
      mealName: string;
      calories: number;
      quantity: string;
    }>;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('date', date.toISOString());

    return this.apiCall(`/user/${userId}/calories?${queryParams.toString()}`);
  }

  // Get diet plan templates
  async getDietTemplates(): Promise<DietPlan[]> {
    return this.apiCall<DietPlan[]>('/templates');
  }

  // Create diet plan from template
  async createFromTemplate(templateId: string, userId: string, planName: string): Promise<DietPlan> {
    return this.apiCall<DietPlan>(`/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        planName
      }),
    });
  }

  // Duplicate diet plan
  async duplicateDietPlan(planId: string, newPlanName: string, userId: string): Promise<DietPlan> {
    return this.apiCall<DietPlan>(`/${planId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({
        newPlanName,
        userId
      }),
    });
  }
}
