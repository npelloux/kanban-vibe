import React, { useState } from 'react'
import './App.css'
import { Column } from './components/Column'
import { NextDayButton } from './components/NextDayButton'

// Define the Card type
interface Card {
  id: string;
  content: string;
  stage: string;
}

// stagedone function to determine if a card should move to the next stage
const stagedone = (card: Card): boolean => {
  // For now, all cards in TODO will move to DONE
  return card.stage === 'TODO';
}

function App() {
  // Initialize cards with their stages
  const initialCards: Card[] = [
    {
      id: '1',
      content: 'Create a Kanban board',
      stage: 'TODO'
    },
    {
      id: '2',
      content: 'Set up project structure',
      stage: 'DONE'
    }
  ];

  // State to track all cards
  const [cards, setCards] = useState<Card[]>(initialCards);

  // Filter cards by stage
  const todoCards = cards.filter(card => card.stage === 'TODO');
  const doneCards = cards.filter(card => card.stage === 'DONE');

  // Handle Next Day button click
  const handleNextDay = () => {
    // Process each card and move it if stagedone returns true
    const updatedCards = cards.map(card => {
      if (stagedone(card)) {
        return { ...card, stage: 'DONE' };
      }
      return card;
    });
    
    setCards(updatedCards);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Vibe</h1>
      </header>
      <main className="kanban-board">
        <Column title="TODO" cards={todoCards} />
        <Column title="DONE" cards={doneCards} />
      </main>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={handleNextDay} />
      </div>
    </div>
  )
}

export default App
