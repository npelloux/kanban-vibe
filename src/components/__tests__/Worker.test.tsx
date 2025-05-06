import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Worker } from '../Worker';

describe('Worker Component', () => {
  it('renders a worker with the correct type and id', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<Worker type="red" id="1" isSelected={false} onClick={mockOnClick} />);
    
    // Assert
    expect(screen.getByTestId('worker-1')).toBeInTheDocument();
    expect(screen.getByTestId('worker-1')).toHaveClass('worker-red');
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies selected class when isSelected is true', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<Worker type="blue" id="2" isSelected={true} onClick={mockOnClick} />);
    
    // Assert
    expect(screen.getByTestId('worker-2')).toHaveClass('worker-selected');
  });

  it('calls onClick when clicked', () => {
    // Arrange
    const mockOnClick = vi.fn();
    
    // Act
    render(<Worker type="green" id="3" isSelected={false} onClick={mockOnClick} />);
    fireEvent.click(screen.getByTestId('worker-3'));
    
    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
