import type { RoleNavigation, RolePermissions, NavigationItem } from '@/types';

// Role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'attendance:read', 'attendance:write',
    'financial:read', 'financial:write',
    'workout:read', 'workout:write', 'workout:delete',
    'diet:read', 'diet:write', 'diet:delete',
    'feedback:read', 'feedback:write',
    'messages:read', 'messages:write',
    'reports:read', 'reports:write',
    'payroll:read', 'payroll:write',
    'loyalty:read', 'loyalty:write'
  ],
  trainer: [
    'users:read',
    'attendance:read', 'attendance:write',
    'workout:read', 'workout:write',
    'diet:read', 'diet:write',
    'feedback:read', 'feedback:write',
    'messages:read', 'messages:write',
    'progress:read', 'progress:write',
    'loyalty:read', 'loyalty:write'
  ],
  member: [
    'profile:read', 'profile:write',
    'attendance:read',
    'workout:read',
    'diet:read',
    'progress:read', 'progress:write',
    'feedback:write',
    'messages:read', 'messages:write',
    'loyalty:read',
    'payment:read'
  ],
  manager: [
    'users:read', 'users:write',
    'attendance:read', 'attendance:write',
    'financial:read', 'financial:write',
    'workout:read', 'workout:write',
    'diet:read', 'diet:write',
    'feedback:read', 'feedback:write',
    'messages:read', 'messages:write',
    'reports:read',
    'payroll:read', 'payroll:write',
    'loyalty:read', 'loyalty:write'
  ],
  accountant: [
    'financial:read', 'financial:write',
    'payroll:read', 'payroll:write',
    'reports:read'
  ],
  super_admin: [
    'membership-cards:read', 'membership-cards:write'
  ]
};

