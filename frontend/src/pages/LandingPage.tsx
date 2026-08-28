import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Job Seekers", href: "#features" },
];

const FEATURES = [
  {
    tag: "01 — UPLOAD",
    title: "Resume Upload & Parsing",
    body: "Upload your CV as PDF or DOCX. The system extracts your skills and experience — including OCR fallback for scanned resumes — so nothing important is missed.",
    stat: "PDF/DOCX",
    statLabel: "formats supported",
  },
  {
    tag: "02 — MATCH",
    title: "Skill Match by Job Role",
    body: "Pick a target role from 324 job titles. Compare your resume skills against required skills and see an exact match percentage — not just keyword fluff.",
    stat: "324",
    statLabel: "job roles",
  },
  {
    tag: "03 — GAPS",
    title: "Clear Skill Gaps",
    body: "See which skills you already have and which ones are missing for the role you want. Get concrete suggestions so you know what to learn next.",
    stat: "Actionable",
    statLabel: "improvement tips",
  },
  {
    tag: "04 — SCORE",
    title: "Multi-Model Similarity",
    body: "Your resume is scored against the role with TF-IDF, Doc2Vec, and Sentence-Transformer embeddings so you get a robust readiness signal — not a single brittle score.",
    stat: "3",
    statLabel: "matching methods",
  },
  {
    tag: "05 — EXPLAIN",
    title: "Explainable Insights",
    body: "Predicted job category comes with SHAP explanations so you understand why the model scored you that way — transparent and useful for your career planning.",
    stat: "SHAP",
    statLabel: "explainability",
  },
  {
    tag: "06 — TRACK",
    title: "Track Your Progress",
    body: "Save every analysis to your history. Re-run matches as you update your CV and watch your readiness improve over time for roles you care about.",
    stat: "History",
    statLabel: "saved analyses",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your CV",
    body: "Create a free account and upload your resume as PDF or DOCX. Scanned documents are handled with OCR when needed.",
  },
  {
    step: "02",
    title: "Choose a target role",
    body: "Select the job title you are aiming for from hundreds of roles across industries — from software to design to operations.",
  },
  {
    step: "03",
    title: "See your skill match",
    body: "Get your match score, matched vs missing skills, readiness level, and suggestions to strengthen your CV for that role.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    seats: "For individuals exploring roles",
    items: [
      "5 skill matches / month",
      "PDF & DOCX upload",
      "Skill gap report",
      "Match history",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    seats: "For active job seekers",
    items: [
      "Unlimited skill matches",
      "Multi-model similarity scores",
      "Category prediction + SHAP",
      "Priority processing",
      "Exportable reports",
    ],
    highlight: true,
  },
  {
    name: "Student",
    price: "$5",
    period: "/mo",
    seats: "With valid student email",
    items: [
      "Unlimited skill matches",
      "Career readiness insights",
      "Skill gap learning tips",
      "History & progress tracking",
    ],
    highlight: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCTA = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      navigate("/register");
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,10,10,0.94)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 text-xs font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            RI
          </div>
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.15em",
            }}
          >
            ResumeIQ
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveNav(link.label)}
              className="text-xs tracking-widest uppercase transition-colors duration-150"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color:
                  activeNav === link.label
                    ? "var(--accent)"
                    : "var(--muted-foreground)",
                textDecoration: "none",
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
              fontFamily: "JetBrains Mono, monospace",
              background: "transparent",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold tracking-widest uppercase px-4 py-2 transition-all duration-150"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              border: "none",
              textDecoration: "none",
            }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="pt-32 pb-0 px-8 md:px-16 lg:px-24 relative overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* Background grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Headline */}
        <div className="relative max-w-5xl">
          <h1
            className="text-[clamp(3rem,9vw,7.5rem)] font-bold leading-none mb-0"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "var(--foreground)" }}>Know your</span>
            <br />
            <span style={{ color: "var(--accent)" }}>Fit,</span>
            <br />
            <span style={{ color: "var(--foreground)" }}>close the</span>
            <br />
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "2px rgba(245,240,232,0.3)",
              }}
            >
              Gaps.
            </span>
          </h1>
        </div>

        {/* Sub-grid: description + stats */}
        <div
          className="relative mt-16 grid grid-cols-1 md:grid-cols-3 gap-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            className="md:col-span-2 py-8 pr-8"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <p
              className="text-lg leading-relaxed max-w-xl"
              style={{ color: "rgba(245,240,232,0.65)", fontWeight: 300 }}
            >
              ResumeIQ helps job seekers upload a CV, pick a target role, and
              see exactly how well their skills match — with clear gaps,
              readiness scores, and next steps to improve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  border: "none",
                  textDecoration: "none",
                }}
              >
                Check My Match
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  background: "transparent",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="py-8 pl-8">
            <div className="grid grid-cols-2 gap-8">
              {[
                { n: "3.5K+", l: "resumes analyzed" },
                { n: "324", l: "job roles" },
                { n: "36", l: "career categories" },
                { n: "OCR", l: "scanned CV support" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div
                    className="text-3xl font-bold"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "var(--accent)",
                    }}
                  >
                    {n}
                  </div>
                  <div
                    className="text-xs mt-1 uppercase tracking-widest"
                    style={{
                      color: "var(--muted-foreground)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            {/* Logos */}
            <div className="mt-8">
              <div
                className="text-xs uppercase tracking-widest mb-3"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                Built for
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                {["Graduates", "Switchers", "Job seekers", "Students"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-sm font-medium"
                      style={{
                        color: "rgba(245,240,232,0.3)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {name}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero image / terminal mock */}
        <div
          className="relative mt-16 -mx-8 md:-mx-16 lg:-mx-24 overflow-hidden"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="p-6 md:p-10" style={{ background: "var(--card)" }}>
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#ff5f57" }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#febc2e" }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#28c840" }}
              />
              <span
                className="ml-4 text-xs"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                resumeiq — skill match pipeline
              </span>
            </div>

            {/* Fake terminal output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <pre
                  className="text-sm leading-7 overflow-x-auto"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {`$ resumeiq match \\
  --resume ./my_cv.pdf \\
  --role "Data Scientist"

`}
                  <span style={{ color: "var(--accent)" }}>⠶</span>
                  {` Extracting resume text...  `}
                  <span style={{ color: "#28c840" }}>done</span>
                  {`
`}
                  <span style={{ color: "var(--accent)" }}>⠶</span>
                  {` Detecting your skills...   `}
                  <span style={{ color: "#28c840" }}>done</span>
                  {`
`}
                  <span style={{ color: "var(--accent)" }}>⠶</span>
                  {` Comparing to role...       `}
                  <span style={{ color: "#28c840" }}>done</span>
                  {`
`}
                  <span style={{ color: "var(--accent)" }}>⠶</span>
                  {` Building readiness report  `}
                  <span style={{ color: "#28c840" }}>{"done (382ms)"}</span>
                </pre>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{
                    color: "var(--muted-foreground)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Your Match — Data Scientist
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      name: "Skill match",
                      score: "78%",
                      skills: "Matched 14 of 18 required skills",
                    },
                    {
                      name: "TF-IDF similarity",
                      score: "72%",
                      skills: "Baseline text overlap",
                    },
                    {
                      name: "Readiness level",
                      score: "Mod.",
                      skills: "Moderate match — close the gaps",
                    },
                    {
                      name: "Missing skills",
                      score: "4",
                      skills: "Spark · Airflow · Docker · Tableau",
                    },
                    {
                      name: "Predicted category",
                      score: "DS",
                      skills: "Data Science / Analytics",
                    },
                  ].map(({ name, score, skills }, i) => (
                    <div
                      key={name}
                      className="flex items-center gap-4 px-3 py-2 transition-colors duration-100"
                      style={{
                        borderLeft:
                          i === 0
                            ? "2px solid var(--accent)"
                            : "2px solid transparent",
                        background:
                          i === 0 ? "rgba(240,180,41,0.06)" : "transparent",
                      }}
                    >
                      <span
                        className="text-xs w-4 text-right"
                        style={{
                          color: "var(--muted-foreground)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {name}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{
                            color: "var(--muted-foreground)",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {skills}
                        </div>
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color:
                            i === 0
                              ? "var(--accent)"
                              : "var(--muted-foreground)",
                        }}
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
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--accent)",
              }}
            >
              Capabilities
            </div>
            <h2
              className="text-5xl md:text-6xl font-bold leading-tight"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.03em",
              }}
            >
              Built for
              <br />
              job seekers who
              <br />
              want clarity.
            </h2>
          </div>
          <div className="max-w-sm self-end">
            <p
              style={{
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Every module is designed to help you understand your fit for a
              role, spot skill gaps early, and prepare a stronger application
              before you apply.
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
          style={{ border: "1px solid var(--border)" }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.tag}
              className="p-8 group transition-colors duration-150 cursor-default"
              style={{
                borderRight:
                  (i + 1) % 3 !== 0 ? "1px solid var(--border)" : undefined,
                borderBottom: i < 3 ? "1px solid var(--border)" : undefined,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "var(--secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "transparent";
              }}
            >
              <div
                className="text-xs uppercase tracking-widest mb-6"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "var(--accent)",
                }}
              >
                {f.tag}
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: "rgba(245,240,232,0.5)", fontWeight: 300 }}
              >
                {f.body}
              </p>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "1.5rem",
                }}
              >
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--foreground)",
                  }}
                >
                  {f.stat}
                </div>
                <div
                  className="text-xs uppercase tracking-widest mt-1"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--muted-foreground)",
                  }}
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
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-12"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--accent)",
          }}
        >
          How It Works
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className="pt-10 pb-10"
              style={{
                paddingRight: i < HOW_IT_WORKS.length - 1 ? "3rem" : 0,
                paddingLeft: i > 0 ? "3rem" : 0,
                borderRight:
                  i < HOW_IT_WORKS.length - 1
                    ? "1px solid var(--border)"
                    : undefined,
              }}
            >
              <div
                className="text-6xl font-bold mb-6"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "rgba(240,180,41,0.18)",
                }}
              >
                {step.step}
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {step.title}
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: "rgba(245,240,232,0.5)", fontWeight: 300 }}
              >
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
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="mb-16">
          <div
            className="text-xs uppercase tracking-widest mb-4"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--accent)",
            }}
          >
            Pricing
          </div>
          <h2
            className="text-5xl md:text-6xl font-bold"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "-0.03em",
            }}
          >
            Simple plans.
            <br />
            Built for your job search.
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-0"
          style={{ border: "1px solid var(--border)" }}
        >
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className="p-8 flex flex-col"
              style={{
                borderRight:
                  i < PLANS.length - 1 ? "1px solid var(--border)" : undefined,
                background: plan.highlight ? "var(--secondary)" : "transparent",
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute top-0 left-0 right-0 py-1 text-center text-xs font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  Most Popular
                </div>
              )}
              <div style={{ marginTop: plan.highlight ? "2rem" : 0 }}>
                <div
                  className="text-xs uppercase tracking-widest mb-6"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className="text-5xl font-bold"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm mb-2"
                    style={{
                      color: "var(--muted-foreground)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <div
                  className="text-sm mb-8"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {plan.seats}
                </div>
                <div className="flex flex-col gap-3 mb-10">
                  {plan.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span
                        style={{
                          color: "var(--accent)",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 14,
                        }}
                      >
                        +
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "rgba(245,240,232,0.7)" }}
                      >
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
                    fontFamily: "JetBrains Mono, monospace",
                    background: plan.highlight
                      ? "var(--accent)"
                      : "transparent",
                    color: plan.highlight
                      ? "var(--accent-foreground)"
                      : "var(--foreground)",
                    border: plan.highlight ? "none" : "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    if (plan.highlight) {
                      btn.style.background = "#f5f0e8";
                    } else {
                      btn.style.borderColor = "var(--accent)";
                      btn.style.color = "var(--accent)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    if (plan.highlight) {
                      btn.style.background = "var(--accent)";
                    } else {
                      btn.style.borderColor = "var(--border)";
                      btn.style.color = "var(--foreground)";
                    }
                  }}
                >
                  {plan.name === "Free" ? "Create Free Account" : "Get Started"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        className="px-8 md:px-16 lg:px-24 py-24"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-6"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--accent)",
              }}
            >
              Start Matching
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight mb-4"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.03em",
              }}
            >
              Stop guessing
              <br />
              if you are ready.
            </h2>
            <p
              style={{
                color: "rgba(245,240,232,0.5)",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              Upload your CV, choose a role, and see your skill match in minutes
              — so you apply with confidence and know exactly what to improve.
            </p>
          </div>

          <div>
            {submitted ? (
              <div
                className="p-8 text-center"
                style={{
                  border: "1px solid var(--accent)",
                  background: "rgba(240,180,41,0.06)",
                }}
              >
                <div
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--accent)",
                  }}
                >
                  You are in.
                </div>
                <div
                  style={{ color: "rgba(245,240,232,0.5)", fontWeight: 300 }}
                >
                  Taking you to create your account with {email}…
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleCTA}
                className="flex flex-col gap-0"
                style={{ border: "1px solid var(--border)" }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="px-5 py-4 text-sm outline-none"
                  style={{
                    background: "transparent",
                    color: "var(--foreground)",
                    fontFamily: "JetBrains Mono, monospace",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                  }}
                />
                <button
                  type="submit"
                  className="px-5 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-150"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "#f5f0e8";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "var(--accent)";
                  }}
                >
                  Create Free Account →
                </button>
              </form>
            )}

            <div className="mt-4 flex flex-wrap gap-6">
              {["Free to start", "Upload CV in seconds", "No credit card"].map(
                (t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 text-xs"
                    style={{
                      color: "var(--muted-foreground)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>✓</span>
                    {t}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-8 md:px-16 lg:px-24 py-8 flex flex-wrap items-center justify-between gap-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-6 h-6 text-xs font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            RI
          </div>
          <span
            className="text-xs"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--muted-foreground)",
            }}
          >
            © 2026 ResumeIQ • AI-Powered Resume Skill Matching & Career
            Readiness System
          </span>
        </div>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Security", "Status"].map((link) => (
            <span
              key={link}
              className="text-xs cursor-pointer transition-colors duration-100"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--muted-foreground)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color =
                  "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color =
                  "var(--muted-foreground)";
              }}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
