import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Target,
  Brain,
  X,
} from 'lucide-react';

/* ── full lesson content for the first 4 modules ── */
const lessonContent = {
  'understanding-dashboard': `## Understanding Your Dashboard

Your Slay Season dashboard is the cockpit of your ecommerce business. Every number on the screen tells a story — here's how to read it.

### The Big Four KPIs

**Revenue** — Total sales before any deductions. This is your top-line number, pulled directly from Shopify. It includes all orders, whether paid via credit card, Shop Pay, or other gateways. Watch the trend line more than the absolute number — a consistent upward slope matters more than a single big day.

**Gross Profit** — Revenue minus Cost of Goods Sold (COGS). If you sell a candle for $45 and it costs you $12 to make plus $5 to ship, your gross profit is $28. This is the money you actually have to play with for ads, team, and overhead. Most healthy DTC brands target 60-70% gross margins.

**Net Profit** — The number that actually matters. This is what's left after ad spend, COGS, shipping, transaction fees, software costs, and everything else. A brand doing $500K/month in revenue might only net $50K (10%). That's actually solid for a scaling DTC brand. If you're above 15% net margin while growing, you're elite.

**ROAS (Return on Ad Spend)** — For every dollar you spend on ads, how many dollars come back? A 3.0x ROAS means $1 in → $3 out. But here's the critical distinction: **platform ROAS** (what Meta/Google report) is almost always inflated because both platforms claim credit for the same sale. **Blended ROAS** (total revenue ÷ total ad spend) is the truth. Slay Season shows you both so you can see the gap.

### Reading the Dashboard

Start your morning routine top-to-bottom:
1. Check yesterday's **net profit** — are you actually making money?
2. Look at **blended ROAS** — is your ad efficiency trending up or down?
3. Review **channel breakdown** — which platforms are pulling their weight?
4. Check **AOV (Average Order Value)** — sudden drops here signal discount abuse or product mix shifts.

### Practical Example

Say your dashboard shows: Revenue $12,400 | Ad Spend $3,200 | COGS $4,100 | Net Profit $2,800. Your blended ROAS is 3.9x and net margin is 22.6%. That's a great day. But if tomorrow shows Revenue $14,000 with Ad Spend $6,000 and Net Profit $1,500 — revenue went up but profit went down. The dashboard helps you catch this instantly instead of finding out at month-end.`,

  'connecting-platform': `## Connecting Your First Platform

Getting your data flowing into Slay Season takes under 5 minutes. Here's exactly how to do it, step by step.

### Step 1: Connect Shopify (Required)

Shopify is your source of truth for revenue, orders, and customer data. Click **Settings → Connections → Add Shopify Store**. You'll be redirected to Shopify's OAuth screen — click "Install App" and you're done. Slay Season will begin syncing your historical data immediately (up to 12 months back).

**What we pull:** Orders, refunds, products, customers, shipping costs, and discount codes. We never modify your store — it's read-only access.

### Step 2: Connect Your Ad Platforms

This is where the magic happens. Go to **Settings → Connections** and you'll see tiles for each platform.

**Meta Ads (Facebook & Instagram):** Click Connect, log into your Facebook account, and select the Ad Account you want to track. If you run multiple ad accounts, you can connect them all. Make sure you select the correct one — a common mistake is connecting a personal ad account instead of your business one.

**Google Ads:** Similar OAuth flow. One important note: connect at the **MCC (Manager) level** if you have one, so all sub-accounts flow in automatically.

**Klaviyo:** You'll need your Klaviyo API key. Go to Klaviyo → Account → Settings → API Keys → Create Private API Key with Read access. Paste it into Slay Season. This gives you email/SMS revenue attribution and flow performance data.

**TikTok Ads:** OAuth connection, just like Meta. Select your advertiser account when prompted.

### Step 3: Verify Your Data

After connecting, wait 5-10 minutes for the initial sync. Then check your dashboard:
- Does total revenue match your Shopify admin (roughly)?
- Do ad spend numbers match what you see in each platform?
- Are all channels showing data?

### Common Issues

**"My revenue doesn't match Shopify exactly"** — Small differences (1-2%) are normal due to timezone differences in how orders are counted. If the gap is larger, check that you selected the correct Shopify store.

**"Meta shows more conversions than I have orders"** — This is expected. Meta counts view-through conversions and uses different attribution windows. Slay Season normalizes this for you in the blended view.

**"Klaviyo revenue seems too high"** — Klaviyo attributes revenue to any email click within its attribution window, even if the customer would have bought anyway. Use Slay Season's blended view for the real picture.

### Pro Tip

Connect ALL your platforms before diving into analytics. Partial data leads to bad decisions. If you spend on a channel, track it.`,

  'goals-targets': `## Setting Up Goals & Targets

Goals transform your dashboard from a rearview mirror into a GPS. Here's how to set targets that actually drive growth.

### Why Goals Matter

Without targets, you're just watching numbers go up and down. With targets, you instantly know: "Am I on track this month?" Slay Season's goal tracker shows real-time progress against your targets with projected month-end outcomes.

### Setting Revenue Goals

Go to **Dashboard → Goals** (or the goal icon in the top nav). Start with monthly revenue targets.

**The right way to set revenue goals:** Look at your trailing 3-month average, then add 10-20% for organic growth. If you averaged $180K/month over the last quarter, set next month's target at $200-215K. Aggressive but achievable.

**Don't do this:** Set a $500K target when you've never broken $200K. Unrealistic goals are demotivating and make your dashboard permanently red. Better to hit and exceed a reasonable target than constantly miss an aspirational one.

### Setting Profit Margin Targets

Revenue targets alone are dangerous — you can always hit revenue by burning cash on ads. Set a **minimum net profit margin** alongside your revenue goal. For most DTC brands scaling between $1-10M:
- **Conservative:** 10-12% net margin
- **Healthy:** 15-18% net margin  
- **Aggressive growth phase:** 5-8% net margin (acceptable if you're intentionally reinvesting)

### Setting ROAS Targets

Your ROAS target depends on your margins. Here's the formula:

**Minimum ROAS = 1 ÷ (Gross Margin % × Target Profit %)**

Example: If your gross margin is 65% and you want 15% net profit after all costs, and ad spend represents 30% of revenue, you need roughly a 3.0x blended ROAS to hit your numbers.

Slay Season lets you set ROAS targets per channel too. You might target 2.5x on Meta (prospecting) but 5.0x on Google (branded search captures high-intent buyers).

### Channel-Specific Targets

Set spend targets per channel to maintain your ideal marketing mix:
- **Meta:** 50-60% of ad budget (prospecting + retargeting)
- **Google:** 25-35% (search + shopping + Performance Max)
- **TikTok:** 10-15% (testing and scaling what works)
- **Email/SMS (Klaviyo):** Track attributed revenue target (typically 25-35% of total revenue for mature programs)

### Reviewing Goals

Check your goals every Monday morning. Slay Season projects your month-end result based on current pacing. If you're tracking behind at the halfway point, you have two weeks to adjust — increase spend on winning channels, launch a new offer, or activate an email campaign.`,

  'roas-cac-aov-ltv': `## ROAS, CAC, AOV, LTV Explained Simply

These four metrics are the foundation of every ecommerce growth decision. Let's demystify them with real numbers.

### ROAS (Return on Ad Spend)

**Formula:** Revenue ÷ Ad Spend

You spent $5,000 on Meta Ads this week and generated $20,000 in revenue. That's a 4.0x ROAS — for every $1 spent, you got $4 back.

**But here's the trap:** A 4.0x ROAS doesn't mean you made money. If your COGS is 40% ($8,000), shipping is $2,000, and transaction fees are $600, your actual profit from that $20,000 is only $4,400 — less than your ad spend. You need to think in terms of **profit ROAS**, not just revenue ROAS.

**Benchmarks for DTC brands ($1-10M):**
- Below 2.0x: You're likely losing money unless margins are exceptional
- 2.5-3.5x: Healthy scaling range for most brands
- 4.0x+: Either you're very efficient or not spending enough to scale
- 8.0x+: You're probably only running retargeting/branded — not real growth

### CAC (Customer Acquisition Cost)

**Formula:** Total Marketing Spend ÷ New Customers Acquired

If you spent $15,000 on all marketing this month and acquired 300 new customers, your CAC is $50. This means it costs you $50 to acquire each new customer.

**The golden rule:** Your CAC must be less than your first-order profit. If your average order profit (after COGS, shipping, fees) is $35, but your CAC is $50, you're losing $15 per new customer. That's only okay if those customers come back and buy again (see LTV below).

**Real example:** A skincare brand sells a $65 starter kit with $18 COGS and $7 shipping. First-order profit before ads: $40. Their CAC is $32. They're profitable on the first purchase — this is the dream scenario.

### AOV (Average Order Value)

**Formula:** Total Revenue ÷ Number of Orders

Seems simple but it's incredibly actionable. If your AOV is $58 and you can move it to $72 through bundles or free-shipping thresholds, you just increased revenue 24% without acquiring a single new customer.

**Quick AOV boosters:**
- Free shipping at 1.3x your current AOV (if AOV is $55, set free shipping at $75)
- "Complete the routine" bundles (skincare, supplements, pet food)
- Post-purchase upsells (apps like Zipify add 10-15% to AOV on average)

### LTV (Lifetime Value)

**Formula:** Average Order Value × Purchase Frequency × Customer Lifespan

A customer who spends $60 per order, buys 4 times per year, and stays for 2.5 years has an LTV of $600. Now your $50 CAC looks amazing — you're paying $50 to get $600 in lifetime revenue.

**The LTV:CAC ratio** is arguably the most important metric in ecommerce:
- Below 2:1 — Danger zone, not sustainable
- 3:1 — Healthy and fundable
- 5:1+ — Either you're very efficient or under-investing in growth

Slay Season calculates all of these automatically from your connected data, so you're always working with real numbers, not guesses.`,
};

