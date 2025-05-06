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

  it('moves a card from TODO to dev when Next Day is clicked', () => {
    // Arrange
    render(<App />);
    
    // Initial state check
    expect(screen.getByText('Create a Kanban board')).toBeInTheDocument();
    
    // Act - click Next Day button
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - card should now be in the dev column
    const columns = screen.getAllByRole('heading', { level: 2 });
    const devColumnIndex = columns.findIndex(column => column.textContent === 'dev');
    const devColumn = columns[devColumnIndex].parentElement;
    
    expect(devColumn).toContainElement(screen.getByText('Create a Kanban board'));
  });

  it('moves a card from dev to DONE when Next Day is clicked twice', () => {
    // Arrange
    render(<App />);
    
    // Act - click Next Day button twice
    fireEvent.click(screen.getByText('Next Day'));
    fireEvent.click(screen.getByText('Next Day'));
    
    // Assert - card should now be in the DONE column
    const columns = screen.getAllByRole('heading', { level: 2 });
    const doneColumnIndex = columns.findIndex(column => column.textContent === 'DONE');
    const doneColumn = columns[doneColumnIndex].parentElement;
    
    expect(doneColumn).toContainElement(screen.getByText('Create a Kanban board'));
  });
});
