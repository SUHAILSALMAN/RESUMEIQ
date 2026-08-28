import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type AnalysisResult } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function HistoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.token) return
    api.analyses(user.token)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [user])

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
          History
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
          Your match history
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>
          Every CV skill match you run is saved here so you can track progress.
        </p>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: '#ff6b6b' }}>{error}</p>}

      {items.length === 0 ? (
        <div className="p-10 text-center" style={{ border: '1px solid var(--border)' }}>
          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>No matches yet.</p>
          <Link to="/analyze" className="px-5 py-3 text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent)', color: 'var(--accent-foreground)', textDecoration: 'none' }}>
            Match My CV →
          </Link>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)' }}>
          {items.map((item, i) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 px-5 py-5" style={{ borderTop: i ? '1px solid var(--border)' : undefined }}>
              <div>
                <div className="text-sm font-medium">{item.job_title}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.filename || 'resume'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                {item.skill_match_percentage}% match
              </div>
              <div className="text-xs uppercase tracking-widest self-center" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
                {item.readiness_level}
              </div>
              <div className="text-xs self-center md:text-right" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
