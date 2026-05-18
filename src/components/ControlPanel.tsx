import React, { useState, useEffect } from 'react';
import type { SeasonRange } from '../types';
import { DEFAULT_COLORS, CATEGORIES } from '../data/seed';
import { Dialog } from './Dialog';
import './ControlPanel.css';

interface ControlPanelProps {
  ranges: SeasonRange[];
  onUpdate: (ranges: SeasonRange[]) => void;
}

function getDefaultColor(ranges: SeasonRange[]): string {
  return DEFAULT_COLORS[ranges.length % DEFAULT_COLORS.length];
}

const emptyFormBase = {
  name: '',
  startDate: '',
  endDate: '',
  category: '',
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ ranges, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyFormBase, color: getDefaultColor(ranges) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const item = ranges.find((r) => r.id === editingId);
      if (item) {
        setForm({
          name: item.name,
          startDate: item.startDate,
          endDate: item.endDate,
          category: item.category,
          color: item.color,
        });
      }
    } else {
      setForm({ ...emptyFormBase, color: getDefaultColor(ranges) });
    }
  }, [editingId, ranges]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    if (!form.endDate) nextErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      nextErrors.endDate = 'End date must be on or after start date';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      const updated = ranges.map((r) =>
        r.id === editingId
          ? { ...r, ...form }
          : r
      );
      onUpdate(updated);
      setEditingId(null);
    } else {
      const newRange: SeasonRange = {
        id: crypto.randomUUID(),
        ...form,
        enabled: true,
      };
      const nextRanges = [...ranges, newRange];
      onUpdate(nextRanges);
    }
    setForm({ ...emptyFormBase, color: getDefaultColor(ranges) });
    setErrors({});
  }

  function handleEdit(item: SeasonRange) {
    setEditingId(item.id);
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  function confirmDelete() {
    if (!deleteId) return;
    onUpdate(ranges.filter((r) => r.id !== deleteId));
    if (editingId === deleteId) {
      setEditingId(null);
      setForm({ ...emptyFormBase, color: getDefaultColor(ranges) });
    }
    setDeleteId(null);
  }

  function toggleEnabled(id: string) {
    const updated = ranges.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onUpdate(updated);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyFormBase, color: getDefaultColor(ranges) });
    setErrors({});
  }

  return (
    <div className="control-panel">
      <div className="cp-form-section">
        <h2>{editingId ? 'Edit Range' : 'Add Range'}</h2>
        <form onSubmit={handleSubmit} className="range-form">
          <div className="form-row">
            <label htmlFor="name">Range name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Modern Firearm Elk"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-row date-row">
            <div>
              <label htmlFor="startDate">Start date </label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              {errors.startDate && <span className="error">{errors.startDate}</span>}
            </div>
            <div>
              <label htmlFor="endDate">End date </label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
              {errors.endDate && <span className="error">{errors.endDate}</span>}
            </div>
          </div>



          <div className="form-row">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Color</label>
            <div className="color-picker">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${form.color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Save Changes' : 'Add to Timeline'}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="cp-list-section">
        <h2>Ranges</h2>
        <div className="range-list">
          {ranges.length === 0 ? (
            <p className="empty-list">No ranges yet. Add one above.</p>
          ) : (
            <ul>
              {ranges.map((r) => (
                <li key={r.id} className={`range-list-item ${editingId === r.id ? 'editing' : ''}`}>
                  <label className="range-checkbox-label">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={() => toggleEnabled(r.id)}
                    />
                    <span
                      className="range-color-dot"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="range-list-name">{r.name}</span>
                    {r.category && (
                      <span className="range-list-category">{r.category}</span>
                    )}
                  </label>
                  <div className="range-list-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(r)}
                      aria-label="Edit"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(r.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog
        open={deleteId !== null}
        title="Delete Range"
        message="This will permanently remove the date range from your timeline. You can’t undo this action."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
