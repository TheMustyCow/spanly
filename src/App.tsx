import { useState, useEffect, useRef } from 'react';
import type { SeasonRange } from './types';
import { SEED_DATA } from './data/seed';
import { ControlPanel } from './components/ControlPanel';
import { Timeline } from './components/Timeline';
import { SummaryCard } from './components/SummaryCard';
import './App.css';

const STORAGE_KEY = 'spanly-data-v3';

function loadInitial(): SeasonRange[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SeasonRange[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [...SEED_DATA];
}

function isValidSeasonRangeArray(data: unknown): data is SeasonRange[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      Array.isArray(item.ranges) &&
      typeof item.category === 'string' &&
      typeof item.color === 'string' &&
      typeof item.enabled === 'boolean'
  );
}

export default function App() {
  const [ranges, setRanges] = useState<SeasonRange[]>(loadInitial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  }, [ranges]);

  function handleSave() {
    const blob = new Blob([JSON.stringify(ranges, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spanly-timeline-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleLoadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (isValidSeasonRangeArray(parsed)) {
          setRanges(parsed);
        } else {
          alert('Invalid file format. Please select a valid Spanly timeline JSON file.');
        }
      } catch {
        alert('Could not read file. Make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Spanly</h1>
          <p className="subtitle">Plan and compare date ranges on a shared timeline</p>
        </div>
        <div className="app-header-actions">
          <button className="btn-header" onClick={handleLoadClick}>
            Load
          </button>
          <button className="btn-header btn-header-primary" onClick={handleSave}>
            Save
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <main className="app-layout">
        <SummaryCard ranges={ranges} />
        <Timeline ranges={ranges} />
        <ControlPanel ranges={ranges} onUpdate={setRanges} />
      </main>
    </div>
  );
}
