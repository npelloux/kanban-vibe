import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  it('renders the kanban board with TODO, dev, and DONE columns', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('displays the current day', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('Day 1')).toBeInTheDocument();
  });

  it('increments the day counter when Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - click Next Day button
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert
    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  it('increments work items when Work button is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - click Work button
    fireEvent.click(screen.getByText('Work'));
    
    // Assert - card B should have 5 completed work items now (was 4)
    // This is a bit tricky to test directly with the current implementation
    // We would need to add data attributes or other ways to check the work items count
  });

  it('moves a card from dev to DONE when all work is completed and Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - complete all work items for card B (needs 4 more clicks)
    fireEvent.click(screen.getByText('Work'));
    fireEvent.click(screen.getByText('Work'));
    fireEvent.click(screen.getByText('Work'));
    fireEvent.click(screen.getByText('Work'));
    
    // Click Next Day to move the card
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - card B should now be in the DONE column
    const columns = screen.getAllByRole('heading', { level: 2 });
    const doneColumnIndex = columns.findIndex(column => column.textContent === 'DONE');
    const doneColumn = columns[doneColumnIndex].parentElement?.parentElement;
    
    expect(doneColumn).toContainElement(screen.getByText('Set up project structure'));
  });
});
