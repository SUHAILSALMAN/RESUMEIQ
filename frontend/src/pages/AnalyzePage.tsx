import { useEffect, useState, type FormEvent } from 'react'
import { api, type AnalysisResult } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import ReadinessGauge from '../components/ReadinessGauge'
import SkillCoverageChart from '../components/SkillCoverageChart'
import ShapContributionChart from '../components/ShapContributionChart'

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
          Match your CV<br />to a job role.
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>
          Upload your resume, select the role you want, and see your skill match score and gaps.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-0 mb-10" style={{ border: '1px solid var(--border)' }}>
        <div className="p-6 lg:col-span-2" style={{ borderRight: '1px solid var(--border)' }}>
          <label className="block text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
            Your CV (PDF / DOCX)
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
              Target job role
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
            {loading ? 'Matching…' : 'Check Skill Match →'}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <ReadinessGauge value={result.skill_match_percentage} label="Career Readiness (selected role)" />
            <div className="p-6 flex flex-col justify-center" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                Readiness for {result.job_title}
              </div>
              <div className="text-3xl font-bold mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {result.readiness_level}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {result.suggestion}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
                <span><span style={{ color: '#ff4d4d' }}>■</span> 0–40 needs work</span>
                <span><span style={{ color: '#ffcc00' }}>■</span> 40–70 moderate</span>
                <span><span style={{ color: '#66bb6a' }}>■</span> 70–100 strong</span>
              </div>
            </div>
          </div>

          {result.role_prediction && (
            <div className="p-6 md:p-8" style={{ border: '1px solid var(--accent)', background: 'rgba(240,180,41,0.06)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                Best role prediction for your CV
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
                  {result.role_prediction.best_job_title}
                </h2>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                    {result.role_prediction.confidence}%
                  </div>
                  <div className="text-xs uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
                    skill-match confidence · {result.role_prediction.readiness_level}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.7)' }}>
                {result.role_prediction.reason}
              </p>
              {result.role_prediction.matched_skills.length > 0 && (
                <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.85)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Matched: </span>
                  {result.role_prediction.matched_skills.join(', ')}
                </p>
              )}
              {result.role_prediction.missing_skills.length > 0 && (
                <p className="text-sm mb-4" style={{ color: 'rgba(245,240,232,0.85)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Still missing: </span>
                  {result.role_prediction.missing_skills.join(', ')}
                </p>
              )}
              {result.role_prediction.best_job_title !== result.job_title && (
                <button
                  type="button"
                  onClick={() => setJobTitle(result.role_prediction!.best_job_title)}
                  className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Select {result.role_prediction.best_job_title} →
                </button>
              )}
              {result.role_prediction.classifier_label && (
                <p className="text-xs mt-4" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                  Classifier support: “{result.role_prediction.classifier_label}”
                  {result.role_prediction.classifier_confidence != null
                    ? ` (${Math.round(result.role_prediction.classifier_confidence * 100)}%)`
                    : ''}
                  {result.role_prediction.classifier_mapped_roles.length
                    ? ` → ${result.role_prediction.classifier_mapped_roles.join(', ')}`
                    : ''}
                </p>
              )}
            </div>
          )}

          {!!(result.role_prediction?.alternatives?.length || result.related_roles?.length) && (
            <div className="p-6" style={{ border: '1px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>
                Other strong role matches
              </div>
              <div className="flex flex-col gap-0" style={{ border: '1px solid var(--border)' }}>
                {(result.role_prediction?.alternatives || result.related_roles || []).map((role, i) => (
                  <button
                    key={role.job_title}
                    type="button"
                    onClick={() => setJobTitle(role.job_title)}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-left w-full transition-colors"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderTop: i ? '1px solid var(--border)' : 'none',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <span className="text-sm">{role.job_title}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {role.match_percentage}%
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
                Click a role to select it, then run Check Skill Match again.
              </p>
            </div>
          )}

          <SkillCoverageChart
            matched={result.matched_skills}
            missing={result.missing_skills}
            jobTitle={result.job_title}
            matchPercentage={result.skill_match_percentage}
          />

          {result.shap_terms.length > 0 && (
            <ShapContributionChart
              terms={result.shap_terms}
              category={result.role_prediction?.classifier_label || result.predicted_category}
            />
          )}
        </div>
      )}
    </div>
  )
}
