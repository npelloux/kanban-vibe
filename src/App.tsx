import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Column } from './components/Column';
import { NextDayButton } from './components/NextDayButton';
import { ConnectedWorkerPool } from './components/ConnectedWorkerPool';
import { CumulativeFlowDiagram } from './components/CumulativeFlowDiagram';
import { WipAgingDiagram } from './components/WipAgingDiagram';
import { FlowMetrics } from './components/FlowMetrics';
import { NavigationBar } from './components/NavigationBar';
import type { TabType } from './components/TabNavigation';
import { BoardProvider, useBoardContext } from './simulation/api/board-context';
import { useKanbanBoard } from './simulation/api/use-kanban-board';
import { useSimulationControls } from './simulation/api/use-simulation';
import { useWorkerManagement } from './simulation/api/use-workers';
import { Board } from './simulation/domain/board/board';
import type { Stage } from './simulation/domain/card/card';
import { exportBoard, importBoard } from './simulation/infra/json-export';

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

function AppContent() {
  const { board, updateBoard } = useBoardContext();
  const { cardsInStage, moveCard, addCard, toggleBlock, assignWorker } = useKanbanBoard();
  const { currentDay, advanceDay, runPolicy, cancelPolicy, isRunning, policyProgress } = useSimulationControls();
  const { selectedWorkerId, selectWorker } = useWorkerManagement();

  const [activeTab, setActiveTab] = useState<TabType>('kanban');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Track historical data when day changes
  useEffect(() => {
    const newEntry: HistoricalData = {
      day: currentDay,
      columnData: {
        options: Board.getCardCountByStage(board, 'options'),
        redActive: Board.getCardCountByStage(board, 'red-active'),
        redFinished: Board.getCardCountByStage(board, 'red-finished'),
        blueActive: Board.getCardCountByStage(board, 'blue-active'),
        blueFinished: Board.getCardCountByStage(board, 'blue-finished'),
        green: Board.getCardCountByStage(board, 'green'),
        done: Board.getCardCountByStage(board, 'done'),
      },
    };
    setHistoricalData((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].day !== currentDay) {
        return [...prev, newEntry];
      }
      return prev;
    });
  }, [currentDay, board]);

  const handleCardClick = (cardId: string) => {
    if (selectedWorkerId) {
      assignWorker(cardId, selectedWorkerId);
      selectWorker(null);
    } else {
      moveCard(cardId);
    }
  };

  const handleSaveContext = useCallback(() => {
    const blob = exportBoard(board);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-context-day-${currentDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [board, currentDay]);

  const handleImportContext = useCallback(async (file: File) => {
    const result = await importBoard(file);
    if (result.success) {
      updateBoard(() => result.value);
    }
  }, [updateBoard]);

  const getCardsForStage = (stage: Stage) => cardsInStage(stage);

  const renderKanbanBoard = () => (
    <div className="kanban-board">
      <Column title="Options" cards={getCardsForStage('options')} type="options" status="active" showAddCardButton onAddCard={addCard} onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Red Active" cards={getCardsForStage('red-active')} type="red" status="active" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Red Finished" cards={getCardsForStage('red-finished')} type="red" status="finished" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Blue Active" cards={getCardsForStage('blue-active')} type="blue" status="active" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Blue Finished" cards={getCardsForStage('blue-finished')} type="blue" status="finished" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Green Activities" cards={getCardsForStage('green')} type="green" status="active" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
      <Column title="Done" cards={getCardsForStage('done')} type="green" status="finished" onCardClick={handleCardClick} onToggleBlock={toggleBlock} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'kanban': return renderKanbanBoard();
      case 'cfd': return <CumulativeFlowDiagram historicalData={historicalData} />;
      case 'wip': return <WipAgingDiagram cards={[...board.cards]} currentDay={currentDay} />;
      case 'metrics': return <FlowMetrics cards={[...board.cards]} currentDay={currentDay} historicalData={historicalData} />;
      case 'settings': return <div>WIP Settings (use Settings tab in NavigationBar)</div>;
      default: return renderKanbanBoard();
    }
  };

  return (
    <div className="app">
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} currentDay={currentDay} onSaveContext={handleSaveContext} onImportContext={handleImportContext} onRunPolicy={(_, days) => runPolicy(days)} isPolicyRunning={isRunning} policyProgress={policyProgress ? { currentDay: policyProgress, totalDays: 0 } : undefined} onCancelPolicy={cancelPolicy} />
      <ConnectedWorkerPool />
      {renderContent()}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <NextDayButton onClick={advanceDay} disabled={isRunning} />
      </div>
    </div>
  );
}

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
