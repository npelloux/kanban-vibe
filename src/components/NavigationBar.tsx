import { useState, useRef } from 'react';
import { Logo } from './Logo';
import { PolicyRunner } from './PolicyRunner';
import { SaveIndicator, type SaveStatus } from './SaveIndicator';
import { ConfirmDialog } from './ConfirmDialog';
import type { TabType } from './TabNavigation';
import type { PolicyType } from './PolicyRunner';

interface NavigationBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentDay: number;
  onSaveContext: () => void;
  onImportContext: (file: File) => void;
  onRunPolicy?: (policyType: PolicyType, days: number) => void;
  isPolicyRunning?: boolean;
  policyProgress?: { currentDay: number; totalDays: number };
  onCancelPolicy?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  saveStatus?: SaveStatus;
  lastSavedAt?: Date;
  onResetBoard?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  currentDay,
  onSaveContext,
  onImportContext,
  onRunPolicy,
  isPolicyRunning = false,
  policyProgress,
  onCancelPolicy,
  onUndo,
  canUndo = false,
  onRedo,
  canRedo = false,
  saveStatus,
  lastSavedAt,
  onResetBoard,
}) => {
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportContext(e.target.files[0]);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Close the dropdown
      setShowImportDropdown(false);
    }
  };

  const handleResetClick = () => {
    setShowSaveDropdown(false);
    setShowResetConfirmDialog(true);
  };

  const handleResetConfirm = () => {
    setShowResetConfirmDialog(false);
    onResetBoard?.();
  };

  const handleResetCancel = () => {
    setShowResetConfirmDialog(false);
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        <div className="nav-logo">
          <Logo size="medium" />
          <span className="nav-version">v1.0.0</span>
        </div>
      </div>
      
      <div className="nav-center">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => onTabChange('kanban')}
          >
            Kanban Board
          </button>
          <button 
            className={`nav-tab ${activeTab === 'cfd' ? 'active' : ''}`}
            onClick={() => onTabChange('cfd')}
          >
            Cumulative Flow
          </button>
          <button 
            className={`nav-tab ${activeTab === 'wip' ? 'active' : ''}`}
            onClick={() => onTabChange('wip')}
          >
            WIP & Aging
          </button>
          <button 
            className={`nav-tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => onTabChange('metrics')}
          >
            Flow Metrics
          </button>
        </div>
      </div>
      
      <div className="nav-right">
        <div className="nav-actions">
          {onUndo && (
            <button
              className="nav-action-button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <title>Undo</title>
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
              </svg>
            </button>
          )}
          {onRedo && (
            <button
              className="nav-action-button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <title>Redo</title>
                <path d="M21 7v6h-6"></path>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
              </svg>
            </button>
          )}
          <div className="dropdown-container">
            <button
              className="nav-action-button"
              onClick={() => {
                setShowSaveDropdown(!showSaveDropdown);
                setShowImportDropdown(false);
              }}
              aria-label="Save options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </button>
            {showSaveDropdown && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    onSaveContext();
                    setShowSaveDropdown(false);
                  }}
                >
                  Save Context
                </button>
                {onResetBoard && (
                  <button
                    type="button"
                    className="dropdown-item dropdown-item--destructive"
                    onClick={handleResetClick}
                  >
                    Reset Board
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="dropdown-container">
            <button 
              className="nav-action-button" 
              onClick={() => {
                setShowImportDropdown(!showImportDropdown);
                setShowSaveDropdown(false);
              }}
              aria-label="Import options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </button>
            {showImportDropdown && (
              <div className="dropdown-menu">
                <label className="dropdown-item">
                  Import Context
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
          
          {onRunPolicy && (
            <PolicyRunner
              onRunPolicy={onRunPolicy}
              isRunning={isPolicyRunning}
              progress={policyProgress}
              onCancel={onCancelPolicy}
            />
          )}
        </div>
        
        {saveStatus && (
          <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
        )}

        <div className="day-counter">
          <span className="day-label">Day</span>
          <span className="day-number" data-testid="day-counter">{currentDay}</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirmDialog}
        title="Reset Board?"
        message="This will clear all cards and reset the board to its initial state. This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
      />
    </nav>
  );
};
