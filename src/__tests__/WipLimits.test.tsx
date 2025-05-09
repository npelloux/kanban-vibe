import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock Math.random to return predictable values for testing
const originalRandom = Math.random;

// Mock window.alert to capture alert messages
const mockAlert = vi.fn();
window.alert = mockAlert;

// Mock console.log to capture console messages
const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();

describe('WIP Limits', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Math.random = originalRandom;
    mockAlert.mockClear();
    console.log = mockConsoleLog;
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    // Restore original console.log after all tests
    console.log = originalConsoleLog;
  });

  describe('Max WIP Limits', () => {
    it('prevents moving a card to a column when max WIP limit would be exceeded', () => {
      // Arrange
      render(<App />);
      
      // Set max WIP limit for Red Active to 1
      // Find the WIP limit editor in the kanban-subheader-row
      const kanbanSubheaderRow = document.querySelector('.kanban-subheader-row');
      if (!kanbanSubheaderRow) throw new Error('Kanban subheader row not found');
      
      // Get all the WIP limit containers in the subheader row
      const wipLimitContainers = kanbanSubheaderRow.querySelectorAll('.wip-limit-container');
      
      // The Red Active WIP limit editor should be the second one (index 1)
      const redActiveWipLimitContainer = wipLimitContainers[1] as HTMLElement;
      if (!redActiveWipLimitContainer) throw new Error('Red Active WIP limit container not found');
      
      // Click to edit WIP limits
      fireEvent.click(redActiveWipLimitContainer);
      
      // Find the max input and set it to 1
      const maxInput = screen.getByLabelText('Max:');
      fireEvent.change(maxInput, { target: { value: '1' } });
      
      // Save the WIP limit
      const saveButton = screen.getByRole('button', { name: '✓' });
      fireEvent.click(saveButton);
      
      // Add two cards to the Options column
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      if (!optionsColumn) throw new Error('Options column not found');
      
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton); // Add first card
      fireEvent.click(addCardButton); // Add second card
      
      // Move the first card to Red Active
      const optionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(optionsCards.length).toBe(2);
      fireEvent.click(optionsCards[0]);
      
      // Verify the first card moved to Red Active
      const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      if (!redActiveColumn) throw new Error('Red Active column not found');
      
      const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
      expect(redActiveCards.length).toBe(1);
      
      // Act - Try to move the second card to Red Active
      fireEvent.click(optionsCards[1]);
      
      // Assert - Alert should be shown and card should not move
      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Cannot move card to Red Active: Max WIP limit of 1 would be exceeded'));
      
      // Verify the second card is still in Options
      const updatedOptionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(updatedOptionsCards.length).toBe(1);
      
      // Verify Red Active still has only one card
      const updatedRedActiveCards = within(redActiveColumn).queryAllByTestId('card');
      expect(updatedRedActiveCards.length).toBe(1);
    });

    it('prevents automatic card movement during Next Day when max WIP limit would be exceeded', () => {
      // Arrange
      render(<App />);
      
      // Set max WIP limit for Red Finished to 0 (to block movement)
      // Find the WIP limit editor in the kanban-subheader-row
      const kanbanSubheaderRow = document.querySelector('.kanban-subheader-row');
      if (!kanbanSubheaderRow) throw new Error('Kanban subheader row not found');
      
      // Get all the WIP limit containers in the subheader row
      const wipLimitContainers = kanbanSubheaderRow.querySelectorAll('.wip-limit-container');
      
      // The Red Finished WIP limit editor should be the third one (index 2)
      const redFinishedWipLimitContainer = wipLimitContainers[2] as HTMLElement;
      if (!redFinishedWipLimitContainer) throw new Error('Red Finished WIP limit container not found');
      
      // Click to edit WIP limits
      fireEvent.click(redFinishedWipLimitContainer);
      
      // Find the max input and set it to 0 (explicitly)
      const maxInput = screen.getByLabelText('Max:');
      fireEvent.change(maxInput, { target: { value: '0' } });
      
      // Save the WIP limit
      const saveButton = screen.getByRole('button', { name: '✓' });
      fireEvent.click(saveButton);
      
      // Add a card to the Options column
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      if (!optionsColumn) throw new Error('Options column not found');
      
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton);
      
      // Move the card to Red Active
      const optionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(optionsCards.length).toBe(1);
      fireEvent.click(optionsCards[0]);
      
      // Verify the card moved to Red Active
      const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      if (!redActiveColumn) throw new Error('Red Active column not found');
      
      const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
      expect(redActiveCards.length).toBe(1);
      
      // Get the card ID for tracking
      const cardId = redActiveCards[0].getAttribute('data-card-id');
      
      // Assign a red worker to the card to complete the work
      const redWorker = screen.getByTestId('worker-bob');
      fireEvent.click(redWorker); // Select the worker
      fireEvent.click(redActiveCards[0]); // Drop on the card
      
      // Mock Math.random to return a high value to ensure work is completed
      Math.random = vi.fn().mockReturnValue(0.9);
      
      // Act - Click Next Day button
      fireEvent.click(screen.getByText('Next Day'));
      
      // Assert - The card should still be in Red Active and not moved to Red Finished
      // because of the max WIP limit on Red Finished
      
      // Verify the card is still in Red Active
      const updatedRedActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      const updatedRedActiveCards = within(updatedRedActiveColumn).queryAllByTestId('card');
      const sameCard = updatedRedActiveCards.find(card => card.getAttribute('data-card-id') === cardId);
      
      expect(sameCard).toBeInTheDocument();
    });
  });

  describe('Min WIP Limits', () => {
    it('prevents moving a card out of a column when min WIP limit would be violated', () => {
      // Arrange
      render(<App />);
      
      // Add a card to the Options column
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      if (!optionsColumn) throw new Error('Options column not found');
      
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton);
      
      // Set min WIP limit for Options to 1
      // Find the WIP limit editor in the kanban-subheader-row
      const kanbanSubheaderRow = document.querySelector('.kanban-subheader-row');
      if (!kanbanSubheaderRow) throw new Error('Kanban subheader row not found');
      
      // Get all the WIP limit containers in the subheader row
      const wipLimitContainers = kanbanSubheaderRow.querySelectorAll('.wip-limit-container');
      
      // The Options WIP limit editor should be the first one (index 0)
      const optionsWipLimitContainer = wipLimitContainers[0] as HTMLElement;
      if (!optionsWipLimitContainer) throw new Error('Options WIP limit container not found');
      
      // Click to edit WIP limits
      fireEvent.click(optionsWipLimitContainer);
      
      // Find the min input and set it to 1
      const minInput = screen.getByLabelText('Min:');
      fireEvent.change(minInput, { target: { value: '1' } });
      
      // Save the WIP limit
      const saveButton = screen.getByRole('button', { name: '✓' });
      fireEvent.click(saveButton);
      
      // Act - Try to move the card from Options to Red Active
      const optionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(optionsCards.length).toBe(1);
      fireEvent.click(optionsCards[0]);
      
      // Assert - Alert should be shown and card should not move
      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Cannot move card out of Options: Min WIP limit of 1 would be violated'));
      
      // Verify the card is still in Options
      const updatedOptionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(updatedOptionsCards.length).toBe(1);
      
      // Verify Red Active has no cards
      const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      if (!redActiveColumn) throw new Error('Red Active column not found');
      
      const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
      expect(redActiveCards.length).toBe(0);
    });

    it('prevents automatic card movement during Next Day when min WIP limit would be violated', () => {
      // Arrange
      render(<App />);
      
      // Add two cards to the Options column
      const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
      if (!optionsColumn) throw new Error('Options column not found');
      
      const addCardButton = within(optionsColumn).getByText('+ New');
      fireEvent.click(addCardButton); // Add first card
      fireEvent.click(addCardButton); // Add second card
      
      // Move both cards to Red Active
      const optionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(optionsCards.length).toBe(2);
      fireEvent.click(optionsCards[0]); // Move first card
      
      // Get the updated options cards after the first move
      const updatedOptionsCards = within(optionsColumn).queryAllByTestId('card');
      expect(updatedOptionsCards.length).toBe(1);
      fireEvent.click(updatedOptionsCards[0]); // Move second card
      
      // Verify both cards moved to Red Active
      const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      if (!redActiveColumn) throw new Error('Red Active column not found');
      
      const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
      expect(redActiveCards.length).toBe(2);
      
      // Set min WIP limit for Red Active to 2
      // Find the WIP limit editor in the kanban-subheader-row
      const kanbanSubheaderRow = document.querySelector('.kanban-subheader-row');
      if (!kanbanSubheaderRow) throw new Error('Kanban subheader row not found');
      
      // Get all the WIP limit containers in the subheader row
      const wipLimitContainers = kanbanSubheaderRow.querySelectorAll('.wip-limit-container');
      
      // The Red Active WIP limit editor should be the second one (index 1)
      const redActiveWipLimitContainer = wipLimitContainers[1] as HTMLElement;
      if (!redActiveWipLimitContainer) throw new Error('Red Active WIP limit container not found');
      
      // Click to edit WIP limits
      fireEvent.click(redActiveWipLimitContainer);
      
      // Find the min input and set it to 2
      const minInput = screen.getByLabelText('Min:');
      fireEvent.change(minInput, { target: { value: '2' } });
      
      // Save the WIP limit
      const saveButton = screen.getByRole('button', { name: '✓' });
      fireEvent.click(saveButton);
      
      // Assign a red worker to the first card to complete the work
      const redWorker = screen.getByTestId('worker-bob');
      fireEvent.click(redWorker); // Select the worker
      fireEvent.click(redActiveCards[0]); // Drop on the first card
      
      // Mock Math.random to return a high value to ensure work is completed
      Math.random = vi.fn().mockReturnValue(0.9);
      
      // Act - Click Next Day button
      fireEvent.click(screen.getByText('Next Day'));
      
      // Assert - Both cards should still be in Red Active because of the min WIP limit
      
      // Verify both cards are still in Red Active
      const updatedRedActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
      const updatedRedActiveCards = within(updatedRedActiveColumn).queryAllByTestId('card');
      expect(updatedRedActiveCards.length).toBe(2);
    });
  });
});
