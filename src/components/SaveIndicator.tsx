import type { SaveStatus } from '../simulation/api/board-context';
import { formatRelativeTime } from './time-formatting/format-relative-time';

export type { SaveStatus };

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date;
  onRetry?: () => void;
}

function CheckmarkIcon() {
  return (
    <svg
      data-testid="save-indicator-icon"
      data-icon="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      data-testid="save-indicator-icon"
      data-icon="spinner"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="save-indicator__spinner"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      data-testid="save-indicator-icon"
      data-icon="warning"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      data-testid="save-indicator-icon"
      data-icon="error"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  lastSavedAt,
  onRetry,
}) => {
  const renderIcon = () => {
    switch (status) {
      case 'saved':
        return <CheckmarkIcon />;
      case 'saving':
        return <SpinnerIcon />;
      case 'dirty':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
    }
  };

  const renderText = () => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'saving':
        return 'Saving...';
      case 'dirty':
        return 'Unsaved changes';
      case 'error':
        return 'Save failed';
    }
  };

  const renderTimestamp = () => {
    if (status !== 'saved' || !lastSavedAt) {
      return null;
    }
    return (
      <span className="save-indicator__timestamp">
        {formatRelativeTime(lastSavedAt)}
      </span>
    );
  };

  const renderRetryButton = () => {
    if (status !== 'error' || !onRetry) {
      return null;
    }
    return (
      <button
        type="button"
        className="save-indicator__retry"
        onClick={onRetry}
        aria-label="Retry save"
      >
        Retry
      </button>
    );
  };

  return (
    <div
      className={`save-indicator save-indicator--${status}`}
      aria-live="polite"
    >
      {renderIcon()}
      <span className="save-indicator__text">{renderText()}</span>
      {renderTimestamp()}
      {renderRetryButton()}
    </div>
  );
};
