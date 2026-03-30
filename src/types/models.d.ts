// Database Models Types

// User Model
export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'admin' | 'trainer' | 'member' | 'manager' | 'accountant' | 'super_admin';
  phone?: string;
  dob?: Date;
  avatarUrl?: string;
  address?: string;
  balance: number;
  status: 'active' | 'inactive' | 'banned';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  metadata?: {
    emergencyContact?: string;
    notes?: string;
    lastLogin?: Date;
    ipAddress?: string;
    // keep backwards compatibility if height was stored here before
    heightCm?: number;
  };
  isDeleted: boolean;
  
  // Subscription data
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  subscriptionFreezeDays: number;
  subscriptionFreezeUsed: number;
  subscriptionStatus: 'active' | 'frozen' | 'expired' | 'cancelled';
  subscriptionRenewalReminderSent?: Date;
  lastPaymentDate?: Date;
  nextPaymentDueDate?: Date;
  
  loyaltyPoints: number;
  membershipLevel: 'basic' | 'silver' | 'gold' | 'platinum';
  
  goals: {
    weightLoss: boolean;
    muscleGain: boolean;
    endurance: boolean;
  };
  
  trainerId?: string;

  // New gym fields
  heightCm?: number;
  baselineWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthNotes?: string;
  // Virtual field from backend
  age?: number;
  
  createdAt: Date;
  updatedAt: Date;
  barcode: string;
}

// Attendance Record
export interface AttendanceRecord {
  _id: string;
  userId: string;
  date: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workout Plan
export interface Exercise {
  _id: string;
  name: string;
  reps: number;
  sets: number;
  notes?: string;
  image?: string;
}

export interface WorkoutPlan {
  _id: string;
  userId: string;
  trainerId?: string;
  planName: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

// Diet Plan
export interface Meal {
  mealId: string;
  mealName: string;
  calories: number;
  quantity: string;
  notes?: string;
}

export interface DietPlan {
  _id: string;
  userId: string;
  trainerId?: string;
  planName: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  meals: Meal[];
  createdAt: Date;
  updatedAt: Date;
}

// Loyalty Points History
export interface LoyaltyPointsHistory {
  _id: string;
  userId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'admin_added' | 'admin_deducted' | 'payment_bonus' | 'attendance_bonus' | 'expired';
  reason: string;
  rewardId?: string;
  paymentId?: string;
  attendanceId?: string;
  remainingPoints: number;
  adminId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Redeemable Reward (الجوائز القابلة للاستبدال)
export interface RedeemableReward {
  _id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'discount' | 'free_session' | 'merchandise' | 'subscription_extension' | 'premium_feature' | 'gift_card';
  isActive: boolean;
  stock: number; // -1 = unlimited
  imageUrl?: string;
  validUntil?: Date;
  minMembershipLevel: 'basic' | 'silver' | 'gold' | 'platinum';
  value?: number;
  valueUnit?: string;
  conditions?: string;
  maxRedemptionsPerUser: number;
  totalRedemptions: number;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy Reward (للتوافق مع الكود القديم)
export interface Reward {
  _id: string;
  userId: string;
  points: number;
  redeemedFor?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payment
export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  date: Date;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense
export interface Expense {
  _id: string;
  amount: number;
  date: Date;
  category: string;
  paidTo?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Revenue
export interface Revenue {
  _id: string;
  amount: number;
  date: Date;
  source: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payroll
export interface Payroll {
  _id: string;
  employeeId: string;
  amount: number;
  date: Date;
  status: 'pending' | 'paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feedback
export interface Feedback {
  _id: string;
  toUserId: string;
  fromUserId?: string;
  rating: number;
  comment?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message
export interface Message {
  _id: string;
  userId: string; // المستلم
  fromUserId: string; // المرسل
  message: string; // نص الرسالة
  content?: string; // محتوى الرسالة (للتوافق مع الواجهة)
  subject?: string; // موضوع الرسالة
  date: Date; // تاريخ الإرسال
  read: boolean; // حالة القراءة
  createdAt: Date;
  updatedAt: Date;
}

// Client Progress
export interface ClientProgress {
  _id: string;
  userId: string;
  trainerId?: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number; // الكتلة العضلية
  waist?: number; // مقاس الوسط
  chest?: number; // مقاس الصدر
  arms?: number; // مقاس الذراع
  legs?: number; // مقاس الرجل
  weightChange?: number; // التغير في الوزن
  fatChange?: number;    // التغير في الدهون
  muscleChange?: number; // التغير في العضلات
  status?: 'ممتاز' | 'جيد' | 'يحتاج لتحسين';
  advice?: string;
  notes?: string;
  image?: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Session Schedule (جدولة الحصص)
export interface SessionSchedule {
  _id: string;
  userId: string; // المتدرب
  trainerId: string; // المدرب
  date: Date;
  startTime: string;
  endTime: string;
  duration?: number; // بالدقايق
  sessionType: 'شخصية' | 'جماعية' | 'أونلاين' | 'تغذية';
  status: 'مجدولة' | 'مكتملة' | 'ملغاة';
  location?: string;
  price?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Loyalty Points API Response Types ====================

// User Points Response
export interface UserPointsResponse {
  user: {
    id: string;
    name: string;
    email: string;
    loyaltyPoints: number;
  };
  history: LoyaltyPointsHistory[];
}

// Redeemable Rewards Response
export interface RedeemableRewardsResponse {
  user: {
    loyaltyPoints: number;
    membershipLevel: string;
  };
  rewards: RedeemableReward[];
}

// Reward Redemption Response
export interface RewardRedemptionResponse {
  user: User;
  reward: {
    id: string;
    name: string;
    description: string;
    pointsUsed: number;
    category: string;
  };
  message: string;
}

// Loyalty Points Stats Response
export interface LoyaltyPointsStatsResponse {
  stats: {
    totalPoints: number;
    totalUsers: number;
    avgPoints: number;
    maxPoints: number;
  };
  topUsers: Array<{
    _id: string;
    name: string;
    email: string;
    loyaltyPoints: number;
    avatarUrl?: string;
  }>;
}

// Rewards Stats Response
export interface RewardsStatsResponse {
  general: {
    totalRewards: number;
    activeRewards: number;
    totalRedemptions: number;
    avgPointsRequired: number;
  };
  byCategory: Array<{
    _id: string;
    count: number;
    totalRedemptions: number;
  }>;
}

// Points History Response
export interface PointsHistoryResponse {
  history: LoyaltyPointsHistory[];
  totalCount: number;
  pagination: {
    limit: number;
    total: number;
  };
}