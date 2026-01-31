import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SlotManager } from '../SlotManager';
import type { SlotInfo } from '../../simulation/infra/state-repository';
import '@testing-library/jest-dom';

describe('SlotManager', () => {
  const mockOnSave = vi.fn();
  const mockOnLoad = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRename = vi.fn();
  const mockOnClose = vi.fn();

  const emptySlots: [SlotInfo | null, SlotInfo | null, SlotInfo | null] = [
    null,
    null,
    null,
  ];

  const defaultProps = {
    isOpen: true,
    slots: emptySlots,
    onSave: mockOnSave,
    onLoad: mockOnLoad,
    onDelete: mockOnDelete,
    onRename: mockOnRename,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<SlotManager {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog when isOpen is true', () => {
      render(<SlotManager {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('slot display', () => {
    it('displays all three slots', () => {
      render(<SlotManager {...defaultProps} />);

      expect(screen.getByText('Slot 1')).toBeInTheDocument();
      expect(screen.getByText('Slot 2')).toBeInTheDocument();
      expect(screen.getByText('Slot 3')).toBeInTheDocument();
    });

    it('shows Empty label for empty slots', () => {
      render(<SlotManager {...defaultProps} />);

      const emptyLabels = screen.getAllByText('Empty');
      expect(emptyLabels).toHaveLength(3);
    });

    it('displays saved slot name and timestamp', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [
          { name: 'My Save', savedAt: Date.now() - 60000 },
          null,
          { name: 'Another Save', savedAt: Date.now() - 3600000 },
        ];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      expect(screen.getByText('My Save')).toBeInTheDocument();
      expect(screen.getByText('Another Save')).toBeInTheDocument();
    });

    it('shows relative time for saved slots', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Recent', savedAt: Date.now() - 120000 }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      expect(screen.getByText(/2 min ago/)).toBeInTheDocument();
    });
  });

  describe('save action', () => {
    it('renders save button for each slot', () => {
      render(<SlotManager {...defaultProps} />);

      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      expect(saveButtons).toHaveLength(3);
    });

    it('calls onSave with slot number and default name for empty slot', () => {
      render(<SlotManager {...defaultProps} />);

      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      fireEvent.click(saveButtons[0]);

      expect(mockOnSave).toHaveBeenCalledWith(1, 'Slot 1');
    });

    it('shows overwrite confirmation for occupied slot', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Existing', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      fireEvent.click(saveButtons[0]);

      expect(screen.getByText(/overwrite/i)).toBeInTheDocument();
    });

    it('calls onSave after confirming overwrite', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Existing', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      fireEvent.click(saveButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(mockOnSave).toHaveBeenCalledWith(1, 'Existing');
    });

    it('does not call onSave when overwrite is cancelled', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Existing', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      fireEvent.click(saveButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('load action', () => {
    it('renders load button for each slot', () => {
      render(<SlotManager {...defaultProps} />);

      const loadButtons = screen.getAllByRole('button', { name: /load/i });
      expect(loadButtons).toHaveLength(3);
    });

    it('disables load button for empty slots', () => {
      render(<SlotManager {...defaultProps} />);

      const loadButtons = screen.getAllByRole('button', { name: /load/i });
      loadButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('enables load button for occupied slots', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const loadButtons = screen.getAllByRole('button', { name: /load/i });
      expect(loadButtons[0]).not.toBeDisabled();
      expect(loadButtons[1]).toBeDisabled();
      expect(loadButtons[2]).toBeDisabled();
    });

    it('calls onLoad with slot number when clicked', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const loadButtons = screen.getAllByRole('button', { name: /load/i });
      fireEvent.click(loadButtons[0]);

      expect(mockOnLoad).toHaveBeenCalledWith(1);
    });
  });

  describe('delete action', () => {
    it('renders delete button for occupied slots only', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(1);
    });

    it('shows confirmation before deleting', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
    });

    it('calls onDelete with slot number after confirmation', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('does not call onDelete when cancelled', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Saved', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('rename action', () => {
    it('renders edit button for occupied slots', () => {
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: 'Original Name', savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      expect(screen.getByRole('button', { name: /edit slot name/i })).toBeInTheDocument();
    });

    it('does not render edit button for empty slots', () => {
      render(<SlotManager {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /edit slot name/i })).not.toBeInTheDocument();
    });
  });

  describe('close action', () => {
    it('calls onClose when close button is clicked', () => {
      render(<SlotManager {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      render(<SlotManager {...defaultProps} />);

      const backdrop = screen.getByTestId('slot-manager-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<SlotManager {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('long slot names', () => {
    it('truncates long slot names in display', () => {
      const longName = 'This is a very long slot name that should be truncated';
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: longName, savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const truncatedText = longName.slice(0, 17) + '...';
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });

    it('shows full name in tooltip for truncated names', () => {
      const longName = 'This is a very long slot name that should be truncated';
      const slotsWithData: [SlotInfo | null, SlotInfo | null, SlotInfo | null] =
        [{ name: longName, savedAt: Date.now() }, null, null];

      render(<SlotManager {...defaultProps} slots={slotsWithData} />);

      const slotNameElement = screen.getByTitle(longName);
      expect(slotNameElement).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper dialog role and aria attributes', () => {
      render(<SlotManager {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('focuses first interactive element when opened', () => {
      render(<SlotManager {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(document.activeElement).toBe(closeButton);
    });
  });
});
