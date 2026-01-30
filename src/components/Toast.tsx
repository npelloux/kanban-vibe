import React, { useEffect } from 'react';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
  duration?: number;
}

const DEFAULT_DURATION = 4000;

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onDismiss,
  duration = DEFAULT_DURATION,
}) => {
  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`toast toast-${type}`}
      data-testid="toast"
    >
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-dismiss"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};
