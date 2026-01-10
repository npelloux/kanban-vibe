import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock Math.random to return predictable values for testing
const originalRandom = Math.random;

// Mock the Chart.js component to avoid canvas errors in tests
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart">Mock Line Chart</div>,
  Bar: () => <div data-testid="mock-bar-chart">Mock Bar Chart</div>,
  Scatter: () => <div data-testid="mock-scatter-chart">Mock Scatter Chart</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset Math.random mock before each test
    Math.random = originalRandom;
  });

  it('renders the kanban board with all required columns', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert - Use more specific selectors to avoid ambiguity
    expect(screen.getByRole('heading', { name: 'Options' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Red Active' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Red Finished' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blue Active' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blue Finished' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Green Activities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });

  it('displays the current day as 0', () => {
    // Arrange
    render(<App />);
    
    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments the day counter when Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - click Next Day button
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - use a more specific selector to find the day number
    expect(screen.getByTestId('day-counter')).toHaveTextContent('1');
  });

  it('renders the worker pool with the correct workers', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('Workers')).toBeInTheDocument();
    expect(screen.getByTestId('worker-bob')).toBeInTheDocument(); // Red worker
    expect(screen.getByTestId('worker-zoe')).toBeInTheDocument(); // Blue worker
    expect(screen.getByTestId('worker-lea')).toBeInTheDocument(); // Blue worker
    expect(screen.getByTestId('worker-taz')).toBeInTheDocument(); // Green worker
  });

  it('selects a worker when clicked', () => {
    // Arrange
    render(<App />);
    
    // Act
    fireEvent.click(screen.getByTestId('worker-zoe'));
    
    // Assert
    expect(screen.getByTestId('worker-zoe')).toHaveClass('worker-selected');
  });

  it('adds a new card when Add Card button is clicked', () => {
    // Arrange
    // Mock Math.random to return predictable values
    Math.random = vi.fn().mockReturnValue(0.5);
    render(<App />);
    
    // Get initial number of cards in Options column - use heading to find column
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const initialCards = within(optionsColumn).queryAllByTestId('card');
    const initialCardCount = initialCards.length;
    
    // Act - click Add Card button
    const addCardButton = within(optionsColumn).getByText('+ New');
    fireEvent.click(addCardButton);
    
    // Assert
    const updatedCards = within(optionsColumn).queryAllByTestId('card');
    expect(updatedCards.length).toBe(initialCardCount + 1);
  });

  it('does not increment age for cards in Options column when Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // First add a card to the Options column
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const addCardButton = within(optionsColumn).getByText('+ New');
    fireEvent.click(addCardButton);
    
    // Find the card we just added
    const optionsCards = within(optionsColumn).queryAllByTestId('card');
    expect(optionsCards.length).toBeGreaterThan(0);
    
    // Get the card ID for tracking
    const cardId = optionsCards[0].getAttribute('data-card-id');
    
    // Act - click Next Day button
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - card should still be in the Options column
    const updatedOptionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    const updatedCards = within(updatedOptionsColumn).queryAllByTestId('card');
    const sameCard = updatedCards.find(card => card.getAttribute('data-card-id') === cardId);
    
    expect(sameCard).toBeInTheDocument();
  });

  it('increments age for cards in active columns when Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // First add a card to the Options column
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const addCardButton = within(optionsColumn).getByText('+ New');
    fireEvent.click(addCardButton);
    
    // Find the card we just added and click it to move to Red Active
    const optionsCards = within(optionsColumn).queryAllByTestId('card');
    expect(optionsCards.length).toBeGreaterThan(0);
    fireEvent.click(optionsCards[0]);
    
    // Find the card in Red Active column
    const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
    if (!redActiveColumn) throw new Error('Red Active column not found');
    
    const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
    expect(redActiveCards.length).toBeGreaterThan(0);
    
    // Get the card ID for tracking
    const cardId = redActiveCards[0].getAttribute('data-card-id');
    
    // Act - click Next Day button
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - card should still be in the Red Active column
    const updatedRedActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
    const updatedCards = within(updatedRedActiveColumn).queryAllByTestId('card');
    const sameCard = updatedCards.find(card => card.getAttribute('data-card-id') === cardId);
    
    expect(sameCard).toBeInTheDocument();
  });

  it('switches between tabs when tab navigation is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - click on Cumulative Flow tab
    fireEvent.click(screen.getByText('Cumulative Flow'));
    
    // Assert - should show Cumulative Flow Diagram (using mock chart)
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    
    // Act - click on WIP & Aging tab
    fireEvent.click(screen.getByText('WIP & Aging'));
    
    // Assert - should show WIP & Aging Diagram (using mock chart)
    expect(screen.getByTestId('mock-scatter-chart')).toBeInTheDocument();
    
    // Act - click on Flow Metrics tab
    fireEvent.click(screen.getByText('Flow Metrics'));
    
    // Assert - should show Flow Metrics (using mock charts)
    expect(screen.getAllByTestId('mock-bar-chart').length).toBeGreaterThan(0);
    
    // Act - click back to Kanban Board tab
    fireEvent.click(screen.getByText('Kanban Board'));
    
    // Assert - should show Kanban Board again
    expect(screen.getByRole('heading', { name: 'Options' })).toBeInTheDocument();
  });

  it('moves a card from Options to Red Active when clicked', () => {
    // Arrange
    render(<App />);
    
    // First add a card to the Options column
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const addCardButton = within(optionsColumn).getByText('+ New');
    fireEvent.click(addCardButton);
    
    // Find the card we just added
    const optionsCards = within(optionsColumn).queryAllByTestId('card');
    expect(optionsCards.length).toBeGreaterThan(0);
    
    // Get the card ID and content for later verification
    const cardId = optionsCards[0].getAttribute('data-card-id');
    const cardContentElement = optionsCards[0].querySelector('.card-content');
    const cardContent = cardContentElement ? cardContentElement.textContent : '';
    
    // Act - click on the card to move it to Red Active
    fireEvent.click(optionsCards[0]);
    
    // Assert - card should now be in Red Active column
    const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
    if (!redActiveColumn) throw new Error('Red Active column not found');
    
    const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
    const movedCard = Array.from(redActiveCards).find(
      card => card.getAttribute('data-card-id') === cardId
    );
    
    expect(movedCard).toBeInTheDocument();
    const movedCardContentElement = movedCard!.querySelector('.card-content');
    const movedCardContent = movedCardContentElement ? movedCardContentElement.textContent : '';
    expect(movedCardContent).toBe(cardContent);
  });

  describe('Block Toggle', () => {
    it('toggles card blocked state when block toggle is clicked', () => {
      // Arrange
      render(<App />);

      // Add a card to Options column
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton);

      // Find the card and verify it's not blocked
      const card = within(optionsColumn).getByTestId('card');
      expect(card).not.toHaveClass('card-blocked');

      // Act - click the block toggle
      const toggleButton = within(card).getByRole('button', { name: /toggle block/i });
      fireEvent.click(toggleButton);

      // Assert - card should now be blocked
      expect(card).toHaveClass('card-blocked');
      expect(within(card).getByText('BLOCKED!')).toBeInTheDocument();
    });

    it('unblocks card when block toggle is clicked on blocked card', () => {
      // Arrange
      render(<App />);

      // Add a card and block it
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton);

      const card = within(optionsColumn).getByTestId('card');
      const toggleButton = within(card).getByRole('button', { name: /toggle block/i });

      // Block the card
      fireEvent.click(toggleButton);
      expect(card).toHaveClass('card-blocked');

      // Act - click toggle again to unblock
      fireEvent.click(toggleButton);

      // Assert - card should no longer be blocked
      expect(card).not.toHaveClass('card-blocked');
      expect(within(card).queryByText('BLOCKED!')).not.toBeInTheDocument();
    });

    it('does not move card when block toggle is clicked', () => {
      // Arrange
      render(<App />);

      // Add a card
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton);

      const card = within(optionsColumn).getByTestId('card');
      const cardId = card.getAttribute('data-card-id');

      // Act - click the block toggle
      const toggleButton = within(card).getByRole('button', { name: /toggle block/i });
      fireEvent.click(toggleButton);

      // Assert - card should still be in Options column (not moved to Red Active)
      const updatedOptionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      const cardStillInOptions = within(updatedOptionsColumn).queryAllByTestId('card')
        .find(c => c.getAttribute('data-card-id') === cardId);
      expect(cardStillInOptions).toBeInTheDocument();

      // And should NOT be in Red Active
      const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      const cardInRedActive = within(redActiveColumn).queryAllByTestId('card')
        .find(c => c.getAttribute('data-card-id') === cardId);
      expect(cardInRedActive).toBeUndefined();
    });
  });
});
