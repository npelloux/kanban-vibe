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
import { WipLimitEditor } from './components/WipLimitEditor'
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
  const [wipLimits, setWipLimits] = useState({
    options: { min: 0, max: 0 },
    redActive: { min: 0, max: 0 },
    redFinished: { min: 0, max: 0 },
    blueActive: { min: 0, max: 0 },
    blueFinished: { min: 0, max: 0 },
    green: { min: 0, max: 0 },
    done: { min: 0, max: 0 }
  });
  
  // Function to update WIP limits for a specific column
  const handleWipLimitUpdate = (column: keyof typeof wipLimits, min: number, max: number) => {
    setWipLimits(prevLimits => ({
      ...prevLimits,
      [column]: { min, max }
    }));
  };
  
  // Map stage to column key
  const getColumnKey = (stage: string): keyof typeof wipLimits => {
    if (stage === 'options') return 'options';
    if (stage === 'red-active') return 'redActive';
    if (stage === 'red-finished') return 'redFinished';
    if (stage === 'blue-active') return 'blueActive';
    if (stage === 'blue-finished') return 'blueFinished';
    if (stage === 'green') return 'green';
    if (stage === 'done') return 'done';
    return 'options'; // Default fallback
  };

  // Check if moving a card to a column would exceed the max WIP limit
  const wouldExceedWipLimit = (targetStage: string): boolean => {
    const columnKey = getColumnKey(targetStage);
    const maxWip = wipLimits[columnKey].max;
    
    // If max WIP is 0, there is no constraint
    if (maxWip === 0) return false;
    
    // Count cards in the target column
    const cardsInColumn = cards.filter(card => card.stage === targetStage).length;
    
    // Check if adding one more card would exceed the limit
    return cardsInColumn >= maxWip;
  };
  
  // Check if moving a card out of a column would violate the min WIP limit
  const wouldViolateMinWipLimit = (sourceStage: string): boolean => {
    const columnKey = getColumnKey(sourceStage);
    const minWip = wipLimits[columnKey].min;
    
    // If min WIP is 0, there is no constraint
    if (minWip === 0) return false;
    
    // Count cards in the source column
    const cardsInColumn = cards.filter(card => card.stage === sourceStage).length;
    
    // Check if removing one card would violate the min limit
    return cardsInColumn <= minWip;
  };
  
  // Initialize workers
  const initialWorkers: Worker[] = [
    { id: '1', type: 'red' },
    { id: '3', type: 'blue' },
    { id: '4', type: 'blue' },
    { id: '5', type: 'green' }
  ];
  
  // State to track workers
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  
  // Generate a unique worker ID
  const generateWorkerId = (): string => {
    // Find the highest numeric ID
    const numericIds = workers
      .map(worker => parseInt(worker.id))
      .filter(id => !isNaN(id))
      .sort((a, b) => b - a);
    
    // If no numeric IDs, start with 1
    if (numericIds.length === 0) {
      return '1';
    }
    
    // Return the next ID
    return (numericIds[0] + 1).toString();
  };
  
  // Handle adding a new worker
  const handleAddWorker = (type: WorkerType) => {
    const newWorkerId = generateWorkerId();
    const newWorker: Worker = {
      id: newWorkerId,
      type
    };
    
    setWorkers(prevWorkers => [...prevWorkers, newWorker]);
  };
  
  // Handle deleting a worker
  const handleDeleteWorker = (workerId: string) => {
    // First, remove the worker from any cards it's assigned to
    const updatedCards = cards.map(card => {
      if (card.assignedWorkers.some(worker => worker.id === workerId)) {
        return {
          ...card,
          assignedWorkers: card.assignedWorkers.filter(worker => worker.id !== workerId)
        };
      }
      return card;
    });
    
    // Then remove the worker from the workers array
    setWorkers(prevWorkers => prevWorkers.filter(worker => worker.id !== workerId));
    
    // Update cards
    setCards(updatedCards);
    
    // If the deleted worker was selected, clear the selection
    if (selectedWorkerId === workerId) {
      setSelectedWorkerId(null);
    }
  };
  
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
    // and the WIP limits are not violated
    const updatedCards = cardsWithWorkerOutput.map(card => {
      if (stagedone(card)) {
        // Check if moving the card out would violate min WIP limit
        if (wouldViolateMinWipLimit(card.stage)) {
          console.log(`Cannot move card ${card.id} out of ${card.stage}: Min WIP limit would be violated.`);
          return card;
        }
        
        if (card.stage === 'red-active') {
          // Check if moving to red-finished would exceed max WIP limit
          if (wouldExceedWipLimit('red-finished')) {
            console.log(`Cannot move card ${card.id} to Red Finished: Max WIP limit would be exceeded.`);
            return card;
          }
          return { ...card, stage: 'red-finished' };
        } else if (card.stage === 'red-finished') {
          // Check if moving to blue-active would exceed max WIP limit
          if (wouldExceedWipLimit('blue-active')) {
            console.log(`Cannot move card ${card.id} to Blue Active: Max WIP limit would be exceeded.`);
            return card;
          }
          return { ...card, stage: 'blue-active' };
        } else if (card.stage === 'blue-active') {
          // Check if moving to blue-finished would exceed max WIP limit
          if (wouldExceedWipLimit('blue-finished')) {
            console.log(`Cannot move card ${card.id} to Blue Finished: Max WIP limit would be exceeded.`);
            return card;
          }
          return { ...card, stage: 'blue-finished' };
        } else if (card.stage === 'blue-finished') {
          // Check if moving to green would exceed max WIP limit
          if (wouldExceedWipLimit('green')) {
            console.log(`Cannot move card ${card.id} to Green Activities: Max WIP limit would be exceeded.`);
            return card;
          }
          return { ...card, stage: 'green' };
        } else if (card.stage === 'green') {
          // Check if moving to done would exceed max WIP limit
          if (wouldExceedWipLimit('done')) {
            console.log(`Cannot move card ${card.id} to Done: Max WIP limit would be exceeded.`);
            return card;
          }
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
      // Check if moving to red-active would exceed max WIP limit
      if (wouldExceedWipLimit('red-active')) {
        alert(`Cannot move card to Red Active: Max WIP limit of ${wipLimits.redActive.max} would be exceeded.`);
        return;
      }
      
      // Check if moving out of options would violate min WIP limit
      if (wouldViolateMinWipLimit('options')) {
        alert(`Cannot move card out of Options: Min WIP limit of ${wipLimits.options.min} would be violated.`);
        return;
      }
      
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
      // Check if moving to blue-active would exceed max WIP limit
      if (wouldExceedWipLimit('blue-active')) {
        alert(`Cannot move card to Blue Active: Max WIP limit of ${wipLimits.blueActive.max} would be exceeded.`);
        return;
      }
      
      // Check if moving out of red-finished would violate min WIP limit
      if (wouldViolateMinWipLimit('red-finished')) {
        alert(`Cannot move card out of Red Finished: Min WIP limit of ${wipLimits.redFinished.min} would be violated.`);
        return;
      }
      
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
      // Check if moving to green would exceed max WIP limit
      if (wouldExceedWipLimit('green')) {
        alert(`Cannot move card to Green Activities: Max WIP limit of ${wipLimits.green.max} would be exceeded.`);
        return;
      }
      
      // Check if moving out of blue-finished would violate min WIP limit
      if (wouldViolateMinWipLimit('blue-finished')) {
        alert(`Cannot move card out of Blue Finished: Min WIP limit of ${wipLimits.blueFinished.min} would be violated.`);
        return;
      }
      
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
                <WipLimitEditor 
                  min={wipLimits.options.min} 
                  max={wipLimits.options.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('options', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-active">
                <WipLimitEditor 
                  min={wipLimits.redActive.min} 
                  max={wipLimits.redActive.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('redActive', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-finished">
                <WipLimitEditor 
                  min={wipLimits.redFinished.min} 
                  max={wipLimits.redFinished.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('redFinished', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-active">
                <WipLimitEditor 
                  min={wipLimits.blueActive.min} 
                  max={wipLimits.blueActive.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('blueActive', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-finished">
                <WipLimitEditor 
                  min={wipLimits.blueFinished.min} 
                  max={wipLimits.blueFinished.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('blueFinished', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-empty">
                <WipLimitEditor 
                  min={wipLimits.green.min} 
                  max={wipLimits.green.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('green', min, max)} 
                />
              </div>
              <div className="kanban-subheader-cell kanban-subheader-empty">
                <WipLimitEditor 
                  min={wipLimits.done.min} 
                  max={wipLimits.done.max} 
                  onUpdate={(min, max) => handleWipLimitUpdate('done', min, max)} 
                />
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
        onAddWorker={handleAddWorker}
        onDeleteWorker={handleDeleteWorker}
      />
      
      {renderContent()}
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
