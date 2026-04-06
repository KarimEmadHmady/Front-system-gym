// Feature Flags Configuration
// .env variables: VITE_FEATURE_USERS, VITE_FEATURE_ATTENDANCE, etc.

export interface FeatureFlags {
  users: boolean;
  attendance: boolean;
  payments: boolean;
  purchases: boolean;
  workoutPlans: boolean;
  dietPlans: boolean;
  messages: boolean;
  clientProgress: boolean;
  schedules: boolean;
  feedback: boolean;
  loyaltyPoints: boolean;
  financial: boolean;
  gymSettings: boolean;
  membershipCards: boolean;
  attendanceScan: boolean;
  notifications: boolean;
  backup: boolean;
  whatsapp: boolean;
}

const DEFAULTS: FeatureFlags = {
  users: true,
  attendance: true,
  payments: true,
  purchases: true,
  workoutPlans: true,
  dietPlans: true,
  messages: true,
  clientProgress: true,
  schedules: true,
  feedback: true,
  loyaltyPoints: true,
  financial: true,
  gymSettings: true,
  membershipCards: true,
  attendanceScan: true,
  notifications: true,
  backup: true,
  whatsapp: true,
};

function fromEnv(): Partial<FeatureFlags> {
  const out: Partial<FeatureFlags> = {};
  
  // Next.js doesn't support dynamic process.env access, so we map explicitly
  const envMap: Partial<Record<keyof FeatureFlags, string | undefined>> = {
    users:          process.env.NEXT_PUBLIC_FEATURE_USERS,
    attendance:     process.env.NEXT_PUBLIC_FEATURE_ATTENDANCE,
    payments:       process.env.NEXT_PUBLIC_FEATURE_PAYMENTS,
    purchases:      process.env.NEXT_PUBLIC_FEATURE_PURCHASES,
    workoutPlans:   process.env.NEXT_PUBLIC_FEATURE_WORKOUTPLANS,
    dietPlans:      process.env.NEXT_PUBLIC_FEATURE_DIETPLANS,
    messages:       process.env.NEXT_PUBLIC_FEATURE_MESSAGES,
    clientProgress: process.env.NEXT_PUBLIC_FEATURE_CLIENTPROGRESS,
    schedules:      process.env.NEXT_PUBLIC_FEATURE_SCHEDULES,
    feedback:       process.env.NEXT_PUBLIC_FEATURE_FEEDBACK,
    loyaltyPoints:  process.env.NEXT_PUBLIC_FEATURE_LOYALTYPOINTS,
    financial:      process.env.NEXT_PUBLIC_FEATURE_FINANCIAL,
    gymSettings:    process.env.NEXT_PUBLIC_FEATURE_GYMSETTINGS,
    membershipCards:process.env.NEXT_PUBLIC_FEATURE_MEMBERSHIPCARDS,
    attendanceScan: process.env.NEXT_PUBLIC_FEATURE_ATTENDANCESCAN,
    notifications:  process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS,
    backup:         process.env.NEXT_PUBLIC_FEATURE_BACKUP,
    whatsapp:       process.env.NEXT_PUBLIC_FEATURE_WHATSAPP,
  };

  (Object.keys(envMap) as (keyof FeatureFlags)[]).forEach((key) => {
    const val = envMap[key];
    if (val !== undefined) out[key] = val !== 'false' && val !== '0';
  });

  return out;
}

export const INITIAL_FEATURES: FeatureFlags = { ...DEFAULTS, ...fromEnv() };

export async function fetchFeatures(): Promise<FeatureFlags> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    const res = await fetch(`${base}/features`);
    if (!res.ok) throw new Error();
    const { success, features } = await res.json();
    if (!success) throw new Error();
    return { ...INITIAL_FEATURES, ...features };
  } catch {
    return INITIAL_FEATURES;
  }
}