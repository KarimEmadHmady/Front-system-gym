export const getTypeText = (type: string) => {
  const types = {
    weight_loss: 'تخسيس',
    muscle_gain: 'بناء عضلات',
    general_fitness: 'لياقة عامة',
    general_health: 'صحة عامة'
  };
  return types[type as keyof typeof types] || type;
};

export const getDifficultyColor = (difficulty: string) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getDifficultyText = (difficulty: string) => {
  const texts = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
  };
  return texts[difficulty as keyof typeof texts] || difficulty;
};

export const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string) => {
  const texts = {
    active: 'نشط',
    inactive: 'غير نشط',
    draft: 'مسودة'
  };
  return texts[status as keyof typeof texts] || status;
};
