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
  Info,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';


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

  // Payment Method: 'khqr' (Cambodia National KHQR Gateway) | 'card' | 'crypto'
  const [paymentMethod, setPaymentMethod] = useState('khqr');

  // Activation Link State (Published by Admin)
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activationLink, setActivationLink] = useState('');
  const [activationNote, setActivationNote] = useState('');
  const [activationLinkCopied, setActivationLinkCopied] = useState(false);

  // KHQR Direct Gateway Dynamic Payment State
  const [khqrPayment, setKhqrPayment] = useState(null);
  const [khqrLoading, setKhqrLoading] = useState(false);
  const [khqrIframeLoading, setKhqrIframeLoading] = useState(true);
  const [khqrError, setKhqrError] = useState(null);
  const [hasOpenedKhqr, setHasOpenedKhqr] = useState(false);
  const [txCopied, setTxCopied] = useState(false);

  // Credit card state
  const [cardNumber, setCardNumber] = useState('4532 8920 1823 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCVC, setCardCVC] = useState('889');

  const [issuedApiKey, setIssuedApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);


  // Generate dynamic signed payment for KHQR
  const generateKhqrPayment = async () => {
    if (totalUSD <= 0) return;
    setKhqrLoading(true);
    setKhqrError(null);
    setKhqrIframeLoading(true);

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
        if (data.order) {
          setCurrentOrder(data.order);
        }
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

  // Real-time polling for admin's published activation link while in Step 3
  useEffect(() => {
    if (step !== 3 || !currentOrder?.id || activationLink) return;

    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${currentOrder.id}`);
        const data = await res.json();
        if (data.success && data.order?.activation_link) {
          setActivationLink(data.order.activation_link);
          if (data.order.activation_note) {
            setActivationNote(data.order.activation_note);
          }
          addToast('🎉 Admin has published your Activation Link!', 'success');
          try {
            confetti({
              particleCount: 160,
              spread: 100,
              origin: { y: 0.5 }
            });
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Activation link poll check:', err);
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [step, currentOrder?.id, activationLink]);

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
    addToast('🚀 Opening Cambodia National KHQR gateway...', 'info');

    if (redirect) {
      window.location.href = khqrPayment.checkout_url;
    } else {
      const win = window.open(khqrPayment.checkout_url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = khqrPayment.checkout_url;
      }
    }
  };


  const handleCopyTxId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setTxCopied(true);
    setTimeout(() => setTxCopied(false), 2000);
    addToast('Transaction ID copied!', 'info');
  };


  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    const fallbackKey = generateNewApiKey(`Production - ${customerCompany || customerName}`);
    let finalKey = fallbackKey.key;

    const activeTxId = paymentMethod === 'khqr' ? khqrPayment?.transaction_id : null;
    const orderNum = activeTxId || `SYN-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const activePaymentTitle = paymentMethod === 'khqr'
      ? 'KHQR Direct Gateway'
      : paymentMethod === 'card'
        ? 'Credit Card'
        : 'Crypto';

    const localOrder = {
      id: orderNum,
      order_number: orderNum,
      customer_name: customerName,
      customerName: customerName,
      customer_email: customerEmail,
      customerEmail: customerEmail,
      company: customerCompany,
      items: cart.map((c) => c.name),
      amount: totalUSD,
      payment_method: activePaymentTitle,
      paymentMethod: activePaymentTitle,
      merchant_name: 'BUNTHOEUN CHETRA',
      status: 'Verified',
      api_key: finalKey,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    // Send order to backend API
    try {
      if (activeTxId) {
        const res = await fetch(`/api/payment/khqr/verify/${activeTxId}?confirm=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.api_key) {
            finalKey = data.api_key;
          }
          if (data.order) {
            setCurrentOrder({ ...localOrder, ...data.order });
            if (data.order.activation_link) {
              setActivationLink(data.order.activation_link);
            }
          } else {
            setCurrentOrder(localOrder);
          }
        } else {
          setCurrentOrder(localOrder);
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
            paymentMethod: activePaymentTitle,
            status: 'Verified'
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.apiKey) finalKey = data.apiKey;
          if (data.order) {
            setCurrentOrder({ ...localOrder, ...data.order });
            if (data.order.activation_link) {
              setActivationLink(data.order.activation_link);
            }
          } else {
            setCurrentOrder(localOrder);
          }
        } else {
          setCurrentOrder(localOrder);
        }
      }
    } catch (err) {
      console.warn('Backend order sync warning:', err);
      setCurrentOrder(localOrder);
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

  const handleDownloadReceipt = () => {
    const activeTxId = paymentMethod === 'khqr' ? khqrPayment?.transaction_id : `SYN-${Date.now().toString(36).toUpperCase()}`;
    const activeHash = paymentMethod === 'khqr' ? (khqrPayment?.hash || 'SHA-1 VERIFIED') : 'VERIFIED';
    const paymentMethodDisplay = paymentMethod === 'khqr'
      ? `KHQR DIRECT GATEWAY (TX: ${khqrPayment?.transaction_id || 'N/A'})`
      : paymentMethod.toUpperCase();

    const receiptContent = `=====================================================
SYNAPSE.AI — OFFICIAL LICENSE & TAX INVOICE
=====================================================
Order ID: ${activeTxId}
Date: ${new Date().toLocaleDateString()}
Customer: ${customerName} (${customerEmail})
Organization: ${customerCompany || 'Individual'}

ITEMS PURCHASED:
${cart.map((c) => `- ${c.name} (${formatPrice(c.price)})`).join('\n')}

TOTAL PAID: ${formatPrice(totalUSD)}
PAYMENT METHOD: ${paymentMethodDisplay} (VERIFIED)
GATEWAY SIGNATURE: ${activeHash}

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
            <p className="step-sub">Pay instantly via KHQR (ABA Mobile & All Cambodian Banks), Card, or Crypto.</p>

            {/* Payment Method Selector */}
            <div className="payment-methods-tabs">
              {/* Tab 1: KHQR Gateway */}
              <button
                type="button"
                className={`payment-tab payment-tab-khqr ${paymentMethod === 'khqr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('khqr')}
                id="tab-payment-khqr"
              >
                <div className="khqr-mini-badge">KHQR</div>
                <span className="payment-tab-title">KHQR Gateway</span>
                <span className="badge-khqr-hot">Bakong / All Banks</span>
              </button>

              {/* Tab 3: Credit Card */}
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                id="tab-payment-card"
              >
                <CreditCard size={18} />
                <span>Credit Card</span>
              </button>

              {/* Tab 4: Crypto */}
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('crypto')}
                id="tab-payment-crypto"
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
                          {khqrIframeLoading && (
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
                            onLoad={() => setKhqrIframeLoading(false)}
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
                            Scan the official dynamic KHQR code with <strong>ABA Mobile</strong>, <strong>Bakong</strong>, or any Cambodian mobile banking app:
                          </p>

                          <div className="khqr-action-buttons-stack">
                            <a
                              href={khqrPayment.checkout_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-khqr-primary btn-glow"
                              onClick={(e) => handleOpenKhqr(e)}
                              id="btn-pay-now-khqr"
                            >
                              <Zap size={18} />
                              <span>Open Fullscreen KHQR Gateway</span>
                              <ExternalLink size={16} />
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
                            <strong className="text-cyan">{khqrPayment.merchant_name || 'dyzz'} (Verified)</strong>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Transaction ID:</span>
                            <div className="spec-val-wrap">
                              <code className="spec-code">{khqrPayment.transaction_id}</code>
                              <button
                                type="button"
                                className="btn-copy-spec"
                                onClick={() => handleCopyTxId(khqrPayment.transaction_id)}
                                title="Copy Transaction ID"
                              >
                                {txCopied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Security Hash (SHA-1):</span>
                            <div className="spec-val-wrap">
                              <code className="spec-code hash-code">{khqrPayment.hash}</code>
                              <button
                                type="button"
                                className="btn-copy-spec"
                                onClick={() => {
                                  navigator.clipboard.writeText(khqrPayment.hash);
                                  addToast('Security Hash copied!', 'info');
                                }}
                                title="Copy Hash"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="khqr-spec-row">
                            <span className="spec-label">Profile ID:</span>
                            <code className="spec-code">{khqrPayment.profile_id}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {hasOpenedKhqr && (
                  <div className="khqr-opened-banner">
                    <CheckCircle2 size={18} className="text-cyan shrink-0" />
                    <div>
                      <strong>KHQR Gateway opened in a new tab!</strong>
                      <p>
                        Complete your payment on the gateway. Once finished, click <strong>"I've Paid — Activate License"</strong> below.
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
            {paymentMethod === 'khqr' ? (
              <div className="checkout-actions-aba-wrap">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="aba-dual-actions">
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

                  <button
                    type="button"
                    className={`btn ${hasOpenedKhqr ? 'btn-success btn-glow' : 'btn-outline-glow'}`}
                    onClick={handleCompleteOrder}
                    disabled={isProcessing}
                    id="btn-confirm-payment"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" />
                        <span>Activating License...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>
                          {hasOpenedKhqr
                            ? "I've Paid — Activate License"
                            : "Already Paid? Activate License"}
                        </span>
                      </>
                    )}
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

              <h3 className="success-title">Order Successful & Verified!</h3>
              <p className="success-sub">
                Welcome to Synapse.AI! Your payment via <strong>{paymentMethod === 'khqr' ? 'KHQR Direct Gateway' : paymentMethod.toUpperCase()}</strong> has been recorded.
              </p>

              {/* Dedicated Customer Activation Link Box */}
              {activationLink ? (
                <div className="activation-link-ready-box">
                  <div className="activation-ready-header">
                    <span className="badge-activated-live">
                      <Sparkles size={13} className="inline mr-1" /> ACTIVATION LINK READY
                    </span>
                    <span className="live-verified-dot"></span>
                  </div>
                  <h4 className="activation-ready-title">Your Dedicated Workspace Activation Link</h4>
                  <p className="activation-ready-desc">
                    {activationNote || 'Your membership is authorized. Click below to launch your platform workspace.'}
                  </p>

                  <div className="activation-url-display-row">
                    <a
                      href={activationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="activation-direct-link"
                      title="Open Activation Link"
                    >
                      <span>{activationLink}</span>
                      <ExternalLink size={14} className="inline ml-1 shrink-0" />
                    </a>
                    <button
                      type="button"
                      className="btn-copy-activation-link"
                      onClick={() => {
                        navigator.clipboard.writeText(activationLink);
                        setActivationLinkCopied(true);
                        setTimeout(() => setActivationLinkCopied(false), 2000);
                        addToast('Activation link copied to clipboard!', 'info');
                      }}
                      title="Copy Activation Link"
                    >
                      {activationLinkCopied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                    </button>
                  </div>

                  <a
                    href={activationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-glow btn-full mt-3"
                    id="btn-open-activation-link"
                  >
                    <Zap size={16} />
                    <span>Launch & Activate Your Account Now →</span>
                  </a>
                </div>
              ) : (
                <div className="activation-link-pending-box">
                  <div className="activation-pending-header">
                    <span className="badge-pending-activation">
                      <Clock size={13} className="inline mr-1 spin-subtle" /> AWAITING ADMIN ACTIVATION LINK
                    </span>
                    <span className="order-ref-pill">Order #{currentOrder?.order_number || 'SYN-ORD'}</span>
                  </div>
                  <h4 className="activation-pending-title">Payment Confirmed — Admin Alerted!</h4>
                  <p className="activation-pending-desc">
                    The store admin has received an alert for your order. Your custom activation link is being prepared and will appear right here automatically.
                  </p>
                  <div className="activation-radar-pulse">
                    <span className="radar-circle"></span>
                    <span className="radar-text">Listening for admin link in real time...</span>
                  </div>
                </div>
              )}


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
