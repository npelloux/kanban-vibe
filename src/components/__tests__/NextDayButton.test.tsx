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
});
