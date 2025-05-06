import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  it('renders the kanban board with all required columns', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('Red Active')).toBeInTheDocument();
    expect(screen.getByText('Red Finished')).toBeInTheDocument();
    expect(screen.getByText('Blue Active')).toBeInTheDocument();
    expect(screen.getByText('Blue Finished')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
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

  it('renders the worker pool with workers', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('Workers')).toBeInTheDocument();
    expect(screen.getByTestId('worker-1')).toBeInTheDocument();
    expect(screen.getByTestId('worker-2')).toBeInTheDocument();
    expect(screen.getByTestId('worker-3')).toBeInTheDocument();
    expect(screen.getByTestId('worker-4')).toBeInTheDocument();
    expect(screen.getByTestId('worker-5')).toBeInTheDocument();
    expect(screen.getByTestId('worker-6')).toBeInTheDocument();
  });

  it('selects a worker when clicked', () => {
    // Arrange
    render(<App />);
    
    // Act
    fireEvent.click(screen.getByTestId('worker-3'));
    
    // Assert
    expect(screen.getByTestId('worker-3')).toHaveClass('worker-selected');
  });
});
