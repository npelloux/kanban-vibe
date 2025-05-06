import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders a card with content', () => {
    // Arrange
    const cardProps = {
      id: '1',
      content: 'Test Card Content'
    };
    
    // Act
    render(<Card {...cardProps} />);
    
    // Assert
    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});
