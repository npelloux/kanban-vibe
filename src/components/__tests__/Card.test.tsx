import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card';
import { createTestCardWithId } from '../../simulation/domain/card/card-test-fixtures';

describe('Card Component', () => {
  it('renders a card with content', () => {
    const card = createTestCardWithId('A', { content: 'Test Card Content' });

    render(<Card card={card} />);

    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders a card with age information', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      age: 5,
      stage: 'red-active',
    });

    render(<Card card={card} />);

    expect(screen.getByText('Age: 5 days')).toBeInTheDocument();
  });

  it('renders a card with start day information', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      startDay: 10,
    });

    render(<Card card={card} />);

    expect(screen.getByText('Start: Day 10')).toBeInTheDocument();
  });

  it('renders a blocked card with blocked label', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      isBlocked: true,
    });

    render(<Card card={card} />);

    expect(screen.getByText('BLOCKED!')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toHaveClass('card-blocked');
  });

  it('renders work items based on total and completed count', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      workItems: {
        red: { total: 0, completed: 0 },
        blue: { total: 4, completed: 2 },
        green: { total: 0, completed: 0 },
      },
    });

    const { container } = render(<Card card={card} />);

    const workItems = container.querySelectorAll('.work-item');
    expect(workItems.length).toBe(4);

    const completedItems = container.querySelectorAll('.work-item.completed');
    expect(completedItems.length).toBe(2);
  });

  it('renders all three types of work items (red, blue, green)', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      workItems: {
        red: { total: 3, completed: 1 },
        blue: { total: 2, completed: 0 },
        green: { total: 4, completed: 2 },
      },
    });

    const { container } = render(<Card card={card} />);

    const redSection = container.querySelector(
      '.card-work-items-section:nth-child(1)'
    );
    const blueSection = container.querySelector(
      '.card-work-items-section:nth-child(2)'
    );
    const greenSection = container.querySelector(
      '.card-work-items-section:nth-child(3)'
    );

    const redItems = redSection?.querySelectorAll('.work-item');
    expect(redItems?.length).toBe(3);
    const completedRedItems = redSection?.querySelectorAll(
      '.work-item.completed'
    );
    expect(completedRedItems?.length).toBe(1);

    const blueItems = blueSection?.querySelectorAll('.work-item');
    expect(blueItems?.length).toBe(2);
    const completedBlueItems = blueSection?.querySelectorAll(
      '.work-item.completed'
    );
    expect(completedBlueItems?.length).toBe(0);

    const greenItems = greenSection?.querySelectorAll('.work-item');
    expect(greenItems?.length).toBe(4);
    const completedGreenItems = greenSection?.querySelectorAll(
      '.work-item.completed'
    );
    expect(completedGreenItems?.length).toBe(2);
  });

  it('renders assigned workers on the card', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      assignedWorkers: [
        { id: '1', type: 'red' },
        { id: '3', type: 'blue' },
      ],
    });

    const { container } = render(<Card card={card} />);

    const assignedWorkers = container.querySelectorAll('.card-assigned-worker');
    expect(assignedWorkers.length).toBe(2);

    const redWorker = container.querySelector(
      '.card-assigned-worker.worker-red'
    );
    expect(redWorker).toBeInTheDocument();

    const blueWorker = container.querySelector(
      '.card-assigned-worker.worker-blue'
    );
    expect(blueWorker).toBeInTheDocument();
  });

  it('renders completion day for cards in the done column', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      stage: 'done',
      completionDay: 15,
    });

    render(<Card card={card} />);

    expect(screen.getByText('Completion day: 15')).toBeInTheDocument();
  });

  it('applies bold styling to cards in the done column', () => {
    const card = createTestCardWithId('A', {
      content: 'Test Card Content',
      stage: 'done',
    });

    const { container } = render(<Card card={card} />);

    const cardContent = container.querySelector('.card-content');
    expect(cardContent).toHaveStyle('font-weight: bold');
  });

  describe('Block Toggle', () => {
    it('displays unlock icon when card is not blocked', () => {
      const card = createTestCardWithId('A', {
        content: 'Test Card',
        isBlocked: false,
      });

      render(<Card card={card} onToggleBlock={vi.fn()} />);

      const toggleButton = screen.getByRole('button', {
        name: /toggle block/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('displays lock icon when card is blocked', () => {
      const card = createTestCardWithId('A', {
        content: 'Test Card',
        isBlocked: true,
      });

      render(<Card card={card} onToggleBlock={vi.fn()} />);

      const toggleButton = screen.getByRole('button', {
        name: /toggle block/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onToggleBlock with card id when toggle clicked', () => {
      const onToggleBlock = vi.fn();
      const card = createTestCardWithId('AB', {
        content: 'Test Card',
        isBlocked: false,
      });

      render(<Card card={card} onToggleBlock={onToggleBlock} />);
      const toggleButton = screen.getByRole('button', {
        name: /toggle block/i,
      });
      fireEvent.click(toggleButton);

      expect(onToggleBlock).toHaveBeenCalledTimes(1);
      expect(onToggleBlock).toHaveBeenCalledWith('AB');
    });

    it('does not trigger onClick when toggle button clicked', () => {
      const onClick = vi.fn();
      const onToggleBlock = vi.fn();
      const card = createTestCardWithId('A', {
        content: 'Test Card',
        isBlocked: false,
      });

      render(
        <Card card={card} onCardClick={onClick} onToggleBlock={onToggleBlock} />
      );
      const toggleButton = screen.getByRole('button', {
        name: /toggle block/i,
      });
      fireEvent.click(toggleButton);

      expect(onToggleBlock).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not render toggle button when onToggleBlock is not provided', () => {
      const card = createTestCardWithId('A', {
        content: 'Test Card',
        isBlocked: false,
      });

      render(<Card card={card} />);

      const toggleButton = screen.queryByRole('button', {
        name: /toggle block/i,
      });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('toggle button works on cards in any stage', () => {
      const stages = [
        'options',
        'red-active',
        'red-finished',
        'blue-active',
        'blue-finished',
        'green',
        'done',
      ] as const;
      const onToggleBlock = vi.fn();

      stages.forEach((stage) => {
        const card = createTestCardWithId('A', {
          content: 'Test Card',
          stage,
          isBlocked: false,
        });

        const { unmount } = render(
          <Card card={card} onToggleBlock={onToggleBlock} />
        );

        const toggleButton = screen.getByRole('button', {
          name: /toggle block/i,
        });
        fireEvent.click(toggleButton);

        unmount();
      });

      expect(onToggleBlock).toHaveBeenCalledTimes(stages.length);
    });
  });
});