// Role-based navigation
export const ROLE_NAVIGATION: RoleNavigation = {
  admin: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      permissions: ['reports:read']
    },
    {
      label: 'Users Management',
      href: '/admin/users',
      icon: 'users',
      permissions: ['users:read']
    },
    {
      label: 'Attendance',
      href: '/admin/attendance',
      icon: 'calendar',
      permissions: ['attendance:read']
    },
    {
      label: 'Financial',
      href: '/admin/financial',
      icon: 'dollar-sign',
      permissions: ['financial:read'],
      children: [
        { label: 'Expenses', href: '/admin/financial/expenses', permissions: ['financial:read'] },
        { label: 'Revenue', href: '/admin/financial/revenue', permissions: ['financial:read'] },
        { label: 'Payroll', href: '/admin/financial/payroll', permissions: ['payroll:read'] },
        { label: 'Invoices', href: '/admin/financial/invoices', permissions: ['financial:read'] }
      ]
    },
    {
      label: 'Plans',
      href: '/admin/plans',
      icon: 'clipboard-list',
      permissions: ['workout:read', 'diet:read'],
      children: [
        { label: 'Workout Plans', href: '/admin/plans/workout', permissions: ['workout:read'] },
        { label: 'Diet Plans', href: '/admin/plans/diet', permissions: ['diet:read'] }
      ]
    },
    {
      label: 'Feedback',
      href: '/admin/feedback',
      icon: 'message-square',
      permissions: ['feedback:read']
    },
    {
      label: 'Messages',
      href: '/admin/messages',
      icon: 'mail',
      permissions: ['messages:read']
    },
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: 'bar-chart',
      permissions: ['reports:read']
    },
    {
      label: 'Loyalty Points',
      href: '/admin/loyalty',
      icon: 'star',
      permissions: ['loyalty:read']
    }
  ],
  trainer: [
    {
      label: 'Dashboard',
      href: '/trainer/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'My Clients',
      href: '/trainer/clients',
      icon: 'users'
    },
    {
      label: 'Attendance',
      href: '/trainer/attendance',
      icon: 'calendar'
    },
    {
      label: 'Plans',
      href: '/trainer/plans',
      icon: 'clipboard-list',
      children: [
        { label: 'Workout Plans', href: '/trainer/plans/workout' },
        { label: 'Diet Plans', href: '/trainer/plans/diet' }
      ]
    },
    {
      label: 'Progress Tracking',
      href: '/trainer/progress',
      icon: 'trending-up'
    },
    {
      label: 'Feedback',
      href: '/trainer/feedback',
      icon: 'message-square'
    },
    {
      label: 'Messages',
      href: '/trainer/messages',
      icon: 'mail'
    }
  ],
  member: [
    {
      label: 'Dashboard',
      href: '/member/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Profile',
      href: '/member/profile',
      icon: 'user'
    },
    {
      label: 'Progress',
      href: '/member/progress',
      icon: 'trending-up'
    },
    {
      label: 'Attendance',
      href: '/member/attendance',
      icon: 'calendar'
    },
    {
      label: 'Workout Plan',
      href: '/member/workout',
      icon: 'dumbbell'
    },
    {
      label: 'Diet Plan',
      href: '/member/diet',
      icon: 'utensils'
    },
    {
      label: 'Feedback',
      href: '/member/feedback',
      icon: 'message-square'
    },
    {
      label: 'Messages',
      href: '/member/messages',
      icon: 'mail'
    },
    {
      label: 'Loyalty Points',
      href: '/member/loyalty',
      icon: 'star'
    },
    {
      label: 'Payment History',
      href: '/member/payments',
      icon: 'credit-card'
    }
  ],
  manager: [
    {
      label: 'Dashboard',
      href: '/manager/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Users',
      href: '/manager/users',
      icon: 'users'
    },
    {
      label: 'Attendance',
      href: '/manager/attendance',
      icon: 'calendar'
    },
    {
      label: 'Financial',
      href: '/manager/financial',
      icon: 'dollar-sign',
      children: [
        { label: 'Expenses', href: '/manager/financial/expenses' },
        { label: 'Revenue', href: '/manager/financial/revenue' },
        { label: 'Payroll', href: '/manager/financial/payroll' }
      ]
    },
    {
      label: 'Plans',
      href: '/manager/plans',
      icon: 'clipboard-list',
      children: [
        { label: 'Workout Plans', href: '/manager/plans/workout' },
        { label: 'Diet Plans', href: '/manager/plans/diet' }
      ]
    },
    {
      label: 'Feedback',
      href: '/manager/feedback',
      icon: 'message-square'
    },
    {
      label: 'Messages',
      href: '/manager/messages',
      icon: 'mail'
    },
    {
      label: 'Reports',
      href: '/manager/reports',
      icon: 'bar-chart'
    }
  ],
  accountant: [
    {
      label: 'Dashboard',
      href: '/accountant/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Financial',
      href: '/accountant/financial',
      icon: 'dollar-sign',
      children: [
        { label: 'Expenses', href: '/accountant/financial/expenses' },
        { label: 'Revenue', href: '/accountant/financial/revenue' },
        { label: 'Payroll', href: '/accountant/financial/payroll' }
      ]
    },
    {
      label: 'Reports',
      href: '/accountant/reports',
      icon: 'bar-chart'
    }
  ],
  super_admin: [
    {
      label: 'membership-cards',
      href: '/membership-cards',
      icon: 'membership-cards'
    }

  ]
};

