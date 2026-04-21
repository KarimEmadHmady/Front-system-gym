export interface ProgressRecord {
  _id: string;
  date?: string | Date;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  legs?: number;
  weightChange?: number;
  fatChange?: number;
  muscleChange?: number;
  status?: string;
  advice?: string;
  notes?: string;
  image?: {
    url: string;
    publicId?: string;
  };
}

export interface ProgressFormData {
  date: string;
  weight: string;
  bodyFatPercentage: string;
  notes: string;
  muscleMass?: string;
  waist?: string;
  chest?: string;
  arms?: string;
  legs?: string;
  weightChange?: string;
  fatChange?: string;
  muscleChange?: string;
  status?: string;
  advice?: string;
}