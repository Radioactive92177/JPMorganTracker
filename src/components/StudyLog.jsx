import { useState, useMemo } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Log entry card ───────────────────────────────────────────────────────
function LogEntry({ entry, index }) {
  const isRecent = index === 0;
  return (
    <div
      className="rounded-lg p-3"
      style={{
        backgroundColor: isRecent ? 'rgba(34,211,238,0.04)' : 'var(--color-surface-alt)',
        border: `1px solid ${isRecent ? 'rgba(34,211,238,0.12)' : 'var(--color-border)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {entry.notes}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-ghost)' }}>
            {formatDate(entry.date)}
          </p>
        </div>
        {entry.hours > 0 && (
          <span
            className="shrink-0 text-xs px-2 py-1 rounded-md font-semibold tabular-nums"
            style={{ color: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
          >
            {entry.hours}h
          </span>
        )}
      </div>
    </div>
  );
}

// ─── StudyLog ─────────────────────────────────────────────────────────────
export default function StudyLog({ studyLog, onAddEntry }) {
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');

  const totalHours = useMemo(
    () => studyLog.reduce((sum, e) => sum + (e.hours || 0), 0),
    [studyLog]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Add a brief note about what you studied.');
      return;
    }
    setError('');
    onAddEntry(notes, hours);
    setNotes('');
    setHours('');
  };

  const recentLogs = studyLog.slice(0, 10);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
            Daily Study Log
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            Track your 1AM–5AM sessions · {studyLog.length} entries · {totalHours.toFixed(1)}h total
          </p>
        </div>
        {totalHours > 0 && (
          <div
            className="text-center px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-lg font-bold tabular-nums" style={{ color: '#22d3ee' }}>
              {totalHours.toFixed(0)}h
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-ghost)' }}>logged</div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={notes}
            onChange={e => { setNotes(e.target.value); setError(''); }}
            placeholder="What did you study today? e.g. Docker networking + docker-compose practice"
            className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              border: error ? '1px solid #7f1d1d' : '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#22d3ee55'; }}
            onBlur={e => { e.currentTarget.style.borderColor = error ? '#7f1d1d' : ''; }}
          />
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="hrs"
            min="0"
            max="24"
            step="0.5"
            className="rounded-lg px-3 text-sm outline-none w-24 sm:w-20 text-center tabular-nums"
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              minHeight: '44px',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#22d3ee55'; }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; }}
          />
          <button
            type="submit"
            className="rounded-lg px-4 text-sm font-semibold cursor-pointer shrink-0"
            style={{
              backgroundColor: 'rgba(34,211,238,0.1)',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.25)',
              transition: 'background-color 0.15s ease',
              minHeight: '44px',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(34,211,238,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(34,211,238,0.1)'; }}
          >
            Log
          </button>
        </div>
        {error && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
        )}
      </form>

      {/* Log entries */}
      {recentLogs.length === 0 ? (
        <div
          className="rounded-lg p-4 text-center text-sm"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px dashed var(--color-border)', color: 'var(--color-text-ghost)' }}
        >
          No entries yet. Log your first study session above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {recentLogs.map((entry, i) => (
            <LogEntry key={entry.id} entry={entry} index={i} />
          ))}
          {studyLog.length > 10 && (
            <p className="text-xs text-center mt-1" style={{ color: 'var(--color-text-ghost)' }}>
              Showing last 10 of {studyLog.length} entries
            </p>
          )}
        </div>
      )}
    </div>
  );
}
