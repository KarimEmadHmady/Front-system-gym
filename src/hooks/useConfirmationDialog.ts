import { useState, useCallback } from 'react';

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useConfirmationDialog = () => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'danger'
  });

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
      onCancel?: () => void;
    }
  ) => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      confirmText: options?.confirmText || 'تأكيد',
      cancelText: options?.cancelText || 'إلغاء',
      type: options?.type || 'danger',
      onConfirm,
      onCancel: options?.onCancel
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmationState.onConfirm) {
      confirmationState.onConfirm();
    }
    hideConfirmation();
  }, [confirmationState.onConfirm, hideConfirmation]);

  const handleCancel = useCallback(() => {
    if (confirmationState.onCancel) {
      confirmationState.onCancel();
    }
    hideConfirmation();
  }, [confirmationState.onCancel, hideConfirmation]);

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel
  };
};
