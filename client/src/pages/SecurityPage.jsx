import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Server, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';

const sections = [
  { icon: <Lock className="w-5 h-5" />, title: 'Encryption', items: ['AES-256 encryption for all data at rest', 'TLS 1.3 for all data in transit', 'Database-level encryption with managed keys', 'Encrypted backups with 30-day retention'] },
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'SOC 2 Compliance', items: ['Currently pursuing SOC 2 Type II certification', 'Security controls aligned with AICPA Trust Services Criteria', 'Annual third-party penetration testing', 'Continuous vulnerability scanning and monitoring'] },
  { icon: <Server className="w-5 h-5" />, title: 'Infrastructure', items: ['Hosted on Google Cloud Platform (GCP)', 'Automatic scaling and redundancy', '99.9% uptime SLA for paid plans', 'Daily automated backups across multiple regions'] },
  { icon: <Eye className="w-5 h-5" />, title: 'Data Handling', items: ['We never sell or share your data with third parties', 'Minimal data collection — only what\'s needed for analytics', 'Role-based access controls for all internal systems', 'Full data export and deletion available on request'] },
  { icon: <Shield className="w-5 h-5" />, title: 'Application Security', items: ['OAuth 2.0 for all third-party integrations', 'No passwords stored — magic link and OAuth authentication', 'API rate limiting and abuse detection', 'Regular dependency audits and automated patching'] },
];

const SecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050608]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[#6b7194] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Security</h1>
        <p className="text-lg text-[#6b7194] mb-14 max-w-2xl">Your data security is our top priority. Here's how we protect your business information.</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{section.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6b7194]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Have security questions?</h2>
          <p className="text-[#6b7194] mb-6">We're happy to discuss our security practices, provide documentation, or complete your security questionnaire.</p>
          <button onClick={() => navigate('/contact')} className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
