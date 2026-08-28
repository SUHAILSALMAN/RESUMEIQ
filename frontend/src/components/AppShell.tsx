import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/analyze', label: 'Skill Match' },
  { to: '/history', label: 'History' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 px-6 py-8"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--card)' }}
      >
        <div className="flex items-center gap-3 mb-10">
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

        <nav className="flex flex-col gap-1 flex-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2.5 text-xs uppercase tracking-widest transition-colors ${isActive ? '' : ''}`
              }
              style={({ isActive }) => ({
                fontFamily: 'JetBrains Mono, monospace',
                color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                background: isActive ? 'rgba(240,180,41,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div className="text-sm font-medium mb-1 truncate">{user?.name}</div>
          <div className="text-xs mb-4 truncate" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace' }}>
            {user?.email}
          </div>
          <button
            onClick={async () => {
              await logout()
              navigate('/')
            }}
            className="w-full py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="md:hidden flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ResumeIQ
          </span>
          <div className="flex gap-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>
                {l.label.split(' ')[0]}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="flex-1 px-6 md:px-10 py-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
