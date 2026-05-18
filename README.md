# Spanly

A clean, modern timeline visualization tool for planning and comparing date ranges. Built with React, Vite, and TypeScript.

## Features

- **Add & Edit Ranges** — Enter a name, date range, optional category, and pick a color.
- **Daily Grid Timeline** — All enabled ranges are shown as horizontal colored bars on a shared axis. A subtle vertical grid line marks every single day, with slightly stronger lines for Sundays and month boundaries, making it easy to count days and spot overlaps at a glance.
- **Toggle Visibility** — Use the checkbox list to show or hide individual ranges on the timeline.
- **Summary Card** — See total ranges, active count, earliest start, and latest end date at a glance.
- **Persistent Data** — All data is saved to `localStorage` automatically.
- **Responsive Layout** — Optimized for desktop with a stacked layout on smaller screens.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Plain CSS (component-scoped styles)

## Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser to the URL shown (usually http://localhost:5173)
```

## Build for Production

```bash
npm run build
```

The static output will be generated in the `dist/` directory.

## Project Structure

```
src/
├── types.ts                     # Shared TypeScript interfaces
├── data/
│   └── seed.ts                  # Default color palette and seed data
├── components/
│   ├── ControlPanel.tsx         # Add/edit form + range list with checkboxes
│   ├── ControlPanel.css
│   ├── Timeline.tsx             # Date math + horizontal bar visualization
│   ├── Timeline.css
│   ├── SummaryCard.tsx          # Overview stats card
│   ├── SummaryCard.css
│   ├── Dialog.tsx               # Reusable confirmation modal
│   └── Dialog.css
├── App.tsx                      # Main layout + state + localStorage
├── App.css
├── main.tsx                     # Entry point
└── index.css                    # Global design tokens + resets
```

## Data Model

```ts
interface SeasonRange {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  category: string;
  color: string;
  enabled: boolean;
}
```

## Notes

- The app ships with 5 seed ranges so the timeline is immediately useful.
- Deleting a range opens a polished custom confirmation dialog instead of a browser alert.
- The timeline auto-calculates its visible span from the earliest start to the latest end date, with a small padding buffer.
- Overlapping ranges are easy to spot because each bar sits on its own row.
