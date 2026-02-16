import SEO from '../components/common/SEO';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, UserCheck, Trash2, Download, Globe, CheckCircle2 } from 'lucide-react';

const sections = [
  { icon: <UserCheck className="w-5 h-5" />, title: 'Your Data Rights', desc: 'Under GDPR, you have the following rights regarding your personal data:', items: ['Right of access — request a copy of all data we hold about you', 'Right to rectification — correct any inaccurate personal data', 'Right to erasure — request deletion of your personal data', 'Right to data portability — receive your data in a machine-readable format', 'Right to restrict processing — limit how we use your data', 'Right to object — opt out of certain data processing activities'] },
  { icon: <Trash2 className="w-5 h-5" />, title: 'Data Deletion', desc: 'We make it easy to delete your data:', items: ['Request full account and data deletion from Settings or by contacting us', 'All personal data removed within 30 days of request', 'Backup data purged within 90 days', 'Anonymized, aggregated analytics data may be retained (cannot identify you)', 'We confirm deletion via email once complete'] },
  { icon: <Globe className="w-5 h-5" />, title: 'Data Storage & Processing', desc: 'Where and how your data is stored:', items: ['Primary infrastructure hosted on Google Cloud Platform', 'EU customer data can be stored in EU regions on request', 'Data processing agreements (DPAs) available for all customers', 'Sub-processors listed and updated in our Privacy Policy', 'Cross-border transfers protected by Standard Contractual Clauses (SCCs)'] },
  { icon: <Shield className="w-5 h-5" />, title: 'Consent & Cookies', desc: 'How we handle consent:', items: ['Explicit opt-in consent for marketing communications', 'Cookie consent banner with granular controls', 'Only essential cookies used by default', 'Analytics cookies require active consent', 'Consent preferences can be changed at any time'] },
  { icon: <Download className="w-5 h-5" />, title: 'Data Exports', desc: 'You own your data — take it anywhere:', items: ['Full data export available in CSV and JSON formats', 'Export includes all orders, analytics, and account data', 'Available self-service from your dashboard Settings page', 'Exports typically ready within 24 hours for large datasets'] },
];

const GdprPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased min-h-screen">
      <SEO title="GDPR Compliance" description="Slay Season GDPR and data privacy compliance." path="/gdpr" />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050608]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[#6b7194] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">GDPR Compliance</h1>
        <p className="text-lg text-[#6b7194] mb-14 max-w-2xl">We're committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR). Here's how we handle your data.</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-[#6b7194] mb-4 ml-[52px]">{section.desc}</p>
              <ul className="space-y-2.5 ml-[52px]">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6b7194]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Exercise your data rights</h2>
          <p className="text-[#6b7194] mb-6">To make a GDPR request or ask questions about how we handle your data, get in touch with our team.</p>
          <button onClick={() => navigate('/contact')} className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            Contact Our Privacy Team
          </button>
        </div>

        <p className="text-xs text-[#4a4f6a] mt-8 text-center">Last updated: February 2026</p>
      </div>
    </div>
  );
};

export default GdprPage;
