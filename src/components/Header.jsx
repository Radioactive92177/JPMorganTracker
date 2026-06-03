import { useMemo } from 'react';
import { DSA_TARGET, TARGET_DATE } from '../data/initialData';

// ─── Colour map for phase accents ─────────────────────────────────────────
const PHASE_COLORS = {
  amber:  '#f59e0b',
  blue:   '#3b82f6',
  purple: '#a855f7',
  red:    '#ef4444',
};

// ─── Utility: days until a target date ───────────────────────────────────
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  // Compare date-only (strip time)
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

// ─── Stat pill ────────────────────────────────────────────────────────────
function StatPill({ label, value, accent, sub }) {
  return (
    <div
      className="flex flex-col items-center px-4 py-2 rounded-lg"
      style={{ backgroundColor: '#12151f', minWidth: '90px' }}
    >
      <span
        className="text-xl font-bold tabular-nums leading-tight"
        style={{ color: accent || '#e2e8f0' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs leading-none mb-0.5" style={{ color: accent || '#64748b', opacity: 0.7 }}>
          {sub}
        </span>
      )}
      <span className="text-xs mt-0.5 text-center leading-tight" style={{ color: '#4b5563' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Overall progress ring (SVG) ─────────────────────────────────────────
function MiniRing({ pct, color }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="56" height="56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#1e2433" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="28" y="33"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#e2e8f0"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────
export default function Header({ phases, dsa, studyStreak }) {
  // Overall completion across all skills in all phases
  const { totalSkills, completedSkills, overallPct } = useMemo(() => {
    let total = 0, completed = 0;
    phases.forEach(p => {
      p.skills.forEach(s => {
        total++;
        if (s.completed) completed++;
      });
    });
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { totalSkills: total, completedSkills: completed, overallPct: pct };
  }, [phases]);

  const countdown = daysUntil(TARGET_DATE);
  const dsaTotal = dsa.easySolved + dsa.mediumSolved;
  const dsaPct = Math.min(100, Math.round((dsaTotal / DSA_TARGET) * 100));

  // Phase progress summary pills
  const phasePills = phases.map(p => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = today < p.startDate;
    const done = p.skills.filter(s => s.completed).length;
    const pct = Math.round((done / p.skills.length) * 100);
    return { ...p, pct, upcoming };
  });

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e2433',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top row: title + key stats */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-3 mr-auto">
            <MiniRing pct={overallPct} color="#22d3ee" />
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: '#e2e8f0' }}>
                M G Raju — DevOps Roadmap
              </h1>
              <p className="text-xs leading-tight" style={{ color: '#4b5563' }}>
                JP Morgan SE-II · Hyderabad · Dec 2026 · {completedSkills}/{totalSkills} skills done
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <StatPill
              label="Days to Dec 1"
              value={countdown.toLocaleString()}
              accent="#f59e0b"
            />
            <StatPill
              label="DSA solved"
              value={`${dsaTotal}/${DSA_TARGET}`}
              sub={`${dsaPct}%`}
              accent="#a855f7"
            />
            <StatPill
              label="Study streak"
              value={studyStreak || 0}
              sub="days"
              accent="#22d3ee"
            />
          </div>
        </div>

        {/* Phase progress mini-bars */}
        <div className="flex flex-wrap gap-2 mt-2">
          {phasePills.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-md px-2.5 py-1"
              style={{ backgroundColor: '#0d1018' }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: PHASE_COLORS[p.color] }}
              />
              <span className="text-xs hidden sm:block" style={{ color: '#4b5563', minWidth: '80px' }}>
                {p.shortName}
              </span>
              {/* Mini progress bar or lock for upcoming */}
              {p.upcoming ? (
                <span className="text-xs" style={{ color: '#374151' }}>🔒</span>
              ) : (
                <>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ width: '60px', height: '4px', backgroundColor: '#1e2433' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p.pct}%`,
                        backgroundColor: PHASE_COLORS[p.color],
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums" style={{ color: '#64748b' }}>
                    {p.pct}%
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
