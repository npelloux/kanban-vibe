import { createContext } from 'react';
import type { ToastData } from '../components/ToastContainer';
import type { ToastType } from '../components/Toast';

export interface ShowToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastData[];
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
