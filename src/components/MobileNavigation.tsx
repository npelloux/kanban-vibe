import React, { useState, useEffect, useCallback } from 'react';
import type { TabType } from './TabNavigation';

interface MobileNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentDay: number;
  onNextDay: () => void;
  onOpenWorkerPool?: () => void;
  isNextDayDisabled?: boolean;
}

const TAB_LABELS: Record<TabType, string> = {
  kanban: 'Kanban Board',
  cfd: 'Cumulative Flow',
  wip: 'WIP & Aging',
  metrics: 'Flow Metrics',
};

const TABS: TabType[] = ['kanban', 'cfd', 'wip', 'metrics'];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  currentDay,
  onNextDay,
  onOpenWorkerPool,
  isNextDayDisabled = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleTabSelect = (tab: TabType) => {
    onTabChange(tab);
    handleCloseMenu();
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseMenu();
      }
    },
    [handleCloseMenu]
  );

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-hamburger-button"
          onClick={handleOpenMenu}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="mobile-logo" data-testid="mobile-logo">
          <span className="mobile-logo-text">KV</span>
        </div>

        <div className="mobile-day-counter">
          <span className="mobile-day-label">Day</span>
          <span className="mobile-day-number">{currentDay}</span>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <button
            type="button"
            className="mobile-menu-overlay"
            data-testid="menu-overlay"
            aria-label="Close menu"
            onClick={handleCloseMenu}
          />
          <nav
            className="mobile-menu-drawer"
            role="navigation"
            aria-label="Mobile menu"
            onKeyDown={handleKeyDown}
          >
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={handleCloseMenu}
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mobile-menu-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`mobile-menu-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabSelect(tab)}
                  aria-label={TAB_LABELS[tab]}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}

      <nav className="mobile-bottom-nav" data-testid="bottom-nav">
        <button
          type="button"
          className="mobile-bottom-nav-button"
          onClick={onNextDay}
          disabled={isNextDayDisabled}
          aria-label="Next Day"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Next Day</span>
        </button>

        {onOpenWorkerPool && (
          <button
            type="button"
            className="mobile-bottom-nav-button"
            onClick={onOpenWorkerPool}
            aria-label="Workers"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Workers</span>
          </button>
        )}
      </nav>
    </>
  );
};
