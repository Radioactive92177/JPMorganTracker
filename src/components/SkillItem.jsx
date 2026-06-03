import { useState, useCallback, useRef } from 'react';

// ─── Tag colours ─────────────────────────────────────────────────────────
const TAG_STYLES = {
  'already have': { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
  'learning':     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  'DSA':          { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
};

// ─── Inline notes editor ─────────────────────────────────────────────────
function NotesField({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="text-left w-full mt-1.5 text-xs rounded px-2 py-1.5 leading-relaxed"
        style={{
          color: value ? '#94a3b8' : '#374151',
          backgroundColor: '#0d1018',
          border: '1px solid #1e2433',
        }}
      >
        {value || '+ Add notes…'}
      </button>
    );
  }

  return (
    <textarea
      ref={ref}
      autoFocus
      value={draft}
      rows={2}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
      className="w-full mt-1.5 text-xs rounded px-2 py-1.5 leading-relaxed resize-none outline-none"
      style={{
        color: '#e2e8f0',
        backgroundColor: '#0d1018',
        border: '1px solid #3b82f6',
      }}
      placeholder="Notes, resources, progress details…"
    />
  );
}

// ─── SkillItem ────────────────────────────────────────────────────────────
export default function SkillItem({ skill, phaseId, onToggle, onUpdateNotes }) {
  const tag = TAG_STYLES[skill.tag] || TAG_STYLES['learning'];

  const handleNoteChange = useCallback(
    (notes) => onUpdateNotes(phaseId, skill.id, notes),
    [phaseId, skill.id, onUpdateNotes]
  );

  return (
    <div
      className="rounded-lg p-3 mb-2 last:mb-0"
      style={{
        backgroundColor: skill.completed ? 'rgba(34,211,238,0.03)' : '#0d1018',
        border: `1px solid ${skill.completed ? 'rgba(34,211,238,0.12)' : '#1a1f2e'}`,
        opacity: skill.completed ? 0.85 : 1,
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(phaseId, skill.id)}
          className="shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: skill.completed ? '#22d3ee' : 'transparent',
            border: `2px solid ${skill.completed ? '#22d3ee' : '#374151'}`,
            transition: 'all 0.15s ease',
          }}
          aria-label={skill.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {skill.completed && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="#0f1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-sm font-medium leading-tight"
              style={{
                color: skill.completed ? '#64748b' : '#cbd5e1',
                textDecoration: skill.completed ? 'line-through' : 'none',
              }}
            >
              {skill.name}
            </span>
            {/* Tag */}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                color: tag.color,
                backgroundColor: tag.bg,
                border: `1px solid ${tag.border}`,
              }}
            >
              {skill.tag}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#374151' }}>
            {skill.description}
          </p>

          {/* Notes */}
          <NotesField value={skill.notes} onChange={handleNoteChange} />
        </div>
      </div>
    </div>
  );
}
