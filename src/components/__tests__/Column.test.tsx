import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Column } from '../Column';
import type { CardInput } from '../../simulation/api/card-adapter';

function createCardInput(overrides: Partial<CardInput> & { id: string }): CardInput {
  return {
    content: 'Test Card',
    stage: 'options',
    age: 0,
    startDay: 0,
    isBlocked: false,
    workItems: {
      red: { total: 5, completed: 0 },
      blue: { total: 5, completed: 0 },
      green: { total: 5, completed: 0 },
    },
    assignedWorkers: [],
    ...overrides,
  };
}

describe('Column Component', () => {
  it('renders an empty column', () => {
    render(<Column title="Options" cards={[]} />);

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('renders a column with cards', () => {
    const cards = [
      createCardInput({ id: 'A', content: 'Card A' }),
      createCardInput({ id: 'B', content: 'Card B' }),
    ];

    render(<Column title="Options" cards={cards} />);

    expect(screen.getByText('Card A')).toBeInTheDocument();
    expect(screen.getByText('Card B')).toBeInTheDocument();
  });

  it('shows Add Card button when showAddCardButton is true', () => {
    render(<Column title="Options" cards={[]} showAddCardButton={true} />);

    expect(screen.getByText('+ New')).toBeInTheDocument();
  });

  it('does not show Add Card button by default', () => {
    render(<Column title="Options" cards={[]} />);

    expect(screen.queryByText('+ New')).not.toBeInTheDocument();
  });

  it('calls onAddCard when Add Card button is clicked', () => {
    const mockOnAddCard = vi.fn();
    render(
      <Column
        title="Options"
        cards={[]}
        showAddCardButton={true}
        onAddCard={mockOnAddCard}
      />
    );

    fireEvent.click(screen.getByText('+ New'));

    expect(mockOnAddCard).toHaveBeenCalledTimes(1);
  });

  it('renders column with the correct type class', () => {
    render(
      <Column title="Red Active" cards={[]} type="red" status="active" />
    );

    const column = screen.getByText('Red Active').closest('.column');
    expect(column).toHaveClass('column-red');
    expect(column).toHaveClass('column-active');
  });

  it('calls onCardClick when a card is clicked', () => {
    const mockOnCardClick = vi.fn();
    const cards = [createCardInput({ id: 'A', content: 'Card A' })];

    render(
      <Column title="Options" cards={cards} onCardClick={mockOnCardClick} />
    );

    fireEvent.click(screen.getByText('Card A'));

    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
    expect(mockOnCardClick).toHaveBeenCalledWith('A');
  });

  it('calls onWorkerDrop when a worker is dropped on a card', () => {
    const mockOnWorkerDrop = vi.fn();
    const cards = [createCardInput({ id: 'A', content: 'Card A', stage: 'red-active' })];

    render(
      <Column title="Options" cards={cards} onWorkerDrop={mockOnWorkerDrop} />
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    const dropData = JSON.stringify({ id: 'worker-1', type: 'red' });
    fireEvent.drop(card, {
      dataTransfer: {
        getData: () => dropData,
      },
    });

    expect(mockOnWorkerDrop).toHaveBeenCalledTimes(1);
    expect(mockOnWorkerDrop).toHaveBeenCalledWith('A', 'worker-1');
  });
});
