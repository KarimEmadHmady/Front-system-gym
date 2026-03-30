import { useState, useCallback } from 'react';

export interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    duration: 5000
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      duration: duration ?? 5000
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showAlert(title, message, 'success', duration);
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    showAlert(title, message, 'error', duration);
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showAlert(title, message, 'warning', duration);
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showAlert(title, message, 'info', duration);
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
