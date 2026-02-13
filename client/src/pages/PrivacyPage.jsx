import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

export default function PrivacyPage() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <Link to="/" className="back-link">← Back to Dashboard</Link>

        <header className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: February 2024</p>
        </header>

        <div className="policy-content">
          <section>
            <h2>Introduction</h2>
            <p>
              Slay Season ("we," "us," "our," or "Company") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our ecommerce analytics dashboard application.
            </p>
          </section>

          <section>
            <h2>1. Information We Collect</h2>

            <h3>Shopify Store Data</h3>
            <p>
              When you install Slay Season on your Shopify store, we access and collect the following
              data to provide analytics and insights:
            </p>
            <ul>
              <li>Order data (order IDs, dates, amounts, statuses)</li>
              <li>Product information (names, SKUs, prices, inventory levels)</li>
              <li>Customer aggregate metrics (purchase frequency, lifetime value, cohort analysis)</li>
              <li>Store configuration (timezone, currency, business metrics)</li>
            </ul>
            <p>
              We do NOT collect individual customer personally identifiable information (PII) such as
              full names, email addresses, or shipping details beyond what is necessary for aggregate analysis.
            </p>

            <h3>Connected Ad Platform Data</h3>
            <p>
              If you choose to connect third-party advertising platforms (Facebook, Google Ads, etc.),
              we collect performance metrics from those platforms to correlate with your Shopify data:
            </p>
            <ul>
              <li>Campaign performance metrics</li>
              <li>Ad spend and ROI data</li>
              <li>Impressions and click-through rates</li>
            </ul>
            <p>
              We only collect data from platforms YOU explicitly authorize through OAuth connections.
            </p>

            <h3>Usage Data</h3>
            <p>
              We collect limited usage information to improve our service:
            </p>
            <ul>
              <li>Feature usage patterns (which analytics you view most)</li>
              <li>Session information (login timestamps, session duration)</li>
              <li>Error logs (to diagnose and fix technical issues)</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Store Your Data</h2>

            <h3>Encryption</h3>
            <p>
              All sensitive data is encrypted using AES-256-GCM encryption, the military-grade standard
              for data protection. Your data is encrypted both in transit (via HTTPS/TLS) and at rest in our databases.
            </p>

            <h3>Storage Location</h3>
            <p>
              Your data is stored in secure, geographically redundant databases hosted on industry-leading
              cloud infrastructure with automatic backups and disaster recovery protocols.
            </p>

            <h3>Access Controls</h3>
            <p>
              Access to your data is restricted to authorized personnel on a need-to-know basis.
              We implement role-based access controls and audit all data access.
            </p>
          </section>

          <section>
            <h2>3. Data Sharing and Sales</h2>

            <p>
              <strong>We do not sell, trade, or rent your data to third parties.</strong>
            </p>
            <p>
              Your Shopify store data and metrics remain your exclusive property. We never monetize
              your information or share it with advertisers, data brokers, or other commercial entities
              without your explicit written consent.
            </p>
            <p>
              The only exceptions are:
            </p>
            <ul>
              <li>Data shared with services you explicitly authorize (e.g., connected ad platforms)</li>
              <li>Compliance with legal obligations (e.g., court orders, law enforcement)</li>
              <li>Service providers who assist us (under strict data processing agreements)</li>
            </ul>
          </section>

          <section>
            <h2>4. GDPR Compliance</h2>

            <p>
              Slay Season complies with the General Data Protection Regulation (GDPR) and respects
              the rights of EU residents.
            </p>

            <h3>Your Rights</h3>
            <ul>
              <li>
                <strong>Right to Access:</strong> You can request a copy of all personal data we hold about you.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You can request deletion of your data (subject to legal retention obligations).
              </li>
              <li>
                <strong>Right to Rectification:</strong> You can request correction of inaccurate data.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You can request your data in a machine-readable format.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You can limit how we process your data.
              </li>
              <li>
                <strong>Right to Object:</strong> You can object to certain processing activities.
              </li>
            </ul>

            <h3>Shopify GDPR Webhooks</h3>
            <p>
              We implement and honor Shopify's mandatory GDPR webhooks:
            </p>
            <ul>
              <li>Customer Data Request (shop/customers/data_request): We compile and provide customer data upon request</li>
              <li>Customer Erasure Request (shop/customers/redact): We permanently delete customer data when requested</li>
              <li>Shop Redaction (shop/redact): We delete all store data when Shopify notifies us of account closure</li>
            </ul>
            <p>
              Requests are processed within 30 days in compliance with GDPR requirements.
            </p>
          </section>

          <section>
            <h2>5. Data Retention Policy</h2>

            <p>
              We retain your data only as long as necessary to provide our service. When you uninstall
              Slay Season from your Shopify store:
            </p>
            <ul>
              <li>All active data processing stops immediately</li>
              <li>Your data is securely deleted within 48 hours</li>
              <li>Encrypted backups are purged within 90 days per standard data retention protocols</li>
              <li>We retain only anonymized, aggregated metrics that cannot identify your store</li>
            </ul>
            <p>
              You can also request manual data deletion at any time by contacting support@slayseason.com.
            </p>
          </section>

          <section>
            <h2>6. Third-Party Services</h2>

            <p>
              Slay Season integrates with third-party services only when you explicitly authorize them.
              We are not responsible for the privacy practices of external platforms.
            </p>

            <h3>Supported Integrations</h3>
            <ul>
              <li>Shopify (required for core functionality)</li>
              <li>Facebook Ads (optional, when you connect your ad account)</li>
              <li>Google Ads (optional, when you connect your ad account)</li>
              <li>Stripe (optional, if you use Stripe for payments)</li>
            </ul>
            <p>
              Each platform has its own privacy policy. We recommend reviewing them before connecting.
            </p>
          </section>

          <section>
            <h2>7. Cookies and Tracking</h2>

            <h3>Session Storage Only</h3>
            <p>
              Slay Season uses browser session storage to maintain your login state and preferences
              during your session. Session data is automatically cleared when you close your browser.
            </p>

            <h3>No Tracking Cookies</h3>
            <p>
              We do NOT use tracking cookies, analytics cookies, or advertising cookies.
              We do not track your browsing behavior across the web.
            </p>

            <h3>Strictly Necessary</h3>
            <p>
              Any cookies or storage we use are strictly necessary for authentication and functionality.
              You cannot opt out of essential functionality, but you also won't be tracked.
            </p>
          </section>

          <section>
            <h2>8. Data Security</h2>

            <p>
              We implement industry-standard security measures:
            </p>
            <ul>
              <li>AES-256-GCM encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Regular security audits and penetration testing</li>
              <li>Two-factor authentication support</li>
              <li>Rate limiting and DDoS protection</li>
              <li>Regular security updates and patches</li>
            </ul>
            <p>
              However, no system is 100% secure. If you suspect a breach, contact us immediately
              at support@slayseason.com.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>

            <p>
              Slay Season is not directed at children under 13. We do not knowingly collect data from
              children. If we become aware that we've collected data from a child, we'll delete it immediately.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Privacy Policy</h2>

            <p>
              We may update this policy periodically. We'll notify you of material changes by email
              or through the app interface. Your continued use of Slay Season constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy or our privacy practices:
            </p>
            <div className="contact-info">
              <p>
                <strong>Email:</strong> <a href="mailto:support@slayseason.com">support@slayseason.com</a>
              </p>
              <p>
                <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 5 business days.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
