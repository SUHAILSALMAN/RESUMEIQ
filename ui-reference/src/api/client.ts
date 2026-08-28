const API_BASE = import.meta.env.VITE_API_URL || ''

export type AuthUser = { email: string; name: string; token: string }

export type AnalysisResult = {
  id: string
  email: string
  filename?: string
  created_at: string
  job_title: string
  extraction_method: string
  ocr_used: boolean
  warnings: string[]
  scores: { tfidf: number; doc2vec: number | null; embedding: number | null }
  skill_match_percentage: number
  readiness_level: string
  matched_skills: string[]
  missing_skills: string[]
  resume_skills: string[]
  predicted_category: string | null
  shap_terms: { term: string; value: number }[]
  suggestion: string
  excerpt: string
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ')
          : (data as { message?: string }).message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data as T
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthUser>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthUser>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => request<{ email: string; name: string }>('/api/auth/me', {}, token),
  logout: (token: string) => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }, token),
  jobs: (token: string) => request<{ titles: string[] }>('/api/jobs', {}, token),
  analyze: (token: string, file: File, jobTitle: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('job_title', jobTitle)
    return request<AnalysisResult>('/api/analyze', { method: 'POST', body: form }, token)
  },
  analyses: (token: string) => request<{ items: AnalysisResult[] }>('/api/analyses', {}, token),
}
