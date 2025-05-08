import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
});
