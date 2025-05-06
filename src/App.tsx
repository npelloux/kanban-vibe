import { useState } from 'react'
import './App.css'
import { Column } from './components/Column'
import { NextDayButton } from './components/NextDayButton'

// Define the Card type
interface Card {
  id: string;
  content: string;
  stage: string;
  age: number;
  startDay: number;
  isBlocked: boolean;
  workItems: {
    total: number;
    completed: number;
    color: string;
  };
}

// stagedone function to determine if a card should move to the next stage
const stagedone = (card: Card): boolean => {
  // A card can move to the next stage if it's not blocked and all work is completed
  return !card.isBlocked && card.workItems.completed >= card.workItems.total;
}

function App() {
  // Initialize with day 1
  const [currentDay, setCurrentDay] = useState<number>(1);
  
  // Initialize cards with their stages
  const initialCards: Card[] = [
    {
      id: 'A',
      content: 'Create a Kanban board',
      stage: 'TODO',
      age: 0,
      startDay: 1,
      isBlocked: false,
      workItems: {
        total: 6,
        completed: 0,
        color: 'red'
      }
    },
    {
      id: 'B',
      content: 'Set up project structure',
      stage: 'dev',
      age: 2,
      startDay: 1,
      isBlocked: false,
      workItems: {
        total: 8,
        completed: 4,
        color: 'blue'
      }
    },
    {
      id: 'C',
      content: 'Initial repository setup',
      stage: 'DONE',
      age: 3,
      startDay: 1,
      isBlocked: false,
      workItems: {
        total: 5,
        completed: 5,
        color: 'green'
      }
    }
  ];

  // State to track all cards
  const [cards, setCards] = useState<Card[]>(initialCards);

  // Filter cards by stage
  const todoCards = cards.filter(card => card.stage === 'TODO');
  const devCards = cards.filter(card => card.stage === 'dev');
  const doneCards = cards.filter(card => card.stage === 'DONE');

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
        if (card.stage === 'TODO') {
          return { ...card, stage: 'dev' };
        } else if (card.stage === 'dev') {
          return { ...card, stage: 'DONE' };
        }
      }
      return card;
    });
    
    setCards(updatedCards);
  };

  // Handle Work button click for dev column
  const handleDevWork = () => {
    const updatedCards = cards.map(card => {
      if (card.stage === 'dev' && !card.isBlocked && card.workItems.completed < card.workItems.total) {
        // Do some work (increment completed work items)
        return {
          ...card,
          workItems: {
            ...card.workItems,
            completed: Math.min(card.workItems.completed + 1, card.workItems.total)
          }
        };
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
      <main className="kanban-board">
        <Column title="TODO" cards={todoCards} />
        <Column 
          title="dev" 
          cards={devCards} 
          onWork={handleDevWork}
        />
        <Column title="DONE" cards={doneCards} />
      </main>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
