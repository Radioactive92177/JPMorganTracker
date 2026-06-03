# DevOps Roadmap Tracker

A personal, offline-first progress tracker for a structured DevOps learning roadmap. Built with React + Vite + Tailwind CSS.

## Features

- **Phase-based Learning Roadmap** — 4 phases from Docker/AWS fundamentals to interview prep, with per-skill completion tracking and notes
- **DSA Problem Tracker** — Log Easy/Medium LeetCode problems with daily counts, streak tracking, and a 7-day bar chart
- **Daily Study Log** — Record study sessions with timestamps, hours, and streak tracking
- **Dark/Light Theme** — System-preference aware with manual toggle
- **Data Persistence** — All progress saved in localStorage with schema migrations
- **Import/Export** — JSON backup and restore with data validation
- **Keyboard Shortcuts** — Ctrl+S to export progress
- **PWA-ready** — Installable on mobile with offline support via manifest
- **Accessible** — Skip-to-content link, ARIA labels, focus management, screen reader support
- **Error Boundary** — Graceful crash recovery without data loss

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Tech Stack

- **React 19** — UI library
- **Vite 8** — Build tool with HMR
- **Tailwind CSS 4** — Utility-first styling
- **localStorage** — Client-side persistence (no backend required)

## Project Structure

```
src/
├── components/
│   ├── ConfirmModal.jsx   # Accessible confirmation dialog
│   ├── DsaTracker.jsx     # DSA problem tracking with charts
│   ├── ErrorBoundary.jsx  # React error boundary
│   ├── Header.jsx         # Fixed header with progress stats
│   ├── PhaseCard.jsx      # Collapsible phase card
│   ├── SkillItem.jsx      # Individual skill with toggle + notes
│   ├── StudyLog.jsx       # Study session logging
│   ├── ThemeToggle.jsx    # Dark/light mode switch
│   └── Toast.jsx          # Toast notification system
├── context/
│   ├── ThemeContext.jsx   # Theme state provider
│   └── useTheme.js        # Theme hook
├── data/
│   └── initialData.js     # Default roadmap data + constants
├── App.jsx                # Root component with state management
├── main.jsx               # Entry point with providers
└── index.css              # Theme variables + global styles
```

## Data Management

- Progress is automatically persisted to `localStorage` on every change
- **Export**: Downloads a timestamped JSON backup file
- **Import**: Validates and restores from a previously exported backup
- **Reset**: Clears all progress with confirmation (irreversible)
- Schema migrations ensure forward compatibility when data shape changes

## Deployment

The app is configured for GitHub Pages deployment at `/JPMorganTracker/`:

```bash
npm run build
# Deploy the `dist/` folder to GitHub Pages
```

## License

Private — personal use only.
