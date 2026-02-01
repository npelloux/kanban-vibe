import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Card {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  completionDay?: number;
}

interface FlowMetricsProps {
  cards: Card[];
  currentDay: number;
}

export const FlowMetrics: React.FC<FlowMetricsProps> = ({ cards, currentDay }) => {
  // Calculate completed cards (cards in the 'done' stage)
  const completedCards = cards.filter(card => card.stage === 'done');
  
  // Calculate lead time for each completed card (time from start to completion)
  const leadTimes = completedCards.map(card => 
    card.completionDay ? card.completionDay - card.startDay : 0
  );
  
  // Calculate average lead time
  const averageLeadTime = leadTimes.length > 0 
    ? Math.round((leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length) * 10) / 10
    : 0;
  
  // Calculate throughput (number of cards completed per day)
  const throughputByDay: Record<number, number> = {};
  
  // Initialize all days with 0 throughput
  for (let day = 1; day <= currentDay; day++) {
    throughputByDay[day] = 0;
  }
  
  // Count completions by day
  completedCards.forEach(card => {
    if (card.completionDay) {
      throughputByDay[card.completionDay] = (throughputByDay[card.completionDay] || 0) + 1;
    }
  });
  
  // Calculate rolling average throughput (last 5 days)
  const rollingAverageThroughput = [];
  const rollingWindow = 5;
  
  for (let day = rollingWindow; day <= currentDay; day++) {
    let sum = 0;
    for (let i = 0; i < rollingWindow; i++) {
      sum += throughputByDay[day - i] || 0;
    }
    rollingAverageThroughput.push({
      day,
      throughput: sum / rollingWindow
    });
  }
  
  // Calculate WIP over time
  const wipByDay: Record<number, number> = {};
  
  // Initialize all days with 0 WIP
  for (let day = 1; day <= currentDay; day++) {
    wipByDay[day] = 0;
  }
  
  // Count WIP by day (cards that were in progress on that day)
  cards.forEach(card => {
    const startDay = card.startDay;
    const endDay = card.completionDay || currentDay;
    
    for (let day = startDay; day <= endDay; day++) {
      if (day >= 1 && day <= currentDay) {
        wipByDay[day] = (wipByDay[day] || 0) + 1;
      }
    }
  });
  
  // Prepare data for throughput chart
  const throughputData = {
    labels: Object.keys(throughputByDay).map(day => `Day ${day}`),
    datasets: [
      {
        label: 'Daily Throughput',
        data: Object.values(throughputByDay),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for rolling average throughput chart
  const rollingThroughputData = {
    labels: rollingAverageThroughput.map(item => `Day ${item.day}`),
    datasets: [
      {
        label: `${rollingWindow}-Day Rolling Average Throughput`,
        data: rollingAverageThroughput.map(item => item.throughput),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };
  
  // Prepare data for WIP chart
  const wipData = {
    labels: Object.keys(wipByDay).map(day => `Day ${day}`),
    datasets: [
      {
        label: 'Work in Progress',
        data: Object.values(wipByDay),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Common chart options for mobile responsiveness
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 13,
        },
        padding: 10,
        caretSize: 8,
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Daily Throughput',
        font: {
          size: 14,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cards Completed',
          font: {
            size: 11,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `${rollingWindow}-Day Rolling Average Throughput`,
        font: {
          size: 14,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cards Completed (Average)',
          font: {
            size: 11,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const wipOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Work in Progress Over Time',
        font: {
          size: 14,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Cards',
          font: {
            size: 11,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };
  
  // Calculate Little's Law prediction (Avg Lead Time = Avg WIP / Avg Throughput)
  const avgWip = Object.values(wipByDay).reduce((sum, wip) => sum + wip, 0) / currentDay;
  const avgThroughput = completedCards.length / currentDay;
  const predictedLeadTime = avgThroughput > 0 ? avgWip / avgThroughput : 0;
  
  return (
    <div className="flow-metrics-container">
      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Lead Time</h3>
          <div className="metric-value">{averageLeadTime} days</div>
          <div className="metric-description">Average time from start to completion</div>
        </div>
        
        <div className="metric-card">
          <h3>Throughput</h3>
          <div className="metric-value">
            {(completedCards.length / currentDay).toFixed(2)} cards/day
          </div>
          <div className="metric-description">Average cards completed per day</div>
        </div>
        
        <div className="metric-card">
          <h3>Current WIP</h3>
          <div className="metric-value">
            {cards.filter(card => card.stage !== 'done').length} cards
          </div>
          <div className="metric-description">Cards currently in progress</div>
        </div>
        
        <div className="metric-card">
          <h3>Little's Law Prediction</h3>
          <div className="metric-value">{predictedLeadTime.toFixed(2)} days</div>
          <div className="metric-description">Predicted lead time based on current WIP and throughput</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-wrapper">
          <div className="chart-container chart-container-small">
            <Bar data={throughputData} options={barOptions} />
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-container chart-container-small">
            <Line data={rollingThroughputData} options={lineOptions} />
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-container chart-container-small">
            <Bar data={wipData} options={wipOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
