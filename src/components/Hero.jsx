import React from 'react';
import { 
  Crown, 
  FlaskConical, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  FileCheck, 
  Star, 
  Wand2, 
  Code2, 
  ShieldAlert, 
  Cpu, 
  Gauge, 
  Zap, 
  Radio
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Left Column: Text & CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon"><Zap size={14} /></span>
            <span className="badge-text">Next-Gen AI Marketplace & Unified Cloud</span>
            <span className="badge-tag">v4.5 Live</span>
          </div>

          <h1 className="hero-title">
            Supercharge Your Workflow With <span className="gradient-text">Elite AI Tools</span> & Unified Subscriptions
          </h1>

          <p className="hero-subtitle">
            Access 45+ premier AI models, autonomous coding agents, neural voice synthesizers, and cinematic video generators. Unlock everything with one simple subscription or purchase perpetual tool licenses with instant production API keys.
          </p>

          <div className="hero-cta-group">
            <a href="#pricing" className="btn btn-primary btn-xl btn-glow">
              <Crown size={20} />
              <span>Unlock All-Access Subscription</span>
            </a>
            <a href="#playground" className="btn btn-secondary btn-xl">
              <FlaskConical size={20} />
              <span>Try Live AI Sandbox</span>
            </a>
          </div>

          {/* Real-Time Live Stats Grid */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <div className="stat-number">185,000+</div>
              <div className="stat-label">Active Subscribers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">45+</div>
              <div className="stat-label">Pro AI Engines</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">99.99%</div>
              <div className="stat-label">API SLA Uptime</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number flex-items-center">
                <Star size={16} className="text-warning fill-warning mr-1" /> 4.96/5
              </div>
              <div className="stat-label">14,200+ Reviews</div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="hero-guarantees">
            <span className="guarantee-item">
              <ShieldCheck size={16} /> Instant API Keys
            </span>
            <span className="guarantee-item">
              <RotateCcw size={16} /> 14-Day Money-Back
            </span>
            <span className="guarantee-item">
              <CreditCard size={16} /> Cancel Anytime
            </span>
            <span className="guarantee-item">
              <FileCheck size={16} /> 100% Commercial Rights
            </span>
          </div>
        </div>

        {/* Right Column: Holographic Glass Visual Showcase */}
        <div className="hero-visual">
          <div className="visual-card-glass">
            <div className="visual-card-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="window-title">
                <Radio size={14} className="text-accent mr-1 animate-pulse" />
                Synapse Neural Cluster // SXM5 Node 01
              </div>
              <span className="status-indicator-live">
                <span className="indicator-pulse"></span> ONLINE
              </span>
            </div>

            <div className="hero-image-wrap">
              <img 
                src="/assets/images/hero.jpg" 
                alt="Synapse AI Platform Holographic Neural Core" 
                className="hero-img"
                loading="eager"
              />
              <div className="image-overlay-glow"></div>

              {/* Floating Holographic Micro-Badges */}
              <div className="floating-badge badge-top-left">
                <div className="badge-icon-wrap violet">
                  <Wand2 size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">Visionary Diffusion X</span>
                  <span className="f-sub">8K Ultra Render • 0.8s</span>
                </div>
              </div>

              <div className="floating-badge badge-bottom-right">
                <div className="badge-icon-wrap cyan">
                  <Code2 size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">DeepCode Copilot Pro</span>
                  <span className="f-sub">100% Test Pass • Zero Lint</span>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left">
                <div className="badge-icon-wrap emerald">
                  <ShieldAlert size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">Enterprise Shield</span>
                  <span className="f-sub">Zero Data Retention Active</span>
                </div>
              </div>
            </div>

            <div className="visual-card-footer">
              <div className="runtime-info">
                <Cpu size={14} />
                <span>NVIDIA H100 SXM5 Tensor Core Cluster</span>
              </div>
              <div className="runtime-metrics">
                <span className="metric-tag">
                  <Gauge size={13} /> Latency: 14ms
                </span>
                <span className="metric-tag">
                  400B MoE Weights
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
