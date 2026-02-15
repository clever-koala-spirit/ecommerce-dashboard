import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  Clock,
  MessageSquare,
  Users,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Zap,
  ExternalLink,
  HelpCircle,
  CreditCard,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    subject: 'general'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, we'll just show success message
    // In production, this would POST to your backend
    setIsSubmitted(true);
    
    // Create mailto link as fallback
    const subject = encodeURIComponent(`Slay Season Contact: ${formData.subject === 'general' ? 'General Inquiry' : formData.subject === 'support' ? 'Support Request' : formData.subject === 'billing' ? 'Billing Question' : 'Demo Request'}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}

Message:
${formData.message}
    `.trim());
    
    window.location.href = `mailto:hello@slayseason.com?subject=${subject}&body=${body}`;
  };

  const faqs = [
    {
      category: 'Getting Started',
      icon: <BarChart3 className="w-4 h-4" />,
      questions: [
        'How do I connect my Shopify store?',
        'Setting up Meta & Google Ads tracking',
        'Understanding your profit calculations'
      ]
    },
    {
      category: 'Account & Billing',
      icon: <CreditCard className="w-4 h-4" />,
      questions: [
        'Changing or canceling your plan',
        'Understanding your bill',
        'Payment methods and invoices'
      ]
    },
    {
      category: 'Features',
      icon: <Settings className="w-4 h-4" />,
      questions: [
        'Using the AI forecasting tool',
        'Setting up custom reports',
        'Budget optimization explained'
      ]
    },
    {
      category: 'Security',
      icon: <Shield className="w-4 h-4" />,
      questions: [
        'Data security and encryption',
        'API access permissions',
        'GDPR compliance'
      ]
    }
  ];

  if (isSubmitted) {
    return (
      <div className="w-full bg-[#050608] text-[#e8eaf0] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
          <p className="text-[#8b92b0] mb-6">
            Thanks for reaching out. We'll get back to you within 24 hours at {formData.email}.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent); }
        
        input, textarea, select { 
          background: rgba(14,17,28,.8); 
          border: 1px solid rgba(255,255,255,.1); 
          color: #e8eaf0; 
          border-radius: 8px; 
          padding: 12px 16px; 
          transition: border-color .3s ease; 
        }
        input:focus, textarea:focus, select:focus { 
          outline: none; 
          border-color: rgba(99,102,241,.5); 
          box-shadow: 0 0 0 3px rgba(99,102,241,.1); 
        }
        input::placeholder, textarea::placeholder { color: #6b7194; }
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
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-[#8b92b0] hover:text-white transition-colors px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="flex items-center gap-1.5">Start Free Trial <ArrowRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-16 mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Get in <span className="text-indigo-400">Touch</span>
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed mb-8">
            Questions? Feedback? Want to chat about your DTC analytics challenges? We'd love to hear from you.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-[#6b7194]">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              24-hour response time
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Talk to real humans
            </span>
          </div>
        </div>
      </section>

      {/* Contact Methods + Form */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Reach Out Directly</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email Us</p>
                      <a href="mailto:hello@slayseason.com" className="text-indigo-400 hover:text-indigo-300">hello@slayseason.com</a>
                      <p className="text-xs text-[#6b7194] mt-1">We respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Join Our Community</p>
                      <p className="text-[#8b92b0] text-sm">Growth & Pro plans include priority Slack access</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Australia (HQ)</p>
                      <p className="text-[#8b92b0] text-sm">Convictlabs Holdings LLC</p>
                      <p className="text-[#8b92b0] text-sm">Melbourne, VIC, Australia</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Phone Support</p>
                      <p className="text-[#8b92b0] text-sm">AU: <a href="tel:0342403039" className="text-indigo-400 hover:text-indigo-300">03 4240 3039</a></p>
                      <p className="text-[#8b92b0] text-sm">US: <a href="tel:+18303902778" className="text-indigo-400 hover:text-indigo-300">+1 (830) 390-2778</a></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">United States</p>
                      <p className="text-[#8b92b0] text-sm">Slay Season US</p>
                      <p className="text-[#8b92b0] text-sm">Support across United States</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Promise */}
              <div className="glass rounded-xl p-6 gradient-border">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white">Response Time Promise</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8b92b0]">General inquiries:</span>
                    <span className="text-white font-medium">&lt; 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b92b0]">Support issues:</span>
                    <span className="text-white font-medium">&lt; 4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b92b0]">Critical bugs:</span>
                    <span className="text-white font-medium">&lt; 1 hour</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass rounded-xl p-8 gradient-border">
                <h3 className="text-xl font-bold text-white mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#c4c9d8] mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#c4c9d8] mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@company.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#c4c9d8] mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your brand name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#c4c9d8] mb-2">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="demo">Request Demo</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#c4c9d8] mb-2">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your analytics challenges, questions, or how we can help..."
                      className="w-full resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 group"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAQ Links */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">
              Looking for <span className="text-indigo-400">Quick Answers</span>?
            </h3>
            <p className="text-[#8b92b0]">Check out our help center for instant solutions to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqs.map((category, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:bg-white/[.02] transition-colors cursor-pointer" onClick={() => navigate('/help')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-white">{category.category}</h4>
                </div>
                <ul className="space-y-2 text-sm text-[#8b92b0]">
                  {category.questions.map((q, j) => (
                    <li key={j} className="hover:text-white transition-colors">{q}</li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400">
                  <span>View All</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/help')}
              className="glass px-6 py-3 rounded-lg font-semibold hover:bg-white/[.04] transition-all flex items-center gap-2 mx-auto"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Visit Help Center</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

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

export default ContactPage;