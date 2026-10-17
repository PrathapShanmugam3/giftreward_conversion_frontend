import { BRAND } from './brand';

// Text of the legal pages from the legacy marketing SPA (index.html →
// /privacy-policy, /terms-conditions, /cookie-policy, /affiliate-agreement),
// with the brand name substituted. Each section is { h, p?, list?, defs?, after? }.
const N = BRAND.name;

const contact = (intro) => ({ h: null, p: intro, contact: true });

export const LEGAL_DOCS = {
  'privacy-policy': {
    title: 'Privacy Policy',
    updated: 'January 2026',
    sections: [
      { h: 'Introduction', p: `${N} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our affiliate marketing services.` },
      {
        h: 'Information We Collect',
        p: 'We may collect the following types of information:',
        list: ['Personal identification information (Name, email address, phone number)', 'Payment information for commission payouts', 'Website traffic and usage data', 'IP addresses and browser information', 'Marketing and promotional preferences'],
      },
      {
        h: 'How We Use Your Information',
        p: 'We use collected information to:',
        list: ['Provide and maintain our affiliate services', 'Process commission payments', 'Send promotional communications (with your consent)', 'Analyze and improve our services', 'Detect and prevent fraud', 'Comply with legal obligations'],
      },
      { h: 'Data Sharing', p: 'We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, or analyzing data. All third parties are bound by confidentiality agreements.' },
      { h: 'Data Security', p: 'We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.' },
      { h: 'Your Rights', p: 'You have the right to:', list: ['Access your personal data', 'Correct inaccurate data', 'Request deletion of your data', 'Opt-out of marketing communications', 'Withdraw consent at any time'] },
      { h: 'Contact Us', ...contact('If you have questions about this Privacy Policy, please contact us at:') },
    ],
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    updated: 'January 2026',
    sections: [
      { h: 'Acceptance of Terms', p: `By accessing and using ${N} services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.` },
      { h: 'Eligibility', p: 'To use our services, you must be at least 18 years old and have the legal capacity to enter into binding agreements. You must provide accurate and complete registration information.' },
      {
        h: 'Account Registration',
        p: 'When registering an account, you agree to:',
        list: ['Provide accurate, current, and complete information', 'Maintain and update your information as needed', 'Keep your login credentials confidential', 'Accept responsibility for all activities under your account', 'Notify us immediately of any unauthorized access'],
      },
      {
        h: 'Prohibited Activities',
        p: 'You agree not to:',
        list: ['Generate fraudulent traffic or conversions', 'Use deceptive advertising practices', 'Violate any applicable laws or regulations', 'Infringe on intellectual property rights', 'Distribute malware or harmful content', 'Manipulate or abuse the tracking system'],
      },
      {
        h: 'Payment Terms',
        p: 'Commission payments are subject to:',
        list: ['Minimum payout threshold requirements', 'Verification of valid conversions', 'Deduction of any fraudulent activities', 'Processing within stated payment cycles', 'Applicable taxes and deductions as per Indian law'],
      },
      { h: 'Termination', p: 'We reserve the right to suspend or terminate your account at any time for violations of these terms, fraudulent activity, or any other reason we deem appropriate. Upon termination, unpaid commissions may be forfeited.' },
      { h: 'Limitation of Liability', p: `${N} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the commissions paid to you in the preceding 12 months.` },
      { h: 'Governing Law', p: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Madhya Pradesh, India.' },
      { h: 'Contact', ...contact('For questions regarding these Terms and Conditions:') },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    updated: 'January 2026',
    sections: [
      { h: 'What Are Cookies?', p: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners.' },
      {
        h: 'Types of Cookies We Use',
        cards: [
          ['Essential Cookies', 'Required for the website to function properly. These cannot be disabled and include cookies for login sessions and security.'],
          ['Analytics Cookies', 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.'],
          ['Tracking Cookies', 'Used to track affiliate conversions and attribute commissions correctly. Essential for our affiliate tracking system.'],
          ['Preference Cookies', 'Remember your preferences and settings to provide a personalized experience.'],
        ],
      },
      { h: 'Third-Party Cookies', p: 'We may use third-party services that set their own cookies, including analytics providers (like Google Analytics), advertising partners, and affiliate tracking platforms. These third parties have their own privacy policies.' },
      {
        h: 'Cookie Duration',
        p: 'Cookies may be either:',
        defs: [
          ['Session Cookies', 'Deleted when you close your browser'],
          ['Persistent Cookies', 'Remain on your device for a set period or until manually deleted'],
        ],
      },
      {
        h: 'Managing Cookies',
        p: 'You can control and manage cookies through your browser settings. However, please note that:',
        list: ['Disabling essential cookies may affect website functionality', 'Blocking tracking cookies may affect affiliate commission attribution', 'You can delete cookies at any time through your browser'],
      },
      { h: 'Updates to This Policy', p: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of our website after changes constitutes acceptance of the updated policy.' },
      { h: 'Contact Us', ...contact('If you have questions about our use of cookies:') },
    ],
  },
  'affiliate-agreement': {
    title: 'Affiliate Agreement',
    updated: 'January 2026',
    sections: [
      { h: 'Agreement Overview', p: `This Affiliate Agreement ("Agreement") is entered into between ${N} ("Company") and you ("Publisher" or "Affiliate") upon registration for our affiliate program. This Agreement governs your participation in the ${N} Affiliate Network.` },
      {
        h: 'Program Enrollment',
        p: 'By enrolling in our affiliate program, you agree to:',
        list: ['Provide accurate registration information', 'Maintain updated contact and payment details', 'Comply with all program policies and guidelines', 'Use only approved promotional methods', 'Represent your traffic sources honestly'],
      },
      {
        h: 'Commission Structure',
        p: 'We offer multiple commission models:',
        defs: [
          ['CPA (Cost Per Action)', 'Commission on completed actions'],
          ['CPC (Cost Per Click)', 'Payment for valid clicks'],
          ['CPD (Cost Per Download)', 'Commission per app/file download'],
          ['CPR (Cost Per Registration)', 'Payment per user registration'],
          ['CPI (Cost Per Install)', 'Commission per app installation'],
        ],
        after: 'Commission rates are displayed in your publisher dashboard and are subject to change with notice.',
      },
      {
        h: 'Payment Terms',
        defs: [
          ['Currency', 'All payments are made in Indian Rupees (INR).'],
          ['Minimum Payout', '₹500 (or as specified in your dashboard)'],
          ['Payment Cycle', 'Weekly/Monthly (based on your tier)'],
          ['Payment Methods', 'Bank Transfer (NEFT/IMPS/UPI)'],
          ['Hold Period', '7-30 days to verify conversions'],
        ],
      },
      {
        h: 'Traffic Requirements',
        p: 'Accepted traffic sources include:',
        list: ['Website and blog traffic', 'Social media marketing', 'Email marketing (with proper consent)', 'Mobile apps', 'YouTube and video platforms', 'Search engine traffic (organic and paid)'],
      },
      {
        h: 'Prohibited Activities',
        p: 'The following are strictly prohibited:',
        list: [
          'Fraudulent traffic (bots, incentivized clicks, click farms)',
          'Cookie stuffing or forced clicks',
          'Misleading advertisements or false claims',
          'Brand bidding without permission',
          'Spam or unsolicited communications',
          'Promoting offers on adult/illegal content sites',
          'Self-referrals or fake conversions',
          'Modifying tracking links or creative materials',
        ],
      },
      { h: 'Fraud and Chargebacks', p: 'We reserve the right to reverse commissions for fraudulent or invalid conversions. Repeated violations will result in account termination and forfeiture of unpaid commissions. We employ advanced fraud detection systems and review all suspicious activity.' },
      { h: 'Intellectual Property', p: `You may use ${N}-provided promotional materials in accordance with guidelines. You may not modify, alter, or misrepresent our brand or advertiser brands. All trademarks remain the property of their respective owners.` },
      { h: 'Confidentiality', p: 'Commission rates, offer details, and program information are confidential. You agree not to disclose this information to third parties or use it for competitive purposes.' },
      {
        h: 'Termination',
        p: 'This Agreement may be terminated:',
        list: ['By either party with 7 days written notice', `Immediately by ${N} for violation of terms`, 'Immediately for fraudulent activity'],
        after: 'Upon termination, pending valid commissions will be paid according to standard terms. Commissions under review or flagged for fraud may be withheld.',
      },
      { h: 'Modifications', p: `${N} reserves the right to modify this Agreement at any time. Changes will be communicated via email or dashboard notification. Continued participation after changes constitutes acceptance.` },
      { h: 'Dispute Resolution', p: 'Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes will be subject to arbitration under Indian Arbitration and Conciliation Act, with proceedings held in Madhya Pradesh, India.' },
      { h: 'Contact Information', ...contact('For questions about this Affiliate Agreement:') },
    ],
  },
};
