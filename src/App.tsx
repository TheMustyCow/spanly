import { useState, useEffect } from 'react';
import type { SeasonRange } from './types';
import { SEED_DATA } from './data/seed';
import { ControlPanel } from './components/ControlPanel';
import { Timeline } from './components/Timeline';
import { SummaryCard } from './components/SummaryCard';
import './App.css';

const STORAGE_KEY = 'seasonline-data-v1';

function loadInitial(): SeasonRange[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SeasonRange[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...SEED_DATA];
}

export default function App() {
  const [ranges, setRanges] = useState<SeasonRange[]>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  }, [ranges]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>SeasonLine</h1>
        <p className="subtitle">Plan and compare season date ranges on a shared timeline</p>
      </header>

      <main className="app-layout">
        <SummaryCard ranges={ranges} />
        <Timeline ranges={ranges} />
        <ControlPanel ranges={ranges} onUpdate={setRanges} />
      </main>
    </div>
  );
}