/* ── module/category data ── */
const categories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Zap className="w-5 h-5" />,
    color: 'emerald',
    modules: [
      { id: 'understanding-dashboard', title: 'Understanding Your Dashboard', desc: 'Learn what every KPI means and how to read your dashboard like a pro.', time: '6 min read', level: 'Beginner' },
      { id: 'connecting-platform', title: 'Connecting Your First Platform', desc: 'Step-by-step guide to linking Shopify, Meta, Google, Klaviyo, and more.', time: '5 min read', level: 'Beginner' },
      { id: 'goals-targets', title: 'Setting Up Goals & Targets', desc: 'Set revenue, ROAS, and profit targets that keep your team accountable.', time: '5 min read', level: 'Beginner' },
    ],
  },
  {
    id: 'analytics-fundamentals',
    title: 'Analytics Fundamentals',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'purple',
    modules: [
      { id: 'roas-cac-aov-ltv', title: 'ROAS, CAC, AOV, LTV Explained Simply', desc: 'The four metrics every DTC founder must understand, with real-world math.', time: '7 min read', level: 'Beginner' },
      { id: 'revenue-waterfall', title: 'Reading Your Revenue Waterfall', desc: 'Understand where your money goes from gross revenue to net profit.', time: '6 min read', level: 'Intermediate' },
      { id: 'attribution-models', title: 'Understanding Attribution Models', desc: 'First-touch, last-touch, linear — which model tells the truth?', time: '8 min read', level: 'Intermediate' },
    ],
  },
  {
    id: 'growth-strategies',
    title: 'Growth Strategies',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'indigo',
    modules: [
      { id: 'wasted-ad-spend', title: 'Reducing Wasted Ad Spend', desc: 'Find and kill the campaigns silently draining your budget.', time: '7 min read', level: 'Intermediate' },
      { id: 'channel-mix', title: 'Optimizing Your Channel Mix', desc: 'How to allocate budget across Meta, Google, TikTok, and email.', time: '8 min read', level: 'Intermediate' },
      { id: 'scale-vs-cut', title: 'When to Scale vs When to Cut', desc: 'The framework for doubling down or pulling back on spend.', time: '6 min read', level: 'Intermediate' },
      { id: 'email-roi', title: 'Email Marketing ROI (Klaviyo Metrics)', desc: 'Measure true email revenue without double-counting attribution.', time: '7 min read', level: 'Intermediate' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: <Brain className="w-5 h-5" />,
    color: 'amber',
    modules: [
      { id: 'multi-touch', title: 'Multi-Touch Attribution', desc: 'Go beyond last-click to understand the full customer journey.', time: '10 min read', level: 'Advanced' },
      { id: 'cohort-analysis', title: 'Cohort Analysis for Retention', desc: 'Track how different customer groups behave over time.', time: '9 min read', level: 'Advanced' },
      { id: 'forecasting-budget', title: 'Forecasting & Budget Planning', desc: 'Use data to predict revenue and plan your quarterly budget.', time: '10 min read', level: 'Advanced' },
      { id: 'seasonal-strategy', title: 'Seasonal Strategy Planning', desc: 'Prepare for BFCM, Q5, and other high-impact periods.', time: '8 min read', level: 'Advanced' },
    ],
  },
];

const colorClasses = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
};

