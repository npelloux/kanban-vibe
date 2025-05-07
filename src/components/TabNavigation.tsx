import React from 'react';

export type TabType = 'kanban' | 'cfd' | 'wip' | 'metrics';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => onTabChange('kanban')}
        >
          Kanban Board
        </button>
        <button 
          className={`tab-button ${activeTab === 'cfd' ? 'active' : ''}`}
          onClick={() => onTabChange('cfd')}
        >
          Cumulative Flow
        </button>
        <button 
          className={`tab-button ${activeTab === 'wip' ? 'active' : ''}`}
          onClick={() => onTabChange('wip')}
        >
          WIP & Aging
        </button>
        <button 
          className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => onTabChange('metrics')}
        >
          Flow Metrics
        </button>
      </div>
    </div>
  );
};
