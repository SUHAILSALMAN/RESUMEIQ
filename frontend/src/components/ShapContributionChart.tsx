type ShapTerm = { term: string; value: number }

type Props = {
  terms: ShapTerm[]
  category?: string | null
}

/**
 * Diverging bar chart for SHAP feature contributions.
 * Kept for dissertation / methodology evidence (model interpretability).
 */
export default function ShapContributionChart({ terms, category }: Props) {
  const rows = [...terms]
    .filter((t) => Number.isFinite(t.value) && t.term)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10)

  if (!rows.length) return null

  const maxAbs = Math.max(...rows.map((t) => Math.abs(t.value)), 0.0001)
  const mono = 'JetBrains Mono, monospace'

  return (
    <div className="p-6 md:p-8" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
      <div className="mb-6">
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ fontFamily: mono, color: 'var(--accent)' }}
        >
          Model interpretability
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: mono }}>
          SHAP word contributions{category ? ` — ${category}` : ''}
        </h3>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(245,240,232,0.55)', fontWeight: 300 }}>
          Which resume terms pushed the classifier towards or away from this category.
          Gold supports the prediction, red works against it.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="flex flex-col">
          {rows.map((t, i) => {
            const pct = (Math.abs(t.value) / maxAbs) * 100
            const positive = t.value >= 0
            const color = positive ? '#f0b429' : '#ff6b6b'
            const label = (t.value >= 0 ? '+' : '') + t.value.toFixed(3)

            return (
              <div
                key={`${t.term}-${i}`}
                className="flex items-center gap-3 py-1.5"
                title={`${t.term}: ${label}`}
              >
                <span
                  className="text-xs truncate text-right shrink-0"
                  style={{ fontFamily: mono, width: 104, color: 'var(--foreground)' }}
                >
                  {t.term}
                </span>

                <div className="flex-1 flex items-center" style={{ minWidth: 0 }}>
                  <div className="flex-1 flex justify-end">
                    {!positive && (
                      <div style={{ width: `${pct}%`, height: 12, background: color, opacity: 0.9 }} />
                    )}
                  </div>
                  <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                  <div className="flex-1">
                    {positive && (
                      <div style={{ width: `${pct}%`, height: 12, background: color, opacity: 0.9 }} />
                    )}
                  </div>
                </div>

                <span
                  className="text-xs text-right shrink-0"
                  style={{ fontFamily: mono, width: 52, color: 'var(--muted-foreground)' }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <div
          className="flex items-center justify-between mt-4 pt-3 text-xs"
          style={{ fontFamily: mono, color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}
        >
          <span className="flex items-center gap-2">
            <span style={{ width: 10, height: 10, background: '#ff6b6b', display: 'inline-block' }} />
            Against
          </span>
          <span>0</span>
          <span className="flex items-center gap-2">
            <span style={{ width: 10, height: 10, background: '#f0b429', display: 'inline-block' }} />
            Supports
          </span>
        </div>
      </div>
    </div>
  )
}
