import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NavigationBar } from '../NavigationBar';
import '@testing-library/jest-dom';

describe('NavigationBar Component', () => {
  const mockOnTabChange = vi.fn();
  const mockOnSaveContext = vi.fn();
  const mockOnImportContext = vi.fn();
  const mockOnRunPolicy = vi.fn();
  const mockOnCancelPolicy = vi.fn();
  
  const defaultProps = {
    activeTab: 'kanban' as const,
    onTabChange: mockOnTabChange,
    currentDay: 5,
    onSaveContext: mockOnSaveContext,
    onImportContext: mockOnImportContext
  };
  
  const propsWithPolicy = {
    ...defaultProps,
    onRunPolicy: mockOnRunPolicy,
    isPolicyRunning: false,
    onCancelPolicy: mockOnCancelPolicy
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with all required elements', () => {
    const { container } = render(<NavigationBar {...defaultProps} />);
    
    // Check for logo
    const logoImage = container.querySelector('.logo-image');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'Kanban Vibe Logo');
    
    // Check for tabs
    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    expect(screen.getByText('Cumulative Flow')).toBeInTheDocument();
    expect(screen.getByText('WIP & Aging')).toBeInTheDocument();
    expect(screen.getByText('Flow Metrics')).toBeInTheDocument();
    
    // Check for day counter
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByLabelText('Save options')).toBeInTheDocument();
    expect(screen.getByLabelText('Import options')).toBeInTheDocument();
  });
  
  it('highlights the active tab', () => {
    render(<NavigationBar {...defaultProps} />);
    
    const kanbanTab = screen.getByText('Kanban Board');
    expect(kanbanTab.className).toContain('active');
    
    const cfdTab = screen.getByText('Cumulative Flow');
    expect(cfdTab.className).not.toContain('active');
  });
  
  it('calls onTabChange when a tab is clicked', () => {
    render(<NavigationBar {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cumulative Flow'));
    expect(mockOnTabChange).toHaveBeenCalledWith('cfd');
    
    fireEvent.click(screen.getByText('WIP & Aging'));
    expect(mockOnTabChange).toHaveBeenCalledWith('wip');
    
    fireEvent.click(screen.getByText('Flow Metrics'));
    expect(mockOnTabChange).toHaveBeenCalledWith('metrics');
  });
  
  it('shows save dropdown when save button is clicked', () => {
    render(<NavigationBar {...defaultProps} />);
    
    // Initially dropdown should not be visible
    expect(screen.queryByText('Save Context')).not.toBeInTheDocument();
    
    // Click save button
    fireEvent.click(screen.getByLabelText('Save options'));
    
    // Dropdown should now be visible
    expect(screen.getByText('Save Context')).toBeInTheDocument();
  });
  
  it('calls onSaveContext when save context is clicked', () => {
    render(<NavigationBar {...defaultProps} />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Save options'));
    
    // Click save context
    fireEvent.click(screen.getByText('Save Context'));
    
    // Check if function was called
    expect(mockOnSaveContext).toHaveBeenCalled();
    
    // Dropdown should be closed after clicking
    expect(screen.queryByText('Save Context')).not.toBeInTheDocument();
  });
  
  it('shows import dropdown when import button is clicked', () => {
    render(<NavigationBar {...defaultProps} />);
    
    // Initially dropdown should not be visible
    expect(screen.queryByText('Import Context')).not.toBeInTheDocument();
    
    // Click import button
    fireEvent.click(screen.getByLabelText('Import options'));
    
    // Dropdown should now be visible
    expect(screen.getByText('Import Context')).toBeInTheDocument();
  });
  
  it('closes one dropdown when opening another', () => {
    render(<NavigationBar {...defaultProps} />);
    
    // Open save dropdown
    fireEvent.click(screen.getByLabelText('Save options'));
    expect(screen.getByText('Save Context')).toBeInTheDocument();
    
    // Open import dropdown
    fireEvent.click(screen.getByLabelText('Import options'));
    
    // Save dropdown should be closed
    expect(screen.queryByText('Save Context')).not.toBeInTheDocument();
    
    // Import dropdown should be open
    expect(screen.getByText('Import Context')).toBeInTheDocument();
  });
  
  it('renders PolicyRunner when onRunPolicy prop is provided', () => {
    render(<NavigationBar {...propsWithPolicy} />);
    
    // Policy button should be visible
    expect(screen.getByLabelText('Run policy')).toBeInTheDocument();
  });
  
  it('does not render PolicyRunner when onRunPolicy prop is not provided', () => {
    render(<NavigationBar {...defaultProps} />);
    
    // Policy button should not be visible
    expect(screen.queryByLabelText('Run policy')).not.toBeInTheDocument();
  });
  
  it('passes policy props to PolicyRunner component', () => {
    // Render with policy running
    render(
      <NavigationBar
        {...propsWithPolicy}
        isPolicyRunning={true}
        policyProgress={{ currentDay: 3, totalDays: 10 }}
      />
    );

    // Policy progress should be visible
    expect(screen.getByText('Day 3 of 10')).toBeInTheDocument();
  });

  describe('Undo Button', () => {
    const mockOnUndo = vi.fn();

    it('renders undo button when onUndo prop is provided', () => {
      render(<NavigationBar {...defaultProps} onUndo={mockOnUndo} canUndo={true} />);

      expect(screen.getByLabelText('Undo')).toBeInTheDocument();
    });

    it('does not render undo button when onUndo prop is not provided', () => {
      render(<NavigationBar {...defaultProps} />);

      expect(screen.queryByLabelText('Undo')).not.toBeInTheDocument();
    });

    it('calls onUndo when undo button is clicked', () => {
      render(<NavigationBar {...defaultProps} onUndo={mockOnUndo} canUndo={true} />);

      fireEvent.click(screen.getByLabelText('Undo'));

      expect(mockOnUndo).toHaveBeenCalled();
    });

    it('disables undo button when canUndo is false', () => {
      render(<NavigationBar {...defaultProps} onUndo={mockOnUndo} canUndo={false} />);

      const undoButton = screen.getByLabelText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('enables undo button when canUndo is true', () => {
      render(<NavigationBar {...defaultProps} onUndo={mockOnUndo} canUndo={true} />);

      const undoButton = screen.getByLabelText('Undo');
      expect(undoButton).not.toBeDisabled();
    });
  });

  describe('Redo Button', () => {
    const mockOnUndo = vi.fn();
    const mockOnRedo = vi.fn();

    it('renders redo button when onRedo prop is provided', () => {
      render(
        <NavigationBar
          {...defaultProps}
          onUndo={mockOnUndo}
          canUndo={false}
          onRedo={mockOnRedo}
          canRedo={true}
        />
      );

      expect(screen.getByLabelText('Redo')).toBeInTheDocument();
    });

    it('does not render redo button when onRedo prop is not provided', () => {
      render(<NavigationBar {...defaultProps} />);

      expect(screen.queryByLabelText('Redo')).not.toBeInTheDocument();
    });

    it('calls onRedo when redo button is clicked', () => {
      render(
        <NavigationBar
          {...defaultProps}
          onUndo={mockOnUndo}
          canUndo={false}
          onRedo={mockOnRedo}
          canRedo={true}
        />
      );

      fireEvent.click(screen.getByLabelText('Redo'));

      expect(mockOnRedo).toHaveBeenCalled();
    });

    it('disables redo button when canRedo is false', () => {
      render(
        <NavigationBar
          {...defaultProps}
          onUndo={mockOnUndo}
          canUndo={false}
          onRedo={mockOnRedo}
          canRedo={false}
        />
      );

      const redoButton = screen.getByLabelText('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('enables redo button when canRedo is true', () => {
      render(
        <NavigationBar
          {...defaultProps}
          onUndo={mockOnUndo}
          canUndo={false}
          onRedo={mockOnRedo}
          canRedo={true}
        />
      );

      const redoButton = screen.getByLabelText('Redo');
      expect(redoButton).not.toBeDisabled();
    });

    it('renders redo button next to undo button', () => {
      render(
        <NavigationBar
          {...defaultProps}
          onUndo={mockOnUndo}
          canUndo={true}
          onRedo={mockOnRedo}
          canRedo={true}
        />
      );

      const undoButton = screen.getByLabelText('Undo');
      const redoButton = screen.getByLabelText('Redo');

      expect(undoButton).toBeInTheDocument();
      expect(redoButton).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      const undoIndex = buttons.findIndex(b => b.getAttribute('aria-label') === 'Undo');
      const redoIndex = buttons.findIndex(b => b.getAttribute('aria-label') === 'Redo');
      expect(redoIndex).toBeGreaterThan(undoIndex);
    });
  });

  describe('Save Indicator', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders save indicator when saveStatus prop is provided', () => {
      render(
        <NavigationBar
          {...defaultProps}
          saveStatus="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('shows Saving... when saveStatus is saving', () => {
      render(
        <NavigationBar
          {...defaultProps}
          saveStatus="saving"
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows relative time when saved', () => {
      render(
        <NavigationBar
          {...defaultProps}
          saveStatus="saved"
          lastSavedAt={new Date('2026-01-31T11:58:00Z')}
        />
      );

      expect(screen.getByText('2 min ago')).toBeInTheDocument();
    });

    it('does not render save indicator when saveStatus is not provided', () => {
      render(<NavigationBar {...defaultProps} />);

      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });

    it('positions save indicator near day counter', () => {
      const { container } = render(
        <NavigationBar
          {...defaultProps}
          saveStatus="saved"
          lastSavedAt={new Date('2026-01-31T12:00:00Z')}
        />
      );

      const navRight = container.querySelector('.nav-right');
      expect(navRight).toContainElement(screen.getByText('Saved'));
      expect(navRight).toContainElement(screen.getByTestId('day-counter'));
    });
  });

  describe('Reset Board', () => {
    const mockOnResetBoard = vi.fn();

    it('shows Reset Board option in save dropdown when onResetBoard prop is provided', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));

      expect(screen.getByText('Reset Board')).toBeInTheDocument();
    });

    it('does not show Reset Board option when onResetBoard prop is not provided', () => {
      render(<NavigationBar {...defaultProps} />);

      fireEvent.click(screen.getByLabelText('Save options'));

      expect(screen.queryByText('Reset Board')).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when Reset Board is clicked', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Reset Board?')).toBeInTheDocument();
    });

    it('calls onResetBoard when confirmation is accepted', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      expect(mockOnResetBoard).toHaveBeenCalledTimes(1);
    });

    it('does not call onResetBoard when confirmation is cancelled', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnResetBoard).not.toHaveBeenCalled();
    });

    it('closes confirmation dialog after confirming', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes confirmation dialog after cancelling', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes save dropdown when Reset Board is clicked', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));

      expect(screen.queryByText('Save Context')).not.toBeInTheDocument();
    });

    it('shows destructive styling on the confirm button', () => {
      render(<NavigationBar {...defaultProps} onResetBoard={mockOnResetBoard} />);

      fireEvent.click(screen.getByLabelText('Save options'));
      fireEvent.click(screen.getByText('Reset Board'));

      const resetButton = screen.getByRole('button', { name: 'Reset' });
      expect(resetButton).toHaveClass('confirm-dialog__button--destructive');
    });
  });
});