// Dashboard configurations
export const DASHBOARD_CONFIGS = {
  admin: {
    title: 'Admin Dashboard',
    description: 'Manage your gym operations',
    basePath: '/admin'
  },
  trainer: {
    title: 'Trainer Dashboard',
    description: 'Manage your clients and training programs',
    basePath: '/trainer'
  },
  member: {
    title: 'Member Dashboard',
    description: 'Track your fitness journey',
    basePath: '/member'
  },
  manager: {
    title: 'Manager Dashboard',
    description: 'Oversee gym operations',
    basePath: '/manager'
  },
  accountant: {
    title: 'Accountant Dashboard',
    description: 'Manage financial records and reports',
    basePath: '/accountant'
  },
  super_admin: {
    title: 'Super_Admin Dashboard',
    description: 'Manage for super_admin',
    basePath: '/membership-cards'
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me'
  },
  // Users
  users: {
    list: '/users',
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    get: (id: string) => `/users/${id}`,
    role: '/role',
    deleteHard: (id: string) => `/${id}/hard`,
    myClients: '/my-clients',
    search: '/search'
  },
  // Attendance
  attendance: {
    list: '/attendance',
    create: '/attendance',
    update: (id: string) => `/attendance/${id}`,
    delete: (id: string) => `/attendance/${id}`,
    user: (userId: string) => `/attendance/user/${userId}`
  },
  // Workout Plans
  workoutPlans: {
    list: '/workout-plans',
    create: '/workout-plans',
    update: (id: string) => `/workout-plans/${id}`,
    delete: (id: string) => `/workout-plans/${id}`,
    user: (userId: string) => `/workout-plans/user/${userId}`
  },
  // Diet Plans
  dietPlans: {
    list: '/diet-plans',
    create: '/diet-plans',
    update: (id: string) => `/diet-plans/${id}`,
    delete: (id: string) => `/diet-plans/${id}`,
    user: (userId: string) => `/diet-plans/user/${userId}`
  },
  // Financial
  financial: {
    expenses: {
      list: '/finance/expenses',
      create: '/finance/expenses',
      update: (id: string) => `/finance/expenses/${id}`,
      delete: (id: string) => `/finance/expenses/${id}`,
      get: (id: string) => `/finance/expenses/${id}`,
      summary: '/finance/expenses/summary'
    },
    revenue: {
      list: '/finance/revenues',
      create: '/finance/revenues',
      update: (id: string) => `/finance/revenues/${id}`,
      delete: (id: string) => `/finance/revenues/${id}`,
      get: (id: string) => `/finance/revenues/${id}`,
      summary: '/finance/revenues/summary' 
    },
    payroll: {
      list: '/finance/payrolls',
      create: '/finance/payrolls',
      update: (id: string) => `/finance/payrolls/${id}`,
      delete: (id: string) => `/finance/payrolls/${id}`,
      get: (id: string) => `/finance/payrolls/${id}`,
      summary: '/finance/payrolls/summary'
    },
    invoices: {
      list: '/finance/invoices',
      create: '/finance/invoices',
      update: (id: string) => `/finance/invoices/${id}`,
      delete: (id: string) => `/finance/invoices/${id}`,
      get: (id: string) => `/finance/invoices/${id}`,
      summary: '/finance/invoices/summary'
    }
  },
  // Loyalty Points
  loyalty: {
    // User Points
    user: (userId: string) => `/loyalty-points/${userId}`,
    myPoints: '/loyalty-points/my-points',
    history: '/loyalty-points/history',
    
    // Points Management
    add: '/loyalty-points/add',
    redeem: '/loyalty-points/redeem',
    stats: '/loyalty-points/stats',
    topUsers: '/loyalty-points/top-users',
    
    // Payment & Attendance Points
    paymentPoints: '/loyalty-points/payment-points',
    attendancePoints: '/loyalty-points/attendance-points',
    
    // Rewards (User)
    rewards: '/loyalty-points/rewards',
    redeemReward: '/loyalty-points/redeem-reward',
    
    // Rewards Management (Admin)
    adminRewards: '/loyalty-points/admin/rewards',
    adminRewardsStats: '/loyalty-points/admin/rewards/stats',
    createReward: 'admin/rewards',
    updateReward: (rewardId: string) => `/loyalty-points/admin/rewards/${rewardId}`,
    deleteReward: (rewardId: string) => `/loyalty-points/admin/rewards/${rewardId}`
  },
  // Feedback
  feedback: {
    list: '/feedback',
    create: '/feedback',
    update: (id: string) => `/feedback/${id}`,
    delete: (id: string) => `/feedback/${id}`,
    user: (userId: string) => `/feedback/${userId}`,
  },
  // Messages
  messages: {
    list: '/messages',
    create: '/messages',
    update: (id: string) => `/messages/${id}`,
    delete: (id: string) => `/messages/${id}`,
    markRead: (id: string) => `/messages/${id}/mark-read`,
    updateStatus: (id: string) => `/messages/${id}/read`,
    userMessages: (userId: string) => `/messages/${userId}`
  },
  // Progress
  progress: {
    list: '/progress',
    create: '/progress',
    update: (id: string) => `/progress/${id}`,
    delete: (id: string) => `/progress/${id}`,
    user: (userId: string) => `/progress/${userId}`,
    trainer: (trainerId: string) => `/progress/trainer/${trainerId}`
  },
  // Payments
  payments: {
    list: '/payments',
    create: '/payments',
    update: (id: string) => `/payments/${id}`,
    delete: (id: string) => `/payments/${id}`,
    user: (userId: string) => `/payments/${userId}`
  },
  // Purchases
  purchases: {
    list: '/purchases',
    create: '/purchases',
    update: (id: string) => `/purchases/${id}`,
    delete: (id: string) => `/purchases/${id}`,
    user: (userId: string) => `/purchases/user/${userId}`
  },
  // Session Schedules
  sessionSchedules: {
    list: '/schedules',
    create: (userId: string) => `/schedules/${userId}`,
    update: (id: string) => `/schedules/${id}`,
    delete: (id: string) => `/schedules/${id}`,
    user: (userId: string) => `/schedules/${userId}`,
  },
};

