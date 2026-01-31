import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Column } from '../Column';
import { createTestCardWithId } from '../../simulation/domain/card/card-test-fixtures';

describe('Column Component', () => {
  it('renders an empty column', () => {
    render(<Column title="Options" cards={[]} />);

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('renders a column with cards', () => {
    const cards = [
      createTestCardWithId('A', { content: 'Card A' }),
      createTestCardWithId('B', { content: 'Card B' }),
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
    const cards = [createTestCardWithId('A', { content: 'Card A' })];

    render(
      <Column title="Options" cards={cards} onCardClick={mockOnCardClick} />
    );

    fireEvent.click(screen.getByText('Card A'));

    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
    expect(mockOnCardClick).toHaveBeenCalledWith('A');
  });

  it('calls onWorkerDrop when a worker is dropped on a card', () => {
    const mockOnWorkerDrop = vi.fn();
    const cards = [createTestCardWithId('A', { content: 'Card A', stage: 'red-active' })];

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
    expect(mockOnWorkerDrop).toHaveBeenCalledWith('A', 'worker-1', 'red');
  });

  it('accepts wipLimit prop without error', () => {
    render(
      <Column
        title="Red Active"
        cards={[]}
        type="red"
        status="active"
        wipLimit={{ min: 1, max: 5 }}
      />
    );

    expect(screen.getByText('Red Active')).toBeInTheDocument();
  });

  describe('collapsible columns', () => {
    it('does not show collapse button by default', () => {
      render(<Column title="Options" cards={[]} />);

      expect(screen.queryByLabelText(/collapse/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/expand/i)).not.toBeInTheDocument();
    });

    it('shows collapse button when collapsible prop is true', () => {
      render(<Column title="Options" cards={[]} collapsible={true} />);

      expect(screen.getByLabelText(/collapse column/i)).toBeInTheDocument();
    });

    it('shows cards when column is expanded', () => {
      const cards = [
        createTestCardWithId('A', { content: 'Card A' }),
        createTestCardWithId('B', { content: 'Card B' }),
      ];

      render(<Column title="Options" cards={cards} collapsible={true} />);

      expect(screen.getByText('Card A')).toBeInTheDocument();
      expect(screen.getByText('Card B')).toBeInTheDocument();
    });

    it('hides cards when column is collapsed', () => {
      const cards = [
        createTestCardWithId('A', { content: 'Card A' }),
        createTestCardWithId('B', { content: 'Card B' }),
      ];

      render(<Column title="Options" cards={cards} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(screen.queryByText('Card A')).not.toBeInTheDocument();
      expect(screen.queryByText('Card B')).not.toBeInTheDocument();
    });

    it('shows card count when column is collapsed', () => {
      const cards = [
        createTestCardWithId('A', { content: 'Card A' }),
        createTestCardWithId('B', { content: 'Card B' }),
        createTestCardWithId('C', { content: 'Card C' }),
      ];

      render(<Column title="Options" cards={cards} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(screen.getByText('3 cards')).toBeInTheDocument();
    });

    it('shows singular card count when collapsed with one card', () => {
      const cards = [createTestCardWithId('A', { content: 'Card A' })];

      render(<Column title="Options" cards={cards} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(screen.getByText('1 card')).toBeInTheDocument();
    });

    it('shows empty message when collapsed with no cards', () => {
      render(<Column title="Options" cards={[]} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('changes button label when collapsed', () => {
      render(<Column title="Options" cards={[]} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(screen.getByLabelText(/expand column/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/collapse column/i)).not.toBeInTheDocument();
    });

    it('expands column when clicking expand button', () => {
      const cards = [createTestCardWithId('A', { content: 'Card A' })];

      render(<Column title="Options" cards={cards} collapsible={true} />);

      fireEvent.click(screen.getByLabelText(/collapse column/i));
      expect(screen.queryByText('Card A')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/expand column/i));
      expect(screen.getByText('Card A')).toBeInTheDocument();
    });

    it('adds collapsed class to column when collapsed', () => {
      render(<Column title="Options" cards={[]} collapsible={true} />);

      const column = screen.getByText('Options').closest('.column');
      expect(column).not.toHaveClass('column-collapsed');

      fireEvent.click(screen.getByLabelText(/collapse column/i));

      expect(column).toHaveClass('column-collapsed');
    });

    it('can start collapsed with defaultCollapsed prop', () => {
      const cards = [createTestCardWithId('A', { content: 'Card A' })];

      render(
        <Column
          title="Options"
          cards={cards}
          collapsible={true}
          defaultCollapsed={true}
        />
      );

      expect(screen.queryByText('Card A')).not.toBeInTheDocument();
      expect(screen.getByText('1 card')).toBeInTheDocument();
      expect(screen.getByLabelText(/expand column/i)).toBeInTheDocument();
    });
  });
});
