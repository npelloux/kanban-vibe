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
  completionDay?: number;
}

// Define the Worker type
interface Worker {
  id: string;
  type: WorkerType;
}

// stagedone function to determine if a card should move to the next stage
const stagedone = (card: Card): boolean => {
  // For red-active and blue-active stages, check if the specific color work is completed
  if (card.stage === 'red-active') {
    return !card.isBlocked && 
           card.workItems.red.total > 0 && 
           card.workItems.red.completed >= card.workItems.red.total;
  } else if (card.stage === 'blue-active') {
    return !card.isBlocked && 
           card.workItems.blue.total > 0 && 
           card.workItems.blue.completed >= card.workItems.blue.total;
  } else if (card.stage === 'green') {
    return !card.isBlocked && 
           card.workItems.green.total > 0 && 
           card.workItems.green.completed >= card.workItems.green.total;
  }
  
  // For other stages, use the original logic
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
      assignedWorker: null,
      completionDay: 3
    },
    {
      id: 'D',
      content: 'Implement user authentication',
      stage: 'options',
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
      id: 'E',
      content: 'Create dashboard UI',
      stage: 'options',
      age: 0,
      startDay: 1,
      isBlocked: false,
      workItems: {
        red: { total: getRandomInt(1, 10), completed: 0 },
        blue: { total: getRandomInt(1, 10), completed: 0 },
        green: { total: getRandomInt(1, 10), completed: 0 }
      },
      assignedWorker: null
    }
  ];

  // State to track all cards
  const [cards, setCards] = useState<Card[]>(initialCards);

  // Filter cards by stage
  const optionsCards = cards.filter(card => card.stage === 'options');
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
    
    // Increment age for all cards except those in the done column
    const agedCards = cards.map(card => ({
      ...card,
      age: card.stage === 'done' ? card.age : card.age + 1
    }));
    
    // Apply worker output rules to cards with assigned workers
    const cardsWithWorkerOutput = agedCards.map(card => {
      if (!card.assignedWorker || !card.stage.includes('active') && card.stage !== 'green') {
        return card;
      }
      
      const updatedWorkItems = { ...card.workItems };
      const workerType = card.assignedWorker.type;
      const columnColor = card.stage.includes('red') ? 'red' : 
                          card.stage.includes('blue') ? 'blue' : 'green';
      
      // Determine output based on worker color and column color
      let outputAmount = 0;
      
      if (workerType === columnColor) {
        // Worker is specialized in this color - output 1-6 boxes
        outputAmount = getRandomInt(1, 6);
      } else {
        // Worker is not specialized - output 0-3 boxes
        outputAmount = getRandomInt(0, 3);
      }
      
      // Apply the output to the work items
      if (updatedWorkItems[columnColor]) {
        const newCompleted = Math.min(
          updatedWorkItems[columnColor].total,
          updatedWorkItems[columnColor].completed + outputAmount
        );
        
        updatedWorkItems[columnColor] = {
          ...updatedWorkItems[columnColor],
          completed: newCompleted
        };
      }
      
      return {
        ...card,
        workItems: updatedWorkItems
      };
    });
    
    // Process each card and move it to the next stage if stagedone returns true
    const updatedCards = cardsWithWorkerOutput.map(card => {
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
          // When a card moves to done, store the current day as completionDay
          return { 
            ...card, 
            stage: 'done',
            completionDay: currentDay
          };
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

  // Handle Work button click for a specific column
  const handleWork = (stage: string) => {
    const updatedCards = cards.map(card => {
      if (card.stage === stage && card.assignedWorker) {
        // Allow workers to work on their color regardless of the column
        // This means blue workers can work on blue items in any column, etc.
        const updatedWorkItems = { ...card.workItems };
        const workerColorType = card.assignedWorker.type;
        
        if (updatedWorkItems[workerColorType] && 
            updatedWorkItems[workerColorType].completed < updatedWorkItems[workerColorType].total) {
          updatedWorkItems[workerColorType] = {
            ...updatedWorkItems[workerColorType],
            completed: updatedWorkItems[workerColorType].completed + 1
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

  // Handle worker drop on a card
  const handleWorkerDrop = (cardId: string, workerId: string) => {
    const selectedWorker = workers.find(worker => worker.id === workerId);
    if (!selectedWorker) return;
    
    const updatedCards = cards.map(card => {
      // Remove worker from any card it was previously assigned to
      if (card.assignedWorker && card.assignedWorker.id === workerId) {
        return { ...card, assignedWorker: null };
      }
      
      // Assign worker to the target card
      if (card.id === cardId) {
        return { ...card, assignedWorker: selectedWorker };
      }
      
      return card;
    });
    
    setCards(updatedCards);
    setSelectedWorkerId(null); // Clear selection after drop
  };

  // Handle card click to move from options/finished columns
  const handleCardClick = (cardId: string) => {
    const clickedCard = cards.find(card => card.id === cardId);
    if (!clickedCard) return;
    
    // Handle moving cards between columns
    if (clickedCard.stage === 'options') {
      // Move from options to red-active and update startDay to current day
      const updatedCards = cards.map(card => {
        if (card.id === cardId) {
          return { ...card, stage: 'red-active', startDay: currentDay };
        }
        return card;
      });
      setCards(updatedCards);
      return;
    } else if (clickedCard.stage === 'red-finished') {
      // Move from red-finished to blue-active
      const updatedCards = cards.map(card => {
        if (card.id === cardId) {
          return { ...card, stage: 'blue-active' };
        }
        return card;
      });
      setCards(updatedCards);
      return;
    } else if (clickedCard.stage === 'blue-finished') {
      // Move from blue-finished to green
      const updatedCards = cards.map(card => {
        if (card.id === cardId) {
          return { ...card, stage: 'green' };
        }
        return card;
      });
      setCards(updatedCards);
      return;
    }
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
        {/* First row - Activity type headers */}
        <div className="kanban-header-row">
          <div className="kanban-header-cell kanban-header-options">Options</div>
          <div className="kanban-header-cell kanban-header-red">Red Activities</div>
          <div className="kanban-header-cell kanban-header-blue">Blue Activities</div>
          <div className="kanban-header-cell kanban-header-green">Green Activities</div>
          <div className="kanban-header-cell kanban-header-done">Done</div>
        </div>
        
        {/* Second row - Status subheaders */}
        <div className="kanban-subheader-row">
          <div className="kanban-subheader-cell kanban-subheader-empty"></div>
          <div className="kanban-subheader-cell kanban-subheader-active">Active</div>
          <div className="kanban-subheader-cell kanban-subheader-finished">Finished</div>
          <div className="kanban-subheader-cell kanban-subheader-active">Active</div>
          <div className="kanban-subheader-cell kanban-subheader-finished">Finished</div>
          <div className="kanban-subheader-cell kanban-subheader-empty"></div>
          <div className="kanban-subheader-cell kanban-subheader-empty"></div>
        </div>
        
        {/* Columns with cards */}
        <div className="kanban-columns">
          <Column 
            title="Options" 
            cards={optionsCards} 
            type="options"
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Red Active" 
            cards={redActiveCards} 
            type="red"
            status="active"
            showWorkButton={true}
            onWork={() => handleWork('red-active')}
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Red Finished" 
            cards={redFinishedCards} 
            type="red"
            status="finished"
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Blue Active" 
            cards={blueActiveCards} 
            type="blue"
            status="active"
            showWorkButton={true}
            onWork={() => handleWork('blue-active')}
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Blue Finished" 
            cards={blueFinishedCards} 
            type="blue"
            status="finished"
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Green" 
            cards={greenCards} 
            type="green"
            showWorkButton={true}
            onWork={() => handleWork('green')}
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
          <Column 
            title="Done" 
            cards={doneCards}
            onCardClick={handleCardClick}
            onWorkerDrop={handleWorkerDrop}
          />
        </div>
      </main>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
