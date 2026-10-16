import React, { useState } from 'react';
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
  QrCode
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

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'crypto' | 'paypal'
  const [cardNumber, setCardNumber] = useState('4532 8920 1823 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCVC, setCardCVC] = useState('889');

  const [issuedApiKey, setIssuedApiKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      addToast('Please provide your name and email', 'error');
      return;
    }
    setStep(2);
  };

  const handleCompleteOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newKey = generateNewApiKey(`Production - ${customerCompany || customerName}`);
      setIssuedApiKey(newKey.key);
      setStep(3);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // graceful fallback
      }

      clearCart();
      addToast('🎉 Order confirmed! API Key activated.', 'success');
    }, 1200);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(issuedApiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
    addToast('API Key copied to clipboard!', 'info');
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `=====================================================
SYNAPSE.AI — OFFICIAL LICENSE & TAX INVOICE
=====================================================
Order ID: SYN-${Date.now().toString(36).toUpperCase()}
Date: ${new Date().toLocaleDateString()}
Customer: ${customerName} (${customerEmail})
Organization: ${customerCompany || 'Individual'}

ITEMS PURCHASED:
${cart.map((c) => `- ${c.name} (${formatPrice(c.price)})`).join('\n')}

TOTAL PAID: ${formatPrice(totalUSD)}
PAYMENT METHOD: ${paymentMethod.toUpperCase()} (VERIFIED)

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
            <p className="step-sub">End-to-end encrypted with 256-bit SSL certificate.</p>

            {/* Payment Method Selector */}
            <div className="payment-methods-tabs">
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('crypto')}
              >
                <QrCode size={18} />
                <span>Crypto (USDT / BTC)</span>
              </button>
            </div>

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
                    ? 'Encrypting & Authorizing...'
                    : `Authorize & Pay ${formatPrice(totalUSD)}`}
                </span>
              </button>
            </div>
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
                Welcome to Synapse.AI! Your API keys and cloud privileges have been created.
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
