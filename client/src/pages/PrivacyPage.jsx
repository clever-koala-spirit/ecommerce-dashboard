import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Globe,
  Mail,
  FileText,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .policy-section { margin-bottom: 3rem; }
        .policy-section h2 { font-size: 1.5rem; font-weight: 700; color: #e8eaf0; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,.1); }
        .policy-section h3 { font-size: 1.25rem; font-weight: 600; color: #c4c9d8; margin: 1.5rem 0 0.75rem 0; }
        .policy-section p { margin-bottom: 1rem; line-height: 1.6; color: #8b92b0; }
        .policy-section ul { margin: 1rem 0; padding-left: 1.5rem; }
        .policy-section li { margin-bottom: 0.5rem; color: #8b92b0; line-height: 1.6; }
        .policy-section strong { color: #e8eaf0; font-weight: 600; }
        .policy-section a { color: #6366f1; text-decoration: underline; }
        .policy-section a:hover { color: #8b5cf6; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Slay Season</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <button onClick={() => navigate('/')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Home</button>
            <button onClick={() => navigate('/about')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">About</button>
            <button onClick={() => navigate('/pricing')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Pricing</button>
            <button onClick={() => navigate('/blog')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Blog</button>
            <button onClick={() => navigate('/help')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Help</button>
            <button onClick={() => navigate('/contact')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-[#8b92b0] hover:text-white transition-colors px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="flex items-center gap-1.5">Start Free Trial <ArrowRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-[#6b7194] hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-[#6b7194]">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: February 15, 2025</span>
            </div>
          </header>

          {/* Content */}
          <div className="glass rounded-xl p-8 lg:p-12">
            
            <div className="policy-section">
              <h2>Introduction</h2>
              <p>
                Slay Season ("we," "us," "our," or "Company") operated by <strong>Convictlabs Holdings LLC</strong> is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our ecommerce analytics dashboard application.
              </p>
              <p>
                By using Slay Season, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <div className="policy-section">
              <h2>1. Information We Collect</h2>

              <h3>Shopify Store Data</h3>
              <p>
                When you install Slay Season on your Shopify store, we access and collect the following
                data to provide analytics and insights:
              </p>
              <ul>
                <li>Order data (order IDs, dates, amounts, statuses, product details)</li>
                <li>Product information (names, SKUs, prices, inventory levels, variants)</li>
                <li>Customer aggregate metrics (purchase frequency, lifetime value, cohort analysis)</li>
                <li>Store configuration (timezone, currency, business settings)</li>
                <li>Discount and promotion data</li>
                <li>Refund and return information</li>
                <li>Shipping and fulfillment data</li>
              </ul>
              <p>
                <strong>Important:</strong> We do NOT collect individual customer personally identifiable information (PII) such as
                full names, email addresses, phone numbers, or shipping addresses. All customer data is aggregated and anonymized for analytics purposes.
              </p>

              <h3>Connected Ad Platform Data</h3>
              <p>
                If you choose to connect third-party advertising platforms (Meta Ads, Google Ads, TikTok Ads, etc.),
                we collect performance metrics from those platforms:
              </p>
              <ul>
                <li>Campaign performance metrics (impressions, clicks, conversions)</li>
                <li>Ad spend and return on ad spend (ROAS) data</li>
                <li>Audience and targeting information</li>
                <li>Creative performance data</li>
                <li>Attribution data and conversion tracking</li>
              </ul>
              <p>
                We only collect data from platforms YOU explicitly authorize through OAuth connections.
              </p>

              <h3>Email Marketing Platform Data</h3>
              <p>
                When you connect email platforms like Klaviyo:
              </p>
              <ul>
                <li>Campaign performance metrics</li>
                <li>Revenue attribution from email campaigns</li>
                <li>Subscriber segment data (aggregated)</li>
                <li>Automation flow performance</li>
              </ul>

              <h3>Usage and Technical Data</h3>
              <p>
                We collect limited usage information to improve our service:
              </p>
              <ul>
                <li>Feature usage patterns (which analytics you view most)</li>
                <li>Session information (login timestamps, session duration)</li>
                <li>Error logs and diagnostic information</li>
                <li>Browser type and version</li>
                <li>Device information (for mobile app usage)</li>
                <li>IP address (for security purposes)</li>
              </ul>

              <h3>Account Information</h3>
              <p>
                When you create a Slay Season account:
              </p>
              <ul>
                <li>Email address</li>
                <li>Name (first and last)</li>
                <li>Company/store name</li>
                <li>Billing information (processed securely by Stripe)</li>
                <li>Account preferences and settings</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>2. How We Use Your Information</h2>
              <p>
                We use your information to:
              </p>
              <ul>
                <li>Provide and maintain our analytics service</li>
                <li>Calculate accurate profit metrics and performance data</li>
                <li>Generate forecasts and business insights</li>
                <li>Process payments and manage subscriptions</li>
                <li>Provide customer support</li>
                <li>Send service-related communications</li>
                <li>Improve our service and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>3. Data Storage and Security</h2>

              <h3>Encryption</h3>
              <p>
                All sensitive data is encrypted using <strong>AES-256-GCM encryption</strong>, the military-grade standard
                for data protection. Your data is encrypted both in transit (via HTTPS/TLS 1.3) and at rest in our databases.
              </p>

              <h3>Storage Location</h3>
              <p>
                Your data is stored in secure, geographically redundant databases hosted on industry-leading
                cloud infrastructure (AWS/Google Cloud) with automatic backups and disaster recovery protocols.
                Data is primarily stored in US data centers with EU options available for GDPR compliance.
              </p>

              <h3>Access Controls</h3>
              <p>
                Access to your data is restricted to authorized personnel on a strict need-to-know basis.
                We implement:
              </p>
              <ul>
                <li>Multi-factor authentication for all team members</li>
                <li>Role-based access controls</li>
                <li>Comprehensive audit logs of all data access</li>
                <li>Regular security training and background checks</li>
                <li>Zero-trust network architecture</li>
              </ul>

              <h3>SOC 2 Type II Compliance</h3>
              <p>
                Slay Season is <strong>SOC 2 Type II compliant</strong>, meaning we undergo regular independent audits
                of our security controls, availability, processing integrity, confidentiality, and privacy practices.
              </p>
            </div>

            <div className="policy-section">
              <h2>4. Data Sharing and Sales</h2>
              <p className="text-emerald-400 font-semibold text-lg">
                WE DO NOT SELL, TRADE, OR RENT YOUR DATA TO THIRD PARTIES. EVER.
              </p>
              <p>
                Your Shopify store data and business metrics remain your exclusive property. We never monetize
                your information or share it with advertisers, data brokers, or other commercial entities.
              </p>
              
              <h3>Limited Exceptions</h3>
              <p>
                We may share data only in these specific circumstances:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Trusted vendors who assist us (cloud hosting, payment processing) under strict data processing agreements</li>
                <li><strong>Legal Compliance:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Your Authorization:</strong> When you explicitly connect third-party services</li>
                <li><strong>Business Transfer:</strong> In the event of a merger or acquisition (you'll be notified)</li>
                <li><strong>Security:</strong> To protect against fraud or security threats</li>
              </ul>

              <h3>Aggregated Data</h3>
              <p>
                We may use aggregated, anonymized data that cannot identify you or your business for:
              </p>
              <ul>
                <li>Industry benchmarks and insights</li>
                <li>Product improvement and research</li>
                <li>Public reports on ecommerce trends</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>5. GDPR Compliance (EU Rights)</h2>
              <p>
                Slay Season complies with the General Data Protection Regulation (GDPR) and respects
                the rights of EU residents. If you are located in the EU, you have these rights:
              </p>

              <h3>Your Rights Under GDPR</h3>
              <ul>
                <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete data</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li><strong>Right to Complain:</strong> File a complaint with your data protection authority</li>
              </ul>

              <h3>Legal Basis for Processing</h3>
              <p>
                We process your data based on:
              </p>
              <ul>
                <li><strong>Contract:</strong> To provide our analytics service</li>
                <li><strong>Legitimate Interest:</strong> To improve our service and prevent fraud</li>
                <li><strong>Consent:</strong> For marketing communications (opt-in only)</li>
                <li><strong>Legal Obligation:</strong> To comply with tax and financial regulations</li>
              </ul>

              <h3>Shopify GDPR Webhooks</h3>
              <p>
                We implement and honor Shopify's mandatory GDPR webhooks:
              </p>
              <ul>
                <li><strong>Customer Data Request:</strong> We compile and provide customer data within 30 days</li>
                <li><strong>Customer Erasure Request:</strong> We permanently delete customer data within 30 days</li>
                <li><strong>Shop Redaction:</strong> We delete all store data when notified of account closure</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>6. California Privacy Rights (CCPA)</h2>
              <p>
                California residents have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul>
                <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we don't sell data)</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>
              <p>
                To exercise these rights, contact us at <a href="mailto:hello@slayseason.com">hello@slayseason.com</a>.
              </p>
            </div>

            <div className="policy-section">
              <h2>7. Data Retention Policy</h2>
              <p>
                We retain your data only as long as necessary to provide our service and comply with legal obligations:
              </p>

              <h3>Active Accounts</h3>
              <ul>
                <li>Store data: Retained for the duration of your subscription</li>
                <li>Historical analytics: Retained for up to 3 years for trend analysis</li>
                <li>Account information: Retained while your account is active</li>
              </ul>

              <h3>Account Cancellation</h3>
              <p>
                When you cancel your subscription:
              </p>
              <ul>
                <li>Active data processing stops immediately</li>
                <li>You have 90 days to reactivate and retain your data</li>
                <li>After 90 days, all data is permanently and securely deleted</li>
                <li>Encrypted backups are purged within 180 days</li>
                <li>Billing records are retained for 7 years (legal requirement)</li>
              </ul>

              <h3>Manual Deletion</h3>
              <p>
                You can request immediate data deletion at any time by contacting <a href="mailto:hello@slayseason.com">hello@slayseason.com</a>.
                We'll confirm deletion within 30 days.
              </p>
            </div>

            <div className="policy-section">
              <h2>8. Third-Party Services</h2>
              <p>
                Slay Season integrates with third-party services only when you explicitly authorize them.
                We are not responsible for the privacy practices of external platforms.
              </p>

              <h3>Required Integrations</h3>
              <ul>
                <li><strong>Shopify:</strong> Required for core functionality</li>
                <li><strong>Stripe:</strong> Secure payment processing</li>
              </ul>

              <h3>Optional Integrations (Your Choice)</h3>
              <ul>
                <li>Meta Ads (Facebook & Instagram)</li>
                <li>Google Ads</li>
                <li>Google Analytics 4</li>
                <li>Klaviyo</li>
                <li>TikTok Ads</li>
                <li>Snapchat Ads</li>
                <li>Pinterest Ads</li>
              </ul>
              <p>
                Each platform has its own privacy policy. We recommend reviewing them before connecting.
                You can disconnect any platform at any time from your dashboard.
              </p>
            </div>

            <div className="policy-section">
              <h2>9. Cookies and Tracking</h2>

              <h3>Essential Cookies Only</h3>
              <p>
                Slay Season uses only essential cookies required for:
              </p>
              <ul>
                <li>Authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>Remembering your preferences</li>
              </ul>

              <h3>No Tracking or Analytics Cookies</h3>
              <p>
                We do NOT use:
              </p>
              <ul>
                <li>Google Analytics or similar tracking tools</li>
                <li>Advertising or marketing cookies</li>
                <li>Social media tracking pixels</li>
                <li>Cross-site tracking technologies</li>
              </ul>

              <h3>Third-Party Cookies</h3>
              <p>
                When you connect external platforms, they may set their own cookies according to their privacy policies.
                These are not controlled by Slay Season.
              </p>
            </div>

            <div className="policy-section">
              <h2>10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your own.
                We ensure adequate protection through:
              </p>
              <ul>
                <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved data transfer mechanisms</li>
                <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection</li>
                <li><strong>Data Processing Agreements:</strong> Binding contracts with all data processors</li>
              </ul>
              <p>
                EU customers can request data to be processed only within the EU by contacting support.
              </p>
            </div>

            <div className="policy-section">
              <h2>11. Children's Privacy</h2>
              <p>
                Slay Season is not directed at children under 18. We do not knowingly collect personal information from minors.
                If we become aware that we've collected data from someone under 18, we'll delete it immediately.
              </p>
              <p>
                If you're a parent or guardian and believe your child has provided us with personal information,
                please contact us at <a href="mailto:hello@slayseason.com">hello@slayseason.com</a>.
              </p>
            </div>

            <div className="policy-section">
              <h2>12. Data Breach Notification</h2>
              <p>
                In the unlikely event of a data breach that affects your personal information:
              </p>
              <ul>
                <li>We'll notify you within 72 hours of discovering the breach</li>
                <li>We'll provide details about what data was involved</li>
                <li>We'll explain what steps we're taking to address the breach</li>
                <li>We'll offer guidance on protecting yourself</li>
                <li>We'll notify relevant authorities as required by law</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
                When we make significant changes:
              </p>
              <ul>
                <li>We'll email you at least 30 days before changes take effect</li>
                <li>We'll display a notice in the app interface</li>
                <li>We'll update the "Last Updated" date at the top of this policy</li>
                <li>We'll maintain an archive of previous versions</li>
              </ul>
              <p>
                Your continued use of Slay Season after changes take effect constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="policy-section">
              <h2>14. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, or wish to exercise your rights:
              </p>
              
              <div className="glass rounded-lg p-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-white mb-3">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      Email Support
                    </h3>
                    <p className="text-[#8b92b0] mb-2">
                      <a href="mailto:hello@slayseason.com" className="text-indigo-400 hover:text-indigo-300">hello@slayseason.com</a>
                    </p>
                    <p className="text-sm text-[#6b7194]">
                      We respond to all privacy inquiries within 5 business days
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center gap-2 text-white mb-3">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      Company Information
                    </h3>
                    <p className="text-[#8b92b0] mb-1">Convictlabs Holdings LLC</p>
                    <p className="text-sm text-[#6b7194]">
                      Data Protection Officer available for EU inquiries
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-14 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Slay Season</span>
            </div>
            <p className="text-xs text-[#4a4f6a]">© 2025 Slay Season by Convictlabs Holdings LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;