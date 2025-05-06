import React from 'react'
import './App.css'
import { Column } from './components/Column'

function App() {
  const todoCards = [
    {
      id: '1',
      content: 'Create a Kanban board'
    }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Vibe</h1>
      </header>
      <main className="kanban-board">
        <Column title="TODO" cards={todoCards} />
      </main>
    </div>
  )
}

export default App
