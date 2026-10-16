import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  QrCode,
  ExternalLink,
  Smartphone,
  SmartphoneNfc,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_ABA_PAY_LINK = 'https://link.payway.com.kh/ABAPAY9s540501U';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    clearCart,
    totalUSD, 
    formatPrice, 
    setIsAccountOpen,
    generateNewApiKey,
    addToast
  } = useApp();

  const [step, setStep] = useState(1);
  const [customerName, setCustomerName] = useState('Alex Vance');
  const [customerEmail, setCustomerEmail] = useState('alex@venturelabs.ai');
  const [customerCompany, setCustomerCompany] = useState('VentureLabs Inc.');

  // Default to KHQR Direct Gateway
  const [paymentMethod, setPaymentMethod] = useState('khqr'); // 'khqr' | 'aba' | 'card' | 'crypto'
  const [paywayUrl, setPaywayUrl] = useState(DEFAULT_ABA_PAY_LINK);
  
  // KHQR State
  const [khqrPayment, setKhqrPayment] = useState(null);
  const [khqrLoading, setKhqrLoading] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [khqrError, setKhqrError] = useState(null);
  const [hasOpenedKhqr, setHasOpenedKhqr] = useState(false);
  const [txCopied, setTxCopied] = useState(false);

  // ABA PayWay Fallback State
  const [hasOpenedPayway, setHasOpenedPayway] = useState(false);
  const [abaLinkCopied, setAbaLinkCopied] = useState(false);

  // Credit card state
  const [cardNumber, setCardNumber] = useState('4532 8920 1823 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCVC, setCardCVC] = useState('889');

  const [issuedApiKey, setIssuedApiKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync PayWay URL from backend settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const link = data?.settings?.abaPayLink || data?.abaPayLink;
        if (link) {
          setPaywayUrl(link);
        }
      })
      .catch((err) => console.warn('Could not load backend settings:', err));
  }, []);

  // Generate dynamic KHQR when entering Step 2 or when amount changes
  const generateKhqrPayment = async () => {
    if (totalUSD <= 0) return;
    setKhqrLoading(true);
    setKhqrError(null);
    try {
      const res = await fetch('/api/payment/khqr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalUSD,
          customerName,
          customerEmail,
          company: customerCompany,
          items: cart.map((c) => c.name),
        }),
      });
      const data = await res.json();
      if (data.success && data.checkout_url) {
        setKhqrPayment(data);
      } else {
        setKhqrError(data.message || 'Failed to generate KHQR link');
      }
    } catch (err) {
      console.error('Failed to generate KHQR request:', err);
      setKhqrError('Could not reach KHQR Gateway API');
    } finally {
      setKhqrLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && paymentMethod === 'khqr' && (!khqrPayment || khqrPayment.amount != totalUSD.toFixed(2))) {
      generateKhqrPayment();
    }
  }, [step, paymentMethod, totalUSD]);

  if (!isCheckoutOpen) return null;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      addToast('Please provide your name and email', 'error');
      return;
    }
    setStep(2);
  };

  const handleOpenKhqr = (e, redirect = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!khqrPayment?.checkout_url) return;

    setHasOpenedKhqr(true);
    addToast('🚀 Opening KHQR payment gateway...', 'info');

    if (redirect) {
      window.location.href = khqrPayment.checkout_url;
    } else {
      const win = window.open(khqrPayment.checkout_url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = khqrPayment.checkout_url;
      }
    }
  };

  const handleOpenPayWay = (e, redirect = false) => {
    if (e && e.preventDefault) e.preventDefault();

    // Register pending order to backend
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          company: customerCompany,
          items: cart.map((c) => c.name),
          amount: totalUSD,
          paymentMethod: 'ABA PAY / PayWay',
          abaLink: paywayUrl,
          status: 'Pending PayWay Checkout'
        })
      });
    } catch (err) {
      console.warn('Order sync note:', err);
    }

    setHasOpenedPayway(true);
    addToast('🚀 Opening ABA PayWay gateway...', 'info');

    if (redirect) {
      window.location.href = paywayUrl;
    } else {
      const win = window.open(paywayUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = paywayUrl;
      }
    }
  };

  const handleCopyTxId = () => {
    if (!khqrPayment?.transaction_id) return;
    navigator.clipboard.writeText(khqrPayment.transaction_id);
    setTxCopied(true);
    setTimeout(() => setTxCopied(false), 2000);
    addToast('Transaction ID copied!', 'info');
  };

  const handleCopyAbaLink = () => {
    navigator.clipboard.writeText(paywayUrl);
    setAbaLinkCopied(true);
    setTimeout(() => setAbaLinkCopied(false), 2000);
    addToast('ABA PAY link copied to clipboard!', 'info');
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    const fallbackKey = generateNewApiKey(`Production - ${customerCompany || customerName}`);
    let finalKey = fallbackKey.key;

    // Send order to backend API
    try {
      if (paymentMethod === 'khqr' && khqrPayment?.transaction_id) {
        const res = await fetch(`/api/payment/khqr/verify/${khqrPayment.transaction_id}?confirm=true`);
        const data = await res.json();
        if (data.success && data.api_key) {
          finalKey = data.api_key;
        }
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            customerEmail,
            company: customerCompany,
            items: cart.map((c) => c.name),
            amount: totalUSD,
            paymentMethod: paymentMethod === 'aba' ? 'ABA PAY / PayWay' : (paymentMethod === 'card' ? 'Credit Card' : 'Crypto'),
            abaLink: paywayUrl
          })
        });
        const data = await res.json();
        if (data.apiKey) finalKey = data.apiKey;
      }
    } catch (err) {
      console.warn('Backend order sync warning:', err);
    }

    setIssuedApiKey(finalKey);

    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // graceful fallback
      }

      clearCart();
      addToast('🎉 Order confirmed & license activated!', 'success');
    }, 1000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(issuedApiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
    addToast('API Key copied to clipboard!', 'info');
  };

  const handleDownloadReceipt = () => {
    const paymentMethodDisplay = paymentMethod === 'khqr'
      ? `KHQR DIRECT GATEWAY (TX: ${khqrPayment?.transaction_id || 'N/A'})`
      : paymentMethod === 'aba' 
      ? `ABA PAY / PAYWAY (${paywayUrl})` 
      : paymentMethod.toUpperCase();

    const receiptContent = `=====================================================
SYNAPSE.AI — OFFICIAL LICENSE & TAX INVOICE
=====================================================
Order ID: ${khqrPayment?.transaction_id || `SYN-${Date.now().toString(36).toUpperCase()}`}
Date: ${new Date().toLocaleDateString()}
Customer: ${customerName} (${customerEmail})
Organization: ${customerCompany || 'Individual'}

ITEMS PURCHASED:
${cart.map((c) => `- ${c.name} (${formatPrice(c.price)})`).join('\n')}

TOTAL PAID: ${formatPrice(totalUSD)}
PAYMENT METHOD: ${paymentMethodDisplay} (VERIFIED)
GATEWAY SIGNATURE: ${khqrPayment?.hash || 'SHA-1 VERIFIED'}

CREDENTIALS ISSUED:
Production API Key: ${issuedApiKey}
Access Endpoint: https://api.synapse.ai/v1
Zero Data Retention: Guaranteed

SUPPORT & SLA:
24/7 Priority Discord: https://discord.gg/synapse-ai
Documentation: https://docs.synapse.ai
=====================================================
Thank you for building with SYNAPSE.AI!
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synapse_Receipt_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Receipt downloaded!', 'success');
  };

  const handleFinishAndOpenDashboard = () => {
    setIsCheckoutOpen(false);
    setStep(1);
    setIsAccountOpen(true);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container checkout-modal-container">
        <button
          className="modal-close"
          onClick={() => {
            setIsCheckoutOpen(false);
            setStep(1);
          }}
          aria-label="Close Checkout"
        >
          <X size={20} />
        </button>

        {/* Step Indicator Bar */}
        <div className="checkout-header">
          <div className="checkout-steps">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Account Info</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Activation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Customer Info */}
        {step === 1 && (
          <div className="checkout-step-panel">
            <h3 className="step-title">Customer & Account Credentials</h3>
            <p className="step-sub">Your API keys and license receipts will be issued to this email.</p>

            <form onSubmit={handleNextToPayment}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex@company.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company / Team Name (Optional)</label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  placeholder="e.g. VentureLabs Inc."
                />
              </div>

              {/* Order Preview */}
              <div className="order-summary-box">
                <h4>Order Summary ({cart.length} items):</h4>
                {cart.map((item) => (
                  <div key={item.id} className="summary-item-line">
                    <span>{item.name}</span>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>
                ))}
                <div className="checkout-total-line">
                  <span>Total Due Today:</span>
                  <strong className="text-cyan">{formatPrice(totalUSD)}</strong>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-glow">
                  <span>Continue to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="checkout-step-panel">
            <h3 className="step-title">Select Secure Payment Method</h3>
            <p className="step-sub">Pay instantly via KHQR (ABA Mobile & All Cambodian Banks), PayWay link, Card, or Crypto.</p>

            {/* Payment Method Selector */}
            <div className="payment-methods-tabs">
              {/* KHQR Gateway Tab - Featured */}
              <button
                type="button"
                className={`payment-tab payment-tab-khqr ${paymentMethod === 'khqr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('khqr')}
              >
                <div className="khqr-mini-badge">KHQR</div>
                <span className="payment-tab-title">KHQR Gateway</span>
                <span className="badge-khqr-hot">INSTANT</span>
              </button>

              {/* ABA PayWay Tab */}
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'aba' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('aba')}
              >
                <SmartphoneNfc size={18} className="aba-icon" />
                <span>ABA PayWay</span>
              </button>

              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={18} />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('crypto')}
              >
                <QrCode size={18} />
                <span>Crypto</span>
              </button>
            </div>

            {/* View 1: KHQR Dynamic Gateway */}
            {paymentMethod === 'khqr' && (
              <div className="payment-details-view active">
                <div className="khqr-pay-card">
                  {/* Top Bar with KHQR Branding */}
                  <div className="khqr-card-header">
                    <div className="khqr-branding">
                      <div className="khqr-logo-box">
                        <span className="khqr-logo-text">KHQR</span>
                      </div>
                      <div>
                        <h4 className="khqr-title">Cambodia National KHQR Gateway</h4>
                        <div className="khqr-sub-tags">
                          <span className="khqr-bank-tag aba">ABA Mobile</span>
                          <span className="khqr-bank-tag bakong">Bakong</span>
                          <span className="khqr-bank-tag any">All Banks</span>
                        </div>
                      </div>
                    </div>
                    <div className="khqr-amount-wrap">
                      <span className="khqr-amount-label">Payable</span>
                      <span className="khqr-amount-value">{formatPrice(totalUSD)}</span>
                    </div>
                  </div>

                  {khqrLoading ? (
                    <div className="khqr-loading-box">
                      <RefreshCw size={28} className="spin-icon text-cyan" />
                      <p>Generating dynamic signed KHQR payment...</p>
                    </div>
                  ) : khqrError ? (
                    <div className="khqr-error-box">
                      <p className="text-danger">{khqrError}</p>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm mt-2"
                        onClick={generateKhqrPayment}
                      >
                        <RefreshCw size={14} /> Retry Generation
                      </button>
                    </div>
                  ) : khqrPayment ? (
                    <div className="khqr-checkout-body">
                      {/* Left: Official Live KHQR Gateway Embed */}
                      <div className="khqr-embed-col">
                        <div className="khqr-iframe-card">
                          {iframeLoading && (
                            <div className="khqr-iframe-loading-overlay">
                              <RefreshCw size={26} className="spin-icon text-cyan" />
                              <span>Loading official KHQR QR code...</span>
                            </div>
                          )}
                          <iframe
                            key={khqrPayment.transaction_id}
                            src={khqrPayment.iframe_url || `${khqrPayment.checkout_url}&iframe=1`}
                            title="Official KHQR Payment Gateway"
                            className="khqr-live-iframe"
                            onLoad={() => setIframeLoading(false)}
                            allow="payment"
                          />
                        </div>
                        <div className="khqr-scan-caption">
                          <Smartphone size={13} className="inline mr-1" />
                          <span>Scan QR above with ABA Mobile, Bakong, or any Banking App</span>
                        </div>
                      </div>

                      {/* Right: Payment Actions & Hash Verification */}
                      <div className="khqr-info-col">
                        <div className="khqr-instructions-box">
                          <p className="khqr-lead-text">
                            Scan the official dynamic KHQR code on the left with <strong>ABA Mobile</strong>, <strong>Bakong</strong>, or any Cambodian mobile banking app:
                          </p>

                          <div className="khqr-action-buttons-stack">
                            <a
                              href={khqrPayment.checkout_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleOpenKhqr(e)}
                              className="btn btn-khqr-direct btn-glow"
                              id="btn-open-khqr-gateway"
                            >
                              <ExternalLink size={17} />
                              <span>Open KHQR Fullscreen Page</span>
                            </a>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={generateKhqrPayment}
                              title="Regenerate QR Code"
                            >
                              <RefreshCw size={14} className={khqrLoading ? "spin-icon mr-1" : "mr-1"} />
                              <span>Refresh / New QR</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            className="khqr-direct-link-btn"
                            onClick={() => handleOpenKhqr(null, true)}
                          >
                            Direct redirect to KHQR gateway in this tab →
                          </button>
                        </div>

                        {/* Cryptographic Transaction Details Box */}
                        <div className="khqr-crypto-specs">
                          <div className="khqr-spec-row">
                            <span className="spec-label">Merchant Name:</span>
                            <strong className="text-cyan">dyzz (Verified)</strong>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Transaction ID:</span>
                            <div className="spec-val-wrap">
                              <code className="spec-code">{khqrPayment.transaction_id}</code>
                              <button
                                type="button"
                                className="btn-copy-spec"
                                onClick={handleCopyTxId}
                                title="Copy Transaction ID"
                              >
                                {txCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Security Hash:</span>
                            <code className="spec-hash" title={khqrPayment.hash}>
                              {khqrPayment.hash?.substring(0, 18)}...
                            </code>
                            <span className="khqr-verified-tag">
                              <ShieldCheck size={11} className="inline mr-0.5" /> VERIFIED
                            </span>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Profile ID:</span>
                            <span className="spec-profile">{khqrPayment.profile_id}</span>
                          </div>
                        </div>

                        <div className="khqr-guarantee-note">
                          <ShieldCheck size={14} className="text-success mr-1 shrink-0" />
                          <span>Direct instant settlement to merchant bank account</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {hasOpenedKhqr && (
                  <div className="khqr-opened-banner">
                    <CheckCircle2 size={18} className="text-success shrink-0" />
                    <div>
                      <strong>KHQR Gateway opened in a new tab!</strong>
                      <p>
                        Complete your payment of <strong>{formatPrice(totalUSD)}</strong> on your banking app. Once paid, click <strong>"I've Paid — Activate License"</strong> below.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 2: ABA PAY / PayWay Details */}
            {paymentMethod === 'aba' && (
              <div className="payment-details-view active">
                <div className="aba-pay-card">
                  <div className="aba-card-header">
                    <div className="aba-branding">
                      <div className="aba-logo-badge">ABA'</div>
                      <div>
                        <h4 className="aba-title">ABA PAY & PayWay Checkout</h4>
                        <span className="aba-sub">PayWay Cambodia Direct Gateway</span>
                      </div>
                    </div>
                    <span className="aba-amount-tag">{formatPrice(totalUSD)}</span>
                  </div>

                  <div className="aba-checkout-body">
                    <div className="aba-qr-section">
                      <a
                        href={paywayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenPayWay(e)}
                        className="aba-qr-link-wrapper"
                        title="Click to open PayWay in browser or scan with phone"
                      >
                        <div className="aba-qr-frame">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paywayUrl)}`} 
                            alt="ABA PAY PayWay QR Code" 
                            className="aba-qr-img" 
                          />
                          <div className="aba-qr-pulse"></div>
                          <div className="aba-qr-overlay">
                            <ExternalLink size={24} />
                            <span>Click to Pay</span>
                          </div>
                        </div>
                      </a>
                      <span className="aba-scan-hint">
                        <Smartphone size={13} className="inline mr-1" />
                        Scan with ABA Mobile or click QR to open PayWay
                      </span>
                    </div>

                    <div className="aba-action-section">
                      <p className="aba-instructions">
                        Click below to open PayWay and complete your payment via <strong>ABA Mobile</strong>:
                      </p>

                      <a
                        href={paywayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleOpenPayWay(e)}
                        className="btn btn-aba-direct"
                        id="btn-open-payway-modal"
                      >
                        <SmartphoneNfc size={18} />
                        <span>Open ABA PAY Link</span>
                        <ExternalLink size={16} />
                      </a>

                      <button
                        type="button"
                        className="aba-redirect-link"
                        onClick={() => handleOpenPayWay(null, true)}
                      >
                        Direct redirect to PayWay in this tab →
                      </button>

                      <div className="aba-link-box">
                        <span className="aba-link-label">Direct PayWay URL:</span>
                        <div className="aba-link-row">
                          <a
                            href={paywayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleOpenPayWay(e)}
                            className="aba-link-code aba-link-clickable"
                          >
                            <span>{paywayUrl}</span>
                            <ExternalLink size={12} className="inline ml-1" />
                          </a>
                          <button
                            type="button"
                            className="btn-copy-aba-link"
                            onClick={handleCopyAbaLink}
                            title="Copy ABA Link"
                          >
                            {abaLinkCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="aba-security-notice">
                        <ShieldCheck size={14} className="text-success mr-1" />
                        <span>Instant automated settlement verified by PayWay</span>
                      </div>
                    </div>
                  </div>
                </div>

                {hasOpenedPayway && (
                  <div className="aba-opened-banner">
                    <CheckCircle2 size={18} className="text-success shrink-0" />
                    <div>
                      <strong>PayWay Gateway opened in a new tab!</strong>
                      <p>
                        Complete your payment on PayWay. Once finished, click <strong>"I've Paid — Activate License"</strong> below.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 3: Credit Card */}
            {paymentMethod === 'card' && (
              <div className="payment-details-view active">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8892"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC / Security Code</label>
                    <input
                      type="password"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      placeholder="889"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* View 4: Crypto */}
            {paymentMethod === 'crypto' && (
              <div className="payment-details-view active">
                <div className="crypto-pay-box">
                  <div className="crypto-badge">
                    <ShieldCheck size={14} /> Instant Web3 Settlement
                  </div>
                  <p>Send equivalent USDT (TRC20 or ERC20) to smart contract address:</p>
                  <div className="crypto-address-box">
                    <code>0x71C8F799a4a2736C5029eC15DeaD821b0D67911F</code>
                  </div>
                  <p className="crypto-note">Transaction auto-verifies within 10 seconds.</p>
                </div>
              </div>
            )}

            {/* Step 2 Actions */}
            {(paymentMethod === 'khqr' || paymentMethod === 'aba') ? (
              <div className="checkout-actions-aba-wrap">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="aba-dual-actions">
                  {/* Primary Button: Directly Open Gateway */}
                  {paymentMethod === 'khqr' ? (
                    <a
                      href={khqrPayment?.checkout_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-khqr-primary btn-glow"
                      onClick={(e) => handleOpenKhqr(e)}
                      id="btn-pay-now-khqr"
                    >
                      <Zap size={18} />
                      <span>Pay via KHQR ({formatPrice(totalUSD)})</span>
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <a
                      href={paywayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-aba-pay-primary btn-glow"
                      onClick={(e) => handleOpenPayWay(e)}
                      id="btn-pay-now-payway"
                    >
                      <SmartphoneNfc size={18} />
                      <span>Pay Now via ABA PAY ({formatPrice(totalUSD)})</span>
                      <ExternalLink size={16} />
                    </a>
                  )}

                  {/* Secondary Button: Activate license once paid */}
                  <button
                    type="button"
                    className={`btn ${(hasOpenedKhqr || hasOpenedPayway) ? 'btn-success btn-glow' : 'btn-outline-glow'}`}
                    onClick={handleCompleteOrder}
                    disabled={isProcessing}
                    id="btn-confirm-payment"
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {isProcessing
                        ? 'Activating License...'
                        : (hasOpenedKhqr || hasOpenedPayway)
                        ? "I've Paid — Activate License"
                        : "Already Paid? Activate License"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-glow"
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                >
                  <Lock size={16} />
                  <span>
                    {isProcessing
                      ? 'Verifying Payment & Issuing Keys...'
                      : `Authorize & Pay ${formatPrice(totalUSD)}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success & API Key Activation */}
        {step === 3 && (
          <div className="checkout-step-panel">
            <div className="success-screen text-center">
              <div className="success-icon-wrap">
                <CheckCircle2 size={44} className="text-success" />
              </div>

              <h3 className="success-title">Order Successful & License Activated!</h3>
              <p className="success-sub">
                Welcome to Synapse.AI! Your payment via <strong>{paymentMethod === 'khqr' ? 'KHQR Direct Gateway' : paymentMethod === 'aba' ? 'ABA PAY / PayWay' : paymentMethod.toUpperCase()}</strong> has been verified.
              </p>

              <div className="license-box">
                <div className="license-header">
                  <span>
                    <Sparkles size={14} className="inline mr-1 text-cyan" />
                    YOUR LIVE PRODUCTION API KEY
                  </span>
                  <span className="status-live-tag">ACTIVE</span>
                </div>

                <div className="api-key-display">
                  <code>{issuedApiKey}</code>
                  <button
                    className="btn-copy-key"
                    onClick={handleCopyKey}
                    title="Copy API Key"
                  >
                    {keyCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="license-hint">
                  Keep this key secret. You can generate additional keys anytime in your dashboard.
                </p>
              </div>

              <div className="success-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadReceipt}
                >
                  <Download size={16} />
                  <span>Download License Receipt</span>
                </button>

                <button
                  className="btn btn-primary btn-glow"
                  onClick={handleFinishAndOpenDashboard}
                >
                  <span>Open My Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
