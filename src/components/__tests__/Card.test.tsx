import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders a card with content', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content'
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders a card with age information', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      age: 5
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('Age: 5 days')).toBeInTheDocument();
  });

  it('renders a card with start day information', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      startDay: 10
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('Start: Day 10')).toBeInTheDocument();
  });

  it('renders a blocked card with blocked label', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      isBlocked: true
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('BLOCKED!')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toHaveClass('card-blocked');
  });

  it('renders work items based on total and completed count', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      workItems: {
        total: 4,
        completed: 2,
        color: 'blue'
      }
    };
    
    // Act
    const { container } = render(<Card {...cardProps} />);
    
    // Assert
    const workItems = container.querySelectorAll('.work-item');
    expect(workItems.length).toBe(4);
    
    const completedItems = container.querySelectorAll('.work-item.completed');
    expect(completedItems.length).toBe(2);
  });
});
