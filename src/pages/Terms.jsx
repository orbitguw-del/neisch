import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StoreyIcon from '@/components/brand/StoreyIcon'

function Section({ n, title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-gray-900 text-base">{n}. {title}</h2>
      {children}
    </section>
  )
}

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">

        <div className="mb-8 flex items-center gap-3">
          <StoreyIcon size={32} showText={false} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>
              Terms of Service
            </h1>
            <p className="text-xs text-gray-500">
              Storey — Storey Infra, Guwahati · Effective 5 June 2026
            </p>
          </div>
        </div>

        <div className="card p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-900 text-xs">
            <strong>Beta terms.</strong> Storey is currently in beta. These Terms apply
            to free beta usage and will be supplemented with paid-plan terms when billing
            begins. By using Storey you accept these Terms and our{' '}
            <a href="#/privacy" className="underline">Privacy Policy</a>.
          </div>

          <Section n="1" title="Acceptance">
            <p>
              By creating a Storey account, signing in (via email, Google, phone OTP or
              invite link), or using any feature of Storey, you agree to these Terms and
              our Privacy Policy. If you accept on behalf of a company, you confirm you
              have authority to bind that company. You must be at least 18 years old.
            </p>
          </Section>

          <Section n="2" title="About Storey">
            <p>
              Storey is a mobile-first site-operations application operated by
              <strong> Storey Infra</strong>, an Indian business based in Guwahati, Assam.
              The business is being organised as a private limited company; these Terms
              will transfer automatically to the successor entity upon incorporation.
            </p>
          </Section>

          <Section n="3" title="Beta status — IMPORTANT">
            <div className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 text-amber-900 text-xs space-y-2">
              <p>
                <strong>Storey is currently in BETA and provided FREE OF CHARGE.</strong>
                By using Storey during beta you specifically acknowledge that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Features may change or be discontinued without notice</li>
                <li>Service interruptions, outages, and bugs may occur</li>
                <li>You are using Storey <strong>at your own risk</strong> with no warranty of any kind</li>
                <li>You should <strong>not</strong> rely on Storey as your sole system of record</li>
                <li>You should <strong>maintain independent backups</strong> of critical data</li>
                <li>You should <strong>not</strong> make irreversible business decisions based on Storey output without independent verification</li>
              </ul>
            </div>
            <p className="mt-3">
              We commit to communicate material changes openly, act in good faith,
              and honour the data-protection obligations in our Privacy Policy.
            </p>
          </Section>

          <Section n="3.1" title="Free beta — what we owe you and what you accept">
            <p className="font-medium text-gray-900">What we owe you (not disclaimed):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Data-protection duties under the DPDP Act 2023 and IT Act 2000 — reasonable security, breach notification, grievance redressal, and the user rights in our Privacy Policy.</li>
              <li>Good faith and honest communication about material changes, bugs, and outages.</li>
              <li>Liability for fraud, wilful misconduct, or gross negligence on our part, to the extent it cannot be limited under Indian law.</li>
            </ul>
            <p className="font-medium text-gray-900 mt-3">What you accept by using the free beta:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The service is "AS IS" and "AS AVAILABLE" — no warranty of merchantability, fitness for purpose, or data accuracy.</li>
              <li>We do not owe you a particular uptime, feature set, or response time.</li>
              <li>Beyond the non-waivable duties above, our monetary liability is capped at <strong>₹0</strong> during the free beta — consistent with the absence of fees.</li>
              <li><strong>You</strong> — not Storey — are responsible for verifying the accuracy of any data you input or rely on, and for any business, financial, legal, or operational decision you make based on Storey's output.</li>
              <li>You will not use Storey for any purpose where the consequences of service interruption or data loss exceed what you are willing to absorb at zero refund.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500 italic">
              This balance is intentional: Storey takes on the duties law and decency
              require, and in exchange you take on the additional risk that comes with
              using free, in-development software for your business.
            </p>
          </Section>

          <Section n="4" title="Your data">
            <p>
              Data you input into Storey — sites, workers, materials, photos, tasks,
              expenses — remains your property. You grant us a limited, revocable
              licence to store, process, and display it solely to operate Storey for
              you. You are solely responsible for ensuring that content uploaded is
              lawful, accurate, and used with appropriate permissions from the
              individuals it relates to (e.g. workers, subcontractors).
            </p>
            <p>
              You can export or delete your data at any time by contacting
              help@storeyinfra.com — we'll respond within 7 working days. While we
              maintain operational backups, you are encouraged to maintain
              independent copies of critical business records.
            </p>
          </Section>

          <Section n="5" title="Acceptable use">
            <p>You must not use Storey to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>violate Indian or international law;</li>
              <li>infringe others' intellectual property;</li>
              <li>circumvent our security (e.g. bypass tenant isolation);</li>
              <li>scrape, crawl, or use automated tools to extract data;</li>
              <li>build, train, benchmark, or operate a competing product;</li>
              <li>train AI/ML models on Storey or its data without our permission;</li>
              <li>generate excessive load, automated abuse, or denial-of-service patterns;</li>
              <li>harass, threaten, or harm any individual;</li>
              <li>facilitate forced labour, child labour, or unsafe site practices.</li>
            </ul>
            <p>
              Violations may result in immediate suspension or termination of your
              account.
            </p>
          </Section>

          <Section n="6" title="Disclaimers">
            <p>
              <strong>Storey is a tool.</strong> It does not provide engineering,
              accounting, taxation, legal, compliance, or safety advice, and does not
              replace your professional advisors. Automated insights, reports, or
              recommendations (including any future AI features) are informational
              only and should not be the sole basis for material business decisions.
            </p>
            <p>
              Storey relies on third-party services (Supabase, Vercel, Resend, Google
              Play). We are not responsible for outages in those underlying services.
            </p>
          </Section>

          <Section n="7" title="Limitation of liability">
            <p>
              To the maximum extent permitted by Indian law, our total aggregate
              liability is capped at the fees you paid us in the 12 months preceding
              a claim. During the free beta period, this cap is effectively ₹0,
              except where law requires otherwise. We are not liable for indirect,
              incidental, special, consequential, or punitive damages, nor for events
              beyond our reasonable control (force majeure — including natural
              disasters, internet shutdowns, regulatory orders, telecom or cloud
              outages, cyber-attacks).
            </p>
          </Section>

          <Section n="8" title="Termination">
            <p>
              You can terminate your account at any time. We may suspend or
              terminate if you breach these Terms; if your conduct poses a security
              risk; if we reasonably suspect fraud, forgery, money-laundering, or
              labour-/safety-law violations; or if you have not paid an invoice
              within 30 days of its due date. For non-emergency terminations we'll
              give 30 days' notice and a chance to remedy.
            </p>
          </Section>

          <Section n="9" title="Security incidents">
            <p>
              In the event of a material security incident affecting your data, we
              will investigate promptly, take reasonable steps to contain and
              remediate, notify affected users within a commercially reasonable
              timeframe consistent with applicable law (including the DPDP Act
              2023), and notify regulators where required. Report suspected
              vulnerabilities to <strong>security@storeyinfra.com</strong> or via
              WhatsApp +91 98640 66898.
            </p>
          </Section>

          <Section n="10" title="Electronic communications">
            <p>
              By using Storey you consent to receive electronic communications
              (account notices, service messages, transactional invoices, security
              alerts, and product updates relevant to features you use) by email,
              in-app notification, WhatsApp, or SMS. You may opt out of
              non-essential product announcements but cannot opt out of
              service-related and security communications while your account is
              active.
            </p>
          </Section>

          <Section n="11" title="Governing law">
            <p>
              These Terms are governed by the laws of India. Disputes shall be
              resolved through good-faith negotiation first, then mediation in
              Guwahati, then arbitration in Guwahati under the Indian Arbitration
              and Conciliation Act, 1996, or by the exclusive jurisdiction of the
              courts in Guwahati, Assam.
            </p>
          </Section>

          <Section n="12" title="Changes">
            <p>
              We may update these Terms. For material changes we will notify active
              users at least 30 days in advance. Continued use after the change
              indicates acceptance. If a conflict arises between these Terms and our
              Privacy Policy regarding personal-data handling, the Privacy Policy
              governs.
            </p>
          </Section>

          <Section n="13" title="Contact">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:help@storeyinfra.com" className="text-brand-600 hover:underline">help@storeyinfra.com</a><br />
              <strong>WhatsApp:</strong> +91 98640 66898<br />
              <strong>Postal:</strong> Storey Infra, Guwahati, Assam, India. Until our registered office is published, please use email or WhatsApp above — both are monitored 7 days a week and are our primary channels of record.
            </p>
          </Section>

          <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            These Terms were drafted in good faith and revised after a structured
            review. They are intended as a fair beta-period agreement. The full
            draft (`docs/TERMS-OF-SERVICE-DRAFT.md`) is undergoing review by an
            Indian-law SaaS specialist; minor wording may evolve before the
            non-beta release.
          </p>

        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

      </div>
    </div>
  )
}
