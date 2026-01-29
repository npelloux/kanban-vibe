import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { StateRepository } from '../../simulation/infra/state-repository';
import { createBoardWithDefaultWorkers } from '../../simulation/application/test-fixtures';

const originalRandom = Math.random;

vi.mock('../../simulation/infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
    clearBoard: vi.fn(),
  },
}));

describe('Worker Management', () => {
  beforeEach(() => {
    Math.random = originalRandom;
    vi.mocked(StateRepository.loadBoard).mockReturnValue(createBoardWithDefaultWorkers());
    vi.mocked(StateRepository.saveBoard).mockImplementation(() => {});
  });

  it('displays the Add Worker button', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('+ Add Worker')).toBeInTheDocument();
  });

  it('shows worker type selection when Add Worker button is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act
    fireEvent.click(screen.getByText('+ Add Worker'));
    
    // Assert
    expect(screen.getByLabelText('Red')).toBeInTheDocument();
    expect(screen.getByLabelText('Blue')).toBeInTheDocument();
    expect(screen.getByLabelText('Green')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('adds a new red worker when red type is selected', () => {
    // Arrange
    render(<App />);
    
    // Get initial number of workers
    const initialWorkers = screen.getAllByTestId(/^worker-/);
    const initialCount = initialWorkers.length;
    
    // Act
    fireEvent.click(screen.getByText('+ Add Worker'));
    fireEvent.click(screen.getByLabelText('Red'));
    fireEvent.click(screen.getByText('Confirm'));
    
    // Assert
    const updatedWorkers = screen.getAllByTestId(/^worker-/);
    expect(updatedWorkers.length).toBe(initialCount + 1);
    
    // Find the new worker (it should be the last one added)
    const newWorker = updatedWorkers[updatedWorkers.length - 1];
    expect(newWorker).toHaveClass('worker-red');
  });

  it('adds a new blue worker when blue type is selected', () => {
    // Arrange
    render(<App />);
    
    // Get initial number of workers
    const initialWorkers = screen.getAllByTestId(/^worker-/);
    const initialCount = initialWorkers.length;
    
    // Act
    fireEvent.click(screen.getByText('+ Add Worker'));
    fireEvent.click(screen.getByLabelText('Blue'));
    fireEvent.click(screen.getByText('Confirm'));
    
    // Assert
    const updatedWorkers = screen.getAllByTestId(/^worker-/);
    expect(updatedWorkers.length).toBe(initialCount + 1);
    
    // Find the new worker (it should be the last one added)
    const newWorker = updatedWorkers[updatedWorkers.length - 1];
    expect(newWorker).toHaveClass('worker-blue');
  });

  it('adds a new green worker when green type is selected', () => {
    // Arrange
    render(<App />);
    
    // Get initial number of workers
    const initialWorkers = screen.getAllByTestId(/^worker-/);
    const initialCount = initialWorkers.length;
    
    // Act
    fireEvent.click(screen.getByText('+ Add Worker'));
    fireEvent.click(screen.getByLabelText('Green'));
    fireEvent.click(screen.getByText('Confirm'));
    
    // Assert
    const updatedWorkers = screen.getAllByTestId(/^worker-/);
    expect(updatedWorkers.length).toBe(initialCount + 1);
    
    // Find the new worker (it should be the last one added)
    const newWorker = updatedWorkers[updatedWorkers.length - 1];
    expect(newWorker).toHaveClass('worker-green');
  });

  it('cancels adding a worker when Add Worker button is clicked again', () => {
    // Arrange
    render(<App />);
    
    // Get initial number of workers
    const initialWorkers = screen.getAllByTestId(/^worker-/);
    const initialCount = initialWorkers.length;
    
    // Act
    fireEvent.click(screen.getByText('+ Add Worker')); // Open worker selection
    fireEvent.click(screen.getByLabelText('Red'));
    fireEvent.click(screen.getByText('+ Add Worker')); // Click again to toggle/cancel
    
    // Assert
    const updatedWorkers = screen.getAllByTestId(/^worker-/);
    expect(updatedWorkers.length).toBe(initialCount); // No new worker added
    expect(screen.queryByLabelText('Red')).not.toBeInTheDocument(); // Selection UI is closed
  });

  it('shows delete button for each worker', () => {
    // Arrange
    render(<App />);
    
    // Get a worker to test with
    const workerContainer = screen.getAllByTestId(/^worker-/)[0].closest('.worker-container') as HTMLElement;
    if (!workerContainer) throw new Error('Worker container not found');
    
    // Assert
    // The delete button should be visible next to the worker
    const deleteButton = within(workerContainer).getByTitle('Delete worker');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeVisible();
  });

  it('deletes a worker when delete button is clicked', () => {
    // Arrange
    render(<App />);
    
    // Get initial workers
    const initialWorkers = screen.getAllByTestId(/^worker-/);
    const initialCount = initialWorkers.length;
    
    // Get the first worker's ID to verify it's removed
    const workerToDelete = initialWorkers[0];
    const workerId = workerToDelete.getAttribute('data-testid');
    
    // Get the worker container and delete button
    const workerContainer = workerToDelete.closest('.worker-container') as HTMLElement;
    if (!workerContainer) throw new Error('Worker container not found');
    
    const deleteButton = within(workerContainer).getByTitle('Delete worker');
    
    // Act - click delete
    fireEvent.click(deleteButton);
    
    // Assert
    const updatedWorkers = screen.getAllByTestId(/^worker-/);
    expect(updatedWorkers.length).toBe(initialCount - 1);
    expect(screen.queryByTestId(workerId!)).not.toBeInTheDocument();
  });

});
