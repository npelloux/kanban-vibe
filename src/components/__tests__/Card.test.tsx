import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    const redItems = redSection?.querySelectorAll('.work-item');
    expect(redItems?.length).toBe(3);
    const completedRedItems = redSection?.querySelectorAll('.work-item.completed');
    expect(completedRedItems?.length).toBe(1);
    
    // Check blue work items
    const blueItems = blueSection?.querySelectorAll('.work-item');
    expect(blueItems?.length).toBe(2);
    const completedBlueItems = blueSection?.querySelectorAll('.work-item.completed');
    expect(completedBlueItems?.length).toBe(0);
    
    // Check green work items
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

  describe('Block Toggle', () => {
    it('displays unlock icon when card is not blocked', () => {
      // Arrange
      const cardProps = {
        id: '1',
        content: 'Test Card',
        isBlocked: false,
        onToggleBlock: vi.fn()
      };

      // Act
      render(<Card {...cardProps} />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /toggle block/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('displays lock icon when card is blocked', () => {
      // Arrange
      const cardProps = {
        id: '1',
        content: 'Test Card',
        isBlocked: true,
        onToggleBlock: vi.fn()
      };

      // Act
      render(<Card {...cardProps} />);

      // Assert
      const toggleButton = screen.getByRole('button', { name: /toggle block/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onToggleBlock with card id when toggle clicked', () => {
      // Arrange
      const onToggleBlock = vi.fn();
      const cardProps = {
        id: 'card-42',
        content: 'Test Card',
        isBlocked: false,
        onToggleBlock
      };

      // Act
      render(<Card {...cardProps} />);
      const toggleButton = screen.getByRole('button', { name: /toggle block/i });
      fireEvent.click(toggleButton);

      // Assert
      expect(onToggleBlock).toHaveBeenCalledTimes(1);
      expect(onToggleBlock).toHaveBeenCalledWith('card-42');
    });

    it('does not trigger onClick when toggle button clicked', () => {
      // Arrange
      const onClick = vi.fn();
      const onToggleBlock = vi.fn();
      const cardProps = {
        id: '1',
        content: 'Test Card',
        isBlocked: false,
        onClick,
        onToggleBlock
      };

      // Act
      render(<Card {...cardProps} />);
      const toggleButton = screen.getByRole('button', { name: /toggle block/i });
      fireEvent.click(toggleButton);

      // Assert
      expect(onToggleBlock).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not render toggle button when onToggleBlock is not provided', () => {
      // Arrange
      const cardProps = {
        id: '1',
        content: 'Test Card',
        isBlocked: false
      };

      // Act
      render(<Card {...cardProps} />);

      // Assert
      const toggleButton = screen.queryByRole('button', { name: /toggle block/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('toggle button works on cards in any stage', () => {
      // Arrange
      const stages = ['options', 'red-active', 'red-finished', 'blue-active', 'blue-finished', 'green', 'done'];
      const onToggleBlock = vi.fn();

      // Act & Assert - verify toggle works in all stages
      stages.forEach(stage => {
        const { unmount } = render(
          <Card
            id="1"
            content="Test Card"
            stage={stage}
            isBlocked={false}
            onToggleBlock={onToggleBlock}
          />
        );

        const toggleButton = screen.getByRole('button', { name: /toggle block/i });
        fireEvent.click(toggleButton);

        unmount();
      });

      expect(onToggleBlock).toHaveBeenCalledTimes(stages.length);
    });
  });
});
