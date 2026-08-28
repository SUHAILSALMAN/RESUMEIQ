import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type AnalysisResult } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.token) return
    api.analyses(user.token)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
  }, [user])

  const latest = items[0]
  const avgMatch = items.length
    ? Math.round(items.reduce((s, i) => s + i.skill_match_percentage, 0) / items.length)
    : null

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
          Overview
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
          Welcome back,<br />{user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>
          Upload your CV and see how well your skills match the roles you are applying for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10" style={{ border: '1px solid var(--border)' }}>
        {[
          { label: 'Matches run', value: String(items.length) },
          { label: 'Avg skill match', value: avgMatch != null ? `${avgMatch}%` : '—' },
          { label: 'Latest readiness', value: latest?.readiness_level || '—' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-6"
            style={{ borderRight: i < 2 ? '1px solid var(--border)' : undefined, background: i === 0 ? 'rgba(240,180,41,0.04)' : 'transparent' }}
          >
            <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
              {stat.label}
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="p-8" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
            Next step
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Check a role fit
          </h2>
          <p className="mb-6 text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.55)', fontWeight: 300 }}>
            Upload your PDF or DOCX resume, choose the job you want, and see your skill match score, missing skills, and readiness level.
          </p>
          <Link
            to="/analyze"
            className="inline-block px-5 py-3 text-xs font-bold tracking-widest uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent)', color: 'var(--accent-foreground)', textDecoration: 'none' }}
          >
            Match My CV →
          </Link>
        </div>

        <div className="p-8" style={{ border: '1px solid var(--border)' }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
            What you get
          </div>
          <div className="flex flex-col gap-3">
            {[
              'CV text extraction (OCR for scans)',
              'Skill match % vs target role',
              'Matched and missing skills list',
              'Readiness tips to improve your CV',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(245,240,232,0.75)' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>+</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Recent matches
        </h3>
          <Link to="/history" className="text-xs uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', textDecoration: 'none' }}>
            View all
          </Link>
        </div>
        {error && <p className="text-sm mb-4" style={{ color: '#ff6b6b' }}>{error}</p>}
        {items.length === 0 ? (
          <div className="p-8 text-sm" style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            No matches yet. Upload your CV and pick a role to see your first skill match.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)' }}>
            {items.slice(0, 5).map((item, i) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 px-4 py-4"
                style={{ borderTop: i ? '1px solid var(--border)' : undefined }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.job_title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.filename || 'resume'} · {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                  {item.skill_match_percentage}%
                </div>
                <div className="text-xs uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
                  {item.readiness_level}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
