import { useState, useEffect, useCallback } from 'react';
import './index.css';

import { STORAGE_KEY, buildDefaultState } from './data/initialData';
import Header from './components/Header';
import PhaseCard from './components/PhaseCard';
import DsaTracker from './components/DsaTracker';
import StudyLog from './components/StudyLog';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Apply incremental migrations when loading older persisted state.
 * Each migration is idempotent — safe to run multiple times.
 */
function migrate(saved) {
  let s = saved;

  // v2: mark p2-python as pre-completed (if user hasn't added custom notes),
  //     and ensure dsa.dailyCount exists.
  if (!s.schemaVersion || s.schemaVersion < 2) {
    s = {
      ...s,
      schemaVersion: 2,
      phases: s.phases.map(p =>
        p.id !== 'phase2' ? p : {
          ...p,
          skills: p.skills.map(sk =>
            sk.id !== 'p2-python' ? sk : {
              ...sk,
              completed: sk.notes ? sk.completed : true,
              tag: sk.notes ? sk.tag : 'already have',
              notes: sk.notes || 'Production ETL automation, healthcare data pipelines, cron scheduling — 4 years nightly use at Cotiviti/Edifecs.',
            }
          ),
        }
      ),
      dsa: {
        ...s.dsa,
        dailyCount: s.dsa.dailyCount || {},
      },
    };
  }

  return s;
}

/** Load state from localStorage; fall back to default seed on first visit */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    return migrate(JSON.parse(raw));
  } catch {
    return buildDefaultState();
  }
}

/** Persist the entire state object to localStorage */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded — silently ignore; UX still works in-session
  }
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(() => loadState());

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Skill toggle ──────────────────────────────────────────────────────────
  const toggleSkill = useCallback((phaseId, skillId) => {
    setState(prev => ({
      ...prev,
      phases: prev.phases.map(phase =>
        phase.id !== phaseId ? phase : {
          ...phase,
          skills: phase.skills.map(skill =>
            skill.id !== skillId ? skill : { ...skill, completed: !skill.completed }
          ),
        }
      ),
    }));
  }, []);

  // ── Skill notes update ────────────────────────────────────────────────────
  const updateNotes = useCallback((phaseId, skillId, notes) => {
    setState(prev => ({
      ...prev,
      phases: prev.phases.map(phase =>
        phase.id !== phaseId ? phase : {
          ...phase,
          skills: phase.skills.map(skill =>
            skill.id !== skillId ? skill : { ...skill, notes }
          ),
        }
      ),
    }));
  }, []);

  // ── DSA tracking ─────────────────────────────────────────────────────────
  const addDsaProblem = useCallback((difficulty) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setState(prev => {
      const dsa = prev.dsa;
      const alreadyToday = dsa.solvedDays.includes(todayStr);
      const dailyCount = dsa.dailyCount || {};
      return {
        ...prev,
        dsa: {
          ...dsa,
          easySolved: difficulty === 'easy' ? dsa.easySolved + 1 : dsa.easySolved,
          mediumSolved: difficulty === 'medium' ? dsa.mediumSolved + 1 : dsa.mediumSolved,
          solvedDays: alreadyToday ? dsa.solvedDays : [...dsa.solvedDays, todayStr],
          dailyCount: { ...dailyCount, [todayStr]: (dailyCount[todayStr] || 0) + 1 },
        },
      };
    });
  }, []);

  // ── Study log ─────────────────────────────────────────────────────────────
  const addStudyEntry = useCallback((notes, hours) => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    setState(prev => {
      const lastDate = prev.lastStudyDate;
      let streak = prev.studyStreak || 0;

      if (!lastDate) {
        streak = 1;
      } else if (lastDate === todayStr) {
        // Already logged today — streak unchanged
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        streak = lastDate === yesterdayStr ? streak + 1 : 1;
      }

      const entry = {
        id: `log-${Date.now()}`,
        date: now.toISOString(),
        hours: parseFloat(hours) || 0,
        notes: notes.trim(),
      };

      return {
        ...prev,
        studyLog: [entry, ...prev.studyLog].slice(0, 100),
        lastStudyDate: todayStr,
        studyStreak: streak,
      };
    });
  }, []);

  // ── Reset all data ────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    if (window.confirm('This will wipe ALL progress, DSA counts, and study logs. Are you sure?')) {
      const fresh = buildDefaultState();
      setState(fresh);
    }
  }, []);

  // ── Export progress ───────────────────────────────────────────────────────
  const exportProgress = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raju-roadmap-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const { phases, dsa, studyLog, studyStreak } = state;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1117', color: '#e2e8f0' }}>
      <Header phases={phases} dsa={dsa} studyStreak={studyStreak} />

      <main className="max-w-6xl mx-auto px-4 pb-16" style={{ paddingTop: '128px' }}>

        {/* DSA Tracker — most prominent section after header */}
        <section className="mb-10">
          <DsaTracker dsa={dsa} onAddProblem={addDsaProblem} />
        </section>

        {/* Phase Cards */}
        <section className="mb-10">
          <h2
            className="text-xs font-semibold tracking-widest mb-4 uppercase"
            style={{ color: '#4b5563' }}
          >
            Learning Roadmap
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {phases.map(phase => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                onToggleSkill={toggleSkill}
                onUpdateNotes={updateNotes}
              />
            ))}
          </div>
        </section>

        {/* Study Log */}
        <section className="mb-10">
          <StudyLog studyLog={studyLog} onAddEntry={addStudyEntry} />
        </section>

        {/* Motivational footer */}
        <footer
          className="rounded-xl p-5 text-sm mt-8"
          style={{ backgroundColor: '#12151f', borderLeft: '3px solid #374151', color: '#64748b' }}
        >
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#374151' }}>Context</p>
          <p className="leading-relaxed">
            4 years of night shifts. Top Performer 2024. Two US visas approved.
            200+ production incidents resolved. 30+ client onboardings delivered.
            Healthcare data pipelines running in production every night.{' '}
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>You're not starting from zero.</span>
          </p>
          <NightShiftCounter />
        </footer>

        {/* Reset + Export — discreet */}
        <div className="mt-8 text-center flex items-center justify-center gap-4">
          <button
            onClick={exportProgress}
            style={{ color: '#374151', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#22d3ee'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            ↓ Export progress
          </button>
          <button
            onClick={resetAll}
            style={{ color: '#374151', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Reset all data
          </button>
        </div>
      </main>
    </div>
  );
}

function NightShiftCounter() {
  const start = new Date('2022-01-01');
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const rem = days - years * 365;
  return (
    <p className="mt-3 text-xs" style={{ color: '#1f2937' }}>
      Night-shift tenure: {years}y {rem}d ({days.toLocaleString()} total days) · IST 1AM–5AM study window · Target: JP Morgan Hyderabad + Netherlands / Germany / Sweden
    </p>
  );
}
