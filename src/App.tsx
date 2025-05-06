import { useState } from 'react'
import './App.css'
import { Column } from './components/Column'
import { NextDayButton } from './components/NextDayButton'
import { WorkerPool } from './components/WorkerPool'
import type { WorkItemsType } from './components/Card'
import type { WorkerType } from './components/Worker'

// Generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Define the Card type
interface Card {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  isBlocked: boolean;
  workItems: WorkItemsType;
  assignedWorker: {
    id: string;
    type: WorkerType;
  } | null;
}

// Define the Worker type
interface Worker {
  id: string;
  type: WorkerType;
}

// stagedone function to determine if a card should move to the next stage
const stagedone = (card: Card): boolean => {
  // A card can move to the next stage if it's not blocked and all work is completed
  const totalWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.total, 
    0
  );
  
  const completedWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.completed, 
    0
  );
  
  return !card.isBlocked && totalWorkItems > 0 && completedWorkItems >= totalWorkItems;
}

function App() {
  // Initialize with day 1
  const [currentDay, setCurrentDay] = useState<number>(1);
  
  // Initialize workers
  const initialWorkers: Worker[] = [
    { id: '1', type: 'red' },
    { id: '2', type: 'red' },
    { id: '3', type: 'blue' },
    { id: '4', type: 'blue' },
    { id: '5', type: 'green' },
    { id: '6', type: 'green' }
  ];
  
  // State to track workers
  const [workers] = useState<Worker[]>(initialWorkers);
  
  // State to track selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  
  // Initialize cards with their stages
  const initialCards: Card[] = [
    {
      id: 'A',
      content: 'Create a Kanban board',
      stage: 'red-active',
      age: 0,
      startDay: 1,
      isBlocked: false,
      workItems: {
        red: { total: getRandomInt(1, 10), completed: 0 },
        blue: { total: getRandomInt(1, 10), completed: 0 },
        green: { total: getRandomInt(1, 10), completed: 0 }
      },
      assignedWorker: null
    },
    {
      id: 'B',
      content: 'Set up project structure',
      stage: 'blue-active',
      age: 2,
      startDay: 1,
      isBlocked: false,
      workItems: {
        red: { total: getRandomInt(1, 10), completed: getRandomInt(1, 10) },
        blue: { total: getRandomInt(1, 10), completed: 0 },
        green: { total: getRandomInt(1, 10), completed: 0 }
      },
      assignedWorker: null
    },
    {
      id: 'C',
      content: 'Initial repository setup',
      stage: 'done',
      age: 3,
      startDay: 1,
      isBlocked: false,
      workItems: {
        red: { total: getRandomInt(1, 10), completed: getRandomInt(1, 10) },
        blue: { total: getRandomInt(1, 10), completed: getRandomInt(1, 10) },
        green: { total: getRandomInt(1, 10), completed: getRandomInt(1, 10) }
      },
      assignedWorker: null
    }
  ];

  // State to track all cards
  const [cards, setCards] = useState<Card[]>(initialCards);

  // Filter cards by stage
  const redActiveCards = cards.filter(card => card.stage === 'red-active');
  const redFinishedCards = cards.filter(card => card.stage === 'red-finished');
  const blueActiveCards = cards.filter(card => card.stage === 'blue-active');
  const blueFinishedCards = cards.filter(card => card.stage === 'blue-finished');
  const greenCards = cards.filter(card => card.stage === 'green');
  const doneCards = cards.filter(card => card.stage === 'done');

  // Handle Next Day button click
  const handleNextDay = () => {
    // Increment the day counter
    setCurrentDay(prevDay => prevDay + 1);
    
    // Increment age for all cards
    const agedCards = cards.map(card => ({
      ...card,
      age: card.age + 1
    }));
    
    // Process each card and move it to the next stage if stagedone returns true
    const updatedCards = agedCards.map(card => {
      if (stagedone(card)) {
        if (card.stage === 'red-active') {
          return { ...card, stage: 'red-finished' };
        } else if (card.stage === 'red-finished') {
          return { ...card, stage: 'blue-active' };
        } else if (card.stage === 'blue-active') {
          return { ...card, stage: 'blue-finished' };
        } else if (card.stage === 'blue-finished') {
          return { ...card, stage: 'green' };
        } else if (card.stage === 'green') {
          return { ...card, stage: 'done' };
        }
      }
      return card;
    });
    
    // Reset all assigned workers
    const resetWorkerCards = updatedCards.map(card => ({
      ...card,
      assignedWorker: null
    }));
    
    setCards(resetWorkerCards);
    setSelectedWorkerId(null);
  };

  // Handle Work button click for a specific column and worker type
  const handleWork = (stage: string, workerType: WorkerType) => {
    const updatedCards = cards.map(card => {
      if (card.stage === stage && card.assignedWorker && card.assignedWorker.type === workerType) {
        // Do work based on worker type
        const updatedWorkItems = { ...card.workItems };
        
        if (updatedWorkItems[workerType] && updatedWorkItems[workerType].completed < updatedWorkItems[workerType].total) {
          updatedWorkItems[workerType] = {
            ...updatedWorkItems[workerType],
            completed: updatedWorkItems[workerType].completed + 1
          };
        }
        
        return {
          ...card,
          workItems: updatedWorkItems
        };
      }
      return card;
    });
    
    setCards(updatedCards);
  };

  // Handle worker selection
  const handleWorkerSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
  };

  // Handle card click to assign worker
  const handleCardClick = (cardId: string) => {
    if (!selectedWorkerId) return;
    
    const selectedWorker = workers.find(worker => worker.id === selectedWorkerId);
    if (!selectedWorker) return;
    
    const updatedCards = cards.map(card => {
      // Remove worker from any card it was previously assigned to
      if (card.assignedWorker && card.assignedWorker.id === selectedWorkerId) {
        return { ...card, assignedWorker: null };
      }
      
      // Assign worker to the clicked card
      if (card.id === cardId) {
        return { ...card, assignedWorker: selectedWorker };
      }
      
      return card;
    });
    
    setCards(updatedCards);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Vibe</h1>
        <div className="day-counter">Day {currentDay}</div>
      </header>
      
      <WorkerPool 
        workers={workers} 
        selectedWorkerId={selectedWorkerId} 
        onWorkerSelect={handleWorkerSelect} 
      />
      
      <main className="kanban-board">
        <Column 
          title="Red Active" 
          cards={redActiveCards} 
          type="red"
          status="active"
          showWorkButton={true}
          onWork={() => handleWork('red-active', 'red')}
          onCardClick={handleCardClick}
        />
        <Column 
          title="Red Finished" 
          cards={redFinishedCards} 
          type="red"
          status="finished"
          onCardClick={handleCardClick}
        />
        <Column 
          title="Blue Active" 
          cards={blueActiveCards} 
          type="blue"
          status="active"
          showWorkButton={true}
          onWork={() => handleWork('blue-active', 'blue')}
          onCardClick={handleCardClick}
        />
        <Column 
          title="Blue Finished" 
          cards={blueFinishedCards} 
          type="blue"
          status="finished"
          onCardClick={handleCardClick}
        />
        <Column 
          title="Green" 
          cards={greenCards} 
          type="green"
          showWorkButton={true}
          onWork={() => handleWork('green', 'green')}
          onCardClick={handleCardClick}
        />
        <Column 
          title="Done" 
          cards={doneCards}
          onCardClick={handleCardClick}
        />
      </main>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
