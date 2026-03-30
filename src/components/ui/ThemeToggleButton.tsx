'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTheme, toggleTheme, ThemeMode } from '@/redux/features/theme/themeSlice';

const themeCycle: ThemeMode[] = ['auto', 'dark', 'light'];

export default function ThemeToggleButton() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    // Initialize from localStorage on client side only once
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('ui-theme') as ThemeMode | null;
    if (stored && themeCycle.includes(stored)) {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    // Reset all theme classes first
    html.classList.remove('theme-light', 'theme-dark', 'dark', 'light');

    // Apply current mode
    if (mode === 'dark') {
      html.classList.add('theme-dark', 'dark');
      html.style.colorScheme = 'dark';
    } else if (mode === 'light') {
      html.classList.add('theme-light', 'light');
      html.style.colorScheme = 'light';
    } else {
      html.style.colorScheme = '';
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-theme', mode);
    }
  }, [mode]);

  const label = mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';

  const tooltip =
    mode === 'auto'
      ? 'الوضع التلقائي: يأخذ من إعداد النظام (light/dark)'
      : mode === 'dark'
      ? 'الوضع الداكن مفعل، اضغط للتبديل للفاتح'
      : 'الوضع الفاتح مفعل، اضغط للتبديل للأوتو';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      title={tooltip}
      className="flex items-center gap-2 px-3 py-[6px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span>{mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '🌓'}</span>
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </button>
  );
}
