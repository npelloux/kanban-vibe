import { useState, useRef } from 'react';
import { Logo } from './Logo';
import { PolicyRunner } from './PolicyRunner';
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
  onCancelPolicy
}) => {
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
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
  
  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        <div className="nav-logo">
          <Logo size="medium" />
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
                  className="dropdown-item"
                  onClick={() => {
                    onSaveContext();
                    setShowSaveDropdown(false);
                  }}
                >
                  Save Context
                </button>
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
        
        <div className="day-counter">
          <span className="day-label">Day</span>
          <span className="day-number" data-testid="day-counter">{currentDay}</span>
        </div>
      </div>
    </nav>
  );
};
