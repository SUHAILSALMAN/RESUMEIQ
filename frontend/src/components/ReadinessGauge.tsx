/** Semi-circular readiness gauge — mirrors the Streamlit Plotly indicator. */

type Props = {
  value: number
  label?: string
  className?: string
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

/** Map 0–100 onto a 180° arc (left → right, bottom semicircle upward). */
function polar(cx: number, cy: number, r: number, pct: number) {
  const angle = Math.PI * (1 - clamp(pct) / 100)
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  }
}

function arcPath(cx: number, cy: number, r: number, fromPct: number, toPct: number) {
  const start = polar(cx, cy, r, fromPct)
  const end = polar(cx, cy, r, toPct)
  const large = toPct - fromPct > 50 ? 1 : 0
  // Sweep clockwise from left (100%) toward right (0%) is opposite of our pct mapping;
  // we draw from `from` to `to` with the short/long arc as needed.
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

export default function ReadinessGauge({ value, label = 'Career Readiness', className }: Props) {
  const score = clamp(Number.isFinite(value) ? value : 0)
  const cx = 140
  const cy = 130
  const r = 100
  const needle = polar(cx, cy, r - 12, score)

  const zoneColor =
    score >= 70 ? '#66bb6a' : score >= 40 ? '#f0b429' : '#ff6b6b'

  return (
    <div className={className} style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
      <div
        className="px-6 pt-5 text-xs uppercase tracking-widest"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
      >
        {label}
      </div>
      <svg viewBox="0 0 280 170" className="w-full max-w-md mx-auto block" aria-label={`${label}: ${score}%`}>
        {/* Background track */}
        <path
          d={arcPath(cx, cy, r, 0, 100)}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="18"
          strokeLinecap="butt"
        />
        {/* Zones: 0–40 red, 40–70 amber, 70–100 green */}
        <path d={arcPath(cx, cy, r, 0, 40)} fill="none" stroke="#ff4d4d" strokeWidth="18" opacity="0.85" />
        <path d={arcPath(cx, cy, r, 40, 70)} fill="none" stroke="#ffcc00" strokeWidth="18" opacity="0.85" />
        <path d={arcPath(cx, cy, r, 70, 100)} fill="none" stroke="#66bb6a" strokeWidth="18" opacity="0.85" />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke={zoneColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="7" fill={zoneColor} />
        <circle cx={cx} cy={cy} r="3" fill="var(--background)" />

        {/* Score */}
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          fill="var(--foreground)"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700 }}
        >
          {Math.round(score)}
        </text>
        <text
          x={cx}
          y={cy + 54}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em' }}
        >
          / 100
        </text>

        {/* Tick labels */}
        <text x={cx - r - 4} y={cy + 4} fill="var(--muted-foreground)" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
          0
        </text>
        <text x={cx + r - 8} y={cy + 4} fill="var(--muted-foreground)" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
          100
        </text>
      </svg>
    </div>
  )
}
