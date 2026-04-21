import type { GymSettings } from '@/services/gymSettingsService';

export interface User {
  _id: string;
  name: string;
  email: string;
  barcode: string;
  role: string;
  membershipLevel: string;
  status: string;
  phone?: string;
  userNumber?: string | number;
}

export interface GeneratedCard {
  fileName: string;
  filePath: string;
  barcode?: string;
  size: number;
  created?: string;
}

export interface CardGenerationResult {
  success: boolean;
  message: string;
  data: {
    results: Array<{
      success: boolean;
      message: string;
      fileName: string;
      filePath: string;
      barcode?: string;
      user: {
        id: string;
        name: string;
        barcode: string;
        email: string;
      };
    }>;
    errors: Array<{
      userId: string;
      error: string;
    }>;
    totalRequested: number;
    totalGenerated: number;
    totalErrors: number;
    combinedPdfBuffer?: string;
    combinedPdfFileName?: string;
  };
}

export type CardStyleType = NonNullable<GymSettings['membershipCardStyle']>;
export type FrontStyleType = NonNullable<GymSettings['membershipCardFront']>;

export interface UploadedFiles {
  backgroundImage?: File;
  patternImage?: File;
  centerLogoUrl?: File;
}