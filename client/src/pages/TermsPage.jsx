import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

export default function TermsPage() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <Link to="/" className="back-link">← Back to Dashboard</Link>

        <header className="policy-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: February 2025</p>
        </header>

        <div className="policy-content">
          <section>
            <h2>Introduction</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of Slay Season,
              an ecommerce analytics dashboard application for Shopify stores. By installing or
              using Slay Season, you agree to be bound by these Terms. If you do not agree to
              these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2>1. Service Description</h2>

            <p>
              Slay Season is a Shopify application that provides analytics and business intelligence
              for ecommerce merchants. The Service includes:
            </p>
            <ul>
              <li>Real-time analytics dashboards for orders, products, and customer data</li>
              <li>Integration with advertising platforms for ad performance tracking</li>
              <li>Data visualization and reporting tools</li>
              <li>Historical data analysis and trend insights</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
              at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2>2. Eligibility and Account Responsibility</h2>

            <h3>Eligibility</h3>
            <p>
              You must be at least 18 years old and have the authority to enter into this agreement.
              You must be the owner or authorized administrator of the Shopify store you connect.
            </p>

            <h3>Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to:
            </p>
            <ul>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Keep your password secure and unique</li>
              <li>Log out of your account when using shared computers</li>
              <li>Not share your account credentials with other users</li>
            </ul>
            <p>
              We are not liable for any loss or damage resulting from unauthorized account access.
            </p>

            <h3>Accurate Information</h3>
            <p>
              You agree to provide accurate, current, and complete information during installation
              and to update it as needed.
            </p>
          </section>

          <section>
            <h2>3. User Responsibilities and Conduct</h2>

            <p>
              You agree that you will NOT:
            </p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Reverse engineer, decompile, or attempt to discover the source code or underlying technology</li>
              <li>Interfere with or disrupt the Service or servers connected to it</li>
              <li>Use the Service to send spam, malware, or harmful code</li>
              <li>Harass, abuse, or threaten our support staff</li>
              <li>Remove, obscure, or alter proprietary notices or labels</li>
              <li>Use the Service to violate the rights of third parties</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2>4. Disclaimer of Accuracy</h2>

            <h3>Analytics for Informational Purposes</h3>
            <p>
              The analytics, metrics, and insights provided by Slay Season are for informational
              purposes only. While we strive for accuracy, we do not guarantee the completeness,
              accuracy, or reliability of any information presented.
            </p>

            <h3>Limitations</h3>
            <p>
              You acknowledge that:
            </p>
            <ul>
              <li>Analytics are based on data received from Shopify and connected platforms</li>
              <li>There may be delays or discrepancies in data synchronization</li>
              <li>Third-party platforms may modify their data APIs or reporting without notice</li>
              <li>Analytics should not be the sole basis for business decisions</li>
              <li>Historical data may vary from official platform reports due to API limitations</li>
            </ul>

            <h3>Your Responsibility</h3>
            <p>
              You are responsible for verifying all analytics and metrics independently through
              official platform dashboards before making business or financial decisions.
            </p>
          </section>

          <section>
            <h2>5. Acceptable Use</h2>

            <p>
              You agree to use Slay Season only in compliance with these Terms and all applicable laws.
              We reserve the right to suspend or terminate your access if we determine you are violating
              these terms or engaging in harmful behavior.
            </p>
          </section>

          <section>
            <h2>6. Intellectual Property Rights</h2>

            <p>
              Slay Season and all its content (including software, interfaces, designs, text, graphics)
              are the exclusive property of Slay Season or our licensors. You are granted a limited,
              non-exclusive, non-transferable license to use the Service for your personal, non-commercial
              purposes only.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or exploit any part of the Service without
              explicit written permission.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>

            <h3>Disclaimer</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3>Limitation</h3>
            <p>
              IN NO EVENT SHALL SLAY SEASON, ITS FOUNDERS, EMPLOYEES, OR AGENTS BE LIABLE FOR:
            </p>
            <ul>
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Loss of goodwill or reputation</li>
              <li>Damages arising from service interruption or data loss</li>
              <li>Third-party claims or actions</li>
            </ul>
            <p>
              This limitation applies regardless of the legal theory (contract, tort, strict liability)
              and even if advised of the possibility of such damages.
            </p>

            <h3>Cap on Liability</h3>
            <p>
              Our total cumulative liability to you shall not exceed the amount you paid for Slay Season
              in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2>8. Indemnification</h2>

            <p>
              You agree to indemnify, defend, and hold harmless Slay Season from any claims, damages,
              losses, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your misuse of the Service</li>
              <li>Your infringement of third-party rights</li>
              <li>Your business decisions based on Slay Season analytics</li>
              <li>Data you upload or integrate into the Service</li>
            </ul>
          </section>

          <section>
            <h2>9. Termination</h2>

            <h3>Termination by You</h3>
            <p>
              You may terminate your use of Slay Season at any time by uninstalling the app from
              your Shopify store. Upon uninstallation, your access will end immediately.
            </p>

            <h3>Termination by Us</h3>
            <p>
              We may terminate or suspend your account and access to the Service immediately and
              without notice if:
            </p>
            <ul>
              <li>You violate these Terms</li>
              <li>You engage in harmful, illegal, or abusive behavior</li>
              <li>We determine the Service is being used for unauthorized purposes</li>
              <li>We discontinue the Service</li>
            </ul>

            <h3>Effects of Termination</h3>
            <p>
              Upon termination:
            </p>
            <ul>
              <li>Your right to use the Service ends immediately</li>
              <li>Your data will be deleted within 48 hours per our Privacy Policy</li>
              <li>Any fees paid are non-refundable unless required by law</li>
              <li>Provisions that survive termination continue in effect</li>
            </ul>
          </section>

          <section>
            <h2>10. Service Availability and Support</h2>

            <h3>Uptime and Availability</h3>
            <p>
              While we strive for high availability, we do not guarantee uninterrupted service or
              zero downtime. We will notify you of scheduled maintenance when possible.
            </p>

            <h3>Support</h3>
            <p>
              We provide support via email at hello@slayseason.com. Response times are on a
              best-effort basis, typically within 1-2 business days.
            </p>
          </section>

          <section>
            <h2>11. Governing Law and Dispute Resolution</h2>

            <h3>Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions.
            </p>

            <h3>Jurisdiction</h3>
            <p>
              You agree that any legal action or proceeding relating to these Terms or the Service
              shall be exclusively brought in the state or federal courts located in the United States,
              and you hereby consent to the personal jurisdiction and venue of such courts.
            </p>

            <h3>Dispute Resolution</h3>
            <p>
              Before pursuing legal action, you agree to attempt to resolve any dispute by contacting
              us at hello@slayseason.com. We will work with you in good faith to resolve issues.
            </p>
          </section>

          <section>
            <h2>12. Modifications to Terms</h2>

            <p>
              We may modify these Terms at any time. We will notify you of material changes by email
              or through the Service. Your continued use of Slay Season following notification of
              changes constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2>13. Severability</h2>

            <p>
              If any provision of these Terms is found to be invalid or unenforceable, that provision
              shall be removed or modified to the minimum extent necessary to make it enforceable,
              and the remaining provisions shall remain in full effect.
            </p>
          </section>

          <section>
            <h2>14. Entire Agreement</h2>

            <p>
              These Terms, along with our Privacy Policy, constitute the entire agreement between you
              and Slay Season regarding your use of the Service. They supersede all prior agreements,
              understandings, and negotiations, whether written or oral.
            </p>
          </section>

          <section>
            <h2>15. Contact Information</h2>

            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="contact-info">
              <p>
                <strong>Email:</strong> <a href="mailto:hello@slayseason.com">hello@slayseason.com</a>
              </p>
              <p>
                <strong>Response Time:</strong> We aim to respond to all inquiries within 5 business days.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
