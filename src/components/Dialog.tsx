import React, { useEffect } from 'react';
import './Dialog.css';

interface DialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="dialog-card">
        <div className="dialog-icon">⚠</div>
        <h3 id="dialog-title" className="dialog-title">
          {title}
        </h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`dialog-btn dialog-btn-${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
