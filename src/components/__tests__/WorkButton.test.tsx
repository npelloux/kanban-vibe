import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkButton } from '../WorkButton';

describe('WorkButton Component', () => {
  it('renders a button with "Work" text', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<WorkButton onClick={mockOnClick} columnTitle="dev" />);
    
    // Assert
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<WorkButton onClick={mockOnClick} columnTitle="dev" />);
    fireEvent.click(screen.getByText('Work'));
    
    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has the correct aria-label', () => {
    // Arrange
    const mockOnClick = vi.fn();
    const columnTitle = "dev";
    
    // Act
    render(<WorkButton onClick={mockOnClick} columnTitle={columnTitle} />);
    
    // Assert
    expect(screen.getByLabelText(`Work on ${columnTitle} tasks`)).toBeInTheDocument();
  });
});
