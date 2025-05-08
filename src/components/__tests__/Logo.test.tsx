import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '../Logo';
import '@testing-library/jest-dom';

describe('Logo Component', () => {
  it('renders with default size (medium)', () => {
    const { container } = render(<Logo />);
    
    // Check if the logo image is rendered
    const logoImage = container.querySelector('.logo-image');
    expect(logoImage).toBeInTheDocument();
    
    // Check default size
    expect(logoImage).toHaveStyle('height: 40px');
  });
  
  it('renders with small size when specified', () => {
    const { container } = render(<Logo size="small" />);
    
    // Check size
    const logoImage = container.querySelector('.logo-image');
    expect(logoImage).toHaveStyle('height: 32px');
  });
  
  it('renders with large size when specified', () => {
    const { container } = render(<Logo size="large" />);
    
    // Check size
    const logoImage = container.querySelector('.logo-image');
    expect(logoImage).toHaveStyle('height: 48px');
  });
  
  it('renders with the correct alt text', () => {
    const { container } = render(<Logo />);
    
    // Check alt text
    const logoImage = container.querySelector('.logo-image');
    expect(logoImage).toHaveAttribute('alt', 'Kanban Vibe Logo');
  });
});
