import { BaseService } from './baseService';
import { API_ENDPOINTS } from '../lib/constants';
import type { 
  Reward, 
  PaginationParams, 
  PaginatedResponse,
  RedeemableReward,
  LoyaltyPointsHistory,
  UserPointsResponse,
  RedeemableRewardsResponse,
  RewardRedemptionResponse,
  LoyaltyPointsStatsResponse,
  RewardsStatsResponse,
  PointsHistoryResponse
} from '@/types';

export class LoyaltyService extends BaseService {
  constructor() {
    super('/loyalty-points');
  }

  // Get user's loyalty points
  async getUserPoints(userId: string): Promise<UserPointsResponse> {
    return this.apiCall(`/user/${userId}`);
  }

  // Get current user's points
  async getMyPoints(): Promise<UserPointsResponse> {
    return this.apiCall('/my-points');
  }

  // Get current user's points with membership level
  async getMyPointsWithLevel(): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      loyaltyPoints: number;
      membershipLevel: string;
    };
    history: LoyaltyPointsHistory[];
  }> {
    return this.apiCall('/my-points');
  }

  // Add points to user (Admin only)
  async addPoints(userId: string, points: number, reason: string): Promise<Reward> {
    return this.apiCall('/add', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        points,
        reason
      }),
    });
  }

  // Redeem points
  async redeemPoints(points: number, redeemedFor: string): Promise<Reward> {
    return this.apiCall('/redeem', {
      method: 'POST',
      body: JSON.stringify({
        points,
        redeemedFor
      }),
    });
  }

  // Get loyalty statistics (Admin only)
  async getLoyaltyStats(): Promise<LoyaltyPointsStatsResponse> {
    return this.apiCall('/stats');
  }

  // Get top users by points
  async getTopUsers(limit: number = 10): Promise<Array<{
    _id: string;
    name: string;
    email: string;
    loyaltyPoints: number;
    avatarUrl?: string;
  }>> {
    return this.apiCall(`/top-users?limit=${limit}`);
  }

  // Add points from payment (Admin only)
  async addPointsFromPayment(userId: string, paymentAmount: number, pointsPerDollar: number = 1): Promise<Reward> {
    return this.apiCall('/payment-points', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        paymentAmount,
        pointsPerDollar
      }),
    });
  }

  // Add points from attendance (Admin/Trainer only)
  async addAttendancePoints(userId: string, points: number, reason: string): Promise<Reward> {
    return this.apiCall('/attendance-points', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        points,
        reason
      }),
    });
  }

  // Get user's point history
  async getUserPointHistory(userId: string, params?: any): Promise<import('@/types').PointsHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.rewardId) queryParams.append('rewardId', params.rewardId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall(`/user/${userId}/history?${queryParams.toString()}`);
  }

  // Get available rewards
  async getAvailableRewards(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
    category: string;
    isActive: boolean;
  }>> {
    return this.apiCall('/rewards');
  }

  // Get user's membership level
  async getUserMembershipLevel(userId: string): Promise<{
    level: 'basic' | 'silver' | 'gold' | 'platinum';
    pointsRequired: number;
    currentPoints: number;
    nextLevelPoints: number;
    benefits: string[];
  }> {
    return this.apiCall(`/user/${userId}/membership-level`);
  }

  // ==================== New Rewards System ====================

  // Get redeemable rewards for current user
  async getRedeemableRewards(): Promise<RedeemableRewardsResponse> {
    return this.apiCall('/rewards');
  }

  // Redeem points for a reward
  async redeemReward(rewardId: string): Promise<RewardRedemptionResponse> {
    return this.apiCall('/redeem-reward', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  }

  // Get points history for current user
  async getPointsHistory(filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<PointsHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    return this.apiCall(`/history${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== Admin Rewards Management ====================

  // Get all redeemable rewards (Admin only)
  async getAllRedeemableRewards(filters?: {
    category?: string;
    isActive?: boolean;
    minPoints?: number;
    maxPoints?: number;
    limit?: number;
  }): Promise<RedeemableReward[]> {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters?.minPoints) queryParams.append('minPoints', filters.minPoints.toString());
    if (filters?.maxPoints) queryParams.append('maxPoints', filters.maxPoints.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    return this.apiCall(`/admin/rewards${queryString ? `?${queryString}` : ''}`);
  }

  // Create new redeemable reward (Admin only)
  async createRedeemableReward(rewardData: Partial<RedeemableReward>): Promise<RedeemableReward> {
    return this.apiCall('/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(rewardData),
    });
  }

  // Update redeemable reward (Admin only)
  async updateRedeemableReward(rewardId: string, updateData: Partial<RedeemableReward>): Promise<RedeemableReward> {
    console.log('updateRedeemableReward - rewardId:', rewardId);
    console.log('updateRedeemableReward - updateData:', updateData);
    return this.apiCall(`/admin/rewards/${rewardId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete redeemable reward (Admin only)
  async deleteRedeemableReward(rewardId: string): Promise<{ message: string }> {
    return this.apiCall(`/admin/rewards/${rewardId}`, {
      method: 'DELETE',
    });
  }

  // Get rewards statistics (Admin only)
  async getRewardsStats(): Promise<RewardsStatsResponse> {
    return this.apiCall('/admin/rewards/stats');
  }

  // ==================== Updated Payment & Attendance Points ====================

  // Add points from payment (Admin only) - Updated
  async addPointsFromPaymentUpdated(userId: string, amount: number, paymentType: string, paymentId?: string): Promise<{ message: string; user: any }> {
    return this.apiCall('/payment-points', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        amount,
        paymentType,
        paymentId
      }),
    });
  }

  // Add points from attendance (Admin/Trainer only) - Updated
  async addAttendancePointsUpdated(userId: string, attendanceStreak: number, attendanceId?: string): Promise<{ message: string; user: any }> {
    return this.apiCall('/attendance-points', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        attendanceStreak,
        attendanceId
      }),
    });
  }

  // Get all points history for admin
  async getAllPointsHistory(filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<PointsHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    const queryString = queryParams.toString();
    return this.apiCall(`/admin/history${queryString ? `?${queryString}` : ''}`);
  }
}