const levelColors = {
  Beginner: 'bg-emerald-500/20 text-emerald-400',
  Intermediate: 'bg-indigo-500/20 text-indigo-400',
  Advanced: 'bg-amber-500/20 text-amber-400',
};

/* ── simple markdown-ish renderer ── */
function renderLesson(md) {
  if (!md) return <p className="text-[#8b92b0] text-sm italic">Full lesson content coming soon.</p>;
  return md.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold mt-6 mb-2 text-base">{line.slice(4)}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-white font-extrabold text-lg mt-4 mb-3">{line.slice(3)}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="text-sm text-[#8b92b0] ml-4 list-disc leading-relaxed">{line.slice(2)}</li>;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    // bold spans
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**') ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong> : p
    );
    return <p key={i} className="text-sm text-[#8b92b0] leading-relaxed">{parts}</p>;
  });
}

const AcademyPage = () => {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState(null);

  const toggle = (id) => setExpandedModule(expandedModule === id ? null : id);

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent); }
        .module-card { transition: all .3s ease; }
        .module-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -12px rgba(0,0,0,.4); }
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
            <button className="text-white font-medium">Academy</button>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-indigo-300 mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Free for all Slay Season users</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Slay Season <span className="text-indigo-400">Academy</span>
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed mb-8">
            Master ecommerce analytics and grow your store. Practical lessons built for DTC merchants doing $1‑10M.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-[#6b7194]">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> 14 lessons</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> ~2 hours total</span>
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> All levels</span>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((cat) => {
            const c = colorClasses[cat.color];
            return (
              <div key={cat.id} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>{cat.icon}</div>
                  <h2 className="text-xl font-bold text-white">{cat.title}</h2>
                  <span className="text-xs text-[#6b7194] ml-auto">{cat.modules.length} modules</span>
                </div>

                <div className="space-y-3">
                  {cat.modules.map((mod) => {
                    const isOpen = expandedModule === mod.id;
                    const hasContent = !!lessonContent[mod.id];
                    return (
                      <div key={mod.id} className="module-card glass rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggle(mod.id)}
                          className="w-full px-6 py-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-white/[.02] transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{mod.title}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColors[mod.level]}`}>{mod.level}</span>
                            </div>
                            <p className="text-xs text-[#6b7194] leading-relaxed">{mod.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-[#6b7194] hidden sm:inline">{mod.time}</span>
                            <ChevronDown className={`w-4 h-4 text-[#6b7194] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-6 border-t border-white/5">
                            <div className="pt-5 max-w-none prose-sm">
                              {renderLesson(lessonContent[mod.id])}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Put This Into Practice?</h3>
          <p className="text-[#8b92b0] mb-8 max-w-xl mx-auto">
            Connect your store and see your real numbers. Everything you learned here comes alive on your dashboard.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 group"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Slay Season</span>
              </div>
              <p className="text-sm text-[#6b7194] leading-relaxed">True profit analytics for DTC brands. Built by operators, for operators.</p>
            </div>
            {[
              { title: 'Product', links: [['Features', '/'], ['Pricing', '/pricing'], ['Free Trial', '/signup'], ['Integrations', '/integrations']] },
              { title: 'Company', links: [['About', '/about'], ['Blog', '/blog'], ['Academy', '/academy'], ['Contact', '/contact'], ['Help', '/help']] },
              { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Security', '/security'], ['GDPR', '/gdpr']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(([label, path], j) => (
                    <li key={j}>
                      <button onClick={() => navigate(path)} className="text-sm text-[#6b7194] hover:text-white transition-colors">{label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#4a4f6a]">© {new Date().getFullYear()} Slay Season. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AcademyPage;
