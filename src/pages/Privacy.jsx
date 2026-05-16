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

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">

        <div className="mb-8 flex items-center gap-3">
          <StoreyIcon size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500">
              Storey — Construction Site Manager · Effective 16 May 2026
            </p>
          </div>
        </div>

        <div className="card p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">

          <p>
            This Privacy Policy explains how Storey ("Storey", "we", "us") collects, uses,
            stores and protects information when you use the Storey mobile and web
            application (the "App"). By using the App you agree to this Policy. If you do
            not agree, please do not use the App.
          </p>

          <Section n="1" title="Who we are">
            <p>
              Storey is a construction site management application that helps contractors
              manage sites, workers, attendance, materials and reports. The App is operated
              from India. For any privacy question, contact us at{' '}
              <a href="mailto:help@storeyinfra.com" className="text-brand-600 hover:underline">help@storeyinfra.com</a>.
            </p>
          </Section>

          <Section n="2" title="Information we collect">
            <p className="font-medium text-gray-900">Account information</p>
            <p>Your name, email address, phone number, role and company (tenant) details, provided when you register or are invited.</p>
            <p className="font-medium text-gray-900 mt-3">Data you enter into the App</p>
            <p>
              Construction site records, worker records, daily attendance, daily logs,
              material receipts, transfers and inventory, budgets and reports. Where you
              choose to record worker identity details (such as ID-proof type and number,
              address, and emergency contact), that information is collected and stored on
              your instruction as the employer/contractor.
            </p>
            <p className="font-medium text-gray-900 mt-3">Technical information</p>
            <p>Basic device and session information needed to keep you securely signed in. We do not use advertising identifiers or tracking pixels.</p>
          </Section>

          <Section n="3" title="How we use your information">
            <p>
              We use your information solely to provide and operate the App for you and your
              team — authentication, multi-site management, attendance and payroll
              calculation, material tracking and reporting. We do <strong>not</strong> sell,
              rent or trade your data, and we do not use it for advertising.
            </p>
          </Section>

          <Section n="4" title="Worker data — your responsibility">
            <p>
              When you add worker records, you act as the data fiduciary for that worker's
              information and confirm you have a lawful basis and the worker's consent to
              record it. We process that data only as a service provider on your behalf.
              You are responsible for collecting only the worker data you actually need.
            </p>
          </Section>

          <Section n="5" title="Service providers">
            <p>We share data only with infrastructure providers strictly necessary to run the App:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — database, authentication and storage (with row-level security enforcing strict company-to-company isolation).</li>
              <li><strong>Vercel</strong> — web application hosting.</li>
              <li><strong>Google</strong> — optional Google Sign-In (basic profile only; no access to Gmail, Drive or contacts).</li>
              <li><strong>Twilio</strong> — sending SMS one-time passcodes, if you use phone login.</li>
              <li><strong>Resend</strong> — delivering support emails you send us.</li>
            </ul>
            <p className="mt-2">Each provider processes data only to perform its function and is bound by its own data-protection terms.</p>
          </Section>

          <Section n="6" title="Data storage and security">
            <p>
              Data is stored in secured cloud databases with encryption in transit (HTTPS)
              and access controls. Row-level security ensures your company's data is never
              visible to any other company. No system is perfectly secure; we work to
              protect your data using industry-standard measures.
            </p>
          </Section>

          <Section n="7" title="Data retention">
            <p>
              We retain your data for as long as your account is active. If you close your
              account or request deletion, we delete your data within 30 days, except where
              we must retain certain records to comply with law.
            </p>
          </Section>

          <Section n="8" title="Your rights">
            <p>You may, by writing to us at the address below:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>access the personal data we hold about you;</li>
              <li>request correction of inaccurate data;</li>
              <li>request deletion of your account and associated data;</li>
              <li>withdraw consent for optional processing (such as SMS login).</li>
            </ul>
            <p className="mt-2">We will respond to verified requests within 30 days.</p>
          </Section>

          <Section n="9" title="Children">
            <p>The App is intended for business use by adults. It is not directed at children and we do not knowingly collect data from anyone under 18.</p>
          </Section>

          <Section n="10" title="Changes to this policy">
            <p>We may update this Policy from time to time. Material changes will be notified in the App. The "Effective" date above shows the current version.</p>
          </Section>

          <Section n="11" title="Grievance / contact">
            <p>
              For any privacy concern, data request or grievance, contact our grievance
              point of contact at{' '}
              <a href="mailto:help@storeyinfra.com" className="text-brand-600 hover:underline">help@storeyinfra.com</a>.
              We aim to acknowledge grievances within 48 hours and resolve them within 30 days.
            </p>
          </Section>

        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

      </div>
    </div>
  )
}
