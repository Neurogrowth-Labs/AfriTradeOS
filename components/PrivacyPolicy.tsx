import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="type-header text-gray-900 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-700 dark:text-gray-300 text-[0.95rem] leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-full p-4 md:p-8 lg:p-10 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="card-premium rounded-2xl p-6 md:p-10 shadow-sm border border-[#C9A24D]/15 dark:border-[#C9A24D]/15">
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700/50">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="type-header text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            AfriTradeOS is committed to protecting the privacy and security of your personal information.
            This Privacy Policy describes how we collect, use, disclose, and safeguard your data when you
            use our trade finance and logistics platform.
          </p>

          <Section title="1. Information We Collect">
            <p>
              We collect information that you provide directly to us, such as when you create an account,
              complete your organization profile, submit KYC/KYB documents, or communicate with our support team.
              This may include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact details (name, email address, phone number)</li>
              <li>Business information (company name, registration number, country, role)</li>
              <li>Identity and verification documents for compliance purposes</li>
              <li>Transaction and trade-related data uploaded to the platform</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>
              We use the information we collect to provide, maintain, and improve AfriTradeOS services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verifying your identity and organizational credentials</li>
              <li>Facilitating trade finance, logistics, and compliance workflows</li>
              <li>Providing AI-powered market intelligence and recommendations</li>
              <li>Ensuring platform security and preventing fraudulent activity</li>
              <li>Communicating service updates, support responses, and regulatory notices</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing and Disclosure">
            <p>
              We do not sell your personal data. We may share information with trusted partners,
              financial institutions, logistics providers, and government authorities only when necessary
              to complete a transaction, satisfy a legal obligation, or with your explicit consent.
            </p>
          </Section>

          <Section title="4. Data Security">
            <p>
              We implement industry-standard technical and organizational measures to protect your data,
              including encryption in transit and at rest, access controls, and regular security audits.
              However, no internet-based service is completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict
              the processing of your personal data. You may also have the right to object to processing or
              request data portability. To exercise these rights, please contact us at the address below.
            </p>
          </Section>

          <Section title="6. International Transfers">
            <p>
              AfriTradeOS operates across Africa and may process data in countries outside your country of residence.
              We ensure that any international transfers comply with applicable data protection laws and are
              protected by appropriate safeguards.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the new policy on the platform with an updated effective date.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
              <a
                href="mailto:admin@afritradeos.com"
                className="text-trade-accent hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-4 h-4" /> admin@afritradeos.com
              </a>.
            </p>
          </Section>

          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700/50 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> End-to-end encryption standards
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> Transparent data practices
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Secure data residency options
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Africa-focused compliance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
