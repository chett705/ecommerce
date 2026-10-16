import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Brain, 
  ArrowRight, 
  Lock, 
  Check, 
  Globe
} from 'lucide-react';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6h0a14.5 14.5 0 0 0-4-1.5 9.6 9.6 0 0 0-.5 1 12.3 12.3 0 0 0-3 0 9.6 9.6 0 0 0-.5-1A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2 11 15.3 15.3 0 0 0 5 2.5 10.9 10.9 0 0 0 1-1.7 9.3 9.3 0 0 1-1.6-.8l.4-.3a11.5 11.5 0 0 0 10.4 0l.4.3a9.3 9.3 0 0 1-1.6.8 10.9 10.9 0 0 0 1 1.7 15.3 15.3 0 0 0 5-2.5 15.8 15.8 0 0 0-2-11z" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
  </svg>
);

export default function Footer() {
  const { addToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    addToast('🎉 Subscribed to Synapse Intelligence newsletter!', 'success');
  };

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <a href="#" className="brand-logo footer-logo">
            <div className="logo-symbol">
              <Brain size={22} className="logo-icon" />
            </div>
            <span className="logo-text">SYNAPSE<span className="logo-gradient">.AI</span></span>
          </a>

          <p className="footer-bio">
            The premier unified marketplace and cloud subscription platform for foundation AI models, autonomous agents, and generative developer tooling.
          </p>

          <div className="system-status">
            <span className="status-dot-active"></span>
            <span>All AI Clusters Operational (99.99% SLA)</span>
          </div>

          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
              <DiscordIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
          </div>
        </div>

        {/* Marketplace Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">AI Marketplace</h4>
          <ul className="footer-links">
            <li><a href="#tools">Synapse Omni-LLM 4.5</a></li>
            <li><a href="#tools">Visionary Diffusion X</a></li>
            <li><a href="#tools">DeepCode Copilot Pro</a></li>
            <li><a href="#tools">EchoVoice Neural Studio</a></li>
            <li><a href="#tools">VideoGen 4D Ultra</a></li>
            <li><a href="#tools">AgenticFlow Automator</a></li>
          </ul>
        </div>

        {/* Subscriptions */}
        <div className="footer-col">
          <h4 className="footer-heading">Subscriptions</h4>
          <ul className="footer-links">
            <li><a href="#pricing">Starter Creator ($19/mo)</a></li>
            <li><a href="#pricing">Pro AI Suite ($49/mo)</a></li>
            <li><a href="#pricing">Enterprise Sovereign</a></li>
            <li><a href="#pricing">Annual 20% Discount</a></li>
            <li><a href="#faq">14-Day Money Back</a></li>
            <li><a href="#faq">Zero Data Retention</a></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="footer-col">
          <h4 className="footer-heading">Neural Dispatch</h4>
          <p className="newsletter-sub">
            Receive newly released frontier weights, open-source model evaluations, and special discount codes.
          </p>

          {subscribed ? (
            <div className="newsletter-success-box">
              <Check size={18} className="text-success inline mr-2" />
              <span>You are subscribed to the Dispatch!</span>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="developer@company.com"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <span>Join</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          <span className="spam-free-note">
            <Lock size={12} className="inline mr-1" /> No spam. Unsubscribe with 1-click anytime.
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; 2026 SYNAPSE.AI Technologies Inc. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security & SOC2</a>
            <a href="#">Status Page</a>
            <a href="#login" className="text-muted">Staff Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
