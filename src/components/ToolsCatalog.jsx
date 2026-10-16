import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TOOLS_DATA } from '../data/toolsData';
import { 
  Search, 
  X, 
  Star, 
  Brain, 
  Code2, 
  Sparkles, 
  Mic, 
  Video, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  ShoppingCart, 
  Eye, 
  Zap, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const ICON_MAP = {
  Brain,
  Sparkles,
  Code2,
  Mic,
  Video,
  Workflow,
  Database,
  ShieldCheck,
  Sliders,
  TrendingUp
};

const CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: null },
  { id: 'llm', label: 'LLM & Reasoning', icon: Brain },
  { id: 'code', label: 'Code & Dev', icon: Code2 },
  { id: 'vision', label: 'Vision & Art', icon: Sparkles },
  { id: 'video', label: 'Video & 3D', icon: Video },
  { id: 'audio', label: 'Audio & Voice', icon: Mic },
  { id: 'data', label: 'Data & SEO', icon: Database }
];

export default function ToolsCatalog({ searchRef }) {
  const { addToCart, formatPrice, setSelectedToolModal } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('all'); // 'all' | 'subscription' | 'lifetime'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'price-asc' | 'price-desc'

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      // Category filter
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }
      // Pricing filter
      if (pricingFilter === 'subscription' && !tool.includedInSub) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(query);
        const matchesDesc = tool.shortDesc.toLowerCase().includes(query);
        const matchesCap = tool.capabilities.some((c) => c.toLowerCase().includes(query));
        const matchesBadge = tool.badge.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCap && !matchesBadge) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.priceLifetime - b.priceLifetime;
      if (sortBy === 'price-desc') return b.priceLifetime - a.priceLifetime;
      return b.reviewsCount - a.reviewsCount; // default popular
    });
  }, [activeCategory, searchQuery, pricingFilter, sortBy]);

  const handleAddToolToCart = (tool, licenseType = 'lifetime') => {
    const isPerpetual = licenseType === 'lifetime';
    addToCart({
      id: `${tool.id}_${licenseType}`,
      name: `${tool.name} (${isPerpetual ? 'Perpetual Lifetime License' : 'Monthly Access'})`,
      type: 'tool',
      price: isPerpetual ? tool.priceLifetime : tool.priceMonthly,
      toolId: tool.id,
      badge: isPerpetual ? 'Lifetime License' : 'Monthly License'
    });
  };

  return (
    <section className="tools-section" id="tools">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <Zap size={14} /> TOOL CATALOG
          </span>
          <h2 className="section-title">
            Explore 45+ Premier <span className="gradient-text">AI Engines & Tools</span>
          </h2>
          <p className="section-desc">
            Purchase perpetual lifetime licenses with zero recurring fees, or access all tools via our unified Pro AI Suite subscription.
          </p>
        </div>

        {/* Toolbar */}
        <div className="catalog-toolbar">
          {/* Categories */}
          <div className="category-filters">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {IconComp && <IconComp size={15} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Filter Inputs */}
          <div className="toolbar-subcontrols">
            <div className="search-input-box">
              <Search size={16} className="search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tools, models, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-dropdown-group">
              <select
                className="filter-select"
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value)}
                aria-label="Filter by License Type"
              >
                <option value="all">All License Types</option>
                <option value="subscription">Included in Subscription</option>
                <option value="lifetime">Lifetime License Available</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Order"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Results Count */}
        <div className="active-filter-bar">
          <span className="results-count">
            Showing <strong>{filteredTools.length}</strong> AI Tools
          </span>
          {(activeCategory !== 'all' || searchQuery || pricingFilter !== 'all') && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setPricingFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.icon] || Brain;
              return (
                <div key={tool.id} className="tool-card">
                  <div className="tool-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${tool.color}25, transparent 70%)` }}></div>
                  
                  <div className="tool-card-top">
                    <div className="tool-icon-wrapper" style={{ color: tool.color, borderColor: `${tool.color}40`, backgroundColor: `${tool.color}15` }}>
                      <IconComponent size={24} />
                    </div>
                    <span className="tool-badge-pill" style={{ borderColor: `${tool.color}50`, color: tool.color }}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="tool-name">{tool.name}</h3>

                  <div className="tool-meta-row">
                    <span className="tool-rating">
                      <Star size={14} className="fill-warning text-warning" />
                      <strong>{tool.rating}</strong> ({tool.reviewsCount.toLocaleString()})
                    </span>
                    <span className="tool-users">
                      <Zap size={13} className="text-accent" /> {tool.usersCount} Active Users
                    </span>
                  </div>

                  <p className="tool-description">{tool.shortDesc}</p>

                  <div className="tool-capabilities">
                    {tool.capabilities.map((cap, idx) => (
                      <span key={idx} className="capability-tag">
                        <CheckCircle2 size={12} className="text-cyan mr-1" /> {cap}
                      </span>
                    ))}
                  </div>

                  {/* Included in Subscription Highlight Box */}
                  <div className="subscription-included-badge">
                    <Zap size={14} className="text-warning fill-warning" />
                    <span>Included with <strong>Pro AI Suite</strong> ($49/mo)</span>
                  </div>

                  {/* Price & Buy Action Footer */}
                  <div className="tool-card-footer">
                    <div className="tool-pricing-info">
                      <div className="tool-lifetime-price">
                        {formatPrice(tool.priceLifetime)}
                        <span className="lifetime-label">perpetual license</span>
                      </div>
                      <div className="tool-or-sub">or {formatPrice(tool.priceMonthly)}/month</div>
                    </div>

                    <div className="tool-actions-row">
                      <button
                        className="btn-icon-view"
                        onClick={() => setSelectedToolModal(tool)}
                        title="View API Docs & Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn btn-primary btn-sm btn-glow"
                        onClick={() => handleAddToolToCart(tool, 'lifetime')}
                      >
                        <ShoppingCart size={15} />
                        <span>Buy License</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={32} />
            </div>
            <h3>No AI Tools Found</h3>
            <p>We couldn't find any tools matching "{searchQuery}". Try searching with different keywords.</p>
            <button
              className="btn btn-secondary mt-3"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setPricingFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
