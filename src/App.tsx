import { useState, useEffect } from 'react'
import './App.css'
import { Column } from './components/Column'
import { NextDayButton } from './components/NextDayButton'
import { WorkerPool } from './components/WorkerPool'
import { CumulativeFlowDiagram } from './components/CumulativeFlowDiagram'
import { WipAgingDiagram } from './components/WipAgingDiagram'
import { FlowMetrics } from './components/FlowMetrics'
import { TabNavigation } from './components/TabNavigation'
import { ContextActions } from './components/ContextActions'
import type { TabType } from './components/TabNavigation'
import type { WorkItemsType } from './components/Card'
import type { WorkerType } from './components/Worker'

// Generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random job title
const generateRandomJobTitle = (): string => {
  const actions = ['Create', 'Implement', 'Design', 'Develop', 'Test', 'Refactor', 'Optimize', 'Fix', 'Update', 'Add'];
  const subjects = ['user interface', 'authentication', 'database', 'API', 'dashboard', 'reporting', 'search functionality', 
                   'payment system', 'notification system', 'user profile', 'settings page', 'analytics', 'integration',
                   'documentation', 'error handling', 'performance', 'security', 'accessibility', 'mobile view'];
  
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  
  return `${randomAction} ${randomSubject}`;
};

// Generate a random card ID (next letter in sequence)
const generateNextCardId = (existingCards: Card[]): string => {
  // Find the highest letter ID
  const letterIds = existingCards
    .map(card => card.id)
    .filter(id => /^[A-Z]$/.test(id)) // Only single uppercase letters
    .sort();
  
  if (letterIds.length === 0) {
    return 'A';
  }
  
  const lastLetterId = letterIds[letterIds.length - 1];
  const nextCharCode = lastLetterId.charCodeAt(0) + 1;
  
  // If we've gone beyond 'Z', start with double letters
  if (nextCharCode > 90) {
    return 'AA';
  }
  
  return String.fromCharCode(nextCharCode);
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
  assignedWorkers: {
    id: string;
    type: WorkerType;
  }[];
  completionDay?: number;
}

// Define the Worker type
interface Worker {
  id: string;
  type: WorkerType;
}

// stagedone function to determine if a card should move to the next stage
const stagedone = (card: Card): boolean => {
  // Check if card is blocked
  if (card.isBlocked) {
    return false;
  }
  
  // For red-active stage, check if the red work is completed
  if (card.stage === 'red-active') {
    return card.workItems.red.total > 0 && 
           card.workItems.red.completed >= card.workItems.red.total;
  } 
  // For red-finished stage, ensure red work is completed before moving to blue-active
  else if (card.stage === 'red-finished') {
    return card.workItems.red.total > 0 && 
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For blue-active stage, check if the blue work is completed
  // Also ensure all red work is completed (requirement for blue activities)
  else if (card.stage === 'blue-active') {
    return card.workItems.blue.total > 0 && 
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  } 
  // For blue-finished stage, ensure blue and red work is completed before moving to green
  else if (card.stage === 'blue-finished') {
    return card.workItems.blue.total > 0 && 
           card.workItems.blue.completed >= card.workItems.blue.total &&
           card.workItems.red.completed >= card.workItems.red.total;
  }
  // For green stage, check if the green work is completed
  // Also ensure all red and blue work is completed (requirement for green activities)
  else if (card.stage === 'green') {
    return card.workItems.green.total > 0 && 
           card.workItems.green.completed >= card.workItems.green.total &&
           card.workItems.red.completed >= card.workItems.red.total &&
           card.workItems.blue.completed >= card.workItems.blue.total;
  }
  
  // For other stages (like options or done), check if all work is completed
  const totalWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.total, 
    0
  );
  
  const completedWorkItems = Object.values(card.workItems).reduce(
    (sum, items) => sum + items.completed, 
    0
  );
  
  return totalWorkItems > 0 && completedWorkItems >= totalWorkItems;
}

// Define the historical data type for the cumulative flow diagram
interface HistoricalData {
  day: number;
  columnData: {
    options: number;
    redActive: number;
    redFinished: number;
    blueActive: number;
    blueFinished: number;
    green: number;
    done: number;
  };
}

