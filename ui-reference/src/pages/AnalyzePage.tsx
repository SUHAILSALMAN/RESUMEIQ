import { useEffect, useState, type FormEvent } from 'react'
import { api, type AnalysisResult } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function AnalyzePage() {
  const { user } = useAuth()
  const [titles, setTitles] = useState<string[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    if (!user?.token) return
    api.jobs(user.token)
      .then((res) => {
        setTitles(res.titles)
        if (res.titles.length) setJobTitle(res.titles[0])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load jobs'))
  }, [user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.token || !file || !jobTitle) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const analysis = await api.analyze(user.token, file, jobTitle)
      setResult(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
          Skill Match
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
          Analyze resume<br />readiness.
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>
          Same pipeline as the dissertation system — extraction, skills, TF-IDF, embeddings, classification.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-0 mb-10" style={{ border: '1px solid var(--border)' }}>
        <div className="p-6 lg:col-span-2" style={{ borderRight: '1px solid var(--border)' }}>
          <label className="block text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
            Resume file (PDF / DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
            style={{ color: 'var(--foreground)', fontFamily: 'JetBrains Mono, monospace' }}
          />
          {file && (
            <div className="mt-3 text-xs" style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
              Selected: {file.name}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
              Target role
            </label>
            <select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {titles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="mt-auto py-3 text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: loading ? 'rgba(240,180,41,0.55)' : 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              cursor: loading || !file ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Analyzing…' : 'Run Analysis →'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 text-sm" style={{ border: '1px solid #ff6b6b', color: '#ff6b6b', background: 'rgba(255,107,107,0.06)' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {result.ocr_used && (
            <div className="p-4 text-sm" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'rgba(240,180,41,0.06)' }}>
              Scanned document detected — OCR was used ({result.extraction_method}).
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: '1px solid var(--border)' }}>
            {[
              { label: 'Skill match', value: `${result.skill_match_percentage}%` },
              { label: 'TF-IDF', value: `${result.scores.tfidf}%` },
              { label: 'Doc2Vec', value: result.scores.doc2vec != null ? `${result.scores.doc2vec}%` : '—' },
              { label: 'Embeddings', value: result.scores.embedding != null ? `${result.scores.embedding}%` : '—' },
            ].map((s, i) => (
              <div key={s.label} className="p-5" style={{ borderRight: i < 3 ? '1px solid var(--border)' : undefined }}>
                <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>{s.label}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>Readiness</div>
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{result.readiness_level}</div>
              {result.predicted_category && (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Predicted category: <span style={{ color: 'var(--foreground)' }}>{result.predicted_category}</span>
                </p>
              )}
              <p className="text-sm mt-4 leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>{result.suggestion}</p>
            </div>
            <div className="p-6" style={{ border: '1px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>Matched skills</div>
              <p className="text-sm mb-6" style={{ color: 'rgba(245,240,232,0.8)' }}>
                {result.matched_skills.join(', ') || 'None'}
              </p>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>Missing skills</div>
              <p className="text-sm" style={{ color: 'rgba(245,240,232,0.8)' }}>
                {result.missing_skills.join(', ') || 'None'}
              </p>
            </div>
          </div>

          {result.shap_terms.length > 0 && (
            <div className="p-6" style={{ border: '1px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                SHAP contributions
              </div>
              <div className="flex flex-col gap-2">
                {result.shap_terms.map((t) => (
                  <div key={t.term} className="flex items-center gap-4">
                    <div className="w-32 text-xs truncate" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>{t.term}</div>
                    <div className="flex-1 h-2" style={{ background: 'var(--secondary)' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.abs(t.value) * 400)}%`,
                          height: '100%',
                          background: t.value >= 0 ? 'var(--accent)' : '#ff6b6b',
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.value.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
