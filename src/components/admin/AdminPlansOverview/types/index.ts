export type ExerciseFormItem = {
  name: string;
  reps: number;
  sets: number;
  notes?: string;
  image?: string;
  imageFile?: File;
};

export type MealFormItem = {
  mealName: string;
  calories: number;
  quantity: string;
  notes?: string;
};

export type UserBasic = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};