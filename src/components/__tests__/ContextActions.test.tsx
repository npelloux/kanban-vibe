import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the file download functionality
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

// Mock the file input functionality
const mockFileReader = {
  readAsText: vi.fn(),
  onload: null,
  result: null as string | null
};

// Mock the click event on the download link
const mockClick = vi.fn();
HTMLAnchorElement.prototype.click = mockClick;

describe('Context Actions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
    mockClick.mockReset();
    
    // Reset FileReader mock
    mockFileReader.readAsText.mockReset();
    mockFileReader.onload = null;
    mockFileReader.result = null;
    
    // Mock FileReader constructor
    (window as unknown as { FileReader: new () => typeof mockFileReader }).FileReader = vi.fn(() => mockFileReader);
  });

  it('renders Save Context and Import Context buttons', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByText('Save Context')).toBeInTheDocument();
    expect(screen.getByText('Import Context')).toBeInTheDocument();
  });

  it('creates a download link when Save Context is clicked', () => {
    // Arrange
    render(<App />);
    
    // Mock URL.createObjectURL to return a fake URL
    mockCreateObjectURL.mockReturnValue('blob:fake-url');
    
    // Act
    fireEvent.click(screen.getByText('Save Context'));
    
    // Assert
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('saves the current state including day, cards, workers, and WIP limits', () => {
    // Arrange
    render(<App />);
    
    // Add a card and move it to Red Active
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const addCardButton = within(optionsColumn).getByText('+ Add Card');
    fireEvent.click(addCardButton);
    
    const optionsCards = within(optionsColumn).queryAllByTestId('card');
    fireEvent.click(optionsCards[0]);
    
    // Set a WIP limit
    const kanbanSubheaderRow = document.querySelector('.kanban-subheader-row');
    if (!kanbanSubheaderRow) throw new Error('Kanban subheader row not found');
    
    const wipLimitContainers = kanbanSubheaderRow.querySelectorAll('.wip-limit-container');
    const redActiveWipLimitContainer = wipLimitContainers[1] as HTMLElement;
    
    fireEvent.click(redActiveWipLimitContainer);
    const maxInput = screen.getByLabelText('Max:');
    fireEvent.change(maxInput, { target: { value: '3' } });
    const saveButton = screen.getByRole('button', { name: '✓' });
    fireEvent.click(saveButton);
    
    // Mock Blob constructor
    let savedData: string | null = null;
    (window as unknown as { Blob: new (content: BlobPart[], options?: BlobPropertyBag) => Blob }).Blob = vi.fn((content) => {
      savedData = content[0] as string;
      return { type: 'application/json' } as Blob;
    });
    
    // Act
    fireEvent.click(screen.getByText('Save Context'));
    
    // Assert
    expect(savedData).not.toBeNull();
    
    // Parse the saved data
    const parsedData = JSON.parse(savedData!);
    
    // Verify the saved state contains the expected data
    expect(parsedData).toHaveProperty('day');
    expect(parsedData).toHaveProperty('cards');
    expect(parsedData).toHaveProperty('workers');
    expect(parsedData).toHaveProperty('wipLimits');
    
    // Verify the cards array contains our added card
    expect(parsedData.cards.length).toBeGreaterThan(0);
    
    // Verify the WIP limits contain our set limit
    expect(parsedData.wipLimits).toHaveProperty('red-active');
    expect(parsedData.wipLimits['red-active'].max).toBe(3);
  });

  it('opens file input when Import Context is clicked', () => {
    // Arrange
    render(<App />);
    
    // Mock the file input click
    const mockInputClick = vi.fn();
    HTMLInputElement.prototype.click = mockInputClick;
    
    // Act
    fireEvent.click(screen.getByText('Import Context'));
    
    // Assert
    expect(mockInputClick).toHaveBeenCalled();
  });

  it('loads state from a file when a file is selected', () => {
    // Arrange
    render(<App />);
    
    // Create a mock file with kanban state
    const mockState = {
      day: 5,
      cards: [
        {
          id: 'TEST',
          content: 'Test Card',
          stage: 'red-active',
          age: 2,
          completionDay: null,
          isBlocked: false,
          workItems: {
            red: { total: 5, completed: 3 },
            blue: { total: 3, completed: 0 },
            green: { total: 2, completed: 0 }
          },
          assignedWorkers: []
        }
      ],
      workers: [
        { id: '1', type: 'red' },
        { id: '3', type: 'blue' },
        { id: '4', type: 'blue' },
        { id: '5', type: 'green' }
      ],
      wipLimits: {
        'options': { min: 0, max: 0 },
        'red-active': { min: 0, max: 5 },
        'red-finished': { min: 0, max: 0 },
        'blue-active': { min: 0, max: 0 },
        'blue-finished': { min: 0, max: 0 },
        'green': { min: 0, max: 0 },
        'done': { min: 0, max: 0 }
      },
      columnHistory: {
        'options': [0],
        'red-active': [1],
        'red-finished': [0],
        'blue-active': [0],
        'blue-finished': [0],
        'green': [0],
        'done': [0]
      }
    };
    
    const mockFile = new File(
      [JSON.stringify(mockState)],
      'kanban-state.json',
      { type: 'application/json' }
    );
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput) throw new Error('File input not found');
    
    // Mock FileReader to simulate file loading
    mockFileReader.result = JSON.stringify(mockState);
    
    // Act - trigger file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Simulate FileReader onload event
    if (mockFileReader.onload) {
      const event = new Event('load');
      (mockFileReader.onload as (event: Event) => void)(event);
    }
    
    // Assert - check if the state was loaded
    expect(screen.getByText('Day 5')).toBeInTheDocument(); // Day should be updated to 5
    
    // The test card should be in the Red Active column
    const redActiveColumn = screen.getByRole('heading', { name: 'Red Active' }).closest('.column') as HTMLElement;
    if (!redActiveColumn) throw new Error('Red Active column not found');
    
    const redActiveCards = within(redActiveColumn).queryAllByTestId('card');
    expect(redActiveCards.length).toBe(1);
    expect(redActiveCards[0].textContent).toContain('Test Card');
  });
});
