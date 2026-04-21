import React from 'react';

interface SocialLinksFormProps {
  settings: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SocialLinksForm: React.FC<SocialLinksFormProps> = ({ settings, onChange }) => {
  const socialPlatforms = [
    { key: "facebook", icon: "📘", label: "Facebook" },
    { key: "instagram", icon: "📷", label: "Instagram" },
    { key: "twitter", icon: "🐦", label: "Twitter" },
    { key: "tiktok", icon: "🎵", label: "TikTok" },
    { key: "youtube", icon: "📺", label: "YouTube" }
  ];

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        🌐 روابط السوشيال
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialPlatforms.map((platform) => (
          <div key={platform.key}>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {platform.icon} {platform.label}
            </label>
            <input
              name={`socialLinks.${platform.key}`}
              value={settings?.socialLinks?.[platform.key] || ""}
              onChange={onChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksForm;
