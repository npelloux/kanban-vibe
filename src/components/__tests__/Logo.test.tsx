import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '../Logo';
import '@testing-library/jest-dom';

describe('Logo Component', () => {
  it('renders with default size (medium)', () => {
    render(<Logo />);
    
    // Check if the logo text is rendered
    expect(screen.getByText('Kanban Vibe')).toBeInTheDocument();
    
    // Check if the SVG is rendered
    const svg = document.querySelector('.logo-svg');
    expect(svg).toBeInTheDocument();
    
    // Check default size attributes
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
    
    // Check text size
    const logoText = screen.getByText('Kanban Vibe');
    expect(logoText).toHaveStyle('font-size: 12px');
  });
  
  it('renders with small size when specified', () => {
    render(<Logo size="small" />);
    
    // Check size attributes
    const svg = document.querySelector('.logo-svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    
    // Check text size
    const logoText = screen.getByText('Kanban Vibe');
    expect(logoText).toHaveStyle('font-size: 10px');
  });
  
  it('renders with large size when specified', () => {
    render(<Logo size="large" />);
    
    // Check size attributes
    const svg = document.querySelector('.logo-svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    
    // Check text size
    const logoText = screen.getByText('Kanban Vibe');
    expect(logoText).toHaveStyle('font-size: 14px');
  });
  
  it('contains the correct SVG elements for the logo', () => {
    render(<Logo />);
    
    // Check for the background rectangle
    const background = document.querySelector('rect[width="48"][height="48"]');
    expect(background).toBeInTheDocument();
    expect(background).toHaveAttribute('fill', '#0F4C81');
    
    // Check for the column rectangles
    const columns = document.querySelectorAll('rect[width="8"][height="24"]');
    expect(columns.length).toBe(3);
    
    // Check for the card rectangles
    const cards = document.querySelectorAll('rect[rx="1"]');
    expect(cards.length).toBe(7);
  });
});
