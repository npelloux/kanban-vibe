import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Column } from '../Column';

describe('Column Component', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('renders an empty TODO column', () => {
    // Arrange
    render(<Column title="TODO" cards={[]} />);
    
    // Assert
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('renders a column with cards', () => {
    // Arrange
    const cards = [
      { id: '1', content: 'Card 1' },
      { id: '2', content: 'Card 2' }
    ];
    
    // Act
    render(<Column title="TODO" cards={cards} />);
    
    // Assert
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('shows work button for dev column by default', () => {
    // Arrange
    render(<Column title="dev" cards={[]} />);
    
    // Assert
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('does not show work button for non-dev columns by default', () => {
    // Arrange
    render(<Column title="TODO" cards={[]} />);
    
    // Assert
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });

  it('shows work button when showWorkButton is true', () => {
    // Arrange
    render(<Column title="TODO" cards={[]} showWorkButton={true} />);
    
    // Assert
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls onWork when work button is clicked', () => {
    // Arrange
    const mockOnWork = vi.fn();
    render(<Column title="dev" cards={[]} onWork={mockOnWork} />);
    
    // Act
    fireEvent.click(screen.getByText('Work'));
    
    // Assert
    expect(mockOnWork).toHaveBeenCalledTimes(1);
  });
});
