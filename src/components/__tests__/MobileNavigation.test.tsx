import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MobileNavigation } from '../MobileNavigation';
import type { TabType } from '../TabNavigation';

describe('MobileNavigation Component', () => {
  const mockOnTabChange = vi.fn();
  const mockOnNextDay = vi.fn();
  const mockOnOpenWorkerPool = vi.fn();

  const defaultProps = {
    activeTab: 'kanban' as TabType,
    onTabChange: mockOnTabChange,
    currentDay: 5,
    onNextDay: mockOnNextDay,
    onOpenWorkerPool: mockOnOpenWorkerPool,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Header', () => {
    it('renders hamburger menu button', () => {
      render(<MobileNavigation {...defaultProps} />);

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('displays day counter in header', () => {
      render(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('Day')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows simplified logo in header', () => {
      render(<MobileNavigation {...defaultProps} />);

      expect(screen.getByTestId('mobile-logo')).toBeInTheDocument();
    });
  });

  describe('Hamburger Menu (Slide-out Drawer)', () => {
    it('opens menu when hamburger button is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      expect(screen.getByRole('navigation', { name: /mobile menu/i })).toBeInTheDocument();
    });

    it('shows all tab options in menu', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const menu = screen.getByRole('navigation', { name: /mobile menu/i });
      expect(within(menu).getByText('Kanban Board')).toBeInTheDocument();
      expect(within(menu).getByText('Cumulative Flow')).toBeInTheDocument();
      expect(within(menu).getByText('WIP & Aging')).toBeInTheDocument();
      expect(within(menu).getByText('Flow Metrics')).toBeInTheDocument();
    });

    it('highlights the active tab in menu', () => {
      render(<MobileNavigation {...defaultProps} activeTab="cfd" />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const cfdButton = screen.getByRole('button', { name: /cumulative flow/i });
      expect(cfdButton).toHaveClass('active');
    });

    it('calls onTabChange when menu item is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /cumulative flow/i }));

      expect(mockOnTabChange).toHaveBeenCalledWith('cfd');
    });

    it('closes menu after tab selection', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /cumulative flow/i }));

      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    it('closes menu when close button is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const menu = screen.getByRole('navigation', { name: /mobile menu/i });
      const closeButton = within(menu).getByRole('button', { name: /close menu/i });
      fireEvent.click(closeButton);

      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    it('closes menu when overlay is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.click(screen.getByTestId('menu-overlay'));

      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    it('menu slides in from left', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const menu = screen.getByRole('navigation', { name: /mobile menu/i });
      expect(menu).toHaveClass('mobile-menu-drawer');
    });
  });

  describe('Bottom Navigation Bar', () => {
    it('renders bottom navigation bar', () => {
      render(<MobileNavigation {...defaultProps} />);

      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    });

    it('shows Next Day button in bottom nav', () => {
      render(<MobileNavigation {...defaultProps} />);

      const bottomNav = screen.getByTestId('bottom-nav');
      expect(within(bottomNav).getByRole('button', { name: /next day/i })).toBeInTheDocument();
    });

    it('shows Workers button in bottom nav', () => {
      render(<MobileNavigation {...defaultProps} />);

      const bottomNav = screen.getByTestId('bottom-nav');
      expect(within(bottomNav).getByRole('button', { name: /workers/i })).toBeInTheDocument();
    });

    it('calls onNextDay when Next Day button is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      const bottomNav = screen.getByTestId('bottom-nav');
      fireEvent.click(within(bottomNav).getByRole('button', { name: /next day/i }));

      expect(mockOnNextDay).toHaveBeenCalled();
    });

    it('calls onOpenWorkerPool when Workers button is clicked', () => {
      render(<MobileNavigation {...defaultProps} />);

      const bottomNav = screen.getByTestId('bottom-nav');
      fireEvent.click(within(bottomNav).getByRole('button', { name: /workers/i }));

      expect(mockOnOpenWorkerPool).toHaveBeenCalled();
    });

    it('disables Next Day button when disabled prop is true', () => {
      render(<MobileNavigation {...defaultProps} isNextDayDisabled={true} />);

      const bottomNav = screen.getByTestId('bottom-nav');
      expect(within(bottomNav).getByRole('button', { name: /next day/i })).toBeDisabled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('menu can be closed with Escape key', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.keyDown(screen.getByRole('navigation', { name: /mobile menu/i }), { key: 'Escape' });

      expect(screen.queryByRole('navigation', { name: /mobile menu/i })).not.toBeInTheDocument();
    });

    it('overlay is keyboard accessible', () => {
      render(<MobileNavigation {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const overlay = screen.getByTestId('menu-overlay');
      expect(overlay.tagName).toBe('BUTTON');
    });
  });

  describe('Optional Props', () => {
    it('renders without onOpenWorkerPool (hides Workers button)', () => {
      render(
        <MobileNavigation
          activeTab="kanban"
          onTabChange={mockOnTabChange}
          currentDay={5}
          onNextDay={mockOnNextDay}
        />
      );

      const bottomNav = screen.getByTestId('bottom-nav');
      expect(within(bottomNav).queryByRole('button', { name: /workers/i })).not.toBeInTheDocument();
    });
  });
});
