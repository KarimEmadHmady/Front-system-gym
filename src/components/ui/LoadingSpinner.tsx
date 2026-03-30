'use client';

import React from 'react';
import { useGymBranding } from '@/contexts/GymBrandingContext';

interface LoadingSpinnerProps {
  logoSrc?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  logoSrc,
  className = '',
}) => {
  const { logoUrl } = useGymBranding();

  return (
    <div
      className={`min-h-screen z-50 absolute top-0 left-0 w-full flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#6b6b6b] to-[#f5f5f5] ${className}`}
    >
      <div className="text-center">
        {/* Logo with animation */}
        <img
          src={logoSrc || logoUrl}
          alt="Logo"
          className="h-auto w-30 mx-auto mb-4 animate-pulse"
        />
        <p className="text-white text-lg mt-2">جاري التحميل ...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
