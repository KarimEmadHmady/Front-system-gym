import React from 'react';
import * as XLSX from 'xlsx';
import type { WorkoutPlan, DietPlan } from '@/types';

interface ExportButtonsProps {
  workoutPlans: WorkoutPlan[];
  dietPlans: DietPlan[];
  userNameMap: Record<string, string>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  workoutPlans,
  dietPlans,
  userNameMap
}) => {
  const exportWorkoutPlans = () => {
    try {
      const data = workoutPlans.map(plan => ({
        'Plan Name': plan.planName,
        'User': userNameMap[plan.userId] || 'Unknown',
        'Description': plan.description || '',
        'Start Date': plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '',
        'End Date': plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '',
        'Exercises Count': plan.exercises.length,
        'Created At': new Date(plan.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Workout Plans');
      XLSX.writeFile(wb, `workout_plans_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    } catch (error) {
      console.error('Error exporting workout plans:', error);
    }
  };

  const exportDietPlans = () => {
    try {
      const data = dietPlans.map(plan => ({
        'Plan Name': plan.planName,
        'User': userNameMap[plan.userId] || 'Unknown',
        'Description': plan.description || '',
        'Start Date': plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '',
        'End Date': plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '',
        'Meals Count': plan.meals.length,
        'Total Calories': plan.meals.reduce((sum, meal) => sum + meal.calories, 0),
        'Created At': new Date(plan.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Diet Plans');
      XLSX.writeFile(wb, `diet_plans_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    } catch (error) {
      console.error('Error exporting diet plans:', error);
    }
  };

  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={exportWorkoutPlans}
        disabled={workoutPlans.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Export Workout Plans
      </button>
      <button
        onClick={exportDietPlans}
        disabled={dietPlans.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Export Diet Plans
      </button>
    </div>
  );
};

export default ExportButtons;
