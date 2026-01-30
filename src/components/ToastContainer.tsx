import React from 'react';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

const DEFAULT_MAX_VISIBLE = 5;

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  maxVisible = DEFAULT_MAX_VISIBLE,
}) => {
  const visibleToasts = toasts.slice(-maxVisible);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {visibleToasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
