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
  ExternalLink
} from 'lucide-react';

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock blog posts - in production these would come from your CMS
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
      image: '📊'
    },
    {
      id: 2,
      title: 'iOS 14 Attribution: How to Track Performance Post-Privacy Updates',
      excerpt: 'Facebook\'s attribution is broken. Here\'s how to build a multi-touch attribution model that actually works in 2025.',
      category: 'Attribution',
      author: 'Sarah Kim',
      date: '2025-02-08',
      readTime: '12 min read',
      featured: true,
      tags: ['iOS 14', 'Attribution', 'Facebook Ads'],
      image: '📱'
    },
    {
      id: 3,
      title: 'Shopify Plus vs Regular: When Should You Upgrade?',
      excerpt: 'Breaking down the costs, benefits, and hidden features of Shopify Plus. Is it worth the $2K/month jump?',
      category: 'Ecommerce',
      author: 'Alex Chen',
      date: '2025-02-05',
      readTime: '6 min read',
      featured: false,
      tags: ['Shopify', 'Ecommerce Platform'],
      image: '🛍️'
    },
    {
      id: 4,
      title: 'Black Friday 2024: What Worked (Data from 200+ DTC Brands)',
      excerpt: 'We analyzed Black Friday performance across our customer base. Here are the strategies that drove the highest profit margins.',
      category: 'Case Studies',
      author: 'Leo Martinez',
      date: '2025-01-28',
      readTime: '15 min read',
      featured: false,
      tags: ['Black Friday', 'Case Study', 'Profit'],
      image: '🛒'
    },
    {
      id: 5,
      title: 'Building a Profitable Email Automation Sequence',
      excerpt: 'The 7 emails every DTC brand needs for maximum lifetime value. Templates and benchmarks included.',
      category: 'Email Marketing',
      author: 'Jennifer Park',
      date: '2025-01-25',
      readTime: '10 min read',
      featured: false,
      tags: ['Email Marketing', 'Automation', 'LTV'],
      image: '📧'
    },
    {
      id: 6,
      title: 'Inventory Forecasting: Never Stockout Again',
      excerpt: 'Use AI forecasting to predict demand, optimize inventory levels, and avoid the cash flow disasters of overstocking.',
      category: 'Analytics',
      author: 'David Rodriguez',
      date: '2025-01-22',
      readTime: '9 min read',
      featured: false,
      tags: ['Inventory', 'Forecasting', 'AI'],
      image: '📦'
    },
    {
      id: 7,
      title: 'TikTok Ads vs Meta: Which Converts Better for DTC?',
      excerpt: 'We compared TikTok Ads and Meta across 50 DTC brands. The results might surprise you.',
      category: 'Advertising',
      author: 'Marcus Williams',
      date: '2025-01-18',
      readTime: '7 min read',
      featured: false,
      tags: ['TikTok Ads', 'Meta Ads', 'Comparison'],
      image: '📱'
    },
    {
      id: 8,
      title: 'The $1M Revenue Milestone: What Changes',
      excerpt: 'Hitting 7 figures changes everything. Here\'s what to expect and how to prepare your operations.',
      category: 'Growth',
      author: 'Lisa Thompson',
      date: '2025-01-15',
      readTime: '11 min read',
      featured: false,
      tags: ['Growth', 'Scaling', 'Operations'],
      image: '📈'
    }
  ];

  const categories = [
    'All',
    'Analytics',
    'Attribution', 
    'Advertising',
    'Email Marketing',
    'Ecommerce',
    'Growth',
    'Case Studies'
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
                <article key={post.id} className="blog-card glass rounded-xl p-6 gradient-border cursor-pointer">
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
                <article key={post.id} className="blog-card glass rounded-xl p-6 cursor-pointer group">
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