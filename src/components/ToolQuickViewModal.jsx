import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  ShoppingCart, 
  Zap, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export default function ToolQuickViewModal() {
  const { 
    selectedToolModal, 
    setSelectedToolModal, 
    addToCart, 
    formatPrice, 
    addToast 
  } = useApp();

  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!selectedToolModal) return null;

  const tool = selectedToolModal;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(tool.apiSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    addToast('API snippet copied to clipboard!', 'info');
  };

  const handleAddLifetime = () => {
    addToCart({
      id: `${tool.id}_lifetime`,
      name: `${tool.name} (Perpetual Lifetime License)`,
      type: 'tool',
      price: tool.priceLifetime,
      toolId: tool.id,
      badge: 'Lifetime License'
    });
    setSelectedToolModal(null);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container tool-details-container">
        <button
          className="modal-close"
          onClick={() => setSelectedToolModal(null)}
          aria-label="Close Details"
        >
          <X size={20} />
        </button>

        <div className="tool-details-header">
          <div className="tool-header-left">
            <span className="tool-badge-pill" style={{ color: tool.color, borderColor: `${tool.color}50` }}>
              {tool.badge}
            </span>
            <h2>{tool.name}</h2>
            <div className="tool-rating-line">
              <Star size={15} className="fill-warning text-warning" />
              <strong>{tool.rating}</strong>
              <span className="text-muted">({tool.reviewsCount.toLocaleString()} verified developers)</span>
              <span className="engine-tag">{tool.engineVersion}</span>
            </div>
          </div>
        </div>

        <div className="tool-details-body">
          <p className="tool-full-description">{tool.shortDesc}</p>

          <div className="tool-capabilities-section">
            <h4>Core Model Capabilities</h4>
            <div className="capabilities-grid">
              {tool.capabilities.map((cap, idx) => (
                <div key={idx} className="capability-card">
                  <CheckCircle2 size={16} className="text-cyan mr-2" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Code Example */}
          <div className="api-snippet-section">
            <div className="snippet-header">
              <div className="snippet-title">
                <Terminal size={15} />
                <span>JavaScript / TypeScript SDK Quickstart</span>
              </div>
              <button
                className="btn-copy-snippet"
                onClick={handleCopySnippet}
              >
                {copiedSnippet ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="snippet-body font-mono">
              <pre>
                <code>{tool.apiSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Pricing & Checkout Options */}
          <div className="tool-details-actions">
            <div className="action-col">
              <div className="action-price-label">Perpetual Lifetime Access</div>
              <div className="action-price-val">{formatPrice(tool.priceLifetime)}</div>
              <p className="action-sub">Pay once, own forever. Free minor version updates.</p>
              <button
                className="btn btn-primary btn-glow btn-full"
                onClick={handleAddLifetime}
              >
                <ShoppingCart size={16} />
                <span>Buy Lifetime License</span>
              </button>
            </div>

            <div className="action-col or-col">
              <div className="or-divider-circle">OR</div>
            </div>

            <div className="action-col highlight-sub-col">
              <div className="action-price-label">
                <Zap size={14} className="inline mr-1 text-warning" /> All-Access Pro Subscription
              </div>
              <div className="action-price-val">$49 <span className="text-sm">/ mo</span></div>
              <p className="action-sub">Includes this tool + ALL 45+ other AI tools with unlimited tokens.</p>
              <a
                href="#pricing"
                className="btn btn-secondary btn-full"
                onClick={() => setSelectedToolModal(null)}
              >
                <span>View Subscription Plans</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
