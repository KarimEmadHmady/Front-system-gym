import React from 'react';

interface PoliciesFormProps {
  settings: any;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PoliciesForm: React.FC<PoliciesFormProps> = ({ settings, onChange }) => {
  const policyTypes = [
    { key: "terms", icon: "📄", label: "الشروط والأحكام" },
    { key: "privacy", icon: "🔒", label: "سياسة الخصوصية" },
    { key: "refund", icon: "💰", label: "سياسة الاسترجاع" }
  ];

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        📋 السياسات
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {policyTypes.map((policy) => (
          <div key={policy.key}>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {policy.icon} {policy.label}
            </label>
            <textarea
              name={`policies.${policy.key}`}
              value={settings?.policies?.[policy.key] || ""}
              onChange={onChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoliciesForm;
