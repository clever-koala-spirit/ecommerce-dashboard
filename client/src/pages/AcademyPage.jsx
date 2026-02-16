import SEO from '../components/common/SEO';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ChevronUp, ChevronDown, Play, Pause, GraduationCap } from 'lucide-react';

/* ── Reels Data ── */
const reels = [
  // Getting Started
  { id: 1, cat: 'Getting Started', emoji: '🚀', headline: 'Welcome to Slay Season Academy', body: 'Bite-sized lessons to master ecommerce analytics. Swipe up to level up your DTC game — no fluff, just actionable insights.', tip: '💡 Swipe through all 20+ reels in under 10 minutes', gradient: 'from-emerald-600 via-emerald-800 to-gray-900' },
  { id: 2, cat: 'Getting Started', emoji: '📊', headline: 'Your Dashboard Is a Cockpit', body: 'Revenue, gross profit, net profit, ROAS — the Big Four KPIs. Every morning, check them top-to-bottom. Trends matter more than single days.', tip: '💡 Start each morning: Net Profit → Blended ROAS → Channel Breakdown → AOV', gradient: 'from-emerald-700 via-teal-900 to-gray-900' },
  { id: 3, cat: 'Getting Started', emoji: '🔌', headline: 'Connect Everything. Seriously.', body: 'Partial data = bad decisions. Shopify, Meta, Google, Klaviyo, TikTok — connect ALL your platforms before analyzing anything.', tip: '💡 Setup takes under 5 minutes per platform. No excuses.', gradient: 'from-teal-600 via-emerald-900 to-gray-900' },
  { id: 4, cat: 'Getting Started', emoji: '🎯', headline: 'Goals Turn Data Into GPS', body: 'Without targets, you\'re just watching numbers. Set monthly revenue goals at your 3-month average + 15%. Pair with a profit margin floor.', tip: '💡 Formula: Trailing 3-month avg × 1.15 = next month\'s target', gradient: 'from-green-600 via-emerald-900 to-gray-900' },

  // Analytics
  { id: 5, cat: 'Analytics', emoji: '🤥', headline: 'Your ROAS Is Lying to You', body: 'Platform ROAS is inflated — Meta and Google both claim credit for the same sale. Blended ROAS (total revenue ÷ total ad spend) is the truth.', tip: '💡 Blended ROAS = Total Revenue ÷ Total Ad Spend. Always.', gradient: 'from-purple-600 via-purple-900 to-gray-900' },
  { id: 6, cat: 'Analytics', emoji: '💰', headline: 'Revenue ≠ Profit', body: '$500K/month sounds sexy until you realize only $50K is left after COGS, ads, shipping, and fees. Net margin is the only number that matters.', tip: '💡 Healthy DTC net margin: 15-18%. Above that while scaling? You\'re elite.', gradient: 'from-violet-600 via-purple-900 to-gray-900' },
  { id: 7, cat: 'Analytics', emoji: '🧮', headline: 'The CAC Equation', body: 'Customer Acquisition Cost = Total Marketing Spend ÷ New Customers. If CAC > first-order profit, you need repeat purchases to survive.', tip: '💡 Golden rule: CAC must be < first-order gross profit (or your LTV better be 3x+)', gradient: 'from-fuchsia-600 via-purple-900 to-gray-900' },
  { id: 8, cat: 'Analytics', emoji: '🛒', headline: 'AOV Is Your Secret Weapon', body: 'Moving AOV from $58 to $72 is a 24% revenue increase with ZERO new customers. Bundles, upsells, and smart shipping thresholds do the work.', tip: '💡 Set free shipping at 1.3× your current AOV to nudge carts up', gradient: 'from-purple-700 via-indigo-900 to-gray-900' },
  { id: 9, cat: 'Analytics', emoji: '♻️', headline: 'LTV: The Long Game', body: 'A customer spending $60/order × 4 orders/year × 2.5 years = $600 LTV. Suddenly your $50 CAC looks like a steal.', tip: '💡 Target LTV:CAC ratio of 3:1 minimum. Below 2:1 = danger zone.', gradient: 'from-indigo-600 via-purple-900 to-gray-900' },
  { id: 10, cat: 'Analytics', emoji: '🌊', headline: 'Read the Revenue Waterfall', body: 'Gross Revenue → minus COGS → minus Ad Spend → minus Shipping → minus Fees → Net Profit. Know where every dollar goes.', tip: '💡 If you can\'t trace $1 from revenue to profit, your data is broken', gradient: 'from-purple-600 via-violet-900 to-gray-900' },

  // Growth
  { id: 11, cat: 'Growth', emoji: '🔥', headline: 'Kill Zombie Campaigns', body: 'Most ad accounts have 20-30% wasted spend on campaigns that haven\'t converted in weeks. Audit weekly. Cut ruthlessly.', tip: '💡 No conversions in 7 days + 2× your target CPA spent? Kill it.', gradient: 'from-blue-600 via-indigo-900 to-gray-900' },
  { id: 12, cat: 'Growth', emoji: '🎰', headline: 'The Perfect Channel Mix', body: 'Meta: 50-60% (prospecting). Google: 25-35% (high intent). TikTok: 10-15% (testing). Email/SMS: should drive 25-35% of total revenue.', tip: '💡 Rebalance monthly. The winning mix shifts as you scale.', gradient: 'from-indigo-600 via-blue-900 to-gray-900' },
  { id: 13, cat: 'Growth', emoji: '⚖️', headline: 'Scale or Cut? The Framework', body: 'If ROAS is above target AND you haven\'t hit frequency fatigue — SCALE. If ROAS is declining for 3+ days straight — CUT or refresh creative.', tip: '💡 Scale by 20% max per day. Bigger jumps reset the algorithm.', gradient: 'from-cyan-600 via-blue-900 to-gray-900' },
  { id: 14, cat: 'Growth', emoji: '📧', headline: 'Email Revenue Is Inflated', body: 'Klaviyo claims credit for any purchase after an email click — even if the customer was already buying. Use blended attribution for truth.', tip: '💡 True email contribution is usually 40-60% of what Klaviyo reports', gradient: 'from-blue-700 via-indigo-900 to-gray-900' },
  { id: 15, cat: 'Growth', emoji: '📈', headline: 'The 80/20 of Scaling', body: '80% of your profit comes from 20% of your campaigns. Find your winners, triple down on them, and let the rest go.', tip: '💡 Sort by profit (not ROAS). High ROAS at low spend = vanity metric.', gradient: 'from-indigo-700 via-blue-900 to-gray-900' },

  // Advanced
  { id: 16, cat: 'Advanced', emoji: '🕸️', headline: 'Multi-Touch Attribution', body: 'Last-click is a lie. A customer sees a TikTok, clicks a Google ad, then buys from an email. Who gets credit? All of them.', tip: '💡 Use linear or time-decay attribution to spread credit fairly across touchpoints', gradient: 'from-amber-600 via-orange-900 to-gray-900' },
  { id: 17, cat: 'Advanced', emoji: '👥', headline: 'Cohort Analysis = Retention X-Ray', body: 'Group customers by acquisition month. Track how each cohort\'s spending evolves. Declining cohort value = leaky bucket.', tip: '💡 Month-2 retention above 25% is strong for most DTC brands', gradient: 'from-orange-600 via-amber-900 to-gray-900' },
  { id: 18, cat: 'Advanced', emoji: '🔮', headline: 'Forecast Like a CFO', body: 'Use trailing 3-month revenue trends + seasonality multipliers to predict next quarter. Over-forecast spend, under-forecast revenue. Stay conservative.', tip: '💡 Build 3 scenarios: bear (−20%), base, bull (+20%). Plan for the bear.', gradient: 'from-amber-700 via-yellow-900 to-gray-900' },
  { id: 19, cat: 'Advanced', emoji: '🎄', headline: 'BFCM Is Won in October', body: 'Start warming audiences 6 weeks out. Build your email list aggressively. Have creative ready by Oct 15. BFCM week is too late to prepare.', tip: '💡 Budget 30-40% of Q4 ad spend for Nov 15 – Dec 2. Front-load.', gradient: 'from-yellow-600 via-amber-900 to-gray-900' },
  { id: 20, cat: 'Advanced', emoji: '🧪', headline: 'Test Everything. Trust Nothing.', body: 'Your gut is wrong 60% of the time. A/B test landing pages, pricing, creative, and offers. Let data pick the winner, not your ego.', tip: '💡 Run tests for 7+ days or 100+ conversions — whichever comes LAST', gradient: 'from-red-600 via-amber-900 to-gray-900' },
  { id: 21, cat: 'Advanced', emoji: '💎', headline: 'Profit Is the Only Metric', body: 'Revenue is vanity. ROAS is sanity. Profit is reality. Build every dashboard, every campaign, every decision around NET PROFIT.', tip: '💡 If you remember one thing from Academy: Revenue feeds ego. Profit feeds families.', gradient: 'from-amber-500 via-orange-900 to-gray-900' },
];

