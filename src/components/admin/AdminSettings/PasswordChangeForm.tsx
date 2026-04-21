import React, { useState } from 'react';

interface PasswordChangeFormProps {
  onSave: (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSave, disabled = false }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validatePasswords = () => {
    const newErrors: string[] = [];
    
    if (!currentPassword) {
      newErrors.push("الرجاء إدخال كلمة المرور الحالية.");
    }
    
    if (!newPassword) {
      newErrors.push("الرجاء إدخال كلمة المرور الجديدة.");
    }
    
    if (newPassword.length < 5) {
      newErrors.push("يجب أن تكون كلمة المرور الجديدة 5 أحرف على الأقل.");
    }
    
    if (newPassword !== confirmNewPassword) {
      newErrors.push("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (validatePasswords()) {
      try {
        await onSave({
          currentPassword,
          newPassword,
          confirmNewPassword
        });
        // Reset form after successful save
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrors([]);
      } catch (error) {
        // Error handling is done by parent component
      }
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        🔐 تغيير كلمة المرور
      </h4>
      
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
          {errors.map((error, index) => (
            <div key={index} className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
          كلمة المرور الحالية
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
          placeholder="ادخل كلمة المرور الحالية"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
          كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
          placeholder="ادخل كلمة المرور الجديدة"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
          placeholder="تأكيد كلمة المرور الجديدة"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={disabled || !currentPassword || !newPassword || !confirmNewPassword}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          تغيير كلمة المرور
        </button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
