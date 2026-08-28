import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#pricing' },
]

const FEATURES = [
  {
    tag: '01 — PARSE',
    title: 'Deep Resume Parsing',
    body: 'Extracts structured data from any resume format — PDF, DOCX, plain text — across 200+ fields. Handles non-standard layouts, multi-column formats, and embedded graphics without information loss.',
    stat: '99.4%',
    statLabel: 'parse accuracy',
  },
  {
    tag: '02 — SCORE',
    title: 'JD Match Intelligence',
    body: 'Compares candidate profiles against job descriptions using semantic similarity, not keyword stuffing. Surfaces skill gaps, hidden strengths, and seniority signal in under 400ms.',
    stat: '<400ms',
    statLabel: 'per candidate',
  },
  {
    tag: '03 — RANK',
    title: 'Ranked Shortlists',
    body: 'Produces calibrated, explainable candidate rankings with per-criterion breakdowns. Every decision is auditable — see exactly why a candidate scored where they did.',
    stat: '3.2×',
    statLabel: 'faster time-to-hire',
  },
  {
    tag: '04 — BIAS',
    title: 'Bias Mitigation Layer',
    body: 'Flags protected-attribute proxies before they enter the pipeline. Redacts, neutralizes, and reports — with a full audit trail for compliance and EEOC documentation.',
    stat: '0',
    statLabel: 'known proxy leaks',
  },
  {
    tag: '05 — API',
    title: 'Headless API First',
    body: 'REST + GraphQL endpoints for every capability. Webhook support, async batch processing for bulk ingestion, and SDK packages for Python, TypeScript, and Go.',
    stat: '12ms',
    statLabel: 'median API latency',
  },
  {
    tag: '06 — LEARN',
    title: 'Feedback-Driven Tuning',
    body: 'Rankings improve from recruiter feedback. Connect your ATS outcomes — offer accepted, declined, churned — and the model reweights automatically against your hiring reality.',
    stat: '↑ 41%',
    statLabel: 'accuracy after 90d',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect your ATS',
    body: 'OAuth integrations with Greenhouse, Lever, Workday, and 28 others. Pull historical resumes to bootstrap your baseline model immediately.',
  },
  {
    step: '02',
    title: 'Define your criteria',
    body: 'Paste a job description or configure scoring rubrics manually. The system infers implicit criteria from your past hiring decisions.',
  },
  {
    step: '03',
    title: 'Review ranked shortlists',
    body: 'Candidates surface with scores, evidence, and flags. One click to request a structured interview kit tailored to each candidate.',
  },
]

