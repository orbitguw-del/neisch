import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import StoreyIcon from '@/components/brand/StoreyIcon'
import { supabase } from '@/lib/supabase'

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-sand-300 bg-sand-200/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <StoreyIcon size={28} />
          <span className="font-display text-lg font-bold text-charcoal-900">Storey</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  return (
    <section className={`px-5 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ number, label }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-bold text-brand-600">{number}</p>
      <p className="mt-0.5 text-sm text-charcoal-500">{label}</p>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function Feature({ emoji, title, body }) {
  return (
    <div className="rounded-2xl border border-sand-300 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 text-3xl">{emoji}</div>
      <h3 className="mb-2 font-display text-base font-bold text-charcoal-900">{title}</h3>
      <p className="text-sm leading-relaxed text-charcoal-500">{body}</p>
    </div>
  )
}

// ── Step ─────────────────────────────────────────────────────────────────────
function Step({ n, title, body }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow">
        {n}
      </div>
      <div>
        <p className="font-display font-bold text-charcoal-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-charcoal-500">{body}</p>
      </div>
    </div>
  )
}

// ── Role card ─────────────────────────────────────────────────────────────────
function RoleCard({ emoji, role, who, can }) {
  return (
    <div className="rounded-2xl border border-sand-300 bg-sand-100 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-display font-bold text-charcoal-900">{role}</p>
          <p className="text-xs text-charcoal-400">{who}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {can.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-charcoal-600">
            <span className="mt-0.5 text-sage-500">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const navigate = useNavigate()

  // If user is already logged in, send them straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-sand-200 text-charcoal-900">
      <Nav />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <Section className="pb-20 pt-20">
        <div className="text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            🏗️ Built for construction teams in India
          </span>

          {/* Headline */}
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-charcoal-900 sm:text-5xl">
            Run your sites without<br />
            <span className="text-brand-600">the daily chaos</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-charcoal-500">
            Know what's happening on every site — materials, workers, daily progress —
            without a single phone call or paper register.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary rounded-xl px-7 py-3 text-base shadow-md hover:shadow-lg">
              Start for free →
            </Link>
            <Link to="/login" className="btn-secondary rounded-xl px-7 py-3 text-base">
              Sign in
            </Link>
          </div>

          <p className="mt-3 text-xs text-charcoal-400">No credit card needed · Set up in under 5 minutes</p>
        </div>

        {/* Hero image / mock */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-sand-300 bg-charcoal-900 shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-charcoal-700 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-charcoal-400">storeyinfra.com/dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            {[
              { label: 'Active Sites', value: '4', color: 'text-sage-300' },
              { label: 'Materials on Site', value: '38', color: 'text-brand-400' },
              { label: 'Workers Today', value: '67', color: 'text-sand-300' },
              { label: 'Pending Receipts', value: '3', color: 'text-yellow-400' },
            ].map(card => (
              <div key={card.label} className="rounded-xl bg-charcoal-800 p-4 text-center">
                <p className={`font-display text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className="mt-1 text-xs text-charcoal-400">{card.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 px-5 pb-5 sm:grid-cols-3">
            {[
              { site: 'Sector 5 — Tower A', status: 'On track', dot: 'bg-green-400' },
              { site: 'MG Road — Foundation', status: 'Material low', dot: 'bg-yellow-400' },
              { site: 'Whitefield Phase 2', status: 'On track', dot: 'bg-green-400' },
            ].map(row => (
              <div key={row.site} className="flex items-center justify-between rounded-lg bg-charcoal-800 px-3 py-2.5">
                <span className="text-xs font-medium text-charcoal-200">{row.site}</span>
                <span className="flex items-center gap-1.5 text-xs text-charcoal-400">
                  <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <Section className="py-12">
        <div className="rounded-2xl border border-sand-300 bg-white px-8 py-8 shadow-sm">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat number="10 min" label="Average setup time" />
            <Stat number="4 roles" label="Contractor · Manager · Supervisor · Store" />
            <Stat number="100%" label="Works on phone, no app download needed" />
            <Stat number="Real-time" label="Everyone sees the same numbers" />
          </div>
        </div>
      </Section>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <Section className="py-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Sound familiar?</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-charcoal-900">
              Running a site on WhatsApp messages and Excel sheets?
            </h2>
          </div>
          <ul className="space-y-4">
            {[
              'Your store keeper sends material counts over WhatsApp — you lose track of what arrived',
              'Attendance is marked in a register that gets rained on',
              'You find out cement ran out only when work stops',
              'Month-end reports take two days to put together',
            ].map(pain => (
              <li key={pain} className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-brand-400">✕</span>
                <span className="text-sm leading-relaxed text-charcoal-600">{pain}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <Section className="py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">What you get</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-charcoal-900">Everything in one place</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            emoji="🧱"
            title="Know exactly what's on site"
            body="See every material that arrived, how much is left, and when you need to reorder — updated by your store keeper in real time."
          />
          <Feature
            emoji="👷"
            title="Attendance without registers"
            body="Supervisors mark daily attendance on their phone. You see who showed up across all your sites without asking anyone."
          />
          <Feature
            emoji="📋"
            title="Daily logs from the ground"
            body="Supervisors write short daily updates on what was done. No more end-of-week guesses about site progress."
          />
          <Feature
            emoji="🚚"
            title="Track materials between sites"
            body="Moving cement from one site to another? Record it in seconds. Both sites stay accurate automatically."
          />
          <Feature
            emoji="📊"
            title="Reports without the effort"
            body="See monthly spending, material usage, and how you're tracking against budget — ready in one click, not two days."
          />
          <Feature
            emoji="👥"
            title="Your whole team, one system"
            body="Invite your site managers, supervisors, and store keepers. Everyone sees what they need, nothing more."
          />
        </div>
      </Section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <Section className="py-16">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">For contractors</p>
            <h2 className="mb-8 mt-3 font-display text-2xl font-bold text-charcoal-900">Up and running in minutes</h2>
            <div className="space-y-7">
              <Step n="1" title="Register your company" body="Enter your company name, your name and email. That's it — your account is ready." />
              <Step n="2" title="Add your sites" body="Create a site for each location you're managing. Add an address, that's all you need." />
              <Step n="3" title="Invite your team" body="Send an invite to your site managers, supervisors, and store keepers by email. They join in one click." />
              <Step n="4" title="Start tracking" body="Your team logs materials, marks attendance and writes daily updates. You see everything from your dashboard." />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">For your team</p>
            <h2 className="mb-8 mt-3 font-display text-2xl font-bold text-charcoal-900">Simple enough for the site</h2>
            <div className="space-y-7">
              <Step n="1" title="Check your email" body="You'll get an invite from your contractor with a code to join their company on Storey." />
              <Step n="2" title="Create your account" body="Enter the invite code, your email and a password. Takes about a minute." />
              <Step n="3" title="Open it on your phone" body="No app to download. Just open storeyinfra.com on your phone's browser and sign in." />
              <Step n="4" title="Do your job, digitally" body="Mark attendance, record materials, write your daily update — the same things you already do, just faster." />
            </div>
          </div>
        </div>
      </Section>

      {/* ── ROLES ──────────────────────────────────────────────────────────── */}
      <Section className="py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Built for every role</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-charcoal-900">Each person sees what matters to them</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            emoji="🏢"
            role="Contractor"
            who="Company owner"
            can={[
              'See all sites at a glance',
              'Invite and manage your team',
              'View budgets and spending',
              'Download reports',
            ]}
          />
          <RoleCard
            emoji="📍"
            role="Site Manager"
            who="Manages one or more sites"
            can={[
              'Oversee materials and receipts',
              'Approve material transfers',
              'Monitor daily attendance',
              'Review site progress',
            ]}
          />
          <RoleCard
            emoji="🦺"
            role="Supervisor"
            who="On-ground team lead"
            can={[
              'Mark worker attendance daily',
              'Write end-of-day updates',
              'Record work completed',
              'Flag issues to manager',
            ]}
          />
          <RoleCard
            emoji="🗄️"
            role="Store Keeper"
            who="Manages materials on site"
            can={[
              'Record materials arriving',
              'Log materials sent out',
              'Monitor stock levels',
              'Alert when stock is low',
            ]}
          />
        </div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <Section className="py-20">
        <div className="rounded-3xl bg-charcoal-900 px-8 py-14 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
            <StoreyIcon size={36} />
          </div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Stop managing your sites<br />on WhatsApp
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-charcoal-300">
            Join construction companies already using Storey to stay on top of their sites every day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-xl bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-500">
              Register your company →
            </Link>
            <Link to="/login" className="rounded-xl border border-charcoal-600 px-8 py-3 text-base font-semibold text-charcoal-200 transition hover:border-charcoal-400 hover:text-white">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-charcoal-400">Free to start · No card required</p>
        </div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-sand-300 px-5 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <StoreyIcon size={22} />
            <span className="font-display font-bold text-charcoal-700">Storey</span>
            <span className="ml-1 text-xs text-charcoal-400">Construction, organised.</span>
          </div>
          <div className="flex gap-5 text-sm text-charcoal-400">
            <Link to="/login" className="hover:text-charcoal-700 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-charcoal-700 transition-colors">Register</Link>
            <a href="mailto:support@storeyinfra.com" className="hover:text-charcoal-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-charcoal-400">© 2026 Storey. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
