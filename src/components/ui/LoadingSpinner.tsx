'use client';

import React, { useState, useEffect } from 'react';
import { GymSettingsService } from '@/services/gymSettingsService';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = '',
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(''); // No default logo

  useEffect(() => {
    const fetchGymSettings = async () => {
      try {
        const gymSettingsService = new GymSettingsService();
        const settings = await gymSettingsService.get();
        // Set logo from gym settings
        if (settings?.logoUrl) {
          setLogoSrc(settings.logoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch gym settings:', error);
        // Keep no logo on error
      }
    };
    fetchGymSettings();
  }, []);

  return (
    <div
      className={`min-h-screen z-50 absolute top-0 left-0 w-full flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#6b6b6b] to-[#f5f5f5] ${className}`}
    >
      <div className="text-center">
        {/* Logo with animation - only show if logoSrc exists */}
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Logo"
            className="h-auto w-30 mx-auto mb-4 animate-pulse"
          />
        )}
        <p className="text-white text-lg mt-2">جاري التحميل ...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
