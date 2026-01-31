import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveIndicator } from '../SaveIndicator';
import '@testing-library/jest-dom';

describe('SaveIndicator Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('saved state', () => {
    it('shows "Saved" text when status is saved', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('shows checkmark icon when saved', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(screen.getByTestId('save-indicator-icon')).toHaveAttribute(
        'data-icon',
        'checkmark'
      );
    });

    it('shows "just now" for timestamp within last minute', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('shows "1 min ago" for timestamp 1 minute old', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:59:00Z')}
        />
      );

      expect(screen.getByText('1 min ago')).toBeInTheDocument();
    });

    it('shows "5 min ago" for timestamp 5 minutes old', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:55:00Z')}
        />
      );

      expect(screen.getByText('5 min ago')).toBeInTheDocument();
    });

    it('has subtle styling with muted class', () => {
      const { container } = render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(container.firstChild).toHaveClass('save-indicator--saved');
    });
  });

  describe('saving state', () => {
    it('shows "Saving..." text when status is saving', () => {
      render(<SaveIndicator status="saving" />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows spinner icon when saving', () => {
      render(<SaveIndicator status="saving" />);

      expect(screen.getByTestId('save-indicator-icon')).toHaveAttribute(
        'data-icon',
        'spinner'
      );
    });

    it('does not show timestamp when saving', () => {
      render(
        <SaveIndicator
          status="saving"
          lastSavedAt={new Date('2026-01-31T11:59:00Z')}
        />
      );

      expect(screen.queryByText('1 min ago')).not.toBeInTheDocument();
    });
  });

  describe('dirty state', () => {
    it('shows "Unsaved changes" text when status is dirty', () => {
      render(<SaveIndicator status="dirty" />);

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('shows warning icon when dirty', () => {
      render(<SaveIndicator status="dirty" />);

      expect(screen.getByTestId('save-indicator-icon')).toHaveAttribute(
        'data-icon',
        'warning'
      );
    });

    it('does not show timestamp when dirty', () => {
      render(
        <SaveIndicator
          status="dirty"
          lastSavedAt={new Date('2026-01-31T11:59:00Z')}
        />
      );

      expect(screen.queryByText('1 min ago')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows "Save failed" text when status is error', () => {
      render(<SaveIndicator status="error" onRetry={() => {}} />);

      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });

    it('shows error icon when error', () => {
      render(<SaveIndicator status="error" onRetry={() => {}} />);

      expect(screen.getByTestId('save-indicator-icon')).toHaveAttribute(
        'data-icon',
        'error'
      );
    });

    it('shows retry button when error', () => {
      render(<SaveIndicator status="error" onRetry={() => {}} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<SaveIndicator status="error" onRetry={onRetry} />);

      screen.getByRole('button', { name: /retry/i }).click();

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has appropriate aria-live for status changes', () => {
      const { container } = render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('relative time formatting', () => {
    it('shows "just now" for 0-59 seconds', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:59:30Z')}
        />
      );

      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('shows "1 min ago" for 60-119 seconds', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:59:00Z')}
        />
      );

      expect(screen.getByText('1 min ago')).toBeInTheDocument();
    });

    it('shows "2 min ago" for 120-179 seconds', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:58:00Z')}
        />
      );

      expect(screen.getByText('2 min ago')).toBeInTheDocument();
    });

    it('shows hour format for times over 59 minutes', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T11:00:00Z')}
        />
      );

      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    });

    it('shows plural hours for times over 1 hour', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T10:00:00Z')}
        />
      );

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('shows day format for times over 24 hours', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-30T12:00:00Z')}
        />
      );

      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });

    it('shows plural days for times over 1 day', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-29T12:00:00Z')}
        />
      );

      expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });

    it('treats future dates as just now', () => {
      render(
        <SaveIndicator
          status="saved"
          lastSavedAt={new Date('2026-01-31T12:05:00Z')}
        />
      );

      expect(screen.getByText('just now')).toBeInTheDocument();
    });
  });
});
