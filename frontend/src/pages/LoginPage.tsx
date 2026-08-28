import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props {
  mode?: "login" | "register";
}

const NODES = [
  { cx: 180, cy: 120, r: 6 },
  { cx: 320, cy: 80, r: 4 },
  { cx: 420, cy: 160, r: 5 },
  { cx: 260, cy: 220, r: 7 },
  { cx: 380, cy: 290, r: 4 },
  { cx: 140, cy: 300, r: 5 },
  { cx: 460, cy: 380, r: 6 },
  { cx: 220, cy: 400, r: 4 },
  { cx: 340, cy: 440, r: 5 },
  { cx: 100, cy: 200, r: 3 },
  { cx: 480, cy: 240, r: 3 },
  { cx: 300, cy: 360, r: 4 },
];

const EDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 3],
  [3, 4],
  [5, 3],
  [4, 6],
  [6, 7],
  [7, 8],
  [3, 11],
  [11, 8],
  [9, 0],
  [10, 2],
  [10, 4],
  [5, 7],
];

export default function LoginPage({ mode = "login" }: Props) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim() || email.split("@")[0], email, password);
      } else {
        await login(email, password);
      }
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex items-center gap-3">
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

        <div className="relative flex-1 flex flex-col items-center justify-center py-12">
          <svg
            viewBox="0 0 580 520"
            className="w-full max-w-md"
            aria-hidden="true"
          >
            <defs>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f0b429" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f0b429" stopOpacity="0.3" />
              </radialGradient>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f0b429" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#f0b429" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f0b429" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={NODES[a].cx}
                y1={NODES[a].cy}
                x2={NODES[b].cx}
                y2={NODES[b].cy}
                stroke="url(#edgeGrad)"
                strokeWidth="1"
                opacity="0.7"
              />
            ))}
            {NODES.map((n, i) => (
              <circle
                key={`halo-${i}`}
                cx={n.cx}
                cy={n.cy}
                r={n.r * 3}
                fill="#f0b429"
                opacity="0.04"
              />
            ))}
            {NODES.map((n, i) => (
              <circle
                key={`node-${i}`}
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill="url(#nodeGrad)"
                filter="url(#glow)"
              />
            ))}
            <circle
              cx={300}
              cy={260}
              r={28}
              fill="none"
              stroke="#f0b429"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx={300}
              cy={260}
              r={18}
              fill="none"
              stroke="#f0b429"
              strokeWidth="1"
              opacity="0.5"
            />
            <circle
              cx={300}
              cy={260}
              r={9}
              fill="#f0b429"
              opacity="0.9"
              filter="url(#glow)"
            />
          </svg>
          <div className="text-center mt-2">
            <h2
              className="text-3xl font-bold leading-tight mb-3"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.03em",
              }}
            >
              See how ready
              <br />
              you are for
              <br />
              the role.
            </h2>
            <p
              className="text-sm leading-relaxed max-w-xs mx-auto"
              style={{ color: "rgba(245,240,232,0.4)", fontWeight: 300 }}
            >
              Upload your CV, pick a job title, and get a clear skill match with
              gaps you can close.
            </p>
          </div>
        </div>

        <div
          className="relative grid grid-cols-3 gap-6 pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {[
            { n: "3.5K", l: "Resumes indexed" },
            { n: "324", l: "Job roles" },
            { n: "36", l: "Categories" },
          ].map(({ n, l }) => (
            <div key={l}>
              <div
                className="text-xl font-bold"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "var(--accent)",
                }}
              >
                {n}
              </div>
              <div
                className="text-xs mt-0.5 uppercase tracking-widest"
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
      </div>

      <div className="flex-1 flex flex-col">
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex lg:hidden items-center gap-3">
            <div
              className="flex items-center justify-center w-7 h-7 text-xs font-bold"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              RI
            </div>
            <span
              className="text-sm tracking-widest uppercase"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              ResumeIQ
            </span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <span
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>
            <Link
              to={isRegister ? "/login" : "/register"}
              className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                textDecoration: "none",
              }}
            >
              {isRegister ? "Sign In" : "Register"}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs mb-10"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--muted-foreground)",
                textDecoration: "none",
              }}
            >
              ← Back to home
            </Link>

            {done ? (
              <div className="text-center py-8">
                <div
                  className="w-14 h-14 flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "rgba(240,180,41,0.1)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "var(--accent)",
                      fontSize: 22,
                    }}
                  >
                    ✓
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {isRegister ? "Account created." : "Signed in."}
                </h2>
                <p
                  style={{ color: "var(--muted-foreground)", fontWeight: 300 }}
                >
                  Redirecting to your dashboard…
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <div
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "var(--accent)",
                    }}
                  >
                    {isRegister ? "Get started" : "Welcome back"}
                  </div>
                  <h1
                    className="text-4xl font-bold mb-2"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {isRegister ? (
                      <>
                        Create your
                        <br />
                        job-seeker account.
                      </>
                    ) : (
                      <>
                        Sign in to
                        <br />
                        your dashboard.
                      </>
                    )}
                  </h1>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--muted-foreground)",
                      fontWeight: 300,
                    }}
                  >
                    {isRegister
                      ? "Upload your CV and check skill match for any target role."
                      : "Continue matching your resume to the roles you want."}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-0"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {isRegister && (
                    <div
                      className="relative"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        outline:
                          focusedField === "name"
                            ? "1px solid var(--accent)"
                            : "none",
                        outlineOffset: "-1px",
                      }}
                    >
                      <label
                        className="block px-4 pt-3 text-xs uppercase tracking-widest"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color:
                            focusedField === "name"
                              ? "var(--accent)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        Full name
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Alex Chen"
                        className="w-full px-4 pb-3 pt-1 text-sm outline-none"
                        style={{
                          background: "transparent",
                          color: "var(--foreground)",
                          fontFamily: "JetBrains Mono, monospace",
                          border: "none",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <div
                    className="relative"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      outline:
                        focusedField === "email"
                          ? "1px solid var(--accent)"
                          : "none",
                      outlineOffset: "-1px",
                    }}
                  >
                    <label
                      className="block px-4 pt-3 text-xs uppercase tracking-widest"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color:
                          focusedField === "email"
                            ? "var(--accent)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@email.com"
                      className="w-full px-4 pb-3 pt-1 text-sm outline-none"
                      style={{
                        background: "transparent",
                        color: "var(--foreground)",
                        fontFamily: "JetBrains Mono, monospace",
                        border: "none",
                        display: "block",
                      }}
                    />
                  </div>
                  <div
                    className="relative"
                    style={{
                      outline:
                        focusedField === "password"
                          ? "1px solid var(--accent)"
                          : "none",
                      outlineOffset: "-1px",
                    }}
                  >
                    <label
                      className="block px-4 pt-3 text-xs uppercase tracking-widest"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color:
                          focusedField === "password"
                            ? "var(--accent)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      Password
                    </label>
                    <div className="flex items-center pr-4">
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••••••"
                        className="flex-1 px-4 pb-3 pt-1 text-sm outline-none"
                        style={{
                          background: "transparent",
                          color: "var(--foreground)",
                          fontFamily: "JetBrains Mono, monospace",
                          border: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="text-xs uppercase tracking-widest"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "var(--muted-foreground)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          paddingBottom: "0.75rem",
                        }}
                      >
                        {showPass ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-4 text-sm font-bold tracking-widest uppercase"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      background: loading
                        ? "rgba(240,180,41,0.6)"
                        : "var(--accent)",
                      color: "var(--accent-foreground)",
                      border: "none",
                      borderTop: "1px solid var(--border)",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading
                      ? isRegister
                        ? "Creating account…"
                        : "Signing in…"
                      : isRegister
                        ? "Create Account →"
                        : "Sign In →"}
                  </button>
                </form>

                {error && (
                  <p
                    className="mt-4 text-sm"
                    style={{
                      color: "#ff6b6b",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {error}
                  </p>
                )}

                <div className="mt-5 flex justify-end">
                  <Link
                    to={isRegister ? "/login" : "/register"}
                    className="text-xs"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "var(--muted-foreground)",
                      textDecoration: "none",
                    }}
                  >
                    {isRegister ? "← Sign in instead" : "Create account →"}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className="px-8 py-4 flex flex-wrap gap-4 items-center justify-between"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-xs"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--muted-foreground)",
            }}
          >
            • © 2026 ResumeIQ • AI-Powered Resume Skill Matching & Career
            Readiness System.
          </span>
        </div>
      </div>
    </div>
  );
}