// Loyalty Points Constants
export const LOYALTY_CONSTANTS = {
  // Membership Levels
  MEMBERSHIP_LEVELS: {
    BRONZE: { name: 'Bronze', minPoints: 0, maxPoints: 199, color: 'from-yellow-600 to-yellow-800' },
    SILVER: { name: 'Silver', minPoints: 200, maxPoints: 499, color: 'from-gray-400 to-gray-600' },
    GOLD: { name: 'Gold', minPoints: 500, maxPoints: 999, color: 'from-yellow-400 to-yellow-600' },
    PLATINUM: { name: 'Platinum', minPoints: 1000, maxPoints: 1999, color: 'from-yellow-400 to-yellow-600' },
    DIAMOND: { name: 'Diamond', minPoints: 2000, maxPoints: Infinity, color: 'from-yellow-400 to-yellow-600' }
  },

  // Points Earning Rules
  POINTS_RULES: {
    ATTENDANCE: 50,
    PERSONAL_SESSION: 75,
    WORKOUT_PLAN_COMPLETION: 100,
    FIVE_STAR_RATING: 25,
    PAYMENT_BONUS: 10, // per dollar
    REFERRAL: 200,
    BIRTHDAY: 100,
    ANNIVERSARY: 150
  },

  // Transaction Types
  TRANSACTION_TYPES: {
    EARNED: 'earned',
    REDEEMED: 'redeemed',
    ADMIN_ADDED: 'admin_added',
    ADMIN_DEDUCTED: 'admin_deducted',
    PAYMENT_BONUS: 'payment_bonus',
    ATTENDANCE_BONUS: 'attendance_bonus',
    EXPIRED: 'expired'
  },

  // Reward Categories
  REWARD_CATEGORIES: {
    DISCOUNT: 'discount',
    FREE_SESSION: 'free_session',
    MERCHANDISE: 'merchandise',
    SUBSCRIPTION_EXTENSION: 'subscription_extension',
    PREMIUM_FEATURE: 'premium_feature',
    GIFT_CARD: 'gift_card'
  },

  // Icons for different types
  ICONS: {
    TRANSACTION: {
      earned: '🏋️',
      redeemed: '🎫',
      admin_added: '➕',
      admin_deducted: '➖',
      payment_bonus: '💳',
      attendance_bonus: '📅',
      expired: '⏰'
    },
    REWARD: {
      discount: '🎫',
      free_session: '👤',
      merchandise: '🎁',
      subscription_extension: '🏆',
      premium_feature: '⭐',
      gift_card: '💳'
    }
  },

  // Colors for different transaction types
  TRANSACTION_COLORS: {
    earned: 'text-green-600',
    redeemed: 'text-red-600',
    admin_added: 'text-yellow-600',
    admin_deducted: 'text-red-600',
    payment_bonus: 'text-green-600',
    attendance_bonus: 'text-green-600',
    expired: 'text-gray-600'
  }
};