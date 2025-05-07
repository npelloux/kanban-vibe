import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContextActions } from '../ContextActions';

describe('ContextActions', () => {
  const mockSaveContext = vi.fn();
  const mockImportContext = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders save and import buttons', () => {
    render(
      <ContextActions 
        onSaveContext={mockSaveContext} 
        onImportContext={mockImportContext} 
      />
    );
    
    expect(screen.getByText('Save Context')).toBeInTheDocument();
    expect(screen.getByText('Import Context')).toBeInTheDocument();
  });
  
  it('calls onSaveContext when save button is clicked', () => {
    render(
      <ContextActions 
        onSaveContext={mockSaveContext} 
        onImportContext={mockImportContext} 
      />
    );
    
    fireEvent.click(screen.getByText('Save Context'));
    expect(mockSaveContext).toHaveBeenCalledTimes(1);
  });
  
  it('handles file input for import', () => {
    render(
      <ContextActions 
        onSaveContext={mockSaveContext} 
        onImportContext={mockImportContext} 
      />
    );
    
    const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
    
    // Get the file input directly using a more specific query
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    
    // Set up the files property
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    // Trigger the change event
    fireEvent.change(fileInput);
    
    // Verify the import function was called
    expect(mockImportContext).toHaveBeenCalledTimes(1);
    expect(mockImportContext).toHaveBeenCalledWith(file);
  });
});