const PLANS = [
  {
    name: 'Startup',
    price: '$299',
    period: '/mo',
    seats: 'Up to 5 recruiters',
    items: ['500 resumes/mo', 'JD match scoring', 'API access', 'Email support'],
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$899',
    period: '/mo',
    seats: 'Up to 20 recruiters',
    items: [
      '5,000 resumes/mo',
      'Bias mitigation layer',
      'Feedback-driven tuning',
      'Slack + CRM integrations',
      'Priority support',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    seats: 'Unlimited seats',
    items: [
      'Unlimited resumes',
      'Private model fine-tuning',
      'On-prem / VPC deploy',
      'EEOC audit exports',
      'Dedicated CSM',
    ],
    highlight: false,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleCTA = (e: FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      navigate('/register')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            RI
          </div>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
            ResumeIQ
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveNav(link.label)}
              className="text-xs tracking-widest uppercase transition-colors duration-150"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: activeNav === link.label ? 'var(--accent)' : 'var(--muted-foreground)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-xs font-bold tracking-widest uppercase px-4 py-2 transition-all duration-150"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold tracking-widest uppercase px-4 py-2 transition-all duration-150"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              textDecoration: 'none',
            }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-0 px-8 md:px-16 lg:px-24 relative overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Background grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Label */}
        <div className="relative flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          <span
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
          >
            AI Resume Intelligence — v2.4.0
          </span>
        </div>

        {/* Headline */}
        <div className="relative max-w-5xl">
          <h1
            className="text-[clamp(3rem,9vw,7.5rem)] font-bold leading-none mb-0"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}
          >
            <span style={{ color: 'var(--foreground)' }}>Hire on</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>Signal,</span>
            <br />
            <span style={{ color: 'var(--foreground)' }}>not</span>
            <br />
            <span
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px rgba(245,240,232,0.3)',
              }}
            >
              Noise.
            </span>
          </h1>
        </div>

        {/* Sub-grid: description + stats */}
        <div className="relative mt-16 grid grid-cols-1 md:grid-cols-3 gap-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="md:col-span-2 py-8 pr-8" style={{ borderRight: '1px solid var(--border)' }}>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'rgba(245,240,232,0.65)', fontWeight: 300 }}>
              ResumeIQ uses large-scale language models to parse, score, and rank candidates against any job description — delivering ranked shortlists with explainable scores in under a second. No black boxes. No bias proxies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  border: 'none',
                  textDecoration: 'none',
                }}
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'transparent',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="py-8 pl-8">
            <div className="grid grid-cols-2 gap-8">
              {[
                { n: '4.2M', l: 'resumes processed' },
                { n: '99.4%', l: 'parse accuracy' },
                { n: '3.2×', l: 'faster time-to-hire' },
                { n: '<400ms', l: 'per ranking' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
                  >
                    {n}
                  </div>
                  <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>

            {/* Logos */}
            <div className="mt-8">
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                Trusted by
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                {['Stripe', 'Linear', 'Vercel', 'Notion'].map(name => (
                  <span
                    key={name}
                    className="text-sm font-medium"
                    style={{ color: 'rgba(245,240,232,0.3)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero image / terminal mock */}
        <div className="relative mt-16 -mx-8 md:-mx-16 lg:-mx-24 overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="p-6 md:p-10"
            style={{ background: 'var(--card)' }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="ml-4 text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
                resumeiq — ranking pipeline
              </span>
            </div>

            {/* Fake terminal output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <pre
                  className="text-sm leading-7 overflow-x-auto"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
                >
{`$ resumeiq rank \\
  --jd "Senior ML Engineer" \\
  --pool ./candidates/ \\
  --top 5

`}
                  <span style={{ color: 'var(--accent)' }}>⠶</span>
                  {` Parsing 847 resumes...    `}
                  <span style={{ color: '#28c840' }}>done</span>
                  {`
`}
                  <span style={{ color: 'var(--accent)' }}>⠶</span>
                  {` Scoring against JD...     `}
                  <span style={{ color: '#28c840' }}>done</span>
                  {`
`}
                  <span style={{ color: 'var(--accent)' }}>⠶</span>
                  {` Running bias checks...    `}
                  <span style={{ color: '#28c840' }}>done</span>
                  {`
`}
                  <span style={{ color: 'var(--accent)' }}>⠶</span>
                  {` Generating shortlist...   `}
                  <span style={{ color: '#28c840' }}>{'done (382ms)'}</span>
                </pre>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Ranked Shortlist
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'Priya Mehta', score: 94, skills: 'PyTorch · MLOps · Distributed' },
                    { name: 'James Okafor', score: 91, skills: 'TensorFlow · RLHF · Rust' },
                    { name: 'Sofia Larsson', score: 88, skills: 'JAX · LLM · Systems' },
                    { name: 'Daniel Wu', score: 85, skills: 'Kubernetes · MLflow · Go' },
                    { name: 'Amara Diallo', score: 83, skills: 'Spark · Feature Store · SQL' },
                  ].map(({ name, score, skills }, i) => (
                    <div
                      key={name}
                      className="flex items-center gap-4 px-3 py-2 transition-colors duration-100"
                      style={{
                        borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                        background: i === 0 ? 'rgba(240,180,41,0.06)' : 'transparent',
                      }}
                    >
                      <span
                        className="text-xs w-4 text-right"
                        style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{name}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>{skills}</div>
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: score >= 90 ? 'var(--accent)' : 'var(--muted-foreground)' }}
                      >
                        {score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-8 md:px-16 lg:px-24 py-24">
        <div className="flex items-start justify-between mb-16 flex-wrap gap-6">
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
            >
              Capabilities
            </div>
            <h2
              className="text-5xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}
            >
              Built for<br />recruiters who<br />care about data.
            </h2>
          </div>
          <div className="max-w-sm self-end">
            <p style={{ color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, fontWeight: 300 }}>
              Every module is designed to reduce bias, increase throughput, and surface the candidates that ATS keyword-matching consistently misses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0" style={{ border: '1px solid var(--border)' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.tag}
              className="p-8 group transition-colors duration-150 cursor-default"
              style={{
                borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--border)' : undefined,
                borderBottom: i < 3 ? '1px solid var(--border)' : undefined,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--secondary)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent'
              }}
            >
              <div
                className="text-xs uppercase tracking-widest mb-6"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
              >
                {f.tag}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 300 }}>
                {f.body}
              </p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div
                  className="text-3xl font-bold"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--foreground)' }}
                >
                  {f.stat}
                </div>
                <div
                  className="text-xs uppercase tracking-widest mt-1"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
                >
                  {f.statLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-8 md:px-16 lg:px-24 py-24"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-12"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
        >
          How It Works
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ borderTop: '1px solid var(--border)' }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className="pt-10 pb-10"
              style={{
                paddingRight: i < HOW_IT_WORKS.length - 1 ? '3rem' : 0,
                paddingLeft: i > 0 ? '3rem' : 0,
                borderRight: i < HOW_IT_WORKS.length - 1 ? '1px solid var(--border)' : undefined,
              }}
            >
              <div
                className="text-6xl font-bold mb-6"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(240,180,41,0.18)' }}
              >
                {step.step}
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {step.title}
              </h3>
              <p className="leading-relaxed" style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 300 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="px-8 md:px-16 lg:px-24 py-24"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="mb-16">
          <div
            className="text-xs uppercase tracking-widest mb-4"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
          >
            Pricing
          </div>
          <h2
            className="text-5xl md:text-6xl font-bold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}
          >
            Flat pricing.<br />No per-seat games.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ border: '1px solid var(--border)' }}>
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className="p-8 flex flex-col"
              style={{
                borderRight: i < PLANS.length - 1 ? '1px solid var(--border)' : undefined,
                background: plan.highlight ? 'var(--secondary)' : 'transparent',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute top-0 left-0 right-0 py-1 text-center text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  Most Popular
                </div>
              )}
              <div style={{ marginTop: plan.highlight ? '2rem' : 0 }}>
                <div
                  className="text-xs uppercase tracking-widest mb-6"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
                >
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm mb-2"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {plan.period}
                  </span>
                </div>
                <div className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                  {plan.seats}
                </div>
                <div className="flex flex-col gap-3 mb-10">
                  {plan.items.map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
                        +
                      </span>
                      <span className="text-sm" style={{ color: 'rgba(245,240,232,0.7)' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto">
                <button
                  className="w-full py-3 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    background: plan.highlight ? 'var(--accent)' : 'transparent',
                    color: plan.highlight ? 'var(--accent-foreground)' : 'var(--foreground)',
                    border: plan.highlight ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const btn = e.currentTarget
                    if (plan.highlight) {
                      btn.style.background = '#f5f0e8'
                    } else {
                      btn.style.borderColor = 'var(--accent)'
                      btn.style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={e => {
                    const btn = e.currentTarget
                    if (plan.highlight) {
                      btn.style.background = 'var(--accent)'
                    } else {
                      btn.style.borderColor = 'var(--border)'
                      btn.style.color = 'var(--foreground)'
                    }
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        className="px-8 md:px-16 lg:px-24 py-24"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
            >
              Get Early Access
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}
            >
              Stop reviewing<br />resumes manually.
            </h2>
            <p style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 300, lineHeight: 1.7 }}>
              Join 400+ recruiting teams already using ResumeIQ to cut screening time by 3× — with no change to their existing ATS workflow.
            </p>
          </div>

          <div>
            {submitted ? (
              <div
                className="p-8 text-center"
                style={{ border: '1px solid var(--accent)', background: 'rgba(240,180,41,0.06)' }}
              >
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
                >
                  Access requested.
                </div>
                <div style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 300 }}>
                  We will reach out to {email} within 24 hours.
                </div>
              </div>
            ) : (
              <form onSubmit={handleCTA} className="flex flex-col gap-0" style={{ border: '1px solid var(--border)' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="px-5 py-4 text-sm outline-none"
                  style={{
                    background: 'transparent',
                    color: 'var(--foreground)',
                    fontFamily: 'JetBrains Mono, monospace',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                />
                <button
                  type="submit"
                  className="px-5 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.background = '#f5f0e8'
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.background = 'var(--accent)'
                  }}
                >
                  Request Access →
                </button>
              </form>
            )}

            <div className="mt-4 flex flex-wrap gap-6">
              {['No credit card required', 'Setup in 15 minutes', 'Cancel anytime'].map(t => (
                <div
                  key={t}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-8 md:px-16 lg:px-24 py-8 flex flex-wrap items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-6 h-6 text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            RI
          </div>
          <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}>
            © 2026 ResumeIQ, Inc.
          </span>
        </div>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Security', 'Status'].map(link => (
            <span
              key={link}
              className="text-xs cursor-pointer transition-colors duration-100"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted-foreground)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLSpanElement).style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLSpanElement).style.color = 'var(--muted-foreground)'
              }}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}
