import { 
  LegalModal, 
  TableOfContents, 
  LegalSection, 
  LegalSubsection,
  ContactEmail 
} from './legal-modal'

/**
 * Privacy Policy Modal Component
 * 
 * GDPR and CCPA compliant Privacy Policy including:
 * - Data collection practices
 * - Data usage purposes
 * - Third-party sharing
 * - User rights (access, erasure, portability)
 * - Cookie policy
 * - Data security measures
 * - Data retention policies
 * - Children's privacy
 * 
 * Version: 1.0
 * Last Updated: December 8, 2024
 */

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  showAcceptButton?: boolean
}

const TOC_SECTIONS = [
  { id: 'overview', title: '1. Privacy Overview' },
  { id: 'data-collection', title: '2. Information We Collect' },
  { id: 'data-usage', title: '3. How We Use Your Information' },
  { id: 'data-sharing', title: '4. Information Sharing & Third Parties' },
  { id: 'cookies', title: '5. Cookies & Tracking Technologies' },
  { id: 'user-rights', title: '6. Your Privacy Rights' },
  { id: 'data-security', title: '7. Data Security' },
  { id: 'data-retention', title: '8. Data Retention' },
  { id: 'international', title: '9. International Data Transfers' },
  { id: 'children', title: '10. Children\'s Privacy' },
  { id: 'changes', title: '11. Changes to This Policy' },
  { id: 'contact', title: '12. Contact Us' },
]

