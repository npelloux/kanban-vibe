import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PolicyRunner } from '../PolicyRunner';

describe('PolicyRunner Component', () => {
  const mockOnRunPolicy = vi.fn();
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders a policy button', () => {
    render(<PolicyRunner onRunPolicy={mockOnRunPolicy} isRunning={false} />);
    
    const button = screen.getByLabelText('Run policy');
    expect(button).toBeInTheDocument();
  });
  
  it('shows policy options when button is clicked', () => {
    render(<PolicyRunner onRunPolicy={mockOnRunPolicy} isRunning={false} />);
    
    // Initially, options should not be visible
    expect(screen.queryByText('Run Policy')).not.toBeInTheDocument();
    
    // Click the policy button
    fireEvent.click(screen.getByLabelText('Run policy'));
    
    // Options should now be visible
    expect(screen.getByRole('heading', { name: 'Run Policy' })).toBeInTheDocument();
    expect(screen.getByText('Siloted Expert')).toBeInTheDocument();
    expect(screen.getByText('Days to run:')).toBeInTheDocument();
  });
  
  it('calls onRunPolicy with selected policy and days when run button is clicked', () => {
    render(<PolicyRunner onRunPolicy={mockOnRunPolicy} isRunning={false} />);
    
    // Open the options
    fireEvent.click(screen.getByLabelText('Run policy'));
    
    // Change days to run
    const daysInput = screen.getByLabelText('Days to run:');
    fireEvent.change(daysInput, { target: { value: '15' } });
    
    // Click run policy button
    fireEvent.click(screen.getByRole('button', { name: 'Run Policy' }));
    
    // Check if onRunPolicy was called with correct arguments
    expect(mockOnRunPolicy).toHaveBeenCalledWith('siloted-expert', 15);
    
    // Options should be closed after clicking run
    expect(screen.queryByText('Run Policy')).not.toBeInTheDocument();
  });
  
  it('disables the policy button when isRunning is true', () => {
    render(<PolicyRunner onRunPolicy={mockOnRunPolicy} isRunning={true} />);
    
    const button = screen.getByLabelText('Run policy');
    expect(button).toBeDisabled();
  });
  
  it('shows progress bar when policy is running', () => {
    render(
      <PolicyRunner 
        onRunPolicy={mockOnRunPolicy} 
        isRunning={true} 
        progress={{ currentDay: 5, totalDays: 10 }}
      />
    );
    
    // Progress elements should be visible
    expect(screen.getByText('Day 5 of 10')).toBeInTheDocument();
    
    // Progress bar should be filled to 50%
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 50%');
  });
  
  it('shows cancel button when onCancel prop is provided', () => {
    render(
      <PolicyRunner 
        onRunPolicy={mockOnRunPolicy} 
        isRunning={true} 
        progress={{ currentDay: 5, totalDays: 10 }}
        onCancel={mockOnCancel}
      />
    );
    
    // Cancel button should be visible
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(cancelButton);
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('does not show cancel button when onCancel prop is not provided', () => {
    render(
      <PolicyRunner 
        onRunPolicy={mockOnRunPolicy} 
        isRunning={true} 
        progress={{ currentDay: 5, totalDays: 10 }}
      />
    );
    
    // Cancel button should not be visible
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
  
  it('validates days input to ensure it is a positive number', () => {
    render(<PolicyRunner onRunPolicy={mockOnRunPolicy} isRunning={false} />);
    
    // Open the options
    fireEvent.click(screen.getByLabelText('Run policy'));
    
    // Try to set days to a negative number
    const daysInput = screen.getByLabelText('Days to run:');
    fireEvent.change(daysInput, { target: { value: '-5' } });
    
    // Click run policy button
    fireEvent.click(screen.getByRole('button', { name: 'Run Policy' }));
    
    // Check if onRunPolicy was called with the minimum value (1) instead of -5
    expect(mockOnRunPolicy).toHaveBeenCalledWith('siloted-expert', 1);
  });
});