// Define the application state interface for saving/loading context
interface KanbanState {
  currentDay: number;
  cards: Card[];
  workers: Worker[];
  wipLimits: {
    options: { min: number; max: number };
    redActive: { min: number; max: number };
    redFinished: { min: number; max: number };
    blueActive: { min: number; max: number };
    blueFinished: { min: number; max: number };
    green: { min: number; max: number };
    done: { min: number; max: number };
  };
  historicalData: HistoricalData[];
}

function App() {
  // Initialize with day 0
  const [currentDay, setCurrentDay] = useState<number>(0);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('kanban');
  
  // State for historical data
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  
  // State for WIP limits
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [wipLimits, setWipLimits] = useState({
    options: { min: 0, max: 0 },
    redActive: { min: 0, max: 0 },
    redFinished: { min: 0, max: 0 },
    blueActive: { min: 0, max: 0 },
    blueFinished: { min: 0, max: 0 },
    green: { min: 0, max: 0 },
    done: { min: 0, max: 0 }
  });
  
  // Initialize workers
  const initialWorkers: Worker[] = [
    { id: '1', type: 'red' },
    { id: '3', type: 'blue' },
    { id: '4', type: 'blue' },
    { id: '5', type: 'green' }
  ];
  
  // State to track workers
  const [workers] = useState<Worker[]>(initialWorkers);
  
  // State to track selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  
  // Initialize with no cards
  const initialCards: Card[] = [];

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
    
  // Increment age for all cards except those in the 'options' or 'done' columns
  const agedCards = cards.map(card => ({
    ...card,
    age: (card.stage === 'done' || card.stage === 'options') ? card.age : card.age + 1
  }));
    
    // Apply worker output rules to cards with assigned workers
    const cardsWithWorkerOutput = agedCards.map(card => {
      if (!card.assignedWorkers.length || !card.stage.includes('active') && card.stage !== 'green') {
        return card;
      }
      
      const updatedWorkItems = { ...card.workItems };
      const columnColor = card.stage.includes('red') ? 'red' : 
                          card.stage.includes('blue') ? 'blue' : 'green';
      
      // Process each assigned worker
      card.assignedWorkers.forEach(worker => {
        const workerType = worker.type;
        
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
      });
      
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
      assignedWorkers: []
    }));
    
    setCards(resetWorkerCards);
    setSelectedWorkerId(null);
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
      if (card.assignedWorkers.some(worker => worker.id === workerId)) {
        return { 
          ...card, 
          assignedWorkers: card.assignedWorkers.filter(worker => worker.id !== workerId) 
        };
      }
      
      // Assign worker to the target card (up to 3 workers)
      if (card.id === cardId) {
        // Only add if there are fewer than 3 workers and the worker isn't already assigned
        if (card.assignedWorkers.length < 3 && !card.assignedWorkers.some(worker => worker.id === workerId)) {
          return { 
            ...card, 
            assignedWorkers: [...card.assignedWorkers, selectedWorker] 
          };
        }
      }
      
      return card;
    });
    
    setCards(updatedCards);
    setSelectedWorkerId(null); // Clear selection after drop
  };

  // Handle adding a new random card to the options column
  const handleAddCard = () => {
    console.log('Add Card button clicked');
    
    // Generate a new card ID
    const newCardId = generateNextCardId(cards);
    console.log('Generated new card ID:', newCardId);
    
    // Create a new card with random work items
    const newCard: Card = {
      id: newCardId,
      content: generateRandomJobTitle(),
      stage: 'options',
      age: 0,
      startDay: currentDay,
      isBlocked: false,
      workItems: {
        red: { total: getRandomInt(1, 10), completed: 0 },
        blue: { total: getRandomInt(1, 10), completed: 0 },
        green: { total: getRandomInt(1, 10), completed: 0 }
      },
      assignedWorkers: []
    };
    
    console.log('Created new card:', newCard);
    
    // Add the new card to the cards array
    setCards(prevCards => {
      console.log('Previous cards:', prevCards);
      const updatedCards = [...prevCards, newCard];
      console.log('Updated cards:', updatedCards);
      return updatedCards;
    });
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

  // Update historical data when cards change
  useEffect(() => {
    // Create a new data point for the current day
    const newDataPoint: HistoricalData = {
      day: currentDay,
      columnData: {
        options: optionsCards.length,
        redActive: redActiveCards.length,
        redFinished: redFinishedCards.length,
        blueActive: blueActiveCards.length,
        blueFinished: blueFinishedCards.length,
        green: greenCards.length,
        done: doneCards.length
      }
    };
    
    // Check if we already have data for this day
    const existingDataIndex = historicalData.findIndex(data => data.day === currentDay);
    
    if (existingDataIndex >= 0) {
      // Update existing data point
      const updatedHistoricalData = [...historicalData];
      updatedHistoricalData[existingDataIndex] = newDataPoint;
      setHistoricalData(updatedHistoricalData);
    } else {
      // Add new data point
      setHistoricalData(prevData => [...prevData, newDataPoint]);
    }
  }, [currentDay, optionsCards.length, redActiveCards.length, redFinishedCards.length, 
      blueActiveCards.length, blueFinishedCards.length, greenCards.length, doneCards.length]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // Handle saving the current context to a JSON file
  const handleSaveContext = () => {
    // Create a state object with all the data we want to save
    const state: KanbanState = {
      currentDay,
      cards,
      workers,
      wipLimits,
      historicalData
    };
    
    // Convert the state to a JSON string
    const jsonString = JSON.stringify(state, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-vibe-state-day-${currentDay}.json`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle importing context from a JSON file
  const handleImportContext = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target && typeof event.target.result === 'string') {
          // Parse the JSON data
          const importedState: KanbanState = JSON.parse(event.target.result);
          
          // Update the application state with the imported data
          setCurrentDay(importedState.currentDay);
          setCards(importedState.cards);
          // We don't update workers as they are fixed in this application
          setWipLimits(importedState.wipLimits);
          setHistoricalData(importedState.historicalData);
          
          console.log('Context imported successfully');
        }
      } catch (error) {
        console.error('Error importing context:', error);
        alert('Error importing context. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file. Please try again.');
    };
    
    // Read the file as text
    reader.readAsText(file);
  };

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'kanban':
        return (
          <main className="kanban-board">
            {/* First row - Activity type headers */}
            <div className="kanban-header-row">
              <div className="kanban-header-cell kanban-header-options">Options</div>
              <div className="kanban-header-cell kanban-header-red">Red Activities</div>
              <div className="kanban-header-cell kanban-header-blue">Blue Activities</div>
              <div className="kanban-header-cell kanban-header-green">Green Activities</div>
              <div className="kanban-header-cell kanban-header-done">Done</div>
            </div>
            
            {/* Second row - WIP Limits */}
            <div className="kanban-subheader-row">
              <div className="kanban-subheader-cell kanban-subheader-empty">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.options.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.options.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-active">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.redActive.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.redActive.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-finished">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.redFinished.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.redFinished.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-active">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.blueActive.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.blueActive.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-finished">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.blueFinished.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.blueFinished.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-empty">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.green.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.green.max}</div>
                </div>
              </div>
              <div className="kanban-subheader-cell kanban-subheader-empty">
                <div className="wip-limit-container">
                  <div className="wip-limit-label">Min: {wipLimits.done.min}</div>
                  <div className="wip-limit-label">Max: {wipLimits.done.max}</div>
                </div>
              </div>
            </div>
            
            {/* Columns with cards */}
            <div className="kanban-columns">
              <Column 
                title="Options" 
                cards={optionsCards} 
                type="options"
                showAddCardButton={true}
                onAddCard={handleAddCard}
                onCardClick={handleCardClick}
                onWorkerDrop={handleWorkerDrop}
              />
              <Column 
                title="Red Active" 
                cards={redActiveCards} 
                type="red"
                status="active"
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
                title="Green Activities" 
                cards={greenCards} 
                type="green"
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
        );
      case 'cfd':
        return (
          <div className="cumulative-flow-diagram-container">
            <CumulativeFlowDiagram historicalData={historicalData} />
          </div>
        );
      case 'wip':
        return (
          <div className="wip-aging-container">
            <WipAgingDiagram cards={cards} currentDay={currentDay} />
          </div>
        );
      case 'metrics':
        return (
          <div className="flow-metrics-container">
            <FlowMetrics cards={cards} currentDay={currentDay} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Vibe</h1>
        <div className="day-counter">Day {currentDay}</div>
      </header>
      
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <ContextActions 
        onSaveContext={handleSaveContext}
        onImportContext={handleImportContext}
      />
      
      <WorkerPool 
        workers={workers} 
        selectedWorkerId={selectedWorkerId} 
        onWorkerSelect={handleWorkerSelect} 
      />
      
      {renderContent()}
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
