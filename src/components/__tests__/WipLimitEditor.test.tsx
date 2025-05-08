import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WipLimitEditor } from '../WipLimitEditor';

describe('WipLimitEditor', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders with the provided min and max values', () => {
    render(<WipLimitEditor min={1} max={5} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Min: 1')).toBeInTheDocument();
    expect(screen.getByText('Max: 5')).toBeInTheDocument();
    expect(screen.getByText('(Click to edit)')).toBeInTheDocument();
  });

  it('switches to edit mode when clicked', () => {
    render(<WipLimitEditor min={1} max={5} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Min: 1'));
    
    expect(screen.getByLabelText('Min:')).toBeInTheDocument();
    expect(screen.getByLabelText('Max:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
  });

  it('updates values when saved', () => {
    render(<WipLimitEditor min={1} max={5} onUpdate={mockOnUpdate} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Min: 1'));
    
    // Change values
    fireEvent.change(screen.getByLabelText('Min:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Max:'), { target: { value: '8' } });
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: '✓' }));
    
    // Check if onUpdate was called with the new values
    expect(mockOnUpdate).toHaveBeenCalledWith(2, 8);
  });

  it('cancels editing without updating', () => {
    render(<WipLimitEditor min={1} max={5} onUpdate={mockOnUpdate} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Min: 1'));
    
    // Change values
    fireEvent.change(screen.getByLabelText('Min:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Max:'), { target: { value: '8' } });
    
    // Cancel changes
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    
    // Check if onUpdate was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();
    
    // Check if we're back to display mode with original values
    expect(screen.getByText('Min: 1')).toBeInTheDocument();
    expect(screen.getByText('Max: 5')).toBeInTheDocument();
  });

  it('handles invalid input by defaulting to 0', () => {
    render(<WipLimitEditor min={1} max={5} onUpdate={mockOnUpdate} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Min: 1'));
    
    // Enter invalid values
    fireEvent.change(screen.getByLabelText('Min:'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Max:'), { target: { value: '' } });
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: '✓' }));
    
    // Check if onUpdate was called with default values (0) for invalid inputs
    expect(mockOnUpdate).toHaveBeenCalledWith(0, 0);
  });
});
