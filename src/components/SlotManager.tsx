import { useEffect, useId, useRef, useState } from 'react';
import type { SlotInfo, SlotNumber } from '../simulation/infra/state-repository';
import { formatRelativeTime } from './time-formatting/format-relative-time';

interface SlotManagerProps {
  isOpen: boolean;
  slots: [SlotInfo | null, SlotInfo | null, SlotInfo | null];
  onSave: (slot: SlotNumber, name: string) => void;
  onLoad: (slot: SlotNumber) => void;
  onDelete: (slot: SlotNumber) => void;
  onRename: (slot: SlotNumber, newName: string) => void;
  onClose: () => void;
}

type ConfirmAction = {
  type: 'overwrite' | 'delete';
  slot: SlotNumber;
  name: string;
};

function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
}

export const SlotManager: React.FC<SlotManagerProps> = ({
  isOpen,
  slots,
  onSave,
  onLoad,
  onDelete,
  onRename,
  onClose,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [editingSlot, setEditingSlot] = useState<SlotNumber | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmAction) {
          setConfirmAction(null);
        } else if (editingSlot !== null) {
          setEditingSlot(null);
        } else {
          onCloseRef.current();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, confirmAction, editingSlot]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveClick = (slotNumber: SlotNumber) => {
    const slot = slots[slotNumber - 1];
    if (slot) {
      setConfirmAction({ type: 'overwrite', slot: slotNumber, name: slot.name });
    } else {
      onSave(slotNumber, `Slot ${slotNumber}`);
    }
  };

  const handleDeleteClick = (slotNumber: SlotNumber) => {
    const slot = slots[slotNumber - 1];
    if (slot) {
      setConfirmAction({ type: 'delete', slot: slotNumber, name: slot.name });
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'overwrite') {
      onSave(confirmAction.slot, confirmAction.name);
    } else if (confirmAction.type === 'delete') {
      onDelete(confirmAction.slot);
    }
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  const handleEditStart = (slotNumber: SlotNumber) => {
    const slot = slots[slotNumber - 1];
    if (slot) {
      setEditingSlot(slotNumber);
      setEditValue(slot.name);
    }
  };

  const handleEditSubmit = () => {
    if (editingSlot !== null && editValue.trim()) {
      onRename(editingSlot, editValue.trim());
    }
    setEditingSlot(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingSlot(null);
      setEditValue('');
    }
  };

  const renderSlot = (slotNumber: SlotNumber) => {
    const slot = slots[slotNumber - 1];
    const isEmpty = slot === null;
    const isEditing = editingSlot === slotNumber;

    return (
      <div key={slotNumber} className="slot-manager__slot">
        <div className="slot-manager__slot-header">
          {isEditing ? (
            <input
              type="text"
              className="slot-manager__slot-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              autoFocus
            />
          ) : (
            <>
              <span
                className="slot-manager__slot-name"
                title={slot?.name ?? `Slot ${slotNumber}`}
              >
                {isEmpty ? `Slot ${slotNumber}` : truncateName(slot.name)}
              </span>
              {!isEmpty && (
                <button
                  type="button"
                  className="slot-manager__edit-button"
                  onClick={() => handleEditStart(slotNumber)}
                  aria-label="Edit slot name"
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>
        <div className="slot-manager__slot-info">
          {isEmpty ? (
            <span className="slot-manager__empty-label">Empty</span>
          ) : (
            <span className="slot-manager__saved-at">
              {formatRelativeTime(slot.savedAt)}
            </span>
          )}
        </div>
        <div className="slot-manager__slot-actions">
          <button
            type="button"
            className="slot-manager__action-button"
            onClick={() => handleSaveClick(slotNumber)}
          >
            Save
          </button>
          <button
            type="button"
            className="slot-manager__action-button"
            onClick={() => onLoad(slotNumber)}
            disabled={isEmpty}
          >
            Load
          </button>
          {!isEmpty && (
            <button
              type="button"
              className="slot-manager__action-button slot-manager__action-button--delete"
              onClick={() => handleDeleteClick(slotNumber)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="slot-manager__backdrop"
      data-testid="slot-manager-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="slot-manager"
      >
        <div className="slot-manager__header">
          <h2 id={titleId} className="slot-manager__title">
            Save Slots
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="slot-manager__close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="slot-manager__content">
          {renderSlot(1)}
          {renderSlot(2)}
          {renderSlot(3)}
        </div>
        {confirmAction && (
          <div className="slot-manager__confirm">
            <p className="slot-manager__confirm-message">
              {confirmAction.type === 'overwrite'
                ? `Overwrite "${confirmAction.name}"?`
                : `Confirm delete "${confirmAction.name}"?`}
            </p>
            <div className="slot-manager__confirm-actions">
              <button
                type="button"
                className="slot-manager__confirm-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="slot-manager__confirm-button slot-manager__confirm-button--primary"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
