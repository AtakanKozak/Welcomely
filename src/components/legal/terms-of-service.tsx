import { 
  LegalModal, 
  TableOfContents, 
  LegalSection, 
  LegalSubsection,
  ContactEmail 
} from './legal-modal'

/**
 * Terms of Service Modal Component
 * 
 * Comprehensive Terms of Service including:
 * - Usage terms and limitations
 * - Intellectual property rights
 * - Disclaimer of warranties
 * - Account termination policies
 * - Dispute resolution
 * - Changes to terms
 * 
 * Version: 1.0
 * Last Updated: December 8, 2024
 */

interface TermsOfServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  showAcceptButton?: boolean
}

const TOC_SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'eligibility', title: '2. Eligibility & Account Registration' },
  { id: 'usage', title: '3. Acceptable Use Policy' },
  { id: 'intellectual-property', title: '4. Intellectual Property Rights' },
  { id: 'user-content', title: '5. User Content & Data' },
  { id: 'service-availability', title: '6. Service Availability & Modifications' },
  { id: 'disclaimers', title: '7. Disclaimers & Limitations' },
  { id: 'termination', title: '8. Account Termination' },
  { id: 'disputes', title: '9. Dispute Resolution' },
  { id: 'changes', title: '10. Changes to Terms' },
  { id: 'contact', title: '11. Contact Information' },
]

