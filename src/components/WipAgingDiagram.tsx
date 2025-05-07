import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { TooltipItem, ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CardData {
  id: string;
  stage: string;
  age: number;
}

interface WipAgingDiagramProps {
  cards: CardData[];
  currentDay: number;
}

export const WipAgingDiagram: React.FC<WipAgingDiagramProps> = ({ cards, currentDay }) => {
  // Define column stages and their corresponding labels
  const columnStages = [
    'options', 
    'red-active', 
    'red-finished', 
    'blue-active', 
    'blue-finished', 
    'green',
    'done'
  ];
  
  const columnLabels = [
    'Options', 
    'Red Active', 
    'Red Finished', 
    'Blue Active', 
    'Blue Finished', 
    'Green',
    'Done'
  ];
  
  // Find the maximum age for scaling the y-axis
  const maxAge = Math.max(
    ...cards.map(card => card.age),
    1 // Ensure at least 1 day for empty boards
  );
  
  // Create datasets for each column
  const datasets = columnStages.map((stage, index) => {
    const stageCards = cards.filter(card => card.stage === stage);
    
    // Create data points for each card in this column
    const dataPoints = stageCards.map((card, cardIndex) => {
      // Position cards within their column with some jitter to avoid overlap
      const jitter = (cardIndex % 3 - 1) * 0.1; // Small horizontal offset
      
      return {
        x: index + jitter,
        y: card.age,
        id: card.id, // Store card ID for tooltip
      };
    });
    
    // Color mapping for different columns
    const colors = [
      'rgba(156, 156, 156, 0.8)', // Options
      'rgba(255, 99, 132, 0.8)',  // Red Active
      'rgba(255, 159, 182, 0.8)', // Red Finished
      'rgba(54, 162, 235, 0.8)',  // Blue Active
      'rgba(134, 202, 255, 0.8)', // Blue Finished
      'rgba(75, 192, 192, 0.8)',  // Green
      'rgba(50, 50, 50, 0.8)'     // Done
    ];
    
    return {
      label: columnLabels[index],
      data: dataPoints,
      backgroundColor: colors[index],
      borderColor: colors[index].replace('0.8', '1'),
      borderWidth: 1,
      pointRadius: 8,
      pointHoverRadius: 10
    };
  });
  
  // Prepare data for the scatter chart
  const data = {
    datasets
  };
  
  // Chart options
  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Card Aging by Column (Day ${currentDay})`,
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'scatter'>) {
            const dataPoint = tooltipItem.raw as { x: number; y: number; id: string };
            const columnName = columnLabels[Math.round(dataPoint.x)];
            return `Card ${dataPoint.id} in ${columnName}: ${dataPoint.y} days old`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -0.5,
        max: columnLabels.length - 0.5,
        ticks: {
          callback: function(value: number | string) {
            const index = Math.round(Number(value));
            return index >= 0 && index < columnLabels.length ? columnLabels[index] : '';
          },
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Columns'
        }
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        max: Math.max(maxAge + 1, 5), // Ensure we have some space at the top
        title: {
          display: true,
          text: 'Age (days)'
        }
      }
    }
  };
  
  return (
    <div className="wip-aging-diagram">
      <div style={{ height: '500px', width: '100%' }}>
        <Scatter data={data} options={options} />
      </div>
      
      <div className="wip-aging-metrics">
        <div className="metrics-section">
          <h3>WIP Metrics</h3>
          <ul>
            <li>
              <strong>Total WIP:</strong> {cards.filter(card => card.stage !== 'done').length} cards
            </li>
            <li>
              <strong>WIP Limit Recommendation:</strong> {Math.ceil(cards.filter(card => card.stage !== 'done').length * 0.8)} cards
            </li>
          </ul>
        </div>
        
        <div className="metrics-section">
          <h3>Aging Metrics</h3>
          <ul>
            <li>
              <strong>Oldest Card:</strong> {cards.reduce((max, card) => Math.max(max, card.age), 0)} days
            </li>
            <li>
              <strong>Average Age:</strong> {
                Math.round(
                  (cards.filter(card => card.stage !== 'done').reduce((sum, card) => sum + card.age, 0) / 
                  Math.max(1, cards.filter(card => card.stage !== 'done').length)) * 10
                ) / 10
              } days
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
