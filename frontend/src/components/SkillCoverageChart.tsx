type Props = {
  matched: string[]
  missing: string[]
  jobTitle: string
  matchPercentage: number
}

/** Job-seeker friendly skill coverage: what you have vs what to learn next. */
export default function SkillCoverageChart({
  matched,
  missing,
  jobTitle,
  matchPercentage,
}: Props) {
  const total = Math.max(matched.length + missing.length, 1)
  const havePct = Math.round((matched.length / total) * 100)
  const gapPct = 100 - havePct

  const size = 160
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const haveLen = (havePct / 100) * c

  const priorityGaps = missing.slice(0, 8)

  return (
    <div className="p-6 md:p-8" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
      <div className="mb-6">
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
        >
          Skill coverage
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          What you have vs what to learn
        </h3>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(245,240,232,0.55)', fontWeight: 300 }}>
          For <span style={{ color: 'var(--foreground)' }}>{jobTitle}</span>, your CV covers{' '}
          <span style={{ color: 'var(--accent)' }}>{matched.length}</span> of {total} required skills
          ({matchPercentage}% match). Focus on the gaps below to improve readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Donut */}
        <div className="flex flex-col items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Skill coverage ${havePct}%`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#f0b429"
              strokeWidth={stroke}
              strokeDasharray={`${haveLen} ${c - haveLen}`}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text
              x={size / 2}
              y={size / 2 - 4}
              textAnchor="middle"
              fill="var(--foreground)"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700 }}
            >
              {havePct}%
            </text>
            <text
              x={size / 2}
              y={size / 2 + 18}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.08em' }}
            >
              COVERED
            </text>
          </svg>
          <div className="mt-4 flex gap-4 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ width: 10, height: 10, background: '#f0b429', display: 'inline-block' }} />
              Have ({matched.length})
            </span>
            <span className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--secondary)', display: 'inline-block' }} />
              Gap ({missing.length}) · {gapPct}%
            </span>
          </div>
        </div>

        {/* Have */}
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#66bb6a' }}
          >
            Skills you already have
          </div>
          {matched.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No required skills detected on your CV for this role yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matched.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    border: '1px solid rgba(102,187,106,0.45)',
                    background: 'rgba(102,187,106,0.1)',
                    color: 'var(--foreground)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Learn next */}
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ff6b6b' }}
          >
            Priority skills to learn
          </div>
          {priorityGaps.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No gaps — strong alignment for this role.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {priorityGaps.map((skill, i) => (
                <div
                  key={skill}
                  className="flex items-center gap-3 px-3 py-2"
                  style={{ border: '1px solid var(--border)', background: 'rgba(255,107,107,0.06)' }}
                >
                  <span
                    className="text-xs w-5"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm flex-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
