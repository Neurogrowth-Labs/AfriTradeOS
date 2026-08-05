import React from 'react';
import { Scale, FileText, AlertCircle, Mail, CheckCircle } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="type-header text-gray-900 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-700 dark:text-gray-300 text-[0.95rem] leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-full p-4 md:p-8 lg:p-10 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="card-premium rounded-2xl p-6 md:p-10 shadow-sm border border-[#C9A24D]/15 dark:border-[#C9A24D]/15">
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700/50">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="type-header text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
                Terms of Service
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Welcome to AfriTradeOS. These Terms of Service govern your access to and use of the AfriTradeOS
            platform, including all tools, features, and services offered for trade finance, logistics,
            compliance, and market intelligence across Africa.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account, accessing, or using AfriTradeOS, you agree to be bound by these Terms
              and our Privacy Policy. If you do not agree, you may not use the platform.
            </p>
          </Section>

          <Section title="2. Eligibility and Accounts">
            <p>
              You must be at least 18 years old and authorized to act on behalf of your organization to use
              AfriTradeOS. You agree to provide accurate, complete, and current information during registration
              and to keep your account credentials secure. You are responsible for all activity under your account.
            </p>
          </Section>

          <Section title="3. Platform Services">
            <p>
              AfriTradeOS provides a digital workspace that connects exporters, importers, banks, insurers,
              logistics providers, customs authorities, and government agencies. Services include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Trade lifecycle and document management</li>
              <li>Trade finance application and risk assessment tools</li>
              <li>Compliance, KYC/KYB, and regulatory screening features</li>
              <li>Market intelligence, tenders, and partner discovery</li>
              <li>AI-assisted recommendations and analytics</li>
            </ul>
          </Section>

          <Section title="4. User Conduct">
            <p>
              You agree not to use the platform for unlawful purposes, to submit fraudulent information,
              to interfere with platform operations, or to attempt unauthorized access to systems or data.
              All uploaded information must be accurate and must not infringe on the rights of others.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All platform content, software, trademarks, and materials are owned by AfriTradeOS or its licensors
              and are protected by intellectual property laws. You may not copy, modify, distribute, or reverse
              engineer any part of the platform without our written consent.
            </p>
          </Section>

          <Section title="6. Disclaimers">
            <p>
              AfriTradeOS is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While we strive for accuracy,
              AI-generated insights, market data, and compliance recommendations are for informational purposes
              only and do not constitute legal, financial, or professional advice. You are responsible for
              verifying information before acting on it.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, AfriTradeOS shall not be liable for indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of the platform.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              We may suspend or terminate your access at any time if you violate these Terms or if required by law.
              You may stop using the platform at any time. Provisions that by their nature should survive
              termination will continue to apply.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which AfriTradeOS is registered, without regard to conflict of law principles. Disputes shall
              be resolved through binding arbitration or the competent courts in that jurisdiction.
            </p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>
              We may update these Terms from time to time. Material changes will be posted on the platform with
              an updated effective date. Your continued use after changes constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For questions about these Terms, please contact us at{' '}
              <a
                href="mailto:legal@afritradeos.com"
                className="text-trade-accent hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-4 h-4" /> legal@afritradeos.com
              </a>.
            </p>
          </Section>

          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700/50 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Clear service definitions
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Fair use obligations
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Transparent dispute resolution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
