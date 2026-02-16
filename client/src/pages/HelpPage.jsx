import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  BookOpen,
  Play,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Zap,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  Cpu,
  Link as LinkIcon,
  FileText,
  Video,
  HeadphonesIcon,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  ArrowUpRight,
  Download
} from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const helpCategories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      color: 'indigo',
      description: 'Set up your account and connect your first store',
      articles: [
        { title: 'Creating your Slay Season account', type: 'article', duration: '3 min read' },
        { title: 'Connecting your Shopify store', type: 'video', duration: '2 min watch' },
        { title: 'Understanding your dashboard', type: 'article', duration: '5 min read' },
        { title: 'First-time setup checklist', type: 'article', duration: '4 min read' },
      ]
    },
    {
      id: 'integrations',
      name: 'Platform Connections',
      icon: <LinkIcon className="w-5 h-5" />,
      color: 'emerald',
      description: 'Connect Meta, Google, Klaviyo, TikTok, and more',
      articles: [
        { title: 'Connecting Meta Ads (Facebook & Instagram)', type: 'video', duration: '4 min watch' },
        { title: 'Setting up Google Ads tracking', type: 'article', duration: '6 min read' },
        { title: 'Klaviyo integration guide', type: 'article', duration: '5 min read' },
        { title: 'TikTok Ads connection', type: 'video', duration: '3 min watch' },
        { title: 'Google Analytics 4 setup', type: 'article', duration: '8 min read' },
        { title: 'Troubleshooting connection issues', type: 'article', duration: '4 min read' },
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'purple',
      description: 'Understanding your data and creating reports',
      articles: [
        { title: 'Understanding profit calculations', type: 'article', duration: '7 min read' },
        { title: 'True ROAS vs Platform ROAS', type: 'video', duration: '5 min watch' },
        { title: 'Setting up cost tracking (COGS, shipping, fees)', type: 'article', duration: '10 min read' },
        { title: 'Creating custom reports', type: 'video', duration: '6 min watch' },
        { title: 'Using the AI chat assistant', type: 'article', duration: '4 min read' },
        { title: 'Forecasting and budget optimization', type: 'article', duration: '9 min read' },
      ]
    },
    {
      id: 'account',
      name: 'Account & Billing',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'amber',
      description: 'Manage your subscription and billing',
      articles: [
        { title: 'Upgrading or downgrading your plan', type: 'article', duration: '3 min read' },
        { title: 'Understanding your bill', type: 'article', duration: '4 min read' },
        { title: 'Adding or removing team members', type: 'article', duration: '3 min read' },
        { title: 'Canceling your subscription', type: 'article', duration: '2 min read' },
        { title: 'Payment methods and invoices', type: 'article', duration: '4 min read' },
      ]
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      icon: <Shield className="w-5 h-5" />,
      color: 'green',
      description: 'Data security, permissions, and compliance',
      articles: [
        { title: 'Data security and encryption', type: 'article', duration: '5 min read' },
        { title: 'API permissions and access levels', type: 'article', duration: '4 min read' },
        { title: 'GDPR compliance', type: 'article', duration: '6 min read' },
        { title: 'Two-factor authentication setup', type: 'article', duration: '3 min read' },
        { title: 'Data retention and deletion', type: 'article', duration: '4 min read' },
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Features',
      icon: <Cpu className="w-5 h-5" />,
      color: 'rose',
      description: 'API access, webhooks, and custom integrations',
      articles: [
        { title: 'API documentation and examples', type: 'article', duration: '12 min read' },
        { title: 'Setting up webhooks', type: 'article', duration: '8 min read' },
        { title: 'Custom dashboard widgets', type: 'video', duration: '7 min watch' },
        { title: 'White-label options (Pro plan)', type: 'article', duration: '5 min read' },
        { title: 'Multi-store management', type: 'article', duration: '6 min read' },
      ]
    }
  ];

  const frequentQuestions = [
    {
      q: 'How long does it take to set up Slay Season?',
      a: 'Most merchants are up and running in under 5 minutes. Connecting your Shopify store takes 30 seconds via OAuth. Ad platform connections (Meta, Google, etc.) take 1-2 minutes each. Growth and Pro plan customers can opt for our concierge setup service where our team handles everything for you.',
      category: 'Setup'
    },
    {
      q: 'Why doesn\'t my Slay Season profit match my bookkeeper?',
      a: 'Small differences (1-3%) are normal due to timing differences and accrual vs cash accounting methods. Large differences usually indicate missing cost data. Check that all your COGS, shipping costs, payment processing fees, and fixed costs are properly configured. Contact support if you need help reconciling.',
      category: 'Analytics'
    },
    {
      q: 'Can I track multiple Shopify stores in one account?',
      a: 'Yes! Starter plans include 1 store, Growth plans include up to 3 stores, and Pro plans include unlimited stores. You can switch between stores in the dashboard or view consolidated data across all stores.',
      category: 'Account'
    },
    {
      q: 'What happens to my data if I cancel?',
      a: 'You can export all your data (reports, historical metrics, etc.) before canceling. We keep your data for 90 days after cancellation in case you want to reactivate. After 90 days, all data is permanently deleted per our privacy policy.',
      category: 'Account'
    },
    {
      q: 'Do you support currencies other than USD?',
      a: 'Yes! We support 20+ currencies including EUR, GBP, CAD, AUD, and more. Currency conversion happens in real-time using live exchange rates. You can set your preferred display currency in Settings.',
      category: 'Setup'
    },
    {
      q: 'How accurate is the AI forecasting?',
      a: 'Our AI forecasting averages 85-90% accuracy for 30-day forecasts and 80-85% for 90-day forecasts. Accuracy improves over time as the model learns your business patterns. Results vary based on seasonality, marketing changes, and external factors.',
      category: 'Analytics'
    },
    {
      q: 'Can I white-label Slay Season for my agency clients?',
      a: 'Yes! Pro plan includes white-label options where you can customize the dashboard with your brand colors, logo, and domain. Contact our sales team for setup details and agency pricing.',
      category: 'Advanced'
    },
    {
      q: 'What integrations are coming next?',
      a: 'We add new integrations monthly based on customer requests. Currently working on: Amazon Advertising, Pinterest Ads, Snapchat Ads, YouTube Ads, and direct connections to Amazon Seller Central and Etsy. Vote on upcoming features in our customer Slack community.',
      category: 'Integrations'
    }
  ];

  const supportOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email with detailed responses',
      availability: 'All plans • 24hr response',
      icon: <Mail className="w-5 h-5" />,
      action: 'hello@slayseason.com',
      color: 'indigo'
    },
    {
      title: 'Priority Slack',
      description: 'Join our customer community for real-time support',
      availability: 'Growth & Pro plans • 4hr response',
      icon: <MessageSquare className="w-5 h-5" />,
      action: 'Join Slack Community',
      color: 'emerald'
    },
    {
      title: 'Phone Support',
      description: 'Call our support team directly',
      availability: 'AU: 03 4240 3039 • US: +1 (830) 390-2778',
      icon: <Phone className="w-5 h-5" />,
      action: 'Call Now',
      color: 'purple'
    },
    {
      title: 'Concierge Setup',
      description: 'We\'ll set up your entire dashboard for you',
      availability: 'Growth & Pro plans • 24hr turnaround',
      icon: <HeadphonesIcon className="w-5 h-5" />,
      action: 'Request Setup',
      color: 'amber'
    }
  ];

  const filteredCategories = helpCategories.filter(category => {
    if (selectedCategory === 'all') return true;
    return category.id === selectedCategory;
  });

  const filteredFAQs = frequentQuestions.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent); }
        .help-card { transition: all .3s ease; }
        .help-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -12px rgba(0,0,0,.4); }
        
        input { 
          background: rgba(14,17,28,.8); 
          border: 1px solid rgba(255,255,255,.1); 
          color: #e8eaf0; 
          border-radius: 8px; 
          padding: 12px 16px; 
          transition: border-color .3s ease; 
        }
        input:focus { 
          outline: none; 
          border-color: rgba(99,102,241,.5); 
          box-shadow: 0 0 0 3px rgba(99,102,241,.1); 
        }
        input::placeholder { color: #6b7194; }
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
            <button onClick={() => navigate('/academy')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Academy</button>
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

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-16 mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
            How Can We <span className="text-indigo-400">Help</span>?
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed mb-8">
            Get started quickly with guides, tutorials, and answers to common questions
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7194]" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Quick <span className="text-emerald-400">Start Guide</span>
            </h2>
            <p className="text-[#8b92b0]">Get up and running in under 5 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Connect Your Store',
                description: 'Link your Shopify store with one-click OAuth',
                duration: '30 seconds',
                icon: <LinkIcon className="w-5 h-5" />
              },
              {
                step: '02', 
                title: 'Add Your Channels',
                description: 'Connect Meta, Google, Klaviyo, and other platforms',
                duration: '3 minutes',
                icon: <BarChart3 className="w-5 h-5" />
              },
              {
                step: '03',
                title: 'See Your Data',
                description: 'Review your profit dashboard and start optimizing',
                duration: '1 minute',
                icon: <Zap className="w-5 h-5" />
              }
            ].map((item, i) => (
              <div key={i} className="help-card glass rounded-xl p-6 text-center relative group cursor-pointer">
                <div className="text-[48px] font-black text-white/[.04] absolute top-4 right-6 leading-none">{item.step}</div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#8b92b0] mb-3">{item.description}</p>
                <span className="text-xs text-emerald-400 font-medium">{item.duration}</span>
                <div className="mt-4">
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mx-auto">
                    <span>View Guide</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Browse by <span className="text-purple-400">Category</span>
            </h2>
            <p className="text-[#8b92b0]">Find detailed guides for every aspect of Slay Season</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <div key={category.id} className="help-card glass rounded-xl p-6 cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  category.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
                  category.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                  category.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                  category.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                  category.color === 'green' ? 'bg-green-500/10 text-green-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {category.icon}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-[#8b92b0] mb-4 leading-relaxed">
                  {category.description}
                </p>

                <div className="space-y-2 mb-4">
                  {category.articles.slice(0, 3).map((article, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#6b7194]">
                      {article.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span className="line-clamp-1">{article.title}</span>
                    </div>
                  ))}
                  {category.articles.length > 3 && (
                    <div className="text-xs text-indigo-400">
                      +{category.articles.length - 3} more articles
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6b7194]">
                    {category.articles.length} articles
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6b7194] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Frequently Asked <span className="text-amber-400">Questions</span>
            </h2>
            <p className="text-[#8b92b0]">Quick answers to the most common questions</p>
          </div>

          <div className="space-y-3">
            {filteredFAQs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/[.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-medium">
                      {faq.category}
                    </span>
                    <span className="font-medium text-white text-sm pr-4 group-hover:text-indigo-400 transition-colors">
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#6b7194] flex-shrink-0 transition-transform ${expandedFAQ === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedFAQ === i && (
                  <div className="px-6 pb-4 border-t border-white/5">
                    <p className="text-sm text-[#8b92b0] leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-[#4a4f6a] mx-auto mb-3" />
              <p className="text-[#8b92b0] mb-2">No FAQs found for "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Need More <span className="text-indigo-400">Help</span>?
            </h2>
            <p className="text-[#8b92b0]">Multiple ways to get support based on your plan</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, i) => (
              <div key={i} className="help-card glass rounded-xl p-6 text-center group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  option.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
                  option.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                  option.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {option.icon}
                </div>
                
                <h3 className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {option.title}
                </h3>
                
                <p className="text-sm text-[#8b92b0] mb-3 leading-relaxed">
                  {option.description}
                </p>

                <p className="text-xs text-[#6b7194] mb-4">
                  {option.availability}
                </p>

                <button className={`text-xs font-medium hover:underline ${
                  option.color === 'indigo' ? 'text-indigo-400' :
                  option.color === 'emerald' ? 'text-emerald-400' :
                  option.color === 'purple' ? 'text-purple-400' :
                  'text-amber-400'
                }`}>
                  {option.action}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="glass rounded-xl p-6 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Response Times</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8b92b0]">Critical issues:</span>
                  <span className="text-white font-medium">&lt; 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b92b0]">Priority support:</span>
                  <span className="text-white font-medium">&lt; 4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b92b0]">General support:</span>
                  <span className="text-white font-medium">&lt; 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still Need Help?
          </h3>
          <p className="text-[#8b92b0] mb-8 max-w-xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="btn-primary text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => window.open('mailto:hello@slayseason.com', '_blank')}
              className="glass px-8 py-3 rounded-lg font-semibold hover:bg-white/[.04] transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Us</span>
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

export default HelpPage;