const filterCategories = ['All', 'Getting Started', 'Analytics', 'Growth', 'Advanced'];

const catColors = {
  'Getting Started': '#10b981',
  'Analytics': '#a855f7',
  'Growth': '#6366f1',
  'Advanced': '#f59e0b',
};

const AcademyPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);

  const filtered = activeFilter === 'All' ? reels : reels.filter(r => r.cat === activeFilter);

  // Sync scroll position when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeFilter]);

  // Scroll observer
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!isNaN(idx)) setCurrentIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );
    container.querySelectorAll('[data-index]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) { clearInterval(autoPlayRef.current); return; }
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= filtered.length) { setAutoPlay(false); return prev; }
        scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth' });
        return next;
      });
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, filtered.length]);

  const scrollTo = useCallback((dir) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= filtered.length) return;
    scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth' });
  }, [currentIndex, filtered.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); scrollTo(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); scrollTo(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollTo]);

  return (
    <div className="w-full h-screen bg-[#050608] text-white overflow-hidden antialiased flex flex-col">
      <SEO title="Academy" description="Free ecommerce courses and tutorials to grow your brand." path="/academy" />
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .reel-scroll { scroll-snap-type: y mandatory; overflow-y: scroll; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .reel-scroll::-webkit-scrollbar { display: none; }
        .reel-item { scroll-snap-align: start; scroll-snap-stop: always; }
        .progress-dot { transition: all .3s ease; }
        .filter-tab { transition: all .2s ease; }
        .filter-tab.active { background: rgba(99,102,241,.3); color: white; }
        @media (min-width: 768px) {
          .phone-frame { width: 390px; height: calc(100vh - 120px); max-height: 844px; border-radius: 40px; border: 3px solid rgba(255,255,255,.1); box-shadow: 0 0 80px rgba(99,102,241,.15), inset 0 0 0 1px rgba(255,255,255,.05); overflow: hidden; position: relative; }
          .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 28px; background: #050608; border-radius: 0 0 20px 20px; z-index: 20; }
        }
      `}</style>

      {/* Top Nav */}
      <nav className="flex-shrink-0 glass shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Slay Season</span>
            <span className="text-xs text-indigo-400 font-medium hidden sm:inline ml-1">Academy</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {['/', '/about', '/pricing', '/blog'].map((p, i) => (
              <button key={p} onClick={() => navigate(p)} className="text-[#8b92b0] hover:text-white transition-colors">
                {['Home', 'About', 'Pricing', 'Blog'][i]}
              </button>
            ))}
            <button className="text-white font-medium">Academy</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="text-xs text-[#8b92b0] hover:text-white px-3 py-1.5">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
              Start Free <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#050608]">
        <div className="w-full md:phone-frame h-full flex flex-col bg-[#050608] relative">
          {/* Desktop notch */}
          <div className="hidden md:block phone-notch" />

          {/* Filter Tabs */}
          <div className="flex-shrink-0 px-3 pt-3 md:pt-8 pb-2 bg-[#050608]/90 backdrop-blur-sm z-10">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {filterCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`filter-tab whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${
                    activeFilter === cat ? 'active' : 'text-[#6b7194] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-shrink-0 px-3 pb-2 bg-[#050608]/90 z-10">
            <div className="flex gap-0.5">
              {filtered.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i < currentIndex ? '100%' : i === currentIndex ? '100%' : '0%',
                      background: i <= currentIndex ? (catColors[filtered[i]?.cat] || '#6366f1') : 'transparent',
                      opacity: i === currentIndex ? 1 : i < currentIndex ? 0.5 : 0,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-[#6b7194]">{currentIndex + 1} / {filtered.length}</span>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-1 text-[10px] text-[#6b7194] hover:text-white transition-colors"
              >
                {autoPlay ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                {autoPlay ? 'Pause' : 'Auto-play'}
              </button>
            </div>
          </div>

          {/* Reels Container */}
          <div ref={scrollRef} className="reel-scroll flex-1">
            {filtered.map((reel, i) => (
              <div
                key={reel.id}
                data-index={i}
                className="reel-item h-full flex-shrink-0 flex flex-col items-center justify-center px-6 relative"
                style={{ minHeight: '100%' }}
              >
                {/* Gradient BG */}
                <div className={`absolute inset-0 bg-gradient-to-b ${reel.gradient} opacity-40`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />

                {/* Content */}
                <div className="relative z-10 max-w-sm mx-auto text-center flex flex-col items-center gap-5">
                  {/* Category pill */}
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: `${catColors[reel.cat]}22`, color: catColors[reel.cat] }}
                  >
                    {reel.cat}
                  </span>

                  {/* Emoji */}
                  <div className="text-6xl sm:text-7xl leading-none drop-shadow-2xl">{reel.emoji}</div>

                  {/* Headline */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                    {reel.headline}
                  </h2>

                  {/* Body */}
                  <p className="text-sm sm:text-base text-[#b0b6d0] leading-relaxed max-w-xs">
                    {reel.body}
                  </p>

                  {/* Tip Card */}
                  <div className="w-full glass rounded-2xl px-5 py-4 text-left">
                    <p className="text-sm font-medium text-white leading-relaxed">{reel.tip}</p>
                  </div>

                  {/* CTA on last reel */}
                  {i === filtered.length - 1 && (
                    <button
                      onClick={() => navigate('/signup')}
                      className="btn-primary mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                      Start Free Trial <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Swipe hint on first reel */}
                {i === 0 && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
                    <ChevronUp className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] text-white/30 font-medium">Swipe up</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nav Arrows (desktop) */}
          <div className="hidden md:flex absolute right-[-60px] top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
            <button
              onClick={() => scrollTo(-1)}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo(1)}
              disabled={currentIndex === filtered.length - 1}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Side progress dots (desktop) */}
          <div className="hidden md:flex absolute left-[-40px] top-1/2 -translate-y-1/2 flex-col gap-1.5 z-20">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth' })}
                className={`progress-dot rounded-full ${
                  i === currentIndex ? 'w-2.5 h-2.5 bg-indigo-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyPage;
