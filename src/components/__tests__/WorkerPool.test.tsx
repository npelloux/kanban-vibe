import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkerPool } from '../WorkerPool';

describe('WorkerPool Component', () => {
  const mockWorkers = [
    { id: '1', type: 'red' as const },
    { id: '2', type: 'blue' as const },
    { id: '3', type: 'green' as const }
  ];

  it('renders all workers', () => {
    // Arrange
    const mockOnWorkerSelect = vi.fn();
    
    // Act
    render(
      <WorkerPool 
        workers={mockWorkers} 
        selectedWorkerId={null} 
        onWorkerSelect={mockOnWorkerSelect} 
      />
    );
    
    // Assert
    expect(screen.getByTestId('worker-1')).toBeInTheDocument();
    expect(screen.getByTestId('worker-2')).toBeInTheDocument();
    expect(screen.getByTestId('worker-3')).toBeInTheDocument();
  });

  it('marks the selected worker', () => {
    // Arrange
    const mockOnWorkerSelect = vi.fn();
    
    // Act
    render(
      <WorkerPool 
        workers={mockWorkers} 
        selectedWorkerId="2" 
        onWorkerSelect={mockOnWorkerSelect} 
      />
    );
    
    // Assert
    expect(screen.getByTestId('worker-2')).toHaveClass('worker-selected');
    expect(screen.getByTestId('worker-1')).not.toHaveClass('worker-selected');
    expect(screen.getByTestId('worker-3')).not.toHaveClass('worker-selected');
  });

  it('calls onWorkerSelect with worker id when a worker is clicked', () => {
    // Arrange
    const mockOnWorkerSelect = vi.fn();
    
    // Act
    render(
      <WorkerPool 
        workers={mockWorkers} 
        selectedWorkerId={null} 
        onWorkerSelect={mockOnWorkerSelect} 
      />
    );
    
    fireEvent.click(screen.getByTestId('worker-3'));
    
    // Assert
    expect(mockOnWorkerSelect).toHaveBeenCalledWith('3');
  });
});
