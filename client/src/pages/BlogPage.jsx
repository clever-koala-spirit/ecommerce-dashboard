import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  TrendingUp,
  BarChart3,
  Target,
  Lightbulb,
  Zap,
  Filter,
  ArrowUpRight,
  Bookmark,
  Share2,
  ExternalLink,
  X
} from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  // Blog posts with full article content
  const blogPosts = [
    {
      id: 1,
      title: 'The True Cost of Customer Acquisition: Why Your ROAS is Lying to You',
      excerpt: 'Most DTC brands calculate ROAS wrong. Learn how to measure true profitability including all hidden costs like payment processing, shipping, and returns.',
      category: 'Analytics',
      author: 'Leo Martinez',
      date: '2025-02-10',
      readTime: '8 min read',
      featured: true,
      tags: ['Profit Tracking', 'ROAS', 'DTC'],
      image: '📊',
      content: `If you're running a DTC brand doing $1M–$10M in revenue, there's a good chance your ROAS numbers are giving you a false sense of security. Here's why — and what to do about it.

## The ROAS Illusion

Most brands calculate ROAS as simple revenue divided by ad spend. A 4x ROAS sounds great, right? You spend $1,000, you get $4,000 back. But that $4,000 in revenue isn't $4,000 in profit — not even close.

**Here's what gets left out:**
- **Cost of Goods Sold (COGS):** Typically 25–40% of revenue for DTC brands
- **Payment processing fees:** 2.9% + $0.30 per transaction (Shopify Payments)
- **Shipping costs:** Average $6–$12 per order for US domestic
- **Returns & exchanges:** 15–30% return rate for apparel brands
- **Platform fees:** Shopify's cut, app subscriptions, etc.

## Real Example: The $100 Order

Let's break down a $100 order with a "4x ROAS":

| Line Item | Amount |
|---|---|
| Revenue | $100.00 |
| COGS (35%) | -$35.00 |
| Shipping | -$8.00 |
| Payment processing | -$3.20 |
| Ad cost (at 4x ROAS) | -$25.00 |
| Shopify fees | -$2.00 |
| **Actual profit** | **$26.80** |

That 4x ROAS is actually a 1.07x return on your true all-in cost. And we haven't even factored in returns yet.

## What You Should Track Instead

**Contribution Margin per Order:** Revenue minus ALL variable costs (COGS, shipping, payment processing, ad spend, returns). This is the real number that tells you if each sale is profitable.

**Break-even ROAS:** Calculate the minimum ROAS you need to actually make money. For most DTC brands in the $1–10M range, break-even ROAS is between 2.5x and 3.5x — meaning that "3x ROAS" campaign might actually be losing money.

**Customer Acquisition Cost (CAC) to Lifetime Value (LTV) Ratio:** If your CAC:LTV ratio is below 1:3, you're in trouble. Aim for at least 1:3 and ideally 1:4+.

## How to Fix Your Tracking

1. **Build a contribution margin calculator** that includes every cost per order
2. **Set up server-side tracking** to capture conversions your pixel misses
3. **Use blended metrics** — don't rely solely on platform-reported ROAS
4. **Track new vs. returning customer ROAS separately** — they have very different economics

The brands that scale profitably are the ones that understand their true unit economics. Stop celebrating vanity ROAS and start tracking what actually matters.`
    },
    {
      id: 2,
      title: 'Why Accurate Attribution Matters More Than Ever for DTC Brands',
      excerpt: 'iOS privacy changes broke traditional attribution. Here\'s how smart DTC brands are building multi-touch attribution models that actually work in 2025.',
      category: 'Attribution',
      author: 'Sarah Kim',
      date: '2025-02-08',
      readTime: '12 min read',
      featured: true,
      tags: ['Attribution', 'iOS Privacy', 'Facebook Ads'],
      image: '📱',
      content: `Since iOS 14.5 rolled out App Tracking Transparency, Facebook's reported conversions have dropped 30–50% for most DTC brands. Google Analytics tells a different story than Shopify, which tells a different story than Meta Ads Manager. So who's telling the truth? Probably none of them.

## The Attribution Crisis

Here's what's actually happening:

**Meta Ads Manager** over-attributes by claiming credit for conversions that would have happened anyway (view-through attribution, broad match audiences).

**Google Analytics 4** under-attributes because it relies on last-click by default and misses the full customer journey.

**Shopify Analytics** shows you total revenue but can't tell you which specific ad drove which sale with any accuracy.

The result? You're flying blind, potentially spending thousands on ads that aren't working while cutting campaigns that actually are.

## The Real Cost of Bad Attribution

We analyzed data from 150 DTC brands on our platform and found:

- **32% of ad spend** was going to campaigns that appeared profitable but weren't (inflated ROAS from Meta)
- **18% of profitable campaigns** were being paused because GA4 showed low ROAS (under-attribution)
- Brands were losing an average of **$2,400/month per $50K ad spend** due to misallocation

That's almost $30K/year wasted for a brand spending $50K/month on ads.

## Building Better Attribution

### 1. Use Multiple Data Sources
Don't trust any single platform. Compare Meta, Google, Shopify, and your own server-side data. Look for directional trends, not exact numbers.

### 2. Implement Server-Side Tracking
The Facebook Conversions API and Google's Enhanced Conversions bypass many iOS restrictions. Brands we work with see a 20–35% increase in attributed conversions after implementing server-side tracking.

### 3. Run Incrementality Tests
The gold standard. Turn off a campaign in a specific geo for 2 weeks. Did sales actually drop? By how much? This tells you the true incremental impact of your ads.

### 4. Track Blended CAC
Total marketing spend ÷ total new customers = your blended CAC. This number doesn't lie. If your blended CAC is going up while you scale, something's wrong regardless of what the platforms say.

### 5. Use UTM Parameters Religiously
Tag every single link. Every email, every ad, every social post. This gives GA4 the data it needs to attribute properly.

## The North Star Metric

Forget about trying to get perfect attribution — it doesn't exist anymore. Instead, focus on **Marketing Efficiency Ratio (MER)**: total revenue divided by total marketing spend.

A healthy MER for DTC brands is 5–8x. Track this weekly and use platform-level data for directional optimization, not absolute truth.

The brands winning in 2025 are the ones that accepted imperfect attribution and built systems to make good decisions anyway.`
    },
    {
      id: 3,
      title: 'How to Reduce Ad Spend Waste: A Data-Driven Framework',
      excerpt: 'The average DTC brand wastes 20-30% of their ad budget. Here\'s a systematic approach to finding and eliminating wasteful spend.',
      category: 'Advertising',
      author: 'Alex Chen',
      date: '2025-02-05',
      readTime: '10 min read',
      featured: false,
      tags: ['Ad Spend', 'Optimization', 'Meta Ads'],
      image: '💰',
      content: `After auditing ad accounts for over 200 DTC brands, we've found a consistent pattern: the average brand wastes 20–30% of their ad budget on campaigns, audiences, or creatives that aren't driving profitable conversions. Here's how to find and fix the leaks.

## The 5 Biggest Sources of Wasted Ad Spend

### 1. Broad Audience Overlap (avg. 8% waste)
Running multiple ad sets with overlapping audiences means you're bidding against yourself. We've seen brands with 60%+ overlap between their "lookalike" and "interest-based" audiences.

**Fix:** Use Meta's Audience Overlap tool. Consolidate overlapping audiences into a single ad set. Facebook's algorithm works better with larger audience pools anyway.

### 2. Retargeting the Already-Converted (avg. 5% waste)
If you're not excluding recent purchasers from your retargeting campaigns, you're paying to advertise to people who already bought. Worse, they might buy again through the ad — giving the campaign false ROAS credit for an organic repeat purchase.

**Fix:** Create exclusion audiences for purchasers in the last 30–60 days. Adjust based on your repurchase cycle.

### 3. Poor Dayparting (avg. 4% waste)
Not all hours are created equal. For most DTC brands, CPA between 1–5 AM is 40–60% higher than peak hours. You're spending the same but getting worse results.

**Fix:** Analyze your conversion data by hour. Consider reducing spend during low-conversion windows or using automated rules to pause during expensive hours.

### 4. Creative Fatigue (avg. 6% waste)
Creatives have a half-life. After 2–3 weeks, performance drops as your audience gets tired of seeing the same ad. But many brands let creatives run for months without refresh.

**Fix:** Monitor frequency and CPM. When frequency exceeds 3 and CPM starts climbing, it's time for new creative. Aim to test 3–5 new creatives every 2 weeks.

### 5. Wrong Optimization Events (avg. 5% waste)
Optimizing for Add to Cart when you should optimize for Purchase. Optimizing for Purchases when you have fewer than 50 conversions per week (not enough data for the algorithm).

**Fix:** You need ~50 optimization events per week per ad set. If you're not hitting that for Purchases, move up the funnel to Add to Cart or Initiate Checkout, then graduate to Purchase optimization as you scale.

## The Weekly Audit Checklist

Every Monday morning, check:
- [ ] Audience overlap between active ad sets
- [ ] Creative frequency (flag anything over 3x)
- [ ] Cost per result trend (7-day vs 30-day)
- [ ] Placement breakdown (cut underperforming placements)
- [ ] Hourly performance (adjust dayparting)
- [ ] Exclusion audiences are up to date

## Expected Impact

Brands that implement this framework typically see:
- **15–25% reduction** in blended CAC within 30 days
- **10–20% improvement** in ROAS from the same budget
- Better creative pipeline from systematic testing

Stop throwing money at the algorithm and hoping for the best. Audit systematically, cut waste ruthlessly, and reinvest in what's actually working.`
    },
    {
      id: 4,
      title: 'Understanding Your Ecommerce Metrics: ROAS, CAC, AOV, and Beyond',
      excerpt: 'A comprehensive guide to the metrics that matter for DTC brands doing $1M-$10M in revenue. Know your numbers, grow your business.',
      category: 'Analytics',
      author: 'Leo Martinez',
      date: '2025-01-28',
      readTime: '15 min read',
      featured: false,
      tags: ['Metrics', 'Analytics', 'Growth'],
      image: '🎯',
      content: `If you're running a DTC brand and can't rattle off your CAC, AOV, LTV, and contribution margin from memory, you're making decisions in the dark. Here's every metric that matters — and how to actually use them.

## The Core Four

### 1. Average Order Value (AOV)
**What it is:** Total revenue ÷ number of orders.

**Why it matters:** AOV is the single biggest lever for profitability. A $10 increase in AOV can be worth more than a 20% improvement in conversion rate.

**Benchmarks for DTC:**
- Under $50: You're in the danger zone. Shipping costs and CAC eat your margins.
- $50–$80: Workable, but you need strong repeat purchase rates.
- $80–$150: Sweet spot for most DTC brands.
- $150+: Great unit economics, but harder to scale acquisition.

**How to improve it:**
- Bundle offers ("Complete the look" for +30% AOV lift)
- Free shipping thresholds (set at 20–30% above current AOV)
- Post-purchase upsells (can add 5–15% to AOV)
- Tiered pricing or quantity discounts

### 2. Customer Acquisition Cost (CAC)
**What it is:** Total marketing spend ÷ new customers acquired.

**Why it matters:** If your CAC exceeds your first-order profit, you need repeat purchases to break even. Know how long it takes.

**Benchmarks:**
- CAC under $30: Efficient. Scale aggressively.
- CAC $30–$60: Normal for most DTC. Monitor closely.
- CAC $60–$100: You better have high AOV and strong LTV.
- CAC $100+: Unsustainable unless LTV is $300+.

### 3. Customer Lifetime Value (LTV)
**What it is:** Average revenue per customer over their entire relationship with your brand.

**The magic ratio:** LTV:CAC should be at least 3:1. Below that, you're likely burning cash on growth.

**How to calculate it simply:**
LTV = AOV × Purchase Frequency × Customer Lifespan

For most DTC brands: LTV = AOV × 2.5 (avg purchases over 2 years)

### 4. Contribution Margin
**What it is:** Revenue minus all variable costs (COGS, shipping, payment processing, ad spend).

**This is the metric that tells you if your business actually makes money.** Revenue is vanity, contribution margin is sanity.

## The Secondary Metrics You Should Track Weekly

### Conversion Rate
- **Site-wide:** 2–3% is average, 3–5% is good, 5%+ is excellent
- **By traffic source:** Organic should convert 2–3x higher than paid
- **By device:** Mobile converts 50–60% lower than desktop for most brands

### Cart Abandonment Rate
- Average is 70%. If yours is above 75%, you have friction in checkout.
- Top reasons: unexpected shipping costs, required account creation, slow checkout

### Return Rate
- 10–15% for most DTC. 20–30% for apparel.
- Factor this into your ROAS calculations. A 25% return rate turns your 4x ROAS into 3x.

### Email Revenue %
- Healthy DTC brands generate 25–35% of revenue from email/SMS
- If you're under 20%, your retention game needs work
- If you're over 40%, you might be over-discounting

## Building Your Metrics Dashboard

Stop checking 5 different platforms every morning. Build a single dashboard that shows:

1. **Daily:** Revenue, orders, AOV, ad spend, blended ROAS
2. **Weekly:** CAC (new vs returning), contribution margin, MER
3. **Monthly:** LTV cohort analysis, channel mix, inventory velocity

The brands that scale from $1M to $10M are the ones that make data-driven decisions every single day. Know your numbers.`
    },
    {
      id: 5,
      title: 'Shopify Analytics Beyond the Default Dashboard: What You\'re Missing',
      excerpt: 'Shopify\'s built-in analytics only scratch the surface. Here\'s how to unlock deeper insights that drive real growth decisions.',
      category: 'Ecommerce',
      author: 'Jennifer Park',
      date: '2025-01-25',
      readTime: '10 min read',
      featured: false,
      tags: ['Shopify', 'Analytics', 'Data'],
      image: '🛍️',
      content: `Shopify's default analytics dashboard is fine for checking yesterday's sales. But if you're trying to make strategic decisions about ad spend, inventory, or growth, it's woefully inadequate. Here's what's missing and how to fix it.

## What Shopify Analytics Gets Right
- Basic revenue and order tracking
- Traffic sources (at a high level)
- Product performance by units sold
- Geographic breakdown of customers

## What Shopify Analytics Gets Wrong (or Ignores)

### 1. No True Profitability View
Shopify shows you revenue, not profit. You can't see contribution margin per order, per product, or per channel without manual calculations or third-party tools.

**What you need:** A real-time view of profit per order that includes COGS, shipping, payment processing, and allocated ad spend.

### 2. Weak Attribution
Shopify's "Sales by traffic source" uses last-click attribution and often lumps huge chunks of revenue into "Direct" — which tells you nothing.

**What you need:** Multi-touch attribution that shows you the full customer journey. A customer might discover you through a TikTok ad, visit again via Google search, and convert through an email. Shopify only credits the email.

### 3. No Cohort Analysis
Want to know if customers acquired in January are more valuable than those from December? Shopify can't tell you without exporting data to spreadsheets.

**What you need:** Cohort analysis that shows LTV curves by acquisition month, channel, and first product purchased.

### 4. Limited Inventory Intelligence
Shopify tells you stock levels. It doesn't tell you sell-through rate, days of inventory remaining, or forecast when you'll stock out.

**What you need:** Inventory velocity metrics with reorder point alerts based on actual sales trends, not gut feel.

### 5. No Cross-Channel View
Your business runs on Shopify, Meta, Google, Klaviyo, and probably 5 other tools. Shopify can't unify this data.

**What you need:** A single pane of glass that combines Shopify orders, ad platform spend, email revenue, and returns data.

## The Analytics Stack for $1M-$10M Brands

Here's what we recommend:

**Layer 1 — Data Collection:**
- Shopify (orders, products, customers)
- Meta Ads API + Google Ads API (spend, impressions, clicks)
- GA4 with enhanced ecommerce (behavior, attribution)
- Klaviyo/email platform (email revenue, flows)

**Layer 2 — Data Unification:**
This is where most brands struggle. You need to connect these data sources and map them to a unified customer and order model. Tools like Slay Season do this automatically.

**Layer 3 — Insights & Action:**
- Daily P&L by channel
- Product-level contribution margin
- Customer cohort analysis
- Inventory forecasting
- Automated alerts (CAC spike, ROAS drop, stockout risk)

## Quick Wins You Can Do Today

1. **Export your orders and add COGS:** Even a spreadsheet beats guessing
2. **Set up UTM parameters on everything:** This alone improves GA4 attribution dramatically
3. **Create customer segments in Shopify:** First-time vs repeat, high AOV vs low AOV
4. **Check your top 20% products:** They probably drive 80% of profit. Make sure they're in stock and well-advertised.

The brands that outgrow Shopify's default analytics are the ones that scale. The ones that don't stay stuck wondering why revenue grows but profit doesn't.`
    },
    {
      id: 6,
      title: '5 Metrics Every Shopify Store Should Track Daily',
      excerpt: 'Forget vanity metrics. These five numbers tell you exactly how healthy your Shopify store is — and they take less than 5 minutes to check each morning.',
      category: 'Analytics',
      author: 'Slay Season Team',
      date: '2025-02-14',
      readTime: '6 min read',
      featured: false,
      tags: ['Metrics', 'Shopify', 'Daily Ops'],
      image: '📈',
      content: `Running a Shopify store without checking your metrics daily is like driving with your eyes closed. You might be fine for a while, but eventually you'll crash. Here are the five numbers you should look at every single morning before you do anything else.

## 1. Revenue vs. Spend (Daily P&L)

This isn't just "how much did we make yesterday." It's revenue minus ad spend, minus estimated COGS. A quick daily P&L tells you whether yesterday was actually profitable or just busy.

**How to track it:** Pull yesterday's Shopify revenue, subtract your ad spend from Meta/Google dashboards, and subtract estimated COGS (use your average gross margin percentage). A tool like Slay Season automates this entirely.

**Why daily matters:** Weekly or monthly P&L hides problems. You could be hemorrhaging money on Tuesdays and not know it until month-end.

## 2. Blended Customer Acquisition Cost (CAC)

Total marketing spend divided by total new customers acquired. This is the single most honest number in your business.

**Benchmark:** For DTC brands doing $1-10M, healthy blended CAC is typically 20-35% of your AOV. If your AOV is $80, your CAC should be under $28.

**Watch for:** CAC creeping up week over week. A 10% increase in CAC over 30 days can wipe out your entire margin if you don't catch it early.

## 3. Conversion Rate by Traffic Source

Your site-wide conversion rate is useful, but it hides the real story. Break it down:

- **Organic search:** Should convert at 3-5%
- **Email/SMS:** Should convert at 4-8%
- **Paid social:** Typically 1-3%
- **Direct:** Usually 3-6%

**Red flag:** If paid social conversion rate drops below 1%, your landing pages or targeting need work — not necessarily your ad creative.

## 4. Average Order Value (AOV)

Track this daily because it fluctuates more than you think. Promotions, product mix changes, and seasonal shifts all impact AOV.

**Quick wins if AOV is dropping:**
- Check if a low-price product is suddenly getting more traffic
- Verify your upsell/cross-sell apps are functioning
- Look at your free shipping threshold — is it still above your AOV?

**Pro tip:** Track AOV for new vs. returning customers separately. Returning customers typically have 15-30% higher AOV. If that gap is shrinking, your retention strategy might be off.

## 5. Cart Abandonment Rate

The average is 70%, but what matters is YOUR trend. If abandonment spikes from 68% to 78% overnight, something broke — maybe a payment processor issue, unexpected shipping costs, or a broken discount code.

**Daily check:** Compare today's abandonment rate to your 7-day average. If it's more than 5 points higher, investigate immediately.

**Common fixable causes:**
- Shipping costs appearing late in checkout
- Required account creation
- Slow page load on mobile checkout
- Payment method not working

## Building Your Morning Dashboard

Spend 5 minutes each morning checking these five metrics. That's it. Here's the routine:

1. Open your analytics dashboard (or Slay Season)
2. Check yesterday's P&L — profitable? By how much?
3. Glance at blended CAC — trending up or down?
4. Scan conversion rates by source — any anomalies?
5. Verify AOV and cart abandonment are in normal range

If everything looks normal, get on with your day. If something's off, you caught it in 24 hours instead of 30 days. That early detection is worth thousands of dollars over a year.

The brands that scale from $1M to $10M are obsessive about their daily numbers. Not because they're data nerds, but because they know that small problems become big problems fast when you're spending $500+ per day on ads.`
    },
    {
      id: 7,
      title: 'Google Ads for Shopify: A Complete Beginner\'s Guide',
      excerpt: 'New to Google Ads? This step-by-step guide walks you through setting up your first profitable campaign for your Shopify store — without wasting your budget.',
      category: 'Advertising',
      author: 'Slay Season Team',
      date: '2025-02-12',
      readTime: '11 min read',
      featured: true,
      tags: ['Google Ads', 'Shopify', 'Beginner Guide'],
      image: '🔍',
      content: `If you've been running Meta Ads and want to diversify, Google Ads is usually the next logical step. But Google is a completely different beast — the intent is higher, the learning curve is steeper, and the mistakes are more expensive. Here's how to get started without burning your budget.

## Why Google Ads for Shopify?

The fundamental difference: **Meta is interruption marketing** (you show ads to people scrolling), while **Google is intent marketing** (you show ads to people actively searching for what you sell).

This means:
- Higher conversion rates (typically 2-5x higher than Meta)
- Higher cost per click (you're paying for high-intent traffic)
- Less creative dependency (keywords matter more than videos)
- More predictable scaling once you find winners

## The 3 Campaign Types That Matter

### 1. Google Shopping (Performance Max)
This is where most Shopify brands should start. Your products appear with images and prices directly in search results.

**Setup checklist:**
- Connect Shopify to Google Merchant Center (use the official Shopify app)
- Ensure your product feed is clean: accurate titles, descriptions, prices, and high-quality images
- Set up conversion tracking via Google tag (install the Google & YouTube Shopify app)
- Start with a Performance Max campaign targeting all products

**Budget:** Start with $50-100/day. Give it 2-3 weeks to optimize before judging results.

**Pro tip:** Your product titles in Merchant Center matter enormously. Include the brand, product type, key attributes (color, size, material). "Women's Organic Cotton Crew Neck T-Shirt - Black" beats "The Classic Tee."

### 2. Branded Search
People searching your brand name should see your ad, not a competitor's. This is cheap, high-converting traffic.

**Setup:** Create a search campaign targeting your brand name and common misspellings. Set a modest budget — $10-20/day is usually enough.

**Why bother if you rank #1 organically?** Because competitors can bid on your brand name. And branded search ads push affiliate/review sites further down.

### 3. Non-Branded Search
This is the growth engine — targeting people searching for what you sell without knowing your brand. "Best organic face moisturizer" or "lightweight running shoes for women."

**Setup tips:**
- Start with exact match and phrase match keywords only (avoid broad match initially)
- Build negative keyword lists aggressively (add irrelevant search terms weekly)
- Write ads that match search intent — if someone searches "buy," they're ready to purchase
- Use ad extensions: sitelinks, callouts, structured snippets, price extensions

**Budget:** Start with $30-50/day per ad group. You need enough data to optimize.

## Setting Up Conversion Tracking (Critical)

Bad tracking = bad optimization = wasted money. Here's the right setup:

1. Install the Google & YouTube Shopify channel app
2. Verify your conversion tracking fires on the thank-you page
3. Set up Enhanced Conversions (sends hashed customer data to Google for better attribution)
4. Import your conversions into Google Ads and set "Purchase" as your primary conversion action

**Test it:** Place a test order and verify the conversion appears in Google Ads within 24 hours.

## Budget Allocation for Beginners

For a brand new to Google Ads spending $3,000/month total:

- **Performance Max (Shopping):** $1,500 (50%)
- **Branded Search:** $450 (15%)
- **Non-Branded Search:** $1,050 (35%)

Shift budget toward what's working after the first 30 days.

## Common Beginner Mistakes

1. **Judging too early:** Google's algorithm needs 2-3 weeks and 30-50 conversions to optimize. Don't kill campaigns after 3 days.
2. **Ignoring search terms report:** Check weekly what actual searches triggered your ads. Add irrelevant terms as negatives.
3. **Setting and forgetting:** Google Ads needs weekly optimization. Check bids, search terms, and performance by device/location.
4. **No negative keywords:** Without negatives, you'll pay for clicks from people searching "free," "DIY," "jobs," etc.
5. **Poor landing pages:** If your product pages are slow or confusing, no amount of ad spend will save you.

## Measuring Success

After 30 days, evaluate:
- **ROAS by campaign:** Shopping should hit 3-5x, Branded should hit 8-15x, Non-branded should hit 2-4x
- **Cost per acquisition:** Compare to your Meta CAC. Google is often higher per click but better per conversion.
- **Blended impact:** Did your overall revenue grow without proportionally increasing total ad spend?

Google Ads won't replace Meta for most DTC brands, but it captures high-intent buyers that Meta misses. Start small, track everything, and scale what works.`
    },
    {
      id: 8,
      title: 'Meta Ads Attribution: What Changed in 2025 and What It Means for You',
      excerpt: 'Meta\'s attribution model got another overhaul. Here\'s what actually changed, what the numbers mean now, and how to adjust your strategy.',
      category: 'Attribution',
      author: 'Slay Season Team',
      date: '2025-02-06',
      readTime: '9 min read',
      featured: false,
      tags: ['Meta Ads', 'Attribution', 'iOS Privacy'],
      image: '📲',
      content: `If your Meta Ads ROAS numbers suddenly looked different in early 2025, you're not imagining things. Meta rolled out significant changes to how they model and report conversions. Here's what happened and how to adapt.

## What Actually Changed

### Modeled Conversions Got More Aggressive
Meta now uses more statistical modeling to "fill in" conversions it can't directly observe (thanks to iOS privacy restrictions). In practice, this means:

- Reported conversions are 15-30% higher than what you'd see in Shopify
- The gap between Meta-reported and actual Shopify revenue has widened
- View-through conversions (someone saw your ad but didn't click) are weighted more heavily

### The Default Attribution Window Shifted
Meta's default attribution setting is now **7-day click, 1-day view**. But the way they calculate view-through conversions changed — they're using a broader definition of "view" that includes partial impressions in Reels and Stories.

### Advantage+ Reporting Consolidation
If you're running Advantage+ Shopping campaigns (and you probably should be), Meta now consolidates reporting differently. Individual ad-level data is less granular, pushing you to trust the algorithm more.

## Why This Matters for Your Business

### You Might Be Over-Investing in Meta
If you're making budget decisions based on Meta's reported ROAS, you could be allocating too much to Meta and too little to other channels. A brand seeing "5x ROAS" in Meta might actually be at 3.5x when reconciled with Shopify data.

### Creative Testing Data Is Muddier
With more modeled conversions, it's harder to determine which specific creative is driving sales. A creative that Meta says drove 50 purchases might have actually driven 35.

### Retargeting Looks Better Than It Is
View-through attribution disproportionately benefits retargeting campaigns. That retargeting campaign showing "12x ROAS" is almost certainly cannibalizing organic conversions.

## How to Adjust Your Strategy

### 1. Always Reconcile with Shopify
Make Shopify your source of truth for total revenue. Compare Meta's reported conversions to actual Shopify orders with matching UTM parameters.

**Formula:** True Meta ROAS = (Shopify revenue from Meta UTMs) ÷ (Total Meta ad spend)

This will typically be 20-40% lower than what Meta reports. That's okay — you just need to know the real number.

### 2. Use the "Meta Haircut" Method
Apply a consistent discount to Meta's reported numbers. For most brands, reducing Meta-reported conversions by 25-30% gets you closer to reality.

Track this ratio monthly: (Shopify-attributed Meta revenue) ÷ (Meta-reported revenue). Use this as your "haircut percentage."

### 3. Shift to Incrementality Testing
The only way to know Meta's true impact is to test it. Run geo-holdout tests:

- Pick 2-3 similar geographic regions
- Turn off Meta ads in one region for 2 weeks
- Compare sales performance between test and control regions
- Calculate the true incremental lift from Meta ads

This typically reveals that Meta's real ROAS is 40-60% of what it reports — but that's still profitable for most brands.

### 4. Focus on Blended Metrics
Stop optimizing individual platform ROAS. Instead, track:

- **Marketing Efficiency Ratio (MER):** Total revenue ÷ total marketing spend
- **Blended CAC:** Total marketing spend ÷ total new customers
- **New Customer Revenue %:** What percentage of revenue comes from first-time buyers?

These metrics don't care about attribution models. They tell you the truth.

### 5. Restructure Your Campaign Architecture
With less reliable ad-level data, simplify:

- Run fewer, larger campaigns (consolidate audiences)
- Use Advantage+ Shopping as your primary prospecting campaign
- Keep a separate retargeting campaign but with a small budget (10-15% of total)
- Test creatives in a dedicated testing campaign with controlled spend

## The Bottom Line

Meta Ads still work. They're still the primary acquisition channel for most DTC brands. But the reported numbers require more skepticism than ever. Build your own measurement framework, reconcile religiously with Shopify data, and make decisions based on blended business metrics — not platform-reported vanity numbers.

The brands that thrive aren't the ones with the best Meta ROAS. They're the ones with the best understanding of their true unit economics.`
    },
    {
      id: 9,
      title: 'How to Calculate True Customer Lifetime Value (LTV)',
      excerpt: 'Most LTV calculations are oversimplified and misleading. Here\'s a practical framework for calculating LTV that actually helps you make better spending decisions.',
      category: 'Analytics',
      author: 'Slay Season Team',
      date: '2025-01-30',
      readTime: '8 min read',
      featured: false,
      tags: ['LTV', 'Unit Economics', 'Growth'],
      image: '💎',
      content: `Customer Lifetime Value is the most important — and most miscalculated — metric in DTC. Get it wrong and you'll either overspend on acquisition (burning cash) or underspend (leaving growth on the table). Here's how to get it right.

## Why Most LTV Calculations Are Wrong

The standard formula everyone uses: LTV = AOV × Purchase Frequency × Customer Lifespan.

The problem? Most brands plug in aspirational numbers. "Our average customer buys 3 times over 2 years." Really? Have you actually measured that, or is that what you hope happens?

**Common mistakes:**
- Using all-time averages that include your best customers (survivorship bias)
- Not accounting for discounts and returns in the revenue number
- Ignoring the time value of money (a dollar in 2 years is worth less than a dollar today)
- Confusing revenue-based LTV with profit-based LTV

## The Right Way: Cohort-Based LTV

### Step 1: Define Your Cohorts
Group customers by the month they made their first purchase. January 2024 cohort, February 2024 cohort, etc.

### Step 2: Track Revenue Over Time
For each cohort, track cumulative revenue at 30, 60, 90, 180, and 365 days after first purchase.

**Example — January 2024 Cohort (500 customers):**
- Month 1: $45,000 (first purchase revenue)
- Month 3: $52,000 (some repeat purchases)
- Month 6: $61,000 (more repeats)
- Month 12: $72,000

So 12-month LTV = $72,000 ÷ 500 = $144 per customer.

### Step 3: Calculate Profit-Based LTV
Revenue LTV is useful but profit LTV is what matters for acquisition decisions.

Profit LTV = Revenue LTV × Contribution Margin %

If your contribution margin (after COGS, shipping, payment processing) is 45%:
Profit LTV = $144 × 0.45 = $64.80

This means you can spend up to $64.80 to acquire a customer and still break even over 12 months. In practice, you want to spend less — a good target is 1/3 of profit LTV, so ~$21.60 CAC.

### Step 4: Build LTV Curves
Plot your cohort LTV over time. This reveals:

- **How long to payback:** If your CAC is $30 and 90-day LTV is $35, you break even in about 3 months
- **Cohort quality trends:** Are newer cohorts more or less valuable? If quality is declining, your acquisition is getting less efficient
- **Seasonal patterns:** Holiday cohorts often have lower LTV (one-time gift buyers)

## Quick LTV Calculation for Brands Without Perfect Data

If you don't have cohort data set up yet, here's a practical shortcut:

1. Export all orders from the last 12 months from Shopify
2. Group by customer email
3. Calculate: Average revenue per customer = Total revenue ÷ Unique customers
4. Apply your contribution margin percentage

This gives you a blended 12-month LTV. It's not perfect, but it's better than guessing.

## Using LTV to Make Better Decisions

### Setting CAC Targets
- **Conservative:** CAC should be < 1/4 of 12-month profit LTV
- **Moderate:** CAC should be < 1/3 of 12-month profit LTV
- **Aggressive (venture-funded):** CAC can equal 12-month profit LTV if you have runway

### Channel Evaluation
Different channels attract different quality customers. Calculate LTV by acquisition source:
- Organic search customers often have 20-40% higher LTV
- Discount-driven paid social customers often have 20-30% lower LTV
- Email/referral customers typically have the highest LTV

### Product Strategy
Calculate LTV by first product purchased. You might find that customers who start with Product A have 2x the LTV of those who start with Product B. This should influence which products you advertise.

## The LTV Trap to Avoid

Don't use projected LTV to justify unprofitable acquisition. "Our 3-year LTV is $200 so a $60 CAC is fine" only works if you have the cash to wait 3 years for payback and your projections are accurate.

Stick to observed data. Use 12-month LTV as your primary planning metric. Anything beyond that is speculation for most DTC brands.

The brands that win the LTV game aren't the ones with the fanciest models — they're the ones that actually measure it, act on it, and improve it over time.`
    },
    {
      id: 10,
      title: 'TikTok Ads for Ecommerce: Is It Worth Your Budget?',
      excerpt: 'TikTok is the shiny new ad platform everyone\'s talking about. But is it actually profitable for DTC brands? We break down the real numbers.',
      category: 'Advertising',
      author: 'Slay Season Team',
      date: '2025-02-02',
      readTime: '7 min read',
      featured: false,
      tags: ['TikTok', 'Paid Social', 'Ecommerce'],
      image: '🎵',
      content: `Every DTC founder is asking the same question: should I be advertising on TikTok? The answer is nuanced. TikTok can be incredibly profitable for certain brands, and a complete money pit for others. Here's how to figure out which camp you're in.

## TikTok Ads by the Numbers (2025)

Based on data from DTC brands on our platform:

- **Average CPM:** $8-15 (compared to Meta's $12-25)
- **Average CPC:** $0.80-2.00
- **Average conversion rate:** 0.8-2.0% (lower than Meta's 1.5-3.5%)
- **Average ROAS:** 1.5-4x (compared to Meta's 2-6x for established brands)

The cheaper traffic sounds great, but lower conversion rates often eat the savings. The net result varies enormously by brand.

## Which Brands Succeed on TikTok?

### ✅ Good Fit
- **Visual/demonstrable products:** Beauty, food, gadgets — anything that looks great in short video
- **$20-60 price point:** Impulse purchase range works best on TikTok
- **18-35 target demographic:** TikTok's core audience
- **Strong brand personality:** TikTok rewards authentic, entertaining content over polished ads
- **Products that solve an obvious problem:** "Before and after" content performs incredibly well

### ❌ Poor Fit
- **High-consideration purchases ($150+):** TikTok users are scrolling, not researching
- **B2B or professional products:** Wrong audience and context
- **Commoditized products:** Hard to differentiate in a 15-second video
- **Brands with no video content capability:** You need a steady stream of native-looking video

## How to Test TikTok Without Wasting Money

### Phase 1: Content First ($0)
Before spending a dollar on ads, post organic content for 2-4 weeks. Create 15-30 second videos showing your product in use. If organic content gets traction (1000+ views consistently), that's a green light for paid.

### Phase 2: Spark Ads ($500-1,000)
Take your best-performing organic posts and boost them as Spark Ads. This is the lowest-risk way to test paid TikTok because you already know the content resonates.

**Setup:**
- Use your best 3-5 organic videos
- Target broad audiences (let TikTok's algorithm find buyers)
- Optimize for "Complete Payment" (not clicks or add to cart)
- Run for 7-10 days minimum

### Phase 3: Dedicated Ad Campaigns ($2,000-5,000/month)
If Spark Ads show positive ROAS, graduate to dedicated campaigns:

- Create TikTok-native ad content (NOT repurposed Instagram ads)
- Use creator-style content: talking head, UGC, product demos
- Test 5-10 creatives per week (TikTok burns through creative fast)
- Structure: 1 campaign, 3-5 ad groups, 3-5 ads per group

## The Attribution Challenge

TikTok's attribution is even less reliable than Meta's. Here's why:

- TikTok defaults to **7-day click, 1-day view** but their view-through model is aggressive
- Many TikTok-influenced purchases happen on Google (they search your brand after seeing a TikTok)
- Standard pixel tracking misses 30-50% of conversions on iOS

**How to measure true TikTok impact:**
1. Track branded search volume during TikTok campaigns (should increase 20-50% if TikTok is working)
2. Monitor your blended MER with TikTok on vs. off
3. Use post-purchase surveys ("How did you hear about us?")
4. Compare TikTok-reported ROAS to Shopify-attributed revenue

## Budget Allocation

If you're spending $10K/month on Meta and testing TikTok:

- **Month 1:** Allocate $1,000 (10%) to TikTok testing
- **Month 2:** If ROAS is positive, increase to $2,000 (17%)
- **Month 3:** Scale to $3,000-4,000 (25-30%) if economics work
- **Never:** Put more than 30-40% of budget into TikTok until it's proven over 3+ months

## The Verdict

TikTok is a legitimate acquisition channel for DTC brands — but it's not a Meta replacement. Think of it as diversification. The brands winning on TikTok are the ones treating it as its own platform with unique creative, not just another place to dump their Meta ads.

Test it, measure it honestly, and scale if the numbers work. But keep Meta as your foundation until TikTok proves itself with your specific audience and products.`
    },
    {
      id: 11,
      title: 'Klaviyo vs Mailchimp: Which Is Better for Shopify Stores?',
      excerpt: 'The email platform debate, settled with data. We compare features, pricing, and real performance metrics for DTC brands on Shopify.',
      category: 'Ecommerce',
      author: 'Slay Season Team',
      date: '2025-01-20',
      readTime: '8 min read',
      featured: false,
      tags: ['Email Marketing', 'Klaviyo', 'Shopify'],
      image: '📧',
      content: `Email and SMS should drive 25-40% of your DTC revenue. The platform you use matters more than you think. Let's compare the two most popular options for Shopify stores.

## The Quick Answer

**Klaviyo wins for Shopify stores doing $500K+ in revenue.** The Shopify integration is deeper, the segmentation is more powerful, and the revenue attribution is more accurate.

**Mailchimp wins for very early-stage stores** that need a free plan and basic email functionality.

Now let's get into the details.

## Shopify Integration

### Klaviyo
- Native, first-party Shopify integration
- Real-time sync of customer data, orders, browsing behavior, and product catalog
- Can trigger flows based on Shopify events (checkout started, order placed, fulfillment)
- Predictive analytics built on your Shopify data (predicted LTV, churn risk, next order date)

### Mailchimp
- Rebuilt their Shopify integration after a messy breakup in 2019
- Syncs customer and order data but with some lag
- Fewer Shopify-specific trigger options
- No predictive analytics based on Shopify data

**Winner: Klaviyo** — and it's not close. The depth of Shopify data Klaviyo can access makes every email smarter.

## Segmentation & Personalization

### Klaviyo
- Segment on virtually anything: purchase history, browsing behavior, email engagement, predicted metrics
- Dynamic product recommendations based on individual customer behavior
- Advanced conditional splits in flows (different messages for high-AOV vs low-AOV customers)

### Mailchimp
- Basic segmentation by tags, purchase activity, and engagement
- Product recommendations available but less sophisticated
- Simpler automation workflows with fewer branching options

**Winner: Klaviyo.** Segmentation is where Klaviyo really shines. The ability to create hyper-specific segments like "bought Product A, hasn't purchased in 60 days, predicted high LTV" is game-changing.

## Key Flows You Need (and How Each Platform Handles Them)

### Welcome Series
Both handle this well. Klaviyo edges out with better conditional logic (different series for customers who came from Meta vs Google vs organic).

### Abandoned Cart / Abandoned Checkout
Klaviyo separates "added to cart" from "started checkout" — important because they represent different levels of intent. Mailchimp lumps them together.

### Post-Purchase
Klaviyo lets you create flows based on specific products purchased, order value, and customer segment. Great for cross-sells. Mailchimp's post-purchase options are more limited.

### Win-Back
Klaviyo's predicted churn date lets you trigger win-back flows before customers actually lapse. Mailchimp relies on fixed time windows.

## Pricing Comparison (2025)

### Klaviyo
- Free up to 250 contacts
- 10,000 contacts: ~$150/month
- 25,000 contacts: ~$400/month
- 50,000 contacts: ~$720/month
- SMS is additional ($0.01-0.015 per SMS)

### Mailchimp
- Free up to 500 contacts (limited features)
- 10,000 contacts: ~$100/month (Standard plan)
- 25,000 contacts: ~$270/month
- 50,000 contacts: ~$385/month

**Winner: Mailchimp on price.** Klaviyo is 40-80% more expensive at every tier. But the ROI question is: does Klaviyo's better segmentation and Shopify integration generate enough additional revenue to justify the cost?

For most brands doing $1M+, the answer is yes. Better segmentation typically drives 15-25% more email revenue, which easily covers the price difference.

## Revenue Attribution

### Klaviyo
Tracks revenue with configurable attribution windows. Default is 5-day post-click, which is more conservative and realistic than alternatives.

### Mailchimp
Uses a wider attribution window by default, which can overstate email's contribution.

**Winner: Klaviyo.** More honest attribution = better decision-making.

## SMS Capability

### Klaviyo
Built-in SMS with the same segmentation power as email. Unified customer profiles across email and SMS. One platform to manage both.

### Mailchimp
Basic SMS available but feels bolted on rather than integrated. Limited segmentation for SMS-specific campaigns.

**Winner: Klaviyo.** If you're doing SMS (and you should be), having it in the same platform as email is a massive advantage.

## The Recommendation

- **Under $500K revenue or pre-launch:** Start with Mailchimp's free plan. Switch to Klaviyo when you hit consistent revenue.
- **$500K - $10M revenue:** Use Klaviyo. The Shopify integration and segmentation will generate more revenue than the price difference.
- **Already on Mailchimp and doing $1M+:** Seriously consider migrating. The switch is painful (2-3 weeks of setup) but pays for itself within a quarter.

Email is too important to your DTC business to cheap out on tooling. Pick the platform that lets you send the right message to the right customer at the right time.`
    },
    {
      id: 12,
      title: 'The Complete Guide to Ecommerce Unit Economics',
      excerpt: 'Unit economics determine whether your business can scale profitably. Here\'s everything you need to know about the numbers behind every order.',
      category: 'Analytics',
      author: 'Slay Season Team',
      date: '2025-01-15',
      readTime: '10 min read',
      featured: false,
      tags: ['Unit Economics', 'Profitability', 'DTC'],
      image: '🧮',
      content: `Revenue growth means nothing if you're losing money on every order. Unit economics is the discipline of understanding exactly what happens financially with each transaction. Master this, and you'll know exactly when to scale and when to fix.

## What Are Unit Economics?

Unit economics breaks down the profitability of a single "unit" of your business. For ecommerce, that unit is usually one order or one customer.

The core question: **When you sell one more item, do you make money or lose money?**

## The Unit Economics Waterfall

Here's every cost that comes out of a $100 order:

### Revenue: $100.00
This is your gross sales price after any discount applied at checkout.

### Less: Cost of Goods Sold (COGS): -$32.00
Raw materials, manufacturing, packaging, labels. For most DTC brands, COGS is 25-40% of revenue. If yours is above 40%, you have a pricing or sourcing problem.

### Less: Shipping Cost: -$7.50
What you actually pay to ship the order. Include packaging materials. If you offer free shipping, this comes entirely out of your margin.

### Less: Payment Processing: -$3.20
Shopify Payments charges 2.9% + $0.30. Third-party processors may vary. Don't forget chargeback costs (~0.5% of revenue for most brands).

### Less: Shopify Platform Fees: -$2.00
Your Shopify plan cost allocated per order, plus any app fees (reviews app, upsell app, email app — they all add up).

### Less: Returns & Exchanges: -$3.50
Allocate your return rate across all orders. If 10% of orders are returned and the average refund is $35, that's $3.50 per order.

### = Gross Margin per Order: $51.80

### Less: Customer Acquisition Cost: -$28.00
Total marketing spend ÷ total orders. This includes ad spend, agency fees, influencer costs, and any other marketing expense.

### = Contribution Margin per Order: $23.80

This $23.80 is what's left to cover your fixed costs (rent, salaries, software, etc.) and generate profit.

## Benchmarks: Where Should You Be?

| Metric | Danger Zone | Healthy | Excellent |
|---|---|---|---|
| Gross Margin | Below 50% | 55-65% | Above 65% |
| CAC as % of AOV | Above 40% | 20-35% | Below 20% |
| Contribution Margin | Below 15% | 20-30% | Above 30% |
| Return Rate | Above 20% | 8-15% | Below 8% |

## How to Improve Your Unit Economics

### Lever 1: Increase AOV
Every dollar of AOV increase flows almost entirely to your bottom line (COGS on additional items is usually lower due to bundles).

**Tactics:**
- Free shipping threshold at 20-30% above current AOV
- Product bundles with a 10-15% discount vs. buying separately
- Post-purchase one-click upsells
- Gift with purchase over a certain amount

### Lever 2: Reduce COGS
Negotiate with suppliers as you scale. Every 5% reduction in COGS adds ~$1.50 to your per-order profit at $100 AOV.

**Tactics:**
- Larger order quantities for volume discounts
- Source alternative suppliers annually
- Simplify packaging (do you really need that tissue paper?)
- Reduce SKU count to concentrate volume

### Lever 3: Lower Shipping Costs
Shipping negotiations unlock significant savings at scale.

**Tactics:**
- Negotiate rates with multiple carriers
- Use regional carriers for nearby zones
- Optimize packaging to reduce dimensional weight
- Consider shipping from multiple fulfillment centers

### Lever 4: Reduce CAC
The highest-leverage improvement for most brands.

**Tactics:**
- Improve landing page conversion rate (10% improvement = 10% lower CAC)
- Diversify acquisition channels
- Invest in organic/content (zero marginal CAC)
- Build referral programs (typically 50-70% lower CAC than paid)

### Lever 5: Reduce Returns
Returns are a silent profit killer.

**Tactics:**
- Better product photography and sizing guides
- Honest product descriptions (over-promising leads to returns)
- Quality control improvements
- Exchange-first return policies

## The Break-Even Analysis

Use your unit economics to calculate exactly how many orders you need to break even:

**Monthly fixed costs ÷ Contribution margin per order = Break-even orders**

If your fixed costs are $15,000/month and contribution margin is $23.80 per order, you need 630 orders/month to break even.

This number should guide your growth planning. If you're at 400 orders/month, you know exactly how far you have to go.

## Building Your Unit Economics Dashboard

Track these numbers monthly at minimum:
1. Revenue per order (after discounts)
2. COGS per order
3. Shipping cost per order
4. Payment processing per order
5. Platform fees per order
6. Return cost per order (allocated)
7. CAC per order
8. Contribution margin per order
9. Contribution margin percentage

With Slay Season, all of these are calculated automatically from your Shopify and ad platform data. If you're doing it manually, a monthly spreadsheet review is the minimum.

The brands that scale profitably are the ones that understand their unit economics at a granular level. Don't just track revenue — track what you actually keep.`
    },
    {
      id: 13,
      title: 'How to Set Realistic Revenue Goals for Your Shopify Store',
      excerpt: 'Setting revenue targets based on vibes instead of data? Here\'s a framework for building achievable, data-backed goals for your DTC brand.',
      category: 'Growth',
      author: 'Slay Season Team',
      date: '2025-01-10',
      readTime: '7 min read',
      featured: false,
      tags: ['Revenue Planning', 'Goal Setting', 'Strategy'],
      image: '🎯',
      content: `"We want to 3x revenue this year." Cool. Based on what? Most DTC founders set revenue goals based on ambition rather than math. Here's how to set targets you can actually hit — and build a plan to get there.

## The Revenue Formula

Revenue isn't magic. It's a formula:

**Revenue = Traffic × Conversion Rate × AOV**

To set realistic goals, you need to know what each of these can realistically improve by.

### Traffic Growth
- **Organic traffic:** Grows 5-15% per month with consistent SEO/content effort
- **Paid traffic:** Can scale faster but with diminishing returns. Increasing ad spend 50% typically yields 30-40% more traffic (not 50%)
- **Email/SMS traffic:** Grows proportionally with your list. List growth of 5-10% monthly is achievable

### Conversion Rate Improvement
- **Realistic:** 10-20% improvement per year with consistent CRO work
- **Example:** Going from 2.0% to 2.3% is a solid year of optimization
- **Don't plan for:** Doubling your conversion rate. It almost never happens without a complete site redesign

### AOV Increase
- **Realistic:** 10-15% improvement per year through bundles, upsells, and pricing
- **Example:** Moving from $75 to $85 through a free shipping threshold increase and post-purchase upsells
- **Don't plan for:** 30%+ AOV increases without adding new, higher-priced products

## Building Your Revenue Model

### Step 1: Establish Your Baseline
Take your trailing 12-month data:
- Monthly revenue (note seasonality)
- Monthly traffic by source
- Conversion rate by source
- AOV trend

### Step 2: Model Realistic Growth by Lever

**Example — Brand doing $150K/month:**
| Lever | Current | Realistic Target | Impact |
|---|---|---|---|
| Paid traffic | 50K visits | 65K visits (+30%) | +$45K/mo |
| Organic traffic | 30K visits | 36K visits (+20%) | +$18K/mo |
| Conversion rate | 2.2% | 2.5% (+14%) | +$21K/mo |
| AOV | $78 | $85 (+9%) | +$17K/mo |

Combined realistic growth: ~$100K/month additional = $250K/month = $3M/year (up from $1.8M).

That's 67% growth — ambitious but achievable with focused execution.

### Step 3: Sanity Check with CAC and Budget

More revenue from paid channels requires more ad spend. Check if the math works:

- Additional paid traffic needed: 15K visits/month
- At $2.50 CPC: $37,500/month additional ad spend
- Additional revenue from paid: ~$45K/month
- ROAS on incremental spend: 1.2x

Wait — that's barely profitable. You might need to target a more modest paid traffic increase or improve conversion rate first to make the unit economics work.

**This is why goal-setting by formula matters.** A blanket "grow 67%" sounds achievable until you realize the incremental paid traffic is unprofitable.

## The Seasonal Adjustment

DTC revenue is not flat across the year. Apply seasonal multipliers based on your historical data:

- **January-February:** 0.7-0.8x (post-holiday slowdown)
- **March-May:** 0.9-1.0x (recovery and spring)
- **June-August:** 0.8-1.0x (varies by category)
- **September-October:** 1.0-1.2x (back to school, pre-holiday)
- **November:** 1.5-2.5x (BFCM)
- **December:** 1.3-1.8x (holiday gifting)

Map your annual goal to monthly targets using these multipliers. Nothing kills team morale faster than missing January targets that were set assuming November-level performance.

## Setting Milestone Checkpoints

Break your annual goal into quarterly checkpoints:

- **Q1:** Focus on conversion rate and AOV improvements. Revenue growth comes from efficiency, not spend.
- **Q2:** Start scaling paid acquisition. You should have better unit economics from Q1 optimizations.
- **Q3:** Full scaling mode. Test new channels (TikTok, Google, influencers).
- **Q4:** Maximize your BFCM and holiday strategy. This is where 30-40% of annual revenue happens.

## The "What If" Scenarios

Build three scenarios:

- **Conservative (70% probability):** Each lever improves by half the target. Revenue grows 30%.
- **Base case (50% probability):** Hit your targets. Revenue grows 67%.
- **Aggressive (20% probability):** Everything works plus a viral moment or celebrity mention. Revenue grows 100%+.

Plan your operations (inventory, hiring, infrastructure) for the base case. Plan your cash reserves for the conservative case.

## Common Goal-Setting Mistakes

1. **Ignoring CAC inflation:** Ad costs increase 15-25% per year. Your existing spend won't produce the same results next year.
2. **Not accounting for churn:** You need to replace churned customers before you can grow.
3. **Over-indexing on BFCM:** A brand that does 40% of revenue in Q4 is fragile. Aim to reduce Q4 dependency over time.
4. **Setting goals without action plans:** "Grow 50%" is not a plan. "Increase paid traffic 30% while improving CVR from 2.2% to 2.5%" is a plan.

Set goals with math, track them weekly, and adjust quarterly. That's how $1M brands become $5M brands.`
    },
    {
      id: 14,
      title: 'When to Hire vs Automate: Scaling Your DTC Brand',
      excerpt: 'Every growing DTC brand faces this decision: bring on people or invest in tools? Here\'s a framework for making the right call at each stage.',
      category: 'Growth',
      author: 'Slay Season Team',
      date: '2025-01-05',
      readTime: '8 min read',
      featured: false,
      tags: ['Scaling', 'Operations', 'Automation'],
      image: '⚡',
      content: `At some point, every DTC founder hits a wall. There's too much to do and not enough hours. The instinct is to hire. But in 2025, the smartest brands are automating first and hiring only when they have to. Here's how to decide.

## The Decision Framework

Before hiring or buying a tool, ask three questions:

1. **Is this task repetitive and rule-based?** → Automate it
2. **Does this require judgment, creativity, or relationship-building?** → Hire for it
3. **Is this a one-time project or ongoing need?** → If one-time, freelance it

## What to Automate First (by Revenue Stage)

### $0 - $500K: Automate the Basics
At this stage, it's probably just you or you + 1 person. Automate:

- **Email flows:** Welcome series, abandoned cart, post-purchase (Klaviyo or equivalent)
- **Social posting:** Schedule a week of content at once (Buffer, Later)
- **Inventory alerts:** Low stock notifications (Shopify native or Stocky)
- **Customer service:** Chatbot for FAQ (Tidio, Gorgias)
- **Bookkeeping:** Auto-categorize transactions (QuickBooks + Shopify integration)

**Cost:** $200-500/month in tools. Saves 20-30 hours/month of manual work.

### $500K - $2M: Automate Operations
You probably have 2-5 people. Now automate:

- **Order fulfillment:** 3PL integration for automated picking, packing, shipping
- **Ad reporting:** Automated daily/weekly reports (Slay Season, Triple Whale, or custom dashboards)
- **Review collection:** Automated post-delivery review requests (Judge.me, Loox)
- **Returns processing:** Self-service returns portal (Loop, Returnly)
- **Financial reporting:** Automated P&L and contribution margin reporting

**Cost:** $500-2,000/month in tools. Saves 40-80 hours/month.

### $2M - $10M: Automate Intelligence
At this stage, hire people for strategy and automate the data that informs their decisions:

- **Attribution modeling:** Automated multi-touch attribution
- **Inventory forecasting:** AI-driven demand planning
- **Customer segmentation:** Automated RFM analysis and segment updates
- **Ad optimization:** Automated bid management and budget allocation rules
- **Anomaly detection:** Automated alerts for metric spikes or drops

**Cost:** $2,000-5,000/month in tools. But the real value is better decisions, not time saved.

## When You Must Hire (Not Automate)

### Creative Direction
AI can generate ad variations, but someone needs to understand your brand voice, direct photo/video shoots, and develop creative strategy. Hire a creative lead or work with a dedicated agency.

**When to hire:** When you're spending $30K+/month on ads and need to test 10+ new creatives monthly.

### Community & Brand Building
Authenticity can't be automated. Customer relationships, community management, and brand partnerships require a real person.

**When to hire:** When your social channels have 5,000+ engaged followers and you're missing opportunities to respond and engage.

### Performance Marketing Strategy
Tools can execute, but strategy needs a brain. Someone who decides how to allocate budget across channels, when to scale, and when to pull back.

**When to hire:** When ad spend exceeds $50K/month or when you're managing 3+ paid channels.

### Customer Experience
Beyond basic FAQ, complex customer issues need human empathy. Returns disputes, product problems, and VIP customer management need people.

**When to hire:** When you're getting 50+ support tickets per day and response quality matters to your brand.

## The Hire vs. Automate Cheat Sheet

| Function | Under $1M | $1M - $5M | $5M - $10M |
|---|---|---|---|
| Email/SMS | Automate | Automate + review | Hire email manager |
| Ad management | Founder/freelancer | Freelancer/agency | In-house + tools |
| Creative | Freelance | Agency/freelance | In-house creative lead |
| Customer support | Chatbot + founder | 1-2 support reps + chatbot | Support team + manager |
| Finance | Automated + accountant | Part-time CFO + automation | Full-time finance person |
| Analytics | Automated dashboards | Automated + monthly review | Hire data/analytics person |
| Fulfillment | Self/3PL | 3PL (automated) | 3PL or in-house warehouse |

## The ROI Calculation

Before any hire, calculate:

**Hire cost:** Salary + benefits + management time + onboarding time (typically $4-8K/month fully loaded for entry-level)

**Automation cost:** Tool subscription + setup time + maintenance time (typically $200-2,000/month)

**Value created:** Hours saved × value per hour, OR revenue generated

If a $500/month tool replaces 30 hours of work that you'd pay someone $25/hour for, that's $750 in labor savings. Automate.

If you need someone to build a brand ambassador program that could generate $50K in revenue, that's a strategic hire worth $5K/month.

## The Founder's Trap

The most expensive person in your company is you. If you're spending 10 hours a week on tasks that could be automated for $300/month, you're wasting your most valuable resource.

Audit your time weekly. Track what you spend hours on. Aggressively automate or delegate anything that doesn't require your unique judgment or relationships.

The goal isn't to avoid hiring forever. It's to hire the right people for the right roles and let technology handle the rest. That's how you scale to $10M without a 50-person team.`
    },
    {
      id: 15,
      title: 'Black Friday/Cyber Monday: A Data-Driven Prep Guide',
      excerpt: 'BFCM can make or break your year. Start planning now with this month-by-month preparation guide backed by data from thousands of DTC brands.',
      category: 'Ecommerce',
      author: 'Slay Season Team',
      date: '2024-12-20',
      readTime: '10 min read',
      featured: false,
      tags: ['BFCM', 'Holiday Planning', 'Revenue'],
      image: '🛒',
      content: `Black Friday/Cyber Monday accounts for 20-40% of annual revenue for most DTC brands. Yet most start planning in October. The brands that crush BFCM start in August. Here's your data-driven prep guide.

## BFCM by the Numbers (2024 Data)

From analyzing DTC brands on our platform:

- **Average BFCM revenue:** 3-5x a normal weekend
- **Average discount depth:** 20-30% (deeper discounts didn't always mean more revenue)
- **Email/SMS drove:** 35-45% of BFCM revenue (your list is your biggest asset)
- **Top brands started promotions:** Tuesday before Thanksgiving
- **Conversion rates during BFCM:** 4-8% (vs. normal 2-3%)
- **Mobile traffic:** 72% (but desktop still converted 40% higher)

## The Timeline: Month-by-Month Prep

### August-September: Foundation

**Inventory Planning**
- Analyze last year's BFCM sell-through by SKU
- Identify your hero products (top 20% that drive 80% of BFCM revenue)
- Place orders with suppliers NOW — lead times of 8-12 weeks mean August orders arrive in November
- Plan for 3-5x your normal weekly sales volume for hero products

**Email List Building**
- BFCM email revenue is directly proportional to list size
- Launch a lead magnet or pre-BFCM "VIP early access" signup
- Target: Grow your email list 20-30% between August and November
- Segment your list now: VIPs (top 10% by LTV), active buyers (purchased in last 90 days), prospects (subscribed but never bought)

**Tech & Site Prep**
- Load test your site at 5x normal traffic
- Audit your checkout flow for friction points
- Set up your discount code structure (test that codes work correctly)
- Ensure your analytics tracking is solid — you can't optimize what you can't measure

### October: Strategy & Creative

**Offer Strategy**
Based on data, here's what works:

- **Tiered discounts:** "20% off $100+, 25% off $200+, 30% off $300+" drives higher AOV than flat discounts
- **Gift with purchase:** Often outperforms percentage discounts for premium brands
- **Bundle deals:** "Buy 2 get 1 free" or curated gift sets with 15-20% savings
- **Early access:** Give VIP customers access 24-48 hours before the general public

**What doesn't work:**
- Discounts deeper than 40% (diminishes brand and attracts one-time bargain hunters with low LTV)
- Too many different offers (confuses customers)
- Starting promotions too early (Black Friday in October = fatigue)

**Creative Production**
- Design email templates for: teaser, early access, BFCM launch, daily deals, last chance
- Create ad creatives (plan for 3-5x your normal creative volume)
- Prepare social media content calendar
- Write product descriptions for gift guides

### November (Pre-BFCM): Execution

**Week 1-2: Warm Up**
- Send teaser emails: "BFCM is coming. Get on the VIP list."
- Increase retargeting spend 20-30% to warm up audiences
- Launch "gift guide" content on social and email
- Set up your Meta and Google ad campaigns (but don't launch at full budget yet)

**Week 3 (Thanksgiving Week): Launch**

**Monday-Tuesday:** VIP early access. Email and SMS your top customers with exclusive early deals. This typically drives 15-25% of total BFCM revenue.

**Wednesday:** Open access to email subscribers. Create urgency: "Deals go public on Friday."

**Thursday (Thanksgiving):** Email blast to full list. Light ad spend. Many customers browse on Thanksgiving evening.

**Black Friday:** Full send. Maximum ad budget. Email in the morning, reminder in the evening. This is your highest-revenue single day.

**Saturday-Sunday:** Keep deals running. Many brands see Saturday as their second-highest day.

**Cyber Monday:** Final push. "Last chance" messaging. Best day for digital products, subscriptions, and gift cards.

### Email Cadence During BFCM Week

Yes, you can email every day during BFCM week. Here's the schedule:

- **Monday:** Early access for VIPs
- **Tuesday:** Extend early access to email list
- **Wednesday:** "Deals start tomorrow" teaser
- **Thursday:** "Shop now" with full deal details
- **Friday (AM):** "Black Friday is here" main blast
- **Friday (PM):** "Selling fast" with social proof
- **Saturday:** "Weekend deals continue"
- **Sunday:** "Last day before Cyber Monday"
- **Monday (AM):** "Cyber Monday deals"
- **Monday (PM):** "Hours left" final urgency

**Unsubscribe rate will increase slightly.** That's okay. BFCM email revenue will far outweigh list shrinkage.

## Ad Strategy During BFCM

### Budget Allocation
Increase total ad budget 2-3x during BFCM week. Allocate:

- **50% to retargeting:** Your warmest audiences convert at the highest rate during BFCM
- **30% to prospecting with BFCM creative:** New customer acquisition is cheaper when everyone's in buying mode
- **20% to branded search:** Protect your brand terms (competitors will bid on them)

### Creative That Works
- Lead with the offer, not the brand story (people are deal-hunting)
- Show specific products with prices (before/after pricing)
- Use countdown timers in ads and on landing pages
- UGC outperforms polished creative during BFCM (feels more authentic)

## Post-BFCM: Don't Forget December

BFCM isn't the end — it's the beginning of holiday season.

- **December 1-15:** Gift-giving messaging. Emphasize shipping deadlines.
- **December 15-20:** "Last chance for Christmas delivery" — urgency drives action
- **December 21-25:** Push gift cards hard (instant delivery, no shipping needed)
- **December 26-31:** New Year promotions to capture gift card redemptions and self-purchasing

## Measuring BFCM Success

After BFCM, analyze:

1. **Total revenue vs. goal and vs. last year**
2. **New vs. returning customer split** (aim for 40-60% new customers)
3. **Blended ROAS during BFCM week**
4. **Email/SMS revenue as % of total** (target: 35%+)
5. **Average discount depth and margin impact**
6. **Inventory — did you stock out of hero products?**

Most importantly: track BFCM customer cohort LTV over the following 6 months. If BFCM customers never buy again at full price, your discount strategy needs adjustment.

Start planning now. The brands that win BFCM aren't the ones with the biggest discounts — they're the ones with the best preparation.`
    }
  ];

  const categories = [
    'All',
    'Analytics',
    'Attribution', 
    'Advertising',
    'Ecommerce',
    'Growth',
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent); }
        .blog-card { transition: all .3s ease; }
        .blog-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -12px rgba(0,0,0,.4); }
        
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
            <button onClick={() => navigate('/help')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Help</button>
            <button onClick={() => navigate('/contact')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Contact</button>
            <span className="text-white font-medium">Blog</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-[#8b92b0] hover:text-white transition-colors px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="flex items-center gap-1.5">Start Free Trial <ArrowRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-16 mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
            DTC Analytics <span className="text-indigo-400">Insights</span>
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed">
            Data-driven insights, case studies, and growth strategies from the DTC trenches
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7194]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.toLowerCase()
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-[#8b92b0] hover:text-white hover:bg-white/[.04] border border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredPosts.length > 0 && (
        <section className="py-16 border-t border-white/[.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Featured Articles</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="blog-card glass rounded-xl p-6 gradient-border cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{post.image}</span>
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Tag className="w-3 h-3" />
                      <span>{post.category}</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-xs text-[#6b7194]">Featured</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-[#8b92b0] text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-white/5 text-[#8b92b0] px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-[#6b7194]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#6b7194] group-hover:text-indigo-400 transition-colors" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">
              {selectedCategory === 'all' ? 'All Articles' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
            </h2>
            <span className="text-sm text-[#6b7194]">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-[#4a4f6a] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#8b92b0] mb-2">No articles found</h3>
              <p className="text-[#6b7194] mb-4">Try adjusting your search or filter</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article key={post.id} className="blog-card glass rounded-xl p-6 cursor-pointer group" onClick={() => setSelectedPost(post)}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{post.image}</span>
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Tag className="w-3 h-3" />
                      <span>{post.category}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-[#8b92b0] text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs bg-white/5 text-[#8b92b0] px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#6b7194]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#6b7194] group-hover:text-indigo-400 transition-colors" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-xl p-8 gradient-border">
            <h3 className="text-2xl font-bold text-white mb-4">
              Never Miss an <span className="text-indigo-400">Insight</span>
            </h3>
            <p className="text-[#8b92b0] mb-6 max-w-lg mx-auto">
              Get weekly DTC insights, case studies, and growth tactics delivered to your inbox. No spam, just profit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1"
              />
              <button className="btn-primary text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-[#6b7194] mt-3">
              Join 2,500+ DTC operators • Unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-3xl mx-3 sm:mx-4 my-4 sm:my-8 glass rounded-xl p-5 sm:p-12">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text-secondary, #8b92b0)' }}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedPost.image}</span>
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <Tag className="w-3 h-3" />
                <span>{selectedPost.category}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6b7194] mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{selectedPost.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{selectedPost.readTime}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-[#c0c4d4] leading-relaxed">
              {selectedPost.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-white mt-6 mb-3">{line.slice(4)}</h3>;
                if (line.startsWith('- **')) {
                  const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                  if (match) return <p key={i} className="ml-4 mb-2">• <strong className="text-white">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</p>;
                }
                if (line.startsWith('- [ ]')) return <p key={i} className="ml-4 mb-1">☐ {line.slice(5)}</p>;
                if (line.startsWith('- ')) return <p key={i} className="ml-4 mb-2">• {line.slice(2)}</p>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white mt-4 mb-2">{line.slice(2, -2)}</p>;
                if (line.startsWith('**')) return <p key={i} className="mb-3"><strong className="text-white">{line.replace(/\*\*/g, '')}</strong></p>;
                if (line.startsWith('|')) return null; // skip table lines for simplicity
                if (line.trim() === '') return <div key={i} className="h-3" />;
                return <p key={i} className="mb-3">{line}</p>;
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
              {selectedPost.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-white/5 text-[#8b92b0] px-3 py-1.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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

export default BlogPage;