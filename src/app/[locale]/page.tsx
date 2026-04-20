'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from "next/link";
import { GymSettingsService } from '@/services/gymSettingsService';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gymSettings, setGymSettings] = useState<any>(null);
  const [logoSrc, setLogoSrc] = useState<string>(''); // No default logo
  
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuth();
  const router = useRouter();
  const t = useTranslations('Login');
  const locale = useLocale();

  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

  useEffect(() => {
    const fetchGymSettings = async () => {
      try {
        const gymSettingsService = new GymSettingsService();
        const settings = await gymSettingsService.get();
        setGymSettings(settings);
        // Set logo from gym settings
        if (settings?.logoUrl) {
          setLogoSrc(settings.logoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch gym settings:', error);
        // Keep default logo on error
      }
    };
    fetchGymSettings();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (localError) {
      setLocalError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.identifier || !formData.password) { // Changed from formData.email
      setLocalError('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور'); // More specific Arabic
      return;
    }

    // Basic format validation
    if (formData.identifier.length < 3) {
      setLocalError('البريد الإلكتروني أو رقم الهاتف يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (formData.password.length < 4) {
      setLocalError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }

    // Removed email-specific validation
    // if (!formData.email.includes('@')) {
    //   setLocalError('الرجاء إدخال بريد إلكتروني صالح');
    //   return;
    // }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      const result = await login(formData); // formData now contains identifier and password
      if (!result.success) {
        // More specific error messages based on common scenarios
        if (result.error?.includes('password') || result.error?.includes('كلمة')) {
          setLocalError('كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مرة أخرى');
        } else if (result.error?.includes('user') || result.error?.includes('not found') || result.error?.includes('غير موجود')) {
          setLocalError('البريد الإلكتروني أو رقم الهاتف غير مسجل. يرجى التحقق من البيانات أو إنشاء حساب جديد');
        } else if (result.error?.includes('invalid') || result.error?.includes('صالح')) {
          setLocalError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
        } else {
          setLocalError('فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى');
        }
      }
    } catch (error) {
      setLocalError('حدث خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-gray-500 via-gray-300 to-gray-200 overflow-hidden">
        {/* خلفية زخرفية إضافية */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* دوائر شفافة متداخلة */}
          <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-gray-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-gray-300/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          {/* خطوط ضبابية */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/10" />
        </div>
        <div className="relative z-10 w-full flex items-center justify-center">
          {/* الفورم */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl px-6 py-8 w-full max-w-sm flex flex-col gap-4 mx-5 mt-[10vh] relative z-[999999]"
          >
            {/* Logo */}
            {logoSrc && (
              <div className="flex justify-center mb-4">
                <img src={logoSrc} alt="GYM Logo" className="w-25 h-25 object-contain rounded-full shadow-lg bg-white/80 p-2" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">تسجيل الدخول</h2>
            {/* Error Message */}
            {localError && (
              <div className="bg-red-100/60 border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm">
                {localError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="identifier" className="text-gray-600 font-medium">البريد الإلكتروني أو رقم الهاتف</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-800 placeholder-gray-400 disabled:opacity-50"
                placeholder="أدخل بريدك الإلكتروني أو رقم الهاتف"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-gray-600 font-medium">كلمة المرور</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-800 placeholder-gray-400 disabled:opacity-50"
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="mt-2 w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold transition-all duration-200 shadow-md flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
            {/* Divider */}
            <div className="mt-4 border-t border-gray-300 w-[90%] mx-auto"></div>
            {/* Language & Contact Buttons */}
            <div className="mt-4 w-[90%] mx-auto flex items-center justify-between gap-2">
              <Link
                href={`tel:${contactPhone}`}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors w-full text-center"
              >
                تواصل معنا
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

export default LoginPage;