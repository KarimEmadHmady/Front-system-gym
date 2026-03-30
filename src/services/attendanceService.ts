import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import type { AttendanceRecord, PaginationParams, PaginatedResponse } from '@/types';
import { queueAttendance } from '@/lib/offlineSync';
import { v4 as uuidv4 } from 'uuid';

export class AttendanceService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.attendance.list);
  }

  // Get all attendance records
  async getAttendanceRecords(params?: PaginationParams): Promise<PaginatedResponse<AttendanceRecord>> {
    return this.getAll<AttendanceRecord>(params);
  }

  // Get attendance record by ID
  async getAttendanceRecord(id: string): Promise<AttendanceRecord> {
    return this.getById<AttendanceRecord>(id);
  }

  // Create new attendance record
  async createAttendanceRecord(attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const clientUuid = uuidv4();
    const payload = { ...attendanceData, clientUuid } as any;
    try {
      return await this.create<AttendanceRecord>(payload);
    } catch (e) {
      // If offline or request fails, enqueue locally
      await queueAttendance(payload);
      // Return a local echo object to optimistically update UI
      return {
        ...(attendanceData as any),
        _id: clientUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as AttendanceRecord;
    }
  }

  // Update attendance record
  async updateAttendanceRecord(id: string, attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return this.update<AttendanceRecord>(id, attendanceData);
  }

  // Delete attendance record
  async deleteAttendanceRecord(id: string): Promise<void> {
    return this.delete(id);
  }

  // Get attendance records for specific user
  async getUserAttendance(userId: string, params?: PaginationParams): Promise<PaginatedResponse<AttendanceRecord>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall<PaginatedResponse<AttendanceRecord>>(`/${userId}?${queryParams.toString()}`);
  }

  // Get attendance records by date range
  async getAttendanceByDateRange(
    startDate: Date, 
    endDate: Date, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toISOString());
    queryParams.append('endDate', endDate.toISOString());
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall<PaginatedResponse<AttendanceRecord>>(`/date-range?${queryParams.toString()}`);
  }

  // Get today's attendance
  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    return this.apiCall<AttendanceRecord[]>('/today');
  }

  // Mark attendance
  async markAttendance(userId: string, status: 'present' | 'absent' | 'excused', notes?: string): Promise<AttendanceRecord> {
    const clientUuid = uuidv4();
    const body = {
      userId,
      status,
      notes,
      date: new Date().toISOString(),
      clientUuid,
    };
    try {
      return await this.apiCall<AttendanceRecord>('/mark', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (e) {
      await queueAttendance(body);
      return {
        _id: clientUuid as any,
        userId: userId as any,
        status: status as any,
        notes: notes as any,
        date: new Date(body.date) as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      } as unknown as AttendanceRecord;
    }
  }

  // Get attendance statistics
  async getAttendanceStats(userId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    attendanceRate: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (userId) queryParams.append('userId', userId);
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());

    return this.apiCall(`/stats?${queryParams.toString()}`);
  }

  // Get crowd level for last 1.5 hours
  async getCrowdLevel(): Promise<{
    count: number;
    crowdLevel: 'low' | 'light' | 'moderate' | 'busy' | 'very_busy';
    crowdStatus: string;
    timeRange: string;
    timestamp: string;
  }> {
    return this.apiCall('/crowd-level');
  }
}
