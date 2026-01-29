import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { StateRepository } from '../../simulation/infra/state-repository';
import { createBoardWithDefaultWorkers } from '../../simulation/application/test-fixtures';

const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

const mockFileReader = {
  readAsText: vi.fn(),
  onload: null,
  result: null as string | null
};

const mockClick = vi.fn();
HTMLAnchorElement.prototype.click = mockClick;

vi.mock('../../simulation/infra/state-repository', () => ({
  StateRepository: {
    loadBoard: vi.fn(),
    saveBoard: vi.fn(),
    clearBoard: vi.fn(),
  },
}));

describe('Context Actions', () => {
  beforeEach(() => {
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
    mockClick.mockReset();

    mockFileReader.readAsText.mockReset();
    mockFileReader.onload = null;
    mockFileReader.result = null;

    (window as unknown as { FileReader: new () => typeof mockFileReader }).FileReader = vi.fn(() => mockFileReader);

    vi.mocked(StateRepository.loadBoard).mockReturnValue(createBoardWithDefaultWorkers());
    vi.mocked(StateRepository.saveBoard).mockImplementation(() => {});
  });

  it('renders save and import dropdown buttons', () => {
    // Arrange & Act
    render(<App />);
    
    // Assert
    expect(screen.getByLabelText('Save options')).toBeInTheDocument();
    expect(screen.getByLabelText('Import options')).toBeInTheDocument();
  });

  it('creates a download link when Save Context is clicked', () => {
    // Arrange
    render(<App />);
    
    // Mock URL.createObjectURL to return a fake URL
    mockCreateObjectURL.mockReturnValue('blob:fake-url');
    
    // Act - first click the save options button to open the dropdown
    fireEvent.click(screen.getByLabelText('Save options'));
    
    // Then click the Save Context option
    fireEvent.click(screen.getByText('Save Context'));
    
    // Assert
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it.skip('saves state with WIP limits [requires inline WIP editors removed in D8.4]', () => {
    // Arrange
    render(<App />);
    
    // Add a card and move it to Red Active
    const optionsColumn = screen.getByRole('heading', { name: 'Options' }).closest('.column') as HTMLElement;
    if (!optionsColumn) throw new Error('Options column not found');
    
    const addCardButton = within(optionsColumn).getByText('+ New');
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
    
    // Act - first click the save options button to open the dropdown
    fireEvent.click(screen.getByLabelText('Save options'));
    
    // Then click the Save Context option
    fireEvent.click(screen.getByText('Save Context'));
    
    // Assert
    expect(savedData).not.toBeNull();
    
    // Parse the saved data
    const parsedData = JSON.parse(savedData!);
    
    // Verify the saved state contains the expected data
    expect(parsedData).toHaveProperty('currentDay');
    expect(parsedData).toHaveProperty('cards');
    expect(parsedData).toHaveProperty('workers');
    expect(parsedData).toHaveProperty('wipLimits');
    
    // Verify the cards array contains our added card
    expect(parsedData.cards.length).toBeGreaterThan(0);
    
    // Verify the WIP limits contain our set limit
    expect(parsedData.wipLimits).toHaveProperty('redActive');
    expect(parsedData.wipLimits['redActive'].max).toBe(3);
  });

  it('shows Import Context option when Import dropdown is clicked', () => {
    // Arrange
    render(<App />);
    
    // Act - click the import options button to open the dropdown
    fireEvent.click(screen.getByLabelText('Import options'));
    
    // Assert - check if the Import Context option is visible
    expect(screen.getByText('Import Context')).toBeInTheDocument();
  });

  // Skip this test for now as it requires more complex mocking
  it.skip('loads state from a file when a file is selected', () => {
    // This test will be implemented later
  });
});
