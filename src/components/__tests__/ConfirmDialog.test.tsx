import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';
import '@testing-library/jest-dom';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders dialog when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('displays the title', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    it('displays the message', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('renders confirm button with default text', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('renders cancel button with default text', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('uses custom confirm button text when provided', () => {
      render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
    });

    it('uses custom cancel button text when provided', () => {
      render(<ConfirmDialog {...defaultProps} cancelText="Go Back" />);

      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when clicking the backdrop', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when clicking inside the dialog content', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const dialogContent = screen.getByRole('dialog');
      fireEvent.click(dialogContent);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape key is pressed', () => {
      render(<ConfirmDialog {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has dialog role', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toHaveTextContent('Confirm Action');
    });

    it('has aria-describedby pointing to message', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const messageId = dialog.getAttribute('aria-describedby');
      expect(messageId).toBeTruthy();
      expect(document.getElementById(messageId!)).toHaveTextContent('Are you sure you want to proceed?');
    });
  });

  describe('styling', () => {
    it('applies destructive variant class when variant is destructive', () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('confirm-dialog__button--destructive');
    });

    it('applies default variant class when variant is not specified', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('confirm-dialog__button--primary');
    });
  });
});
