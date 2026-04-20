import React, { useState } from 'react';

interface DietPlanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Array<{ _id: string; name: string; email?: string; phone?: string }>;
  trainers: Array<{ _id: string; name: string; email?: string; phone?: string }>;
  currentRole: string | undefined;
  currentTrainerId: string;
  onCreate: (data: any) => void;
  loading: boolean;
}

const DietPlanCreateModal: React.FC<DietPlanCreateModalProps> = ({
  isOpen,
  onClose,
  members,
  trainers,
  currentRole,
  currentTrainerId,
  onCreate,
  loading
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    trainerId: currentRole === 'trainer' ? currentTrainerId : '',
    planName: '',
    description: '',
    startDate: '',
    endDate: '',
    meals: [] as Array<{
      mealName: string;
      calories: number;
      quantity: string;
      notes: string;
    }>
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [trainerSearch, setTrainerSearch] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredTrainers = trainers.filter(t => 
    t.name.toLowerCase().includes(trainerSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(trainerSearch.toLowerCase())
  );

  const handleMealChange = (index: number, field: string, value: any) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setFormData({ ...formData, meals: updatedMeals });
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, {
        mealName: '',
        calories: 0,
        quantity: '',
        notes: ''
      }]
    });
  };

  const removeMeal = (index: number) => {
    const updatedMeals = formData.meals.filter((_, i) => i !== index);
    setFormData({ ...formData, meals: updatedMeals });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Diet Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Member
              </label>
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 mb-2"
              />
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              >
                <option value="">Select a member</option>
                {filteredMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {currentRole !== 'trainer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Trainer
                </label>
                <input
                  type="text"
                  placeholder="Search trainers..."
                  value={trainerSearch}
                  onChange={(e) => setTrainerSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 mb-2"
                />
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="">Select a trainer</option>
                  {filteredTrainers.map(trainer => (
                    <option key={trainer._id} value={trainer._id}>
                      {trainer.name} ({trainer.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              />
            </div>
          </div>

          {/* Meals */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Meals</h3>
              <button
                type="button"
                onClick={addMeal}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Meal
              </button>
            </div>

            <div className="space-y-4">
              {formData.meals.map((meal, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Meal {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMeal(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meal Name
                      </label>
                      <input
                        type="text"
                        value={meal.mealName}
                        onChange={(e) => handleMealChange(index, 'mealName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) => handleMealChange(index, 'calories', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="text"
                        value={meal.quantity}
                        onChange={(e) => handleMealChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={meal.notes}
                        onChange={(e) => handleMealChange(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietPlanCreateModal;
