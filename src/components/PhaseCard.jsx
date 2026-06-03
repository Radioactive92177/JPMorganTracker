import { useState, useMemo } from 'react';
import SkillItem from './SkillItem';

// ─── Phase colour map ─────────────────────────────────────────────────────
const COLORS = {
  amber:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)',  glow: 'rgba(245,158,11,0.15)' },
  blue:   { accent: '#3b82f6', bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)',   glow: 'rgba(59,130,246,0.15)' },
  purple: { accent: '#a855f7', bg: 'rgba(168,85,247,0.07)',  border: 'rgba(168,85,247,0.2)',   glow: 'rgba(168,85,247,0.15)' },
  red:    { accent: '#ef4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)',    glow: 'rgba(239,68,68,0.15)' },
};

/** Determine if a phase is the currently active one based on today's date */
function isActivePhase(phase) {
  const today = new Date().toISOString().slice(0, 10);
  return today >= phase.startDate && today <= phase.endDate;
}

/** Determine if a phase is upcoming */
function isUpcomingPhase(phase) {
  const today = new Date().toISOString().slice(0, 10);
  return today < phase.startDate;
}

/** Format a YYYY-MM-DD date string as "Aug 2026" */
function formatStartDate(dateStr) {
  // Use noon UTC to avoid local-timezone off-by-one shifts
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ─── Progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ pct, accent }) {
  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ height: '6px', backgroundColor: 'var(--color-border)' }}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: `${pct}%`,
          backgroundColor: accent,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 8px ${accent}88`,
        }}
      />
    </div>
  );
}

// ─── PhaseCard ────────────────────────────────────────────────────────────
export default function PhaseCard({ phase, onToggleSkill, onUpdateNotes }) {
  const [expanded, setExpanded] = useState(() => isActivePhase(phase));
  const colors = COLORS[phase.color] || COLORS.blue;

  const { completedCount, totalCount, pct } = useMemo(() => {
    const total = phase.skills.length;
    const done = phase.skills.filter(s => s.completed).length;
    return { completedCount: done, totalCount: total, pct: Math.round((done / total) * 100) };
  }, [phase.skills]);

  const active = isActivePhase(phase);
  const upcoming = isUpcomingPhase(phase);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${active ? colors.border : 'var(--color-border)'}`,
        boxShadow: active ? `0 0 20px ${colors.glow}` : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Phase header — clickable to expand */}
      <button
        className="w-full text-left p-4 cursor-pointer focus:outline-none"
        onClick={() => setExpanded(e => !e)}
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Colour dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colors.accent }}
              />
              {/* Phase name */}
              <h3
                className="text-sm font-semibold leading-tight"
                style={{ color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              >
                {phase.name}
              </h3>
              {/* Status badge */}
              {active && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ color: colors.accent, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  Active
                </span>
              )}
              {upcoming && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ color: 'var(--color-text-faint)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                >
                  Upcoming
                </span>
              )}
              {!active && !upcoming && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ color: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}
                >
                  Past
                </span>
              )}
            </div>

            {/* Date + week count */}
            <p className="text-xs" style={{ color: `${colors.accent}99` }}>
              {phase.dateRange} · {phase.weeks} weeks
            </p>
          </div>

          {/* Right: pct (hidden for upcoming) + chevron */}
          <div className="flex items-center gap-3 shrink-0">
            {upcoming ? (
              <span className="text-xs flex items-center gap-1" style={{ color: `${colors.accent}99` }}>
                🔒 {formatStartDate(phase.startDate)}
              </span>
            ) : (
              <span className="text-lg font-bold tabular-nums" style={{ color: colors.accent }}>
                {pct}%
              </span>
            )}
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
                color: `${colors.accent}80`,
              }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Progress bar (hidden for upcoming) */}
        <div className="mt-3">
          {upcoming ? (
            <p className="text-xs" style={{ color: `${colors.accent}99` }}>
              Starts {formatStartDate(phase.startDate)} · {totalCount} skills planned
            </p>
          ) : (
            <>
              <ProgressBar pct={pct} accent={colors.accent} />
              <p className="text-xs mt-1" style={{ color: `${colors.accent}99` }}>
                {completedCount} / {totalCount} skills complete
              </p>
            </>
          )}
        </div>
      </button>

      {/* Collapsible skills section */}
      <div
        style={{
          maxHeight: expanded ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out',
        }}
      >
        <div
          className="px-4 pb-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="pt-3">
            {phase.skills.map(skill => (
              <SkillItem
                key={skill.id}
                skill={skill}
                phaseId={phase.id}
                onToggle={onToggleSkill}
                onUpdateNotes={onUpdateNotes}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

