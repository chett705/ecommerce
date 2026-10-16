import React, { useState, useEffect } from 'react';
import { useApp, CURRENCIES } from '../context/AppContext';
import { 
  Brain, 
  ShoppingCart, 
  User, 
  Search, 
  ArrowRight, 
  Menu, 
  X,
  Sparkles,
  Boxes,
  Zap,
  HelpCircle,
  Star
} from 'lucide-react';

export default function Navbar({ onOpenSearch }) {
  const { 
    cart, 
    currency, 
    setCurrency, 
    setIsCartOpen, 
    setIsAccountOpen 
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span className="badge-pill">✨ SPRING 2026 RELEASE</span>
          <p className="announcement-text">
            <strong>Synapse Omni-LLM 4.5 & VideoGen 4D</strong> are now live! Get <strong>20% OFF</strong> all annual subscriptions with code <span className="promo-code-chip">NEURON20</span>
          </p>
          <a href="#pricing" className="announcement-link">
            Claim Offer <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          {/* Brand Logo */}
          <a href="#" className="brand-logo">
            <div className="logo-symbol">
              <Brain size={22} className="logo-icon" />
              <span className="pulse-dot"></span>
            </div>
            <span className="logo-text">SYNAPSE<span className="logo-gradient">.AI</span></span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <a href="#tools" className="nav-link">
              <Boxes size={16} />
              <span>AI Tools</span>
            </a>
            <a href="#playground" className="nav-link">
              <Sparkles size={16} />
              <span>Live Sandbox</span>
            </a>
            <a href="#pricing" className="nav-link">
              <Zap size={16} />
              <span>Subscriptions</span>
              <span className="nav-badge-save">SAVE 20%</span>
            </a>
            <a href="#features" className="nav-link">
              <span>Platform</span>
            </a>
            <a href="#testimonials" className="nav-link">
              <Star size={16} />
              <span>Reviews</span>
            </a>
            <a href="#faq" className="nav-link">
              <HelpCircle size={16} />
              <span>FAQ</span>
            </a>
          </nav>

          {/* Header Action Controls */}
          <div className="header-actions">
            {/* Currency Selector */}
            <div className="currency-picker">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select Currency"
                className="currency-select"
              >
                {Object.entries(CURRENCIES).map(([code, cur]) => (
                  <option key={code} value={code}>
                    {cur.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Trigger */}
            <button 
              className="search-trigger-btn"
              onClick={onOpenSearch}
              title="Search AI Tools"
            >
              <Search size={15} />
              <span className="search-text">Search...</span>
              <kbd className="kbd-shortcut">Ctrl+K</kbd>
            </button>

            {/* Dashboard / Account */}
            <button 
              className="btn-account"
              onClick={() => setIsAccountOpen(true)}
              title="Account Dashboard & API Keys"
            >
              <User size={16} />
              <span className="account-btn-label">Dashboard</span>
            </button>

            {/* Cart Button */}
            <button 
              className="cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={18} />
              {totalItemsCount > 0 && (
                <span className="cart-counter">{totalItemsCount}</span>
              )}
            </button>

            {/* Get Subscribed CTA */}
            <a href="#pricing" className="btn btn-primary btn-glow nav-cta">
              <span>Subscribe</span>
              <ArrowRight size={15} />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <nav className="mobile-nav-links">
              <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Boxes size={18} /> AI Tools Marketplace
              </a>
              <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Sparkles size={18} /> Live AI Sandbox
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Zap size={18} /> Subscriptions (Save 20%)
              </a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Platform Architecture
              </a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Star size={18} /> Customer Stories
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <HelpCircle size={18} /> FAQ
              </a>
              <div className="mobile-actions-stack">
                <button 
                  className="btn btn-secondary btn-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAccountOpen(true);
                  }}
                >
                  <User size={16} /> Open Dashboard & API Keys
                </button>
                <a 
                  href="#pricing" 
                  className="btn btn-primary btn-glow btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={16} /> Subscribe to Pro AI Suite
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