export function TermsOfServiceModal({ 
  isOpen, 
  onClose, 
  onAccept,
  showAcceptButton = false 
}: TermsOfServiceModalProps) {
  return (
    <LegalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      lastUpdated="December 8, 2024"
      onAccept={onAccept}
      showAcceptButton={showAcceptButton}
    >
      {/* Introduction */}
      <div className="mb-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <p className="text-gray-300 text-sm leading-relaxed">
          Welcome to <strong className="text-white">Welcomely</strong>. These Terms of Service ("Terms") 
          govern your access to and use of our onboarding checklist platform, including any content, 
          functionality, and services offered through our website and applications (collectively, the "Service"). 
          By creating an account or using our Service, you agree to be bound by these Terms.
        </p>
      </div>

      <TableOfContents sections={TOC_SECTIONS} />

      {/* Section 1: Acceptance of Terms */}
      <LegalSection id="acceptance" title="1. Acceptance of Terms">
        <p>
          By accessing or using Welcomely, you acknowledge that you have read, understood, and agree to 
          be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part 
          of these terms, you must not use our Service.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you and Welcomely ("Company," "we," 
          "us," or "our"). Your continued use of the Service after any modifications to these Terms will 
          constitute your acceptance of such changes.
        </p>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>Important:</strong> If you are using the Service on behalf of an organization, you 
            represent and warrant that you have the authority to bind that organization to these Terms.
          </p>
        </div>
      </LegalSection>

      {/* Section 2: Eligibility & Account Registration */}
      <LegalSection id="eligibility" title="2. Eligibility & Account Registration">
        <LegalSubsection title="2.1 Age Requirements">
          <p>
            You must be at least <strong className="text-white">18 years of age</strong> to create an 
            account and use our Service. If you are between 13 and 18 years old, you may only use the 
            Service with verifiable parental or guardian consent. We do not knowingly collect or solicit 
            personal information from anyone under 13 years of age.
          </p>
        </LegalSubsection>

        <LegalSubsection title="2.2 Account Creation">
          <p>To access certain features of the Service, you must register for an account. When creating an account, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access or security breaches</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="2.3 Account Security">
          <p>
            You are solely responsible for maintaining the confidentiality of your login credentials and 
            for any activities that occur under your account. We are not liable for any losses arising 
            from unauthorized use of your account, whether or not you had knowledge of such use.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 3: Acceptable Use Policy */}
      <LegalSection id="usage" title="3. Acceptable Use Policy">
        <p>
          When using Welcomely, you agree to comply with all applicable laws and regulations. You may 
          <strong className="text-white"> NOT</strong> use the Service to:
        </p>
        
        <LegalSubsection title="3.1 Prohibited Content">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Post, upload, or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
            <li>Share content that infringes on any patent, trademark, trade secret, copyright, or other intellectual property rights</li>
            <li>Distribute unsolicited advertising, promotional materials, or spam</li>
            <li>Post content that contains personal or identifying information about another person without their consent</li>
            <li>Share content depicting violence, cruelty, or graphic imagery</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="3.2 Prohibited Activities">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Attempt to gain unauthorized access to our systems, servers, or networks</li>
            <li>Use automated scripts, bots, or tools to access the Service without prior written permission</li>
            <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
            <li>Impersonate any person or entity, or falsely represent your affiliation</li>
            <li>Engage in any activity that could harm, disable, or impair the Service</li>
            <li>Create multiple accounts to circumvent restrictions or abuse features</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
            <li>Use the Service for any illegal purpose or to facilitate illegal activities</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="3.3 Rate Limits & Fair Use">
          <p>
            We reserve the right to impose rate limits or usage restrictions to ensure fair access for 
            all users. Excessive or abusive use of API endpoints or service features may result in 
            temporary or permanent restrictions on your account.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 4: Intellectual Property Rights */}
      <LegalSection id="intellectual-property" title="4. Intellectual Property Rights">
        <LegalSubsection title="4.1 Our Intellectual Property">
          <p>
            The Service, including all content, features, and functionality (including but not limited 
            to design, text, graphics, logos, icons, images, audio clips, software, and the selection 
            and arrangement thereof), is owned by Welcomely, its licensors, or other providers and is 
            protected by international copyright, trademark, patent, trade secret, and other intellectual 
            property laws.
          </p>
          <p className="mt-2">
            The Welcomely name, logo, and all related names, logos, product and service names, designs, 
            and slogans are trademarks of Welcomely. You must not use such marks without our prior 
            written permission.
          </p>
        </LegalSubsection>

        <LegalSubsection title="4.2 Limited License">
          <p>
            Subject to your compliance with these Terms, we grant you a limited, non-exclusive, 
            non-transferable, revocable license to access and use the Service for your personal or 
            internal business purposes. This license does not include:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>The right to modify, copy, or create derivative works of the Service</li>
            <li>The right to sublicense, sell, resell, or commercially exploit the Service</li>
            <li>The right to decompile, reverse engineer, or disassemble any software</li>
            <li>The right to remove any copyright or proprietary notices</li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      {/* Section 5: User Content & Data */}
      <LegalSection id="user-content" title="5. User Content & Data">
        <LegalSubsection title="5.1 Your Content">
          <p>
            You retain all ownership rights to the content you create, upload, or share through the 
            Service ("User Content"). By submitting User Content, you grant Welcomely a worldwide, 
            non-exclusive, royalty-free license to:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Use, reproduce, modify, and distribute your User Content solely for providing and improving the Service</li>
            <li>Display your User Content to other users as per your sharing settings</li>
            <li>Create backup copies for disaster recovery purposes</li>
            <li>Analyze anonymized, aggregated data for service improvement</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="5.2 Content Representations">
          <p>By submitting User Content, you represent and warrant that:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>You own or have the necessary rights to submit such content</li>
            <li>Your content does not violate the rights of any third party</li>
            <li>Your content complies with all applicable laws and these Terms</li>
            <li>Your content is accurate and not misleading</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="5.3 Content Moderation">
          <p>
            We reserve the right, but have no obligation, to monitor, review, or remove User Content at 
            our sole discretion. We may remove or disable access to any content that we believe violates 
            these Terms or is otherwise harmful, without prior notice.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 6: Service Availability & Modifications */}
      <LegalSection id="service-availability" title="6. Service Availability & Modifications">
        <LegalSubsection title="6.1 Service Availability">
          <p>
            We strive to maintain high availability of our Service, but we do not guarantee 
            uninterrupted access. The Service may be temporarily unavailable due to:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Scheduled maintenance and updates</li>
            <li>Unplanned technical issues or outages</li>
            <li>Factors beyond our reasonable control (force majeure)</li>
            <li>Actions required to protect the security or integrity of the Service</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="6.2 Service Modifications">
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any 
            time, with or without notice. We will make reasonable efforts to notify users of significant 
            changes that may affect their use of the Service.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 7: Disclaimers & Limitations */}
      <LegalSection id="disclaimers" title="7. Disclaimers & Limitations">
        <LegalSubsection title="7.1 Service Provided 'As Is'">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="uppercase text-xs text-gray-400 mb-2">Important Disclaimer</p>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
          </div>
        </LegalSubsection>

        <LegalSubsection title="7.2 No Guarantee">
          <p>We do not warrant that:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>The Service will meet your specific requirements</li>
            <li>The Service will be uninterrupted, timely, secure, or error-free</li>
            <li>Results obtained from using the Service will be accurate or reliable</li>
            <li>Any errors in the Service will be corrected</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="7.3 Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WELCOMELY, ITS DIRECTORS, 
            EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
            LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>Your access to or use of (or inability to access or use) the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
          <p className="mt-4">
            Our total liability for any claims arising from your use of the Service shall not exceed 
            the amount you paid us, if any, in the twelve (12) months preceding the claim.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 8: Account Termination */}
      <LegalSection id="termination" title="8. Account Termination">
        <LegalSubsection title="8.1 Termination by You">
          <p>
            You may terminate your account at any time by accessing your account settings and following 
            the account deletion process. Upon termination, your right to use the Service will 
            immediately cease.
          </p>
        </LegalSubsection>

        <LegalSubsection title="8.2 Termination by Us">
          <p>We may terminate or suspend your account immediately, without prior notice or liability, if:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li>You breach any provision of these Terms</li>
            <li>We are required to do so by law</li>
            <li>We discontinue the Service</li>
            <li>Your account has been inactive for an extended period</li>
            <li>We believe your actions may cause legal liability or harm to others</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="8.3 Effect of Termination">
          <p>
            Upon termination, we may delete your account and any User Content. We are not obligated to 
            retain or provide you with any User Content after termination. Sections of these Terms that 
            by their nature should survive termination shall survive, including ownership provisions, 
            warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 9: Dispute Resolution */}
      <LegalSection id="disputes" title="9. Dispute Resolution">
        <LegalSubsection title="9.1 Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of 
            Delaware, United States, without regard to its conflict of law provisions.
          </p>
        </LegalSubsection>

        <LegalSubsection title="9.2 Informal Resolution">
          <p>
            Before filing any formal legal action, you agree to first contact us and attempt to resolve 
            any dispute informally. Most concerns can be quickly resolved this way. We will work with 
            you in good faith to resolve any issues.
          </p>
        </LegalSubsection>

        <LegalSubsection title="9.3 Arbitration Agreement">
          <p>
            If informal resolution is unsuccessful, any dispute arising from these Terms or your use of 
            the Service shall be resolved through binding arbitration administered by the American 
            Arbitration Association (AAA) under its Commercial Arbitration Rules.
          </p>
        </LegalSubsection>

        <LegalSubsection title="9.4 Class Action Waiver">
          <p>
            You agree to resolve any disputes on an individual basis and waive any right to bring or 
            participate in any class, collective, or representative action.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Section 10: Changes to Terms */}
      <LegalSection id="changes" title="10. Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. When we make changes, we will:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
          <li>Update the "Last Updated" date at the top of these Terms</li>
          <li>Notify you via email for significant changes</li>
          <li>Display a prominent notice within the Service</li>
          <li>Give you at least 30 days' notice before significant changes take effect</li>
        </ul>
        <p className="mt-4">
          Your continued use of the Service after any changes indicates your acceptance of the new 
          Terms. If you do not agree with the revised Terms, you must stop using the Service and 
          close your account.
        </p>
      </LegalSection>

      {/* Section 11: Contact Information */}
      <LegalSection id="contact" title="11. Contact Information">
        <p>If you have any questions about these Terms, please contact us:</p>
        <div className="mt-4 space-y-2">
          <ContactEmail email="legal@welcomely.io" label="Legal Inquiries" />
          <ContactEmail email="support@welcomely.io" label="General Support" />
        </div>
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-sm">
            <strong className="text-white">Welcomely, Inc.</strong><br />
            1234 Innovation Drive, Suite 500<br />
            San Francisco, CA 94105<br />
            United States
          </p>
        </div>
      </LegalSection>

      {/* Closing Statement */}
      <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          By using Welcomely, you acknowledge that you have read, understood, and agree to be bound 
          by these Terms of Service.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          © {new Date().getFullYear()} Welcomely, Inc. All rights reserved.
        </p>
      </div>
    </LegalModal>
  )
}