export function PrivacyPolicyModal({ 
  isOpen, 
  onClose, 
  onAccept,
  showAcceptButton = false 
}: PrivacyPolicyModalProps) {
  return (
    <LegalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      lastUpdated="December 8, 2024"
      onAccept={onAccept}
      showAcceptButton={showAcceptButton}
    >
      {/* Introduction */}
      <div className="mb-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <p className="text-gray-300 text-sm leading-relaxed">
          At <strong className="text-white">Welcomely</strong>, we take your privacy seriously. This 
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
          you use our onboarding platform. This policy is designed to comply with the{' '}
          <strong className="text-white">General Data Protection Regulation (GDPR)</strong>,{' '}
          <strong className="text-white">California Consumer Privacy Act (CCPA)</strong>, and other 
          applicable data protection laws.
        </p>
      </div>

      <TableOfContents sections={TOC_SECTIONS} />

      {/* Section 1: Privacy Overview */}
      <LegalSection id="overview" title="1. Privacy Overview">
        <p>
          This Privacy Policy applies to all information collected through our website, applications, 
          and any related services, sales, marketing, or events (collectively, the "Service").
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-1">Data Controller</h4>
            <p className="text-gray-400 text-xs">
              Welcomely, Inc. is the data controller responsible for your personal data.
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-1">Legal Basis</h4>
            <p className="text-gray-400 text-xs">
              We process data based on consent, contract performance, and legitimate interests.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Section 2: Information We Collect */}
      <LegalSection id="data-collection" title="2. Information We Collect">
        <LegalSubsection title="2.1 Information You Provide Directly">
          <p>When you create an account or use our Service, we collect:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>
              <strong className="text-white">Email address</strong> — Used for account authentication, 
              communications, and password recovery
            </li>
            <li>
              <strong className="text-white">Password</strong> — Stored using industry-standard bcrypt 
              hashing; we never store or have access to your plain-text password
            </li>
            <li>
              <strong className="text-white">Full name</strong> — Used for personalization and 
              identification within teams
            </li>
            <li>
              <strong className="text-white">Company name</strong> (optional) — Used for organizational 
              context and team features
            </li>
            <li>
              <strong className="text-white">Profile picture</strong> (optional) — Displayed in your 
              profile and team interactions
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="2.2 Information Collected Automatically">
          <p>When you access our Service, we automatically collect:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>
              <strong className="text-white">IP address</strong> — Used for security, fraud prevention, 
              and approximate location analytics
            </li>
            <li>
              <strong className="text-white">Browser type and version</strong> — Used to optimize the 
              Service for different browsers
            </li>
            <li>
              <strong className="text-white">Device information</strong> — Device type, operating system, 
              and screen resolution for responsive design
            </li>
            <li>
              <strong className="text-white">Pages visited</strong> — Which features and pages you access 
              within the Service
            </li>
            <li>
              <strong className="text-white">Session duration</strong> — How long you use the Service 
              and when
            </li>
            <li>
              <strong className="text-white">Referring URL</strong> — How you arrived at our Service
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="2.3 Information from Third Parties">
          <p>When you sign in using Google OAuth, we receive:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Your Google email address</li>
            <li>Your Google profile name</li>
            <li>Your Google profile picture (if available)</li>
          </ul>
          <p className="mt-2 text-sm text-gray-400">
            We do not receive or store your Google password. Google OAuth uses secure token-based 
            authentication.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 3: How We Use Your Information */}
      <LegalSection id="data-usage" title="3. How We Use Your Information">
        <p>We use the information we collect for the following purposes:</p>
        
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-2">📋 Service Provision</h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Create and manage your account</li>
              <li>• Provide core checklist and onboarding features</li>
              <li>• Enable team collaboration and sharing</li>
              <li>• Process and respond to your requests</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-2">📈 Service Improvement</h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Analyze usage patterns to improve features</li>
              <li>• Identify and fix bugs and technical issues</li>
              <li>• Develop new features based on user behavior</li>
              <li>• Optimize performance and user experience</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-2">🔒 Security & Compliance</h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Detect and prevent fraud and abuse</li>
              <li>• Protect against unauthorized access</li>
              <li>• Comply with legal obligations</li>
              <li>• Enforce our Terms of Service</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium text-sm mb-2">📧 Communications</h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Send essential account notifications</li>
              <li>• Provide security alerts and updates</li>
              <li>• Respond to your support inquiries</li>
              <li>• Send marketing communications (with consent)</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* Section 4: Information Sharing & Third Parties */}
      <LegalSection id="data-sharing" title="4. Information Sharing & Third Parties">
        <p>
          We do not sell your personal information. We share your information only in the following 
          circumstances:
        </p>

        <LegalSubsection title="4.1 Service Providers">
          <p>We work with carefully selected third-party service providers:</p>
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium text-sm">Supabase</h4>
              <p className="text-gray-400 text-xs mt-1">
                Database hosting, authentication services, and real-time features. Supabase is 
                SOC 2 Type II certified and GDPR compliant.
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium text-sm">Google Analytics</h4>
              <p className="text-gray-400 text-xs mt-1">
                Website analytics and usage statistics. Data is anonymized and aggregated. You 
                can opt out using browser settings or the Google Analytics Opt-out Browser Add-on.
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium text-sm">Google OAuth</h4>
              <p className="text-gray-400 text-xs mt-1">
                Secure authentication provider for "Sign in with Google" functionality. We only 
                receive your email, name, and profile picture.
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium text-sm">Vercel</h4>
              <p className="text-gray-400 text-xs mt-1">
                Website hosting and CDN services. Vercel is SOC 2 Type II certified and processes 
                only technical data necessary for hosting.
              </p>
            </div>
          </div>
        </LegalSubsection>

        <LegalSubsection title="4.2 Legal Requirements">
          <p>We may disclose your information if required by law or if we believe that such action is necessary to:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Comply with legal obligations or valid legal requests</li>
            <li>Protect the rights, property, or safety of Welcomely, our users, or the public</li>
            <li>Detect, prevent, or address fraud, security issues, or technical problems</li>
            <li>Enforce our Terms of Service</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="4.3 Business Transfers">
          <p>
            In the event of a merger, acquisition, or sale of assets, your information may be 
            transferred as part of that transaction. We will notify you via email and/or prominent 
            notice on our Service of any change in ownership or uses of your personal information.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 5: Cookies & Tracking Technologies */}
      <LegalSection id="cookies" title="5. Cookies & Tracking Technologies">
        <p>
          We use cookies and similar tracking technologies to collect and track information about 
          your activity on our Service.
        </p>

        <LegalSubsection title="5.1 Types of Cookies We Use">
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-green-400 font-medium text-sm">Essential Cookies (Required)</h4>
              <p className="text-gray-400 text-xs mt-1">
                These cookies are strictly necessary for the Service to function. They enable core 
                functionality such as authentication, security, and session management. You cannot 
                opt out of these cookies.
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-medium text-sm">Analytics Cookies (Optional)</h4>
              <p className="text-gray-400 text-xs mt-1">
                These cookies help us understand how visitors interact with our Service by collecting 
                information anonymously. This helps us improve our Service. You can opt out of these 
                cookies.
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="text-yellow-400 font-medium text-sm">Preference Cookies (Optional)</h4>
              <p className="text-gray-400 text-xs mt-1">
                These cookies remember your preferences and settings (like theme preference and 
                language) to provide a more personalized experience.
              </p>
            </div>
          </div>
        </LegalSubsection>

        <LegalSubsection title="5.2 Managing Cookies">
          <p>You can control cookies through your browser settings:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Most browsers allow you to refuse or delete cookies</li>
            <li>You can set your browser to notify you when cookies are sent</li>
            <li>Disabling essential cookies may prevent certain features from working</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            For more information on managing cookies, visit your browser's help documentation or 
            <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline ml-1">
              www.allaboutcookies.org
            </a>
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 6: Your Privacy Rights */}
      <LegalSection id="user-rights" title="6. Your Privacy Rights">
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            We respect your data rights under GDPR, CCPA, and other applicable privacy laws. You can 
            exercise any of the following rights by contacting us at{' '}
            <a href="mailto:privacy@welcomely.io" className="underline">privacy@welcomely.io</a>.
          </p>
        </div>

        <LegalSubsection title="6.1 Right to Access">
          <p>
            You have the right to request a copy of the personal information we hold about you. We will 
            provide this information in a commonly used, machine-readable format within 30 days of your 
            request.
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.2 Right to Rectification">
          <p>
            You have the right to request that we correct any information you believe is inaccurate or 
            complete information you believe is incomplete. You can update most information directly 
            through your account settings.
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.3 Right to Erasure (Right to be Forgotten)">
          <p>
            You have the right to request that we erase your personal data. Upon receiving a valid 
            request, we will delete your data within 30 days, except where retention is required by 
            law or necessary for legal claims.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Note: Deleting your data will permanently remove your account and all associated content.
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.4 Right to Data Portability">
          <p>
            You have the right to request that we transfer your data to another organization, or 
            directly to you, in a structured, commonly used, and machine-readable format (such as JSON 
            or CSV).
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.5 Right to Object">
          <p>
            You have the right to object to our processing of your personal data for direct marketing, 
            profiling, or processing based on legitimate interests.
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.6 Right to Restrict Processing">
          <p>
            You have the right to request that we restrict the processing of your personal data under 
            certain circumstances, such as when you contest the accuracy of your data.
          </p>
        </LegalSubsection>

        <LegalSubsection title="6.7 CCPA Rights (California Residents)">
          <p>If you are a California resident, you have additional rights:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li><strong className="text-white">Right to Know</strong> — What personal information is collected, used, shared</li>
            <li><strong className="text-white">Right to Delete</strong> — Request deletion of personal information</li>
            <li><strong className="text-white">Right to Opt-Out</strong> — Opt out of sale of personal information (we do not sell data)</li>
            <li><strong className="text-white">Right to Non-Discrimination</strong> — No discrimination for exercising privacy rights</li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      {/* Section 7: Data Security */}
      <LegalSection id="data-security" title="7. Data Security">
        <p>
          We implement appropriate technical and organizational measures to protect your personal 
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <LegalSubsection title="7.1 Technical Measures">
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>
              <strong className="text-white">Encryption in Transit</strong> — All data transmitted 
              between your browser and our servers is encrypted using TLS 1.3
            </li>
            <li>
              <strong className="text-white">Encryption at Rest</strong> — Database storage is encrypted 
              using AES-256 encryption
            </li>
            <li>
              <strong className="text-white">Password Hashing</strong> — Passwords are hashed using 
              bcrypt with appropriate cost factors
            </li>
            <li>
              <strong className="text-white">Secure Authentication</strong> — JWT tokens with short 
              expiration times and refresh token rotation
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="7.2 Organizational Measures">
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Access controls limiting data access to authorized personnel only</li>
            <li>Regular security training for all team members</li>
            <li>Incident response procedures for potential breaches</li>
            <li>Regular security audits and vulnerability assessments</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="7.3 Data Breach Notification">
          <p>
            In the event of a data breach affecting your personal information, we will notify you and 
            relevant authorities as required by applicable law, typically within 72 hours of becoming 
            aware of the breach.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 8: Data Retention */}
      <LegalSection id="data-retention" title="8. Data Retention">
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes 
          for which it was collected and to comply with legal obligations.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white font-medium">Data Type</th>
                <th className="text-left py-2 px-3 text-white font-medium">Retention Period</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-white/5">
                <td className="py-2 px-3">Account Data</td>
                <td className="py-2 px-3">Until account deletion + 30 days</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3">User Content</td>
                <td className="py-2 px-3">Until account deletion</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3">Analytics Data</td>
                <td className="py-2 px-3">26 months (anonymized)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3">Server Logs</td>
                <td className="py-2 px-3">90 days</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3">Backup Data</td>
                <td className="py-2 px-3">30 days after deletion</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Legal Records</td>
                <td className="py-2 px-3">As required by law (typically 7 years)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Inactive accounts may be deleted after 24 months of inactivity, with prior notice sent to 
          your registered email address.
        </p>
      </LegalSection>

      {/* Section 9: International Data Transfers */}
      <LegalSection id="international" title="9. International Data Transfers">
        <p>
          Your information may be transferred to and processed in countries other than your country 
          of residence. These countries may have data protection laws different from your country.
        </p>
        
        <LegalSubsection title="9.1 Transfer Safeguards">
          <p>When transferring data internationally, we ensure appropriate safeguards are in place:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Standard Contractual Clauses approved by the European Commission</li>
            <li>Data processing agreements with all service providers</li>
            <li>Privacy Shield certification (where applicable)</li>
            <li>Adequacy decisions by relevant data protection authorities</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="9.2 Primary Data Locations">
          <p>Our primary data infrastructure is hosted in:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>United States (primary database)</li>
            <li>European Union (for EU users, where available)</li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      {/* Section 10: Children's Privacy */}
      <LegalSection id="children" title="10. Children's Privacy">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-300 text-sm">
            <strong>Important:</strong> Our Service is not intended for children under 13 years of age 
            (or 16 years in certain jurisdictions). We do not knowingly collect personal information 
            from children.
          </p>
        </div>
        
        <p className="mt-4">
          If we become aware that we have collected personal information from a child under the 
          applicable age without verifiable parental consent, we will take steps to delete that 
          information as quickly as possible.
        </p>
        
        <p className="mt-2">
          If you believe we have inadvertently collected information from a child, please contact us 
          immediately at <a href="mailto:privacy@welcomely.io" className="text-purple-400 hover:underline">privacy@welcomely.io</a>.
        </p>
      </LegalSection>

      {/* Section 11: Changes to This Policy */}
      <LegalSection id="changes" title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, 
          technology, legal requirements, or other factors.
        </p>
        
        <LegalSubsection title="11.1 Notification of Changes">
          <p>When we make changes, we will:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Send email notification for material changes</li>
            <li>Display a prominent notice within the Service</li>
            <li>Provide at least 30 days' notice before significant changes take effect</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="11.2 Your Choices">
          <p>
            If you do not agree with any changes to this Privacy Policy, you may close your account 
            before the changes take effect. Your continued use of the Service after the effective date 
            of any changes constitutes your acceptance of the revised policy.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 12: Contact Us */}
      <LegalSection id="contact" title="12. Contact Us">
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or our data 
          practices, please contact us:
        </p>
        
        <div className="mt-4 space-y-2">
          <ContactEmail email="privacy@welcomely.io" label="Privacy Inquiries" />
          <ContactEmail email="dpo@welcomely.io" label="Data Protection Officer" />
          <ContactEmail email="support@welcomely.io" label="General Support" />
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-sm">
            <strong className="text-white">Welcomely, Inc.</strong><br />
            Attn: Privacy Team<br />
            1234 Innovation Drive, Suite 500<br />
            San Francisco, CA 94105<br />
            United States
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>EU Representative:</strong> For inquiries from the European Union, you may also 
            contact our EU representative at <a href="mailto:eu-privacy@welcomely.io" className="underline">eu-privacy@welcomely.io</a>.
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          We aim to respond to all legitimate privacy inquiries within 30 days. If you have an 
          unresolved privacy concern, you may have the right to lodge a complaint with your local 
          data protection authority.
        </p>
      </LegalSection>

      {/* Closing Statement */}
      <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          By using Welcomely, you acknowledge that you have read and understood this Privacy Policy.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          © {new Date().getFullYear()} Welcomely, Inc. All rights reserved.
        </p>
      </div>
    </LegalModal>
  )
}

