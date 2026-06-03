import { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';

import { STORAGE_KEY, buildDefaultState } from './data/initialData';
import Header from './components/Header';
import PhaseCard from './components/PhaseCard';
import DsaTracker from './components/DsaTracker';
import StudyLog from './components/StudyLog';
import ConfirmModal from './components/ConfirmModal';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Apply incremental migrations when loading older persisted state.
 * Each migration is idempotent — safe to run multiple times.
 */
function migrate(saved) {
  let s = saved;

  // v2: mark p2-python as pre-completed (once only, via _migrated flag),
  //     and ensure dsa.dailyCount exists.
  if (!s.schemaVersion || s.schemaVersion < 2) {
    s = {
      ...s,
      schemaVersion: 2,
      phases: s.phases.map(p =>
        p.id !== 'phase2' ? p : {
          ...p,
          skills: p.skills.map(sk => {
            if (sk.id !== 'p2-python' || sk._migrated) return sk;
            return {
              ...sk,
              completed: true,
              tag: 'already have',
              notes: sk.notes || 'Production ETL automation, healthcare data pipelines, cron scheduling — 4 years nightly use at Cotiviti/Edifecs.',
              _migrated: true,
            };
          }),
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

/** Validate imported data has the expected shape */
function validateState(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.phases)) return false;
  if (!data.dsa || typeof data.dsa !== 'object') return false;
  if (!Array.isArray(data.studyLog)) return false;

  // Validate phases structure
  for (const phase of data.phases) {
    if (!phase.id || !phase.name || !Array.isArray(phase.skills)) return false;
    for (const skill of phase.skills) {
      if (!skill.id || !skill.name) return false;
    }
  }

  // Validate DSA structure
  if (typeof data.dsa.easySolved !== 'number' || typeof data.dsa.mediumSolved !== 'number') return false;
  if (!Array.isArray(data.dsa.solvedDays)) return false;

  return true;
}

/** Load state from localStorage; fall back to default seed on first visit */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw);
    if (!validateState(parsed)) return buildDefaultState();
    return migrate(parsed);
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
  const [confirmModal, setConfirmModal] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

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
        hours: Math.max(0, Math.min(24, parseFloat(hours) || 0)),
        notes: notes.trim().slice(0, 500),
      };

      return {
        ...prev,
        studyLog: [entry, ...prev.studyLog].slice(0, 100),
        lastStudyDate: todayStr,
        studyStreak: streak,
      };
    });

    addToast('Study session logged ✓', 'success');
  }, [addToast]);

  // ── Reset all data ────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setConfirmModal({
      title: 'Reset All Progress',
      message: 'This will permanently erase ALL your progress, DSA counts, and study logs. This action cannot be undone.',
      confirmLabel: 'Reset Everything',
      cancelLabel: 'Keep My Data',
      variant: 'destructive',
      onConfirm: () => {
        const fresh = buildDefaultState();
        fresh.phases = fresh.phases.map(phase => ({
          ...phase,
          skills: phase.skills.map(skill => ({
            ...skill,
            completed: false,
            notes: '',
            tag: skill.tag === 'already have' ? 'learning' : skill.tag,
          })),
        }));
        setState(fresh);
        setConfirmModal(null);
        addToast('All data has been reset', 'info');
      },
      onCancel: () => setConfirmModal(null),
    });
  }, [addToast]);

  // ── Export progress ───────────────────────────────────────────────────────
  const exportProgress = useCallback(() => {
    try {
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devops-roadmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Progress exported successfully', 'success');
    } catch {
      addToast('Export failed — please try again', 'error');
    }
  }, [state, addToast]);

  // ── Import progress ───────────────────────────────────────────────────────
  const importProgress = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limit file size to 1MB to prevent abuse
      if (file.size > 1024 * 1024) {
        addToast('File too large — maximum 1MB allowed', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!validateState(data)) {
            addToast('Invalid backup file — data structure mismatch', 'error');
            return;
          }

          setConfirmModal({
            title: 'Restore Backup',
            message: `This will replace all current data with the imported backup (${file.name}). Your current progress will be overwritten.`,
            confirmLabel: 'Restore',
            cancelLabel: 'Cancel',
            variant: 'destructive',
            onConfirm: () => {
              setState(migrate(data));
              setConfirmModal(null);
              addToast('Progress restored from backup ✓', 'success');
            },
            onCancel: () => setConfirmModal(null),
          });
        } catch {
          addToast('Could not parse file — ensure it is a valid JSON backup', 'error');
        }
      };
      reader.onerror = () => {
        addToast('Failed to read file', 'error');
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  const { phases, dsa, studyLog, studyStreak } = state;

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ctrl/Cmd + S to export
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportProgress();
      }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [exportProgress]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Skip to content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        style={{ backgroundColor: 'var(--color-surface)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
      >
        Skip to main content
      </a>

      <Header phases={phases} dsa={dsa} studyStreak={studyStreak} />

      <main id="main-content" className="max-w-6xl mx-auto px-4 pb-16" style={{ paddingTop: '128px' }}>

        {/* DSA Tracker — most prominent section after header */}
        <section aria-label="DSA Problem Tracker" className="mb-10">
          <DsaTracker dsa={dsa} onAddProblem={addDsaProblem} />
        </section>

        {/* Phase Cards */}
        <section aria-label="Learning Roadmap" className="mb-10">
          <h2
            className="text-xs font-semibold tracking-widest mb-4 uppercase"
            style={{ color: 'var(--color-text-faint)' }}
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
        <section aria-label="Daily Study Log" className="mb-10">
          <StudyLog studyLog={studyLog} onAddEntry={addStudyEntry} />
        </section>

        {/* Motivational footer */}
        <footer
          className="rounded-xl p-5 text-sm mt-8"
          style={{ backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-text-ghost)', color: 'var(--color-text-dim)' }}
        >
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-text-ghost)' }}>Context</p>
          <p className="leading-relaxed">
            4 years of night shifts. Top Performer 2024. Two US visas approved.
            200+ production incidents resolved. 30+ client onboardings delivered.
            Healthcare data pipelines running in production every night.{' '}
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>You&apos;re not starting from zero.</span>
          </p>
          <NightShiftCounter />
        </footer>

        {/* Data management — discreet */}
        <div className="mt-8 text-center flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={exportProgress}
            className="text-xs transition-colors duration-150"
            style={{ color: 'var(--color-text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#22d3ee'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-ghost)'; }}
            aria-label="Export progress as JSON backup"
          >
            ↓ Export progress
          </button>
          <button
            onClick={importProgress}
            className="text-xs transition-colors duration-150"
            style={{ color: 'var(--color-text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#22d3ee'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-ghost)'; }}
            aria-label="Import progress from JSON backup"
          >
            ↑ Import backup
          </button>
          <button
            onClick={resetAll}
            className="text-xs transition-colors duration-150"
            style={{ color: 'var(--color-text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-ghost)'; }}
            aria-label="Reset all data"
          >
            Reset all data
          </button>
          <span className="text-xs" style={{ color: 'var(--color-text-invisible)' }}>
            Ctrl+S to export
          </span>
        </div>
      </main>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Confirmation modal */}
      {confirmModal && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          cancelLabel={confirmModal.cancelLabel}
          variant={confirmModal.variant}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
  );
}

const NightShiftCounter = function NightShiftCounter() {
  const { days, years, rem } = useMemo(() => {
    const start = new Date('2022-01-01');
    const now = new Date();
    const d = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const y = Math.floor(d / 365);
    const r = d - y * 365;
    return { days: d, years: y, rem: r };
  }, []);

  return (
    <p className="mt-3 text-xs" style={{ color: 'var(--color-text-invisible)' }}>
      Night-shift tenure: {years}y {rem}d ({days.toLocaleString()} total days) · IST 1AM–5AM study window · Target: JP Morgan Hyderabad + Netherlands / Germany / Sweden
    </p>
  );
};
