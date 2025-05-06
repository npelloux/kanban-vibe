import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Column } from '../Column';

describe('Column Component', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('renders an empty TODO column', () => {
    // Arrange
    render(<Column title="TODO" cards={[]} />);
    
    // Assert
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });
});
