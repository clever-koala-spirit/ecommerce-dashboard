import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Award,
  Coffee,
  Cpu,
  BarChart3,
  Lightbulb,
  Rocket,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .ss-reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .ss-visible { opacity: 1; transform: translateY(0); }
        .ss-delay-1 { transition-delay: .1s; }
        .ss-delay-2 { transition-delay: .2s; }
        .ss-delay-3 { transition-delay: .3s; }
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(16,185,129,.06), transparent); }
        
        .intersection-observer { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .intersection-observer.visible { opacity: 1; transform: translateY(0); }
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

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-16 mesh-bg">
        <div className="absolute top-20 left-[15%] w-[400px] h-[400px] bg-indigo-600/[.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-[10%] w-[300px] h-[300px] bg-purple-600/[.06] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center intersection-observer">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Built by Operators,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              For Operators
            </span>
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed">
            We were tired of spreadsheet purgatory and built Slay Season — the analytics tool we wished existed for our own DTC brands.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="intersection-observer">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                <Lightbulb className="w-3.5 h-3.5" /> The Origin Story
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                We Know Your Pain Points Because We've Lived Them
              </h2>
              <div className="space-y-5 text-[#8b92b0] leading-relaxed">
                <p>
                  <strong className="text-white">After a decade running ecommerce brands</strong> — from bootstrapped startups to 8-figure operations — we faced the same frustrating problem every single day: <em>"Where's the real profit hiding?"</em>
                </p>
                <p>
                  Shopify showed revenue. Meta showed ROAS. Google showed conversions. But none of them showed the number that actually mattered: <strong className="text-emerald-400">how much money hit the bank account after all costs.</strong>
                </p>
                <p>
                  We tried every tool on the market. Triple Whale was cluttered and expensive. Northbeam required a data scientist. BeProfit was basic. Spreadsheets took 15 hours per week and were outdated the moment we finished them.
                </p>
                <p className="text-white font-medium text-lg">
                  So we built Slay Season — the dashboard we desperately needed for our own businesses.
                </p>
              </div>
            </div>
            
            <div className="intersection-observer ss-delay-1">
              <div className="glass rounded-xl p-8 gradient-border">
                <h3 className="text-lg font-bold text-white mb-6">The Breaking Point</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">15+ Hours Per Week</p>
                      <p className="text-sm text-[#8b92b0]">Manually updating spreadsheets across 6 platforms just to get basic profit numbers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Flying Blind</p>
                      <p className="text-sm text-[#8b92b0]">Making $100K+ ad spend decisions based on incomplete, conflicting data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Vanity Metrics Everywhere</p>
                      <p className="text-sm text-[#8b92b0]">Revenue was up 30%, but bank balance was shrinking. Which numbers could we trust?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 border-t border-white/[.04] mesh-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 intersection-observer">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Our <span className="text-indigo-400">Mission</span>
            </h2>
            <p className="text-xl text-[#8b92b0] max-w-3xl mx-auto leading-relaxed">
              Make analytics accessible to every DTC merchant, not just the ones with data teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="intersection-observer">
              <div className="glass rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Transparency</h3>
                <p className="text-[#8b92b0] leading-relaxed">
                  No hidden costs, no confusing metrics, no black box algorithms. See exactly how your numbers are calculated and where your money goes.
                </p>
              </div>
            </div>

            <div className="intersection-observer ss-delay-1">
              <div className="glass rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Simplicity</h3>
                <p className="text-[#8b92b0] leading-relaxed">
                  Analytics shouldn't require a PhD in data science. Everything is designed for clarity and speed — get insights in seconds, not hours.
                </p>
              </div>
            </div>

            <div className="intersection-observer ss-delay-2">
              <div className="glass rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Results</h3>
                <p className="text-[#8b92b0] leading-relaxed">
                  We measure success by your success. Our customers average 15-30% profit increases within 90 days of using Slay Season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 intersection-observer">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Small Team, <span className="text-purple-400">Big Impact</span>
            </h2>
            <p className="text-lg text-[#8b92b0] max-w-2xl mx-auto">
              We're a tight-knit team of former operators who've built, scaled, and exited DTC brands. We know your challenges because we've lived them.
            </p>
          </div>

          {/* Founder profile */}
          <div className="max-w-3xl mx-auto intersection-observer">
            <div className="glass rounded-xl p-8 gradient-border">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:text-left">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto md:mx-0 mb-4">
                    L
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Leo Martinez</h3>
                  <p className="text-indigo-400 font-medium mb-4">Co-Founder & CEO</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">12+</p>
                      <p className="text-xs text-[#6b7194] uppercase tracking-wider">Years DTC</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">500+</p>
                      <p className="text-xs text-[#6b7194] uppercase tracking-wider">Brands Helped</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">$50M+</p>
                      <p className="text-xs text-[#6b7194] uppercase tracking-wider">Revenue Managed</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="space-y-4 text-[#8b92b0] leading-relaxed">
                    <p>
                      <strong className="text-white">Former VP of Growth at 3 successful DTC exits</strong> ($10M, $25M, $40M). Built and scaled acquisition channels for beauty, supplements, and fashion brands.
                    </p>
                    <p>
                      After helping hundreds of Shopify merchants scale profitably, Leo got tired of the same problem every client faced: <em>"Where's my real profit?"</em> — so he built the solution.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span>Powered by coffee and a mission to end spreadsheet purgatory</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team stats */}
          <div className="grid sm:grid-cols-4 gap-6 mt-16 intersection-observer">
            {[
              { icon: <Users className="w-5 h-5" />, metric: '8', desc: 'Team Members', color: 'indigo' },
              { icon: <Award className="w-5 h-5" />, metric: '15+', desc: 'Years Combined Experience', color: 'purple' },
              { icon: <Rocket className="w-5 h-5" />, metric: '3', desc: 'Successful Exits', color: 'emerald' },
              { icon: <BarChart3 className="w-5 h-5" />, metric: '$200M+', desc: 'Revenue Scaled', color: 'amber' },
            ].map((stat, i) => (
              <div key={i} className="text-center glass rounded-xl p-6 gradient-border">
                <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : stat.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-white">{stat.metric}</p>
                <p className="text-sm text-[#6b7194] mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture / How We Work */}
      <section className="py-24 border-t border-white/[.04] mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 intersection-observer">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              How We Work
            </h2>
            <p className="text-lg text-[#8b92b0] max-w-2xl mx-auto">
              We operate like the scrappy DTC teams we serve — fast, focused, and obsessed with customer outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Cpu className="w-5 h-5" />,
                title: 'Customer-Obsessed Development',
                desc: 'Every feature starts with a real merchant problem. We talk to customers weekly, not quarterly.'
              },
              {
                icon: <Rocket className="w-5 h-5" />,
                title: 'Ship Fast, Iterate Faster',
                desc: 'Weekly releases, rapid prototyping, and quick pivots based on user feedback.'
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Merchant-Grade Security',
                desc: 'SOC 2 compliant, AES-256 encryption, and read-only API access. Your data is locked down.'
              },
              {
                icon: <Heart className="w-5 h-5" />,
                title: 'Support Like Family',
                desc: 'Personal Slack channels, video calls, and setup concierge. We treat you like our own brand.'
              },
            ].map((principle, i) => (
              <div key={i} className="intersection-observer flex items-start gap-5 glass rounded-xl p-6">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  {principle.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{principle.title}</h3>
                  <p className="text-[#8b92b0] leading-relaxed text-sm">{principle.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/[.04] relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="intersection-observer">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
              Ready to Join the <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Slay Season Family</span>?
            </h2>
            <p className="text-lg text-[#8b92b0] mb-8 max-w-2xl mx-auto leading-relaxed">
              See why 800+ DTC brands chose Slay Season to replace spreadsheets, reduce guesswork, and scale profitably.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary text-white px-8 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group"
              >
                <span className="flex items-center gap-2">
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-6 py-3.5 rounded-xl font-semibold text-base glass hover:bg-white/[.04] transition-all flex items-center justify-center gap-2 text-[#c4c9d8]"
              >
                <span className="flex items-center gap-2">
                  Contact Us
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </button>
            </div>
            <p className="text-xs text-[#6b7194] mt-4">No credit card required • 5-minute setup • 14-day free trial</p>
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

// Intersection Observer for animations
React.useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.intersection-observer').forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, []);

export default AboutPage;