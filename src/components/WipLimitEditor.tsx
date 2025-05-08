import React, { useState } from 'react';

interface WipLimitEditorProps {
  min: number;
  max: number;
  onUpdate: (min: number, max: number) => void;
}

export const WipLimitEditor: React.FC<WipLimitEditorProps> = ({ min, max, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMinValue(isNaN(value) ? 0 : value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxValue(isNaN(value) ? 0 : value);
  };

  const handleSave = () => {
    onUpdate(minValue, maxValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMinValue(min);
    setMaxValue(max);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="wip-limit-editor">
        <div className="wip-limit-inputs">
          <div className="wip-limit-input-group">
            <label htmlFor="min-wip">Min:</label>
            <input
              id="min-wip"
              type="number"
              min="0"
              value={minValue}
              onChange={handleMinChange}
              className="wip-limit-input"
            />
          </div>
          <div className="wip-limit-input-group">
            <label htmlFor="max-wip">Max:</label>
            <input
              id="max-wip"
              type="number"
              min="0"
              value={maxValue}
              onChange={handleMaxChange}
              className="wip-limit-input"
            />
          </div>
        </div>
        <div className="wip-limit-actions">
          <button onClick={handleSave} className="wip-limit-save">✓</button>
          <button onClick={handleCancel} className="wip-limit-cancel">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wip-limit-container" onClick={() => setIsEditing(true)}>
      <div className="wip-limit-label">Min: {min}</div>
      <div className="wip-limit-label">Max: {max}</div>
      <div className="wip-limit-edit-hint">(Click to edit)</div>
    </div>
  );
};
