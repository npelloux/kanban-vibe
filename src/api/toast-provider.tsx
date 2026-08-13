import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from '../components/ToastContainer';
import type { ToastData } from '../components/ToastContainer';
import { ToastContext } from './toast-context';
import type { ShowToastOptions, ToastContextValue } from './toast-context';

function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((options: ShowToastOptions) => {
    const newToast: ToastData = {
      id: generateToastId(),
      message: options.message,
      type: options.type,
      duration: options.duration,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const info = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  }, [showToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  }, [showToast]);

  const value = useMemo<ToastContextValue>(() => ({
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
    info,
    warning,
    error,
    success,
  }), [toasts, showToast, dismissToast, clearAllToasts, info, warning, error, success]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};
