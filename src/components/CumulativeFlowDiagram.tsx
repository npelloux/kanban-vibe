import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ColumnData {
  options: number;
  redActive: number;
  redFinished: number;
  blueActive: number;
  blueFinished: number;
  green: number;
  done: number;
}

interface HistoricalData {
  day: number;
  columnData: ColumnData;
}

interface CumulativeFlowDiagramProps {
  historicalData: HistoricalData[];
}

export const CumulativeFlowDiagram: React.FC<CumulativeFlowDiagramProps> = ({ historicalData }) => {
  // Prepare data for the chart
  const labels = historicalData.map(data => `Day ${data.day}`);
  
  // Create cumulative data for each column
  const cumulativeData = {
    labels,
    datasets: [
      {
        label: 'Done',
        data: historicalData.map(data => data.columnData.done),
        backgroundColor: 'rgba(158, 158, 158, 0.5)',
        borderColor: 'rgba(158, 158, 158, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Green',
        data: historicalData.map(data => data.columnData.green + data.columnData.done),
        backgroundColor: 'rgba(129, 199, 132, 0.5)',
        borderColor: 'rgba(129, 199, 132, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Blue Finished',
        data: historicalData.map(data => 
          data.columnData.blueFinished + data.columnData.green + data.columnData.done
        ),
        backgroundColor: 'rgba(100, 181, 246, 0.5)',
        borderColor: 'rgba(100, 181, 246, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Blue Active',
        data: historicalData.map(data => 
          data.columnData.blueActive + data.columnData.blueFinished + 
          data.columnData.green + data.columnData.done
        ),
        backgroundColor: 'rgba(66, 165, 245, 0.5)',
        borderColor: 'rgba(66, 165, 245, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Red Finished',
        data: historicalData.map(data => 
          data.columnData.redFinished + data.columnData.blueActive + 
          data.columnData.blueFinished + data.columnData.green + data.columnData.done
        ),
        backgroundColor: 'rgba(229, 115, 115, 0.5)',
        borderColor: 'rgba(229, 115, 115, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Red Active',
        data: historicalData.map(data => 
          data.columnData.redActive + data.columnData.redFinished + 
          data.columnData.blueActive + data.columnData.blueFinished + 
          data.columnData.green + data.columnData.done
        ),
        backgroundColor: 'rgba(239, 83, 80, 0.5)',
        borderColor: 'rgba(239, 83, 80, 1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Options',
        data: historicalData.map(data => 
          data.columnData.options + data.columnData.redActive + 
          data.columnData.redFinished + data.columnData.blueActive + 
          data.columnData.blueFinished + data.columnData.green + data.columnData.done
        ),
        backgroundColor: 'rgba(189, 189, 189, 0.5)',
        borderColor: 'rgba(189, 189, 189, 1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cumulative Flow Diagram',
        font: {
          size: 18
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day'
        }
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: 'Number of Cards'
        }
      }
    }
  };

  return (
    <div className="cumulative-flow-diagram">
      <div style={{ height: '500px', width: '100%' }}>
        <Line data={cumulativeData} options={options} />
      </div>
    </div>
  );
};
