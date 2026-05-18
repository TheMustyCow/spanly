import React, { useState, useEffect } from 'react';
import type { SeasonRange, SubRange } from '../types';
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

function makeEmptySubRange(): SubRange {
  return {
    id: crypto.randomUUID(),
    label: '',
    startDate: '',
    endDate: '',
  };
}

const emptyFormState = {
  name: '',
  ranges: [makeEmptySubRange()] as SubRange[],
  category: '',
  color: '',
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ ranges, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyFormState, color: getDefaultColor(ranges) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const item = ranges.find((r) => r.id === editingId);
      if (item) {
        setForm({
          name: item.name,
          ranges: item.ranges.map((sr) => ({ ...sr })),
          category: item.category,
          color: item.color,
        });
      }
    } else {
      setForm({ ...emptyFormState, color: getDefaultColor(ranges) });
    }
  }, [editingId, ranges]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.category) nextErrors.category = 'Category is required';

    form.ranges.forEach((sr, idx) => {
      const prefix = `ranges[${idx}]`;
      if (!sr.label.trim()) nextErrors[`${prefix}.label`] = 'Label is required';
      if (!sr.startDate) nextErrors[`${prefix}.startDate`] = 'Start date is required';
      if (!sr.endDate) nextErrors[`${prefix}.endDate`] = 'End date is required';
      if (sr.startDate && sr.endDate && sr.startDate > sr.endDate) {
        nextErrors[`${prefix}.endDate`] = 'Must be on or after start date';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      const updated = ranges.map((r) =>
        r.id === editingId ? { ...r, ...form } : r
      );
      onUpdate(updated);
      setEditingId(null);
    } else {
      const newRange: SeasonRange = {
        id: crypto.randomUUID(),
        ...form,
        enabled: true,
      };
      onUpdate([...ranges, newRange]);
    }
    setForm({ ...emptyFormState, color: getDefaultColor(ranges) });
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
      setForm({ ...emptyFormState, color: getDefaultColor(ranges) });
    }
    setDeleteId(null);
  }

  function toggleEnabled(id: string) {
    onUpdate(ranges.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyFormState, color: getDefaultColor(ranges) });
    setErrors({});
  }

  function addSubRange() {
    setForm((prev) => ({
      ...prev,
      ranges: [...prev.ranges, makeEmptySubRange()],
    }));
  }

  function removeSubRange(index: number) {
    setForm((prev) => ({
      ...prev,
      ranges: prev.ranges.filter((_, i) => i !== index),
    }));
  }

  function updateSubRange(index: number, patch: Partial<SubRange>) {
    setForm((prev) => ({
      ...prev,
      ranges: prev.ranges.map((sr, i) =>
        i === index ? { ...sr, ...patch } : sr
      ),
    }));
  }

  function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Use an empty image or custom if needed; default ghost is fine
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId && id !== dragOverId) {
      setDragOverId(id);
    }
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const fromIndex = ranges.findIndex((r) => r.id === draggingId);
    const toIndex = ranges.findIndex((r) => r.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const next = [...ranges];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onUpdate(next);
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
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
              placeholder="e.g. Whitetail"
            />
            {errors.name && <span className="error">{errors.name}</span>}
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
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <span className="error">{errors.category}</span>}
          </div>

          <div className="sub-ranges-section">
            <label className="sub-ranges-label">Date ranges</label>
            {form.ranges.map((sr, idx) => (
              <div key={sr.id} className="sub-range-row">
                <div className="sub-range-field">
                  <input
                    type="text"
                    placeholder="Label (e.g. Early)"
                    value={sr.label}
                    onChange={(e) => updateSubRange(idx, { label: e.target.value })}
                  />
                  {errors[`ranges[${idx}].label`] && (
                    <span className="error">{errors[`ranges[${idx}].label`]}</span>
                  )}
                </div>
                <div className="sub-range-field">
                  <input
                    type="date"
                    value={sr.startDate}
                    onChange={(e) => updateSubRange(idx, { startDate: e.target.value })}
                  />
                  {errors[`ranges[${idx}].startDate`] && (
                    <span className="error">{errors[`ranges[${idx}].startDate`]}</span>
                  )}
                </div>
                <div className="sub-range-field">
                  <input
                    type="date"
                    value={sr.endDate}
                    onChange={(e) => updateSubRange(idx, { endDate: e.target.value })}
                  />
                  {errors[`ranges[${idx}].endDate`] && (
                    <span className="error">{errors[`ranges[${idx}].endDate`]}</span>
                  )}
                </div>
                {form.ranges.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => removeSubRange(idx)}
                    aria-label="Remove sub-range"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost btn-small"
              onClick={addSubRange}
            >
              + Add another date range
            </button>
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
                <li
                  key={r.id}
                  className={`range-list-item ${editingId === r.id ? 'editing' : ''} ${draggingId === r.id ? 'dragging' : ''} ${dragOverId === r.id ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, r.id)}
                  onDragOver={(e) => handleDragOver(e, r.id)}
                  onDrop={(e) => handleDrop(e, r.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
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
                    <div className="range-list-info">
                      <div className="range-list-top">
                        <span className="range-list-name">{r.name}</span>
                        {r.category && (
                          <span className="range-list-category">{r.category}</span>
                        )}
                      </div>
                      <div className="range-list-subs">
                        {r.ranges.map((sr) => (
                          <span key={sr.id} className="range-list-sub">
                            {sr.label}: {formatShortDate(sr.startDate)} – {formatShortDate(sr.endDate)}
                          </span>
                        ))}
                      </div>
                    </div>
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
        message="This will permanently remove the date range from your timeline. You can't undo this action."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
