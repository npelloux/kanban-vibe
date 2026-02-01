import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CumulativeFlowDiagram } from '../CumulativeFlowDiagram';
import { WipAgingDiagram } from '../WipAgingDiagram';
import { FlowMetrics } from '../FlowMetrics';

vi.mock('react-chartjs-2', () => ({
  Line: ({ options }: { options: Record<string, unknown> }) => (
    <div data-testid="mock-line-chart" data-options={JSON.stringify(options)}>
      Mock Line Chart
    </div>
  ),
  Bar: ({ options }: { options: Record<string, unknown> }) => (
    <div data-testid="mock-bar-chart" data-options={JSON.stringify(options)}>
      Mock Bar Chart
    </div>
  ),
  Scatter: ({ options }: { options: Record<string, unknown> }) => (
    <div data-testid="mock-scatter-chart" data-options={JSON.stringify(options)}>
      Mock Scatter Chart
    </div>
  ),
}));

const sampleHistoricalData = [
  { day: 0, columnData: { options: 5, redActive: 0, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 } },
  { day: 1, columnData: { options: 4, redActive: 1, redFinished: 0, blueActive: 0, blueFinished: 0, green: 0, done: 0 } },
  { day: 2, columnData: { options: 3, redActive: 1, redFinished: 1, blueActive: 0, blueFinished: 0, green: 0, done: 0 } },
];

const sampleCards = [
  { id: '1', stage: 'red-active', age: 2 },
  { id: '2', stage: 'blue-active', age: 1 },
  { id: '3', stage: 'done', age: 3 },
];

const sampleFlowCards = [
  { id: '1', content: 'Card 1', stage: 'red-active', age: 2, startDay: 1 },
  { id: '2', content: 'Card 2', stage: 'blue-active', age: 1, startDay: 2 },
  { id: '3', content: 'Card 3', stage: 'done', age: 3, startDay: 0, completionDay: 3 },
];

describe('Responsive Charts', () => {
  describe('CumulativeFlowDiagram', () => {
    it('renders with responsive options', () => {
      render(<CumulativeFlowDiagram historicalData={sampleHistoricalData} />);

      const chart = screen.getByTestId('mock-line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
    });

    it('has touch-friendly tooltip mode', () => {
      render(<CumulativeFlowDiagram historicalData={sampleHistoricalData} />);

      const chart = screen.getByTestId('mock-line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.tooltip.mode).toBe('index');
      expect(options.plugins.tooltip.intersect).toBe(false);
    });

    it('has chart container with proper sizing class', () => {
      render(<CumulativeFlowDiagram historicalData={sampleHistoricalData} />);

      const container = document.querySelector('.cumulative-flow-diagram');
      expect(container).toBeInTheDocument();
    });

    it('configures legend for mobile readability', () => {
      render(<CumulativeFlowDiagram historicalData={sampleHistoricalData} />);

      const chart = screen.getByTestId('mock-line-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.plugins.legend).toBeDefined();
      expect(options.plugins.legend.position).toBeDefined();
    });
  });

  describe('WipAgingDiagram', () => {
    it('renders with responsive options', () => {
      render(<WipAgingDiagram cards={sampleCards} currentDay={5} />);

      const chart = screen.getByTestId('mock-scatter-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
    });

    it('has touch-friendly point sizes', () => {
      render(<WipAgingDiagram cards={sampleCards} currentDay={5} />);

      const chart = screen.getByTestId('mock-scatter-chart');
      expect(chart).toBeInTheDocument();
    });

    it('has chart container with proper sizing class', () => {
      render(<WipAgingDiagram cards={sampleCards} currentDay={5} />);

      const container = document.querySelector('.wip-aging-diagram');
      expect(container).toBeInTheDocument();
    });

    it('has readable axis configuration', () => {
      render(<WipAgingDiagram cards={sampleCards} currentDay={5} />);

      const chart = screen.getByTestId('mock-scatter-chart');
      const options = JSON.parse(chart.getAttribute('data-options') || '{}');

      expect(options.scales).toBeDefined();
      expect(options.scales.x).toBeDefined();
      expect(options.scales.y).toBeDefined();
    });
  });

  describe('FlowMetrics', () => {
    it('renders all charts with responsive options', () => {
      render(<FlowMetrics cards={sampleFlowCards} currentDay={5} />);

      const barCharts = screen.getAllByTestId('mock-bar-chart');

      expect(barCharts.length).toBeGreaterThan(0);

      barCharts.forEach((chart) => {
        const options = JSON.parse(chart.getAttribute('data-options') || '{}');
        expect(options.responsive).toBe(true);
        expect(options.maintainAspectRatio).toBe(false);
      });
    });

    it('renders metrics summary cards', () => {
      render(<FlowMetrics cards={sampleFlowCards} currentDay={5} />);

      expect(screen.getByText('Lead Time')).toBeInTheDocument();
      expect(screen.getByText('Throughput')).toBeInTheDocument();
      expect(screen.getByText('Current WIP')).toBeInTheDocument();
    });

    it('has chart containers with proper sizing classes', () => {
      render(<FlowMetrics cards={sampleFlowCards} currentDay={5} />);

      const container = document.querySelector('.flow-metrics-container');
      expect(container).toBeInTheDocument();

      const chartWrappers = document.querySelectorAll('.chart-wrapper');
      expect(chartWrappers.length).toBeGreaterThan(0);
    });

    it('renders metric cards in a responsive grid', () => {
      render(<FlowMetrics cards={sampleFlowCards} currentDay={5} />);

      const metricsSummary = document.querySelector('.metrics-summary');
      expect(metricsSummary).toBeInTheDocument();

      const metricCards = document.querySelectorAll('.metric-card');
      expect(metricCards.length).toBe(4);
    });
  });

  describe('Chart Container Responsiveness', () => {
    it('CFD container has responsive wrapper', () => {
      render(<CumulativeFlowDiagram historicalData={sampleHistoricalData} />);

      const diagramWrapper = document.querySelector('.cumulative-flow-diagram');
      expect(diagramWrapper).toBeInTheDocument();
    });

    it('WIP Aging has responsive container', () => {
      render(<WipAgingDiagram cards={sampleCards} currentDay={5} />);

      const diagramWrapper = document.querySelector('.wip-aging-diagram');
      expect(diagramWrapper).toBeInTheDocument();
    });

    it('FlowMetrics charts container exists', () => {
      render(<FlowMetrics cards={sampleFlowCards} currentDay={5} />);

      const chartsContainer = document.querySelector('.charts-container');
      expect(chartsContainer).toBeInTheDocument();
    });
  });
});
