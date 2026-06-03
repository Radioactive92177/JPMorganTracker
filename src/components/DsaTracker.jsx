import { useMemo } from 'react';
import { DSA_TARGET } from '../data/initialData';

// ─── Circular progress ring ───────────────────────────────────────────────
function ProgressRing({ pct, solved, target }) {
  const r = 48;
  const stroke = 7;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  const cx = 60, cy = 60;

  return (
    <svg width="120" height="120" className="shrink-0">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      {/* Progress */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="url(#dsaGrad)"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <defs>
        <linearGradient id="dsaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Centre text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--color-text)">
        {solved}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="var(--color-text-faint)">
        of {target}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fontWeight="600" fill="#a855f7">
        {pct}%
      </text>
    </svg>
  );
}

// ─── Add button ───────────────────────────────────────────────────────────
function AddButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer"
      style={{
        color: color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}33`,
        transition: 'background-color 0.15s ease, transform 0.1s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${color}14`; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      +1 {label}
    </button>
  );
}

// ─── Stat block ───────────────────────────────────────────────────────────
function StatBlock({ value, label, sub, color }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums" style={{ color: color || 'var(--color-text)' }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: color ? `${color}99` : 'var(--color-text-faint)' }}>{sub}</div>}
      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-ghost)' }}>{label}</div>
    </div>
  );
}

// ─── Streak indicator ────────────────────────────────────────────────────
function StreakBadge({ days }) {
  if (days === 0) return null;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        color: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.25)',
      }}
    >
      <span>🔥</span>
      <span>{days}-day streak</span>
    </div>
  );
}

// ─── Bar chart for last 7 days ────────────────────────────────────────────
function WeekBarChart({ weekDays, dailyCount, todayStr }) {
  const counts = weekDays.map(d => dailyCount[d] || 0);
  const maxCount = Math.max(1, ...counts);
  const BAR_MAX_H = 40; // px

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${BAR_MAX_H + 2}px` }}>
        {weekDays.map((day, i) => {
          const count = counts[i];
          const barH = count > 0 ? Math.max(4, Math.round((count / maxCount) * BAR_MAX_H)) : 3;
          const isToday = day === todayStr;
          return (
            <div
              key={day}
              title={`${day}: ${count} problem${count !== 1 ? 's' : ''}`}
              style={{
                flex: 1,
                height: `${barH}px`,
                backgroundColor: count > 0 ? (isToday ? '#c084fc' : '#a855f7') : 'var(--color-border)',
                borderRadius: '3px 3px 0 0',
                outline: isToday ? '1px solid #6366f1' : 'none',
                transition: 'height 0.3s ease',
                boxShadow: count > 0 ? '0 0 5px #a855f755' : 'none',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>
      {/* Day labels */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
        {weekDays.map((day, i) => {
          const count = counts[i];
          return (
            <div
              key={day}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '9px',
                color: count > 0 ? 'var(--color-text-dim)' : 'var(--color-text-invisible)',
                lineHeight: 1,
              }}
            >
              {count > 0 ? count : new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function getTodayStr() { return new Date().toISOString().slice(0, 10); }

function getWeekDays() {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ─── DsaTracker ───────────────────────────────────────────────────────────
export default function DsaTracker({ dsa, onAddProblem }) {
  const total = dsa.easySolved + dsa.mediumSolved;
  const pct = Math.min(100, Math.round((total / DSA_TARGET) * 100));

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayStr = getTodayStr();

  // How many active days this week (we track days but not per-problem breakdown)
  const solvedThisWeek = weekDays.filter(d => dsa.solvedDays.includes(d)).length;

  // Compute consecutive-day DSA streak
  const dsaStreak = useMemo(() => {
    const sorted = [...dsa.solvedDays].sort().reverse();
    if (sorted.length === 0) return 0;
    let streak = 0;
    let check = new Date();
    for (const dayStr of sorted) {
      const checkStr = check.toISOString().slice(0, 10);
      if (dayStr === checkStr) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [dsa.solvedDays]);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid rgba(168,85,247,0.25)',
        boxShadow: '0 0 30px rgba(168,85,247,0.08)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
            DSA Tracker
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            LeetCode grind — target {DSA_TARGET} problems before interview sprint
          </p>
        </div>
        <StreakBadge days={dsaStreak} />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Ring */}
        <ProgressRing pct={pct} solved={total} target={DSA_TARGET} />

        {/* Stats + buttons */}
        <div className="flex-1 w-full">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <StatBlock value={dsa.easySolved} label="Easy" color="#4ade80" />
            <StatBlock value={dsa.mediumSolved} label="Medium" color="#fb923c" />
            <StatBlock
              value={solvedThisWeek}
              label="This week"
              sub="active days"
              color="#60a5fa"
            />
            <StatBlock
              value={`${DSA_TARGET - total}`}
              label="Remaining"
              color="#a855f7"
            />
          </div>

          {/* Add buttons */}
          <div className="flex gap-3">
            <AddButton label="Easy" color="#4ade80" onClick={() => onAddProblem('easy')} />
            <AddButton label="Medium" color="#fb923c" onClick={() => onAddProblem('medium')} />
          </div>

          {/* Progress bar breakdown */}
          <div className="mt-4">
            <div
              className="rounded-full overflow-hidden flex"
              style={{ height: '8px', backgroundColor: 'var(--color-border)' }}
            >
              {/* Easy segment */}
              <div
                style={{
                  width: `${(dsa.easySolved / DSA_TARGET) * 100}%`,
                  backgroundColor: '#4ade80',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 6px #4ade8066',
                }}
              />
              {/* Medium segment */}
              <div
                style={{
                  width: `${(dsa.mediumSolved / DSA_TARGET) * 100}%`,
                  backgroundColor: '#fb923c',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 6px #fb923c66',
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-ghost)' }}>
              <span>
                <span style={{ color: '#4ade80' }}>{dsa.easySolved} Easy</span>
                {' '}+{' '}
                <span style={{ color: '#fb923c' }}>{dsa.mediumSolved} Medium</span>
              </span>
              <span>{DSA_TARGET} target</span>
            </div>
          </div>

          {/* Tip when no problems yet */}
          {total === 0 && (
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-invisible)' }}>
              Start with Easy problems — arrays, strings, hashmaps. Aim for 3–4 per week during Phase 2.
            </p>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-ghost)' }}>Last 7 days</p>
        <WeekBarChart weekDays={weekDays} dailyCount={dsa.dailyCount || {}} todayStr={todayStr} />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-invisible)' }}>
          <span>6d ago</span>
          <span>today</span>
        </div>
      </div>
    </div>
  );
}
