import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NextDayButton } from '../NextDayButton';

describe('NextDayButton Component', () => {
  it('renders a button with "Next Day" text', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<NextDayButton onClick={mockOnClick} />);
    
    // Assert
    expect(screen.getByText('Next Day')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<NextDayButton onClick={mockOnClick} />);
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<NextDayButton onClick={mockOnClick} disabled={true} />);
    const button = screen.getByText('Next Day');
    
    // Assert
    expect(button).toBeDisabled();
    
    // Click the button while disabled
    fireEvent.click(button);
    
    // Verify the click handler wasn't called
    expect(mockOnClick).not.toHaveBeenCalled();
  });
  
  it('is enabled by default', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<NextDayButton onClick={mockOnClick} />);
    
    // Assert
    expect(screen.getByText('Next Day')).not.toBeDisabled();
  });
});
