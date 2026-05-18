import { useState, useEffect, useRef } from 'react';
import type { SeasonRange } from './types';
import { SEED_DATA } from './data/seed';
import { DEMO_DATA } from './data/demoData';
import { ControlPanel } from './components/ControlPanel';
import { Timeline } from './components/Timeline';
import { SummaryCard } from './components/SummaryCard';
import './App.css';

const STORAGE_KEY = 'spanly-data-v3';
const DEMO_KEY = 'spanly-demo-active';
const THEME_KEY = 'spanly-theme';

function loadInitial(): SeasonRange[] {
  try {
    const isDemo = localStorage.getItem(DEMO_KEY) === 'true';
    if (isDemo) {
      return structuredClone ? structuredClone(DEMO_DATA) : JSON.parse(JSON.stringify(DEMO_DATA));
    }
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

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function App() {
  const [ranges, setRanges] = useState<SeasonRange[]>(loadInitial);
  const [isDemoActive, setIsDemoActive] = useState(() => {
    try {
      return localStorage.getItem(DEMO_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  }, [ranges]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleDemoToggle() {
    if (isDemoActive) {
      localStorage.removeItem(DEMO_KEY);
      setRanges([...SEED_DATA]);
      setIsDemoActive(false);
    } else {
      localStorage.setItem(DEMO_KEY, 'true');
      const cloned = structuredClone
        ? structuredClone(DEMO_DATA)
        : JSON.parse(JSON.stringify(DEMO_DATA));
      setRanges(cloned);
      setIsDemoActive(true);
    }
  }

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
          <button
            className={`btn-header ${isDemoActive ? 'btn-header-danger' : ''}`}
            onClick={handleDemoToggle}
          >
            {isDemoActive ? 'Remove' : 'Demo'}
          </button>
          <button
            className="btn-icon-theme"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
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
