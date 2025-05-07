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
        red: { total: 0, completed: 0 },
        blue: { total: 4, completed: 2 },
        green: { total: 0, completed: 0 }
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

  it('renders all three types of work items (red, blue, green)', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      workItems: {
        red: { total: 3, completed: 1 },
        blue: { total: 2, completed: 0 },
        green: { total: 4, completed: 2 }
      }
    };
    
    // Act
    const { container } = render(<Card {...cardProps} />);
    
    // Assert
    // Find all work item sections
    const redSection = container.querySelector('.card-work-items-section:nth-child(1)');
    const blueSection = container.querySelector('.card-work-items-section:nth-child(2)');
    const greenSection = container.querySelector('.card-work-items-section:nth-child(3)');
    
    // Check red work items
    expect(redSection?.querySelector('.card-work-items-label')?.textContent).toBe('Red:');
    const redItems = redSection?.querySelectorAll('.work-item');
    expect(redItems?.length).toBe(3);
    const completedRedItems = redSection?.querySelectorAll('.work-item.completed');
    expect(completedRedItems?.length).toBe(1);
    
    // Check blue work items
    expect(blueSection?.querySelector('.card-work-items-label')?.textContent).toBe('Blue:');
    const blueItems = blueSection?.querySelectorAll('.work-item');
    expect(blueItems?.length).toBe(2);
    const completedBlueItems = blueSection?.querySelectorAll('.work-item.completed');
    expect(completedBlueItems?.length).toBe(0);
    
    // Check green work items
    expect(greenSection?.querySelector('.card-work-items-label')?.textContent).toBe('Green:');
    const greenItems = greenSection?.querySelectorAll('.work-item');
    expect(greenItems?.length).toBe(4);
    const completedGreenItems = greenSection?.querySelectorAll('.work-item.completed');
    expect(completedGreenItems?.length).toBe(2);
  });

  it('renders assigned workers on the card', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      assignedWorkers: [
        { id: '1', type: 'red' as const },
        { id: '3', type: 'blue' as const }
      ]
    };
    
    // Act
    const { container } = render(<Card {...cardProps} />);
    
    // Assert
    const assignedWorkers = container.querySelectorAll('.card-assigned-worker');
    expect(assignedWorkers.length).toBe(2);
    
    const redWorker = container.querySelector('.card-assigned-worker.worker-red');
    expect(redWorker).toBeInTheDocument();
    
    const blueWorker = container.querySelector('.card-assigned-worker.worker-blue');
    expect(blueWorker).toBeInTheDocument();
  });

  it('renders completion day for cards in the done column', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      stage: 'done',
      completionDay: 15
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('Completion day: 15')).toBeInTheDocument();
  });

  it('applies bold styling to cards in the done column', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content',
      stage: 'done'
    };
    
    // Act
    const { container } = render(<Card {...cardProps} />);
    
    // Assert
    const cardContent = container.querySelector('.card-content');
    expect(cardContent).toHaveStyle('font-weight: bold');
  });
});
