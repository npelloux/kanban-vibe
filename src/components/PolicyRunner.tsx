import React, { useState } from 'react';

export type PolicyType = 'siloted-expert';

interface PolicyRunnerProps {
  onRunPolicy: (policyType: PolicyType, days: number) => void;
  isRunning: boolean;
  progress?: {
    currentDay: number;
    totalDays: number;
  };
  onCancel?: () => void;
}

export const PolicyRunner: React.FC<PolicyRunnerProps> = ({
  onRunPolicy,
  isRunning,
  progress,
  onCancel
}) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('siloted-expert');
  const [daysToRun, setDaysToRun] = useState<number>(10);

  const handlePolicyButtonClick = () => {
    if (!isRunning) {
      setShowOptions(!showOptions);
    }
  };

  const handleRunPolicy = () => {
    // Ensure days is a positive number
    const validDays = Math.max(1, daysToRun);
    
    onRunPolicy(selectedPolicy, validDays);
    setShowOptions(false);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDaysToRun(isNaN(value) ? 10 : value);
  };

  const getPolicyDescription = (policy: PolicyType): string => {
    switch (policy) {
      case 'siloted-expert':
        return 'Workers always work on cards in their own active color. Finished tasks move to the next column as soon as possible. Max WIP limits are respected at all times.';
      default:
        return '';
    }
  };

  const renderProgressBar = () => {
    if (!progress) return null;

    const { currentDay, totalDays } = progress;
    const percentage = Math.min(100, Math.round((currentDay / totalDays) * 100));

    return (
      <div className="policy-progress">
        <div className="progress-text">Day {currentDay} of {totalDays}</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="policy-runner">
      <button 
        className="policy-button" 
        onClick={handlePolicyButtonClick}
        disabled={isRunning}
        aria-label="Run policy"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>

      {isRunning && renderProgressBar()}

      {showOptions && !isRunning && (
        <div className="policy-options-dropdown">
          <div className="policy-options-content">
            <h3>Run Policy</h3>
            
            <div className="policy-type-selector">
              <label>
                <input 
                  type="radio" 
                  name="policy-type" 
                  value="siloted-expert"
                  checked={selectedPolicy === 'siloted-expert'}
                  onChange={() => setSelectedPolicy('siloted-expert')}
                />
                Siloted Expert
              </label>
              <p className="policy-description">
                {getPolicyDescription(selectedPolicy)}
              </p>
            </div>
            
            <div className="days-input">
              <label htmlFor="days-to-run">Days to run:</label>
              <input 
                id="days-to-run"
                type="number" 
                value={daysToRun} 
                onChange={handleDaysChange}
                min="1"
              />
            </div>
            
            <button className="run-policy-button" onClick={handleRunPolicy}>
              Run Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
