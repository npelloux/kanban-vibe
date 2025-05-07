import React, { useRef } from 'react';

interface ContextActionsProps {
  onSaveContext: () => void;
  onImportContext: (file: File) => void;
}

export const ContextActions: React.FC<ContextActionsProps> = ({ onSaveContext, onImportContext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="context-actions">
      <button 
        className="context-button save-context-button" 
        onClick={onSaveContext}
      >
        Save Context
      </button>
      <label className="context-button import-context-button">
        Import Context
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onImportContext(e.target.files[0]);
              // Reset the input so the same file can be selected again if needed
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
        />
      </label>
    </div>
  );
};
