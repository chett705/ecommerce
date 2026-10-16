import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' }
};

export function AppProvider({ children }) {
  // Cart state
  const [cart, setCart] = useState([
    {
      id: 'plan_pro',
      name: 'Pro AI Suite (Annual Subscription)',
      type: 'subscription',
      billing: 'annual',
      price: 588, // $49/mo * 12
      unitPriceMonthly: 49,
      quantity: 1,
      badge: 'All-Access Pass'
    }
  ]);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code: 'NEURON20', percent: 20 }
  const [promoMessage, setPromoMessage] = useState(null);

  // Currency
  const [currency, setCurrency] = useState('USD');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedToolModal, setSelectedToolModal] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // User Account State
  const [userSubscription, setUserSubscription] = useState({
    planName: 'Pro AI Suite (Annual)',
    planId: 'plan_pro',
    status: 'Active',
    renewsOn: 'October 16, 2027',
    tokensUsed: 3840000,
    tokenLimit: 15000000,
    gpuCredits: 'Unlimited (Turbo Priority)'
  });

  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key_1',
      name: 'Production Cloud Cluster',
      key: 'sk_synapse_live_98a7f1c90e2b45398ab7102e88a',
      created: 'Oct 12, 2026',
      status: 'Active',
      lastUsed: 'Just now'
    },
    {
      id: 'key_2',
      name: 'Local Dev & Testing',
      key: 'sk_synapse_test_54b3a8d11c8842109fe1299c104',
      created: 'Oct 14, 2026',
      status: 'Active',
      lastUsed: '4 hours ago'
    }
  ]);

  const [purchasedLicenses, setPurchasedLicenses] = useState([
    {
      id: 'lic_1',
      toolName: 'DeepCode Copilot Pro',
      licenseKey: 'LIC-DCP-9812-7801-XC',
      version: 'v4.5 Enterprise',
      date: 'Oct 15, 2026'
    }
  ]);

  // Format currency helper
  const formatPrice = (usdAmount) => {
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = usdAmount * cur.rate;
    return `${cur.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        addToast(`Increased quantity for ${item.name}`, 'info');
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      addToast(`Added "${item.name}" to cart!`, 'success');
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Promo code apply
  const applyPromo = (codeToTest) => {
    const code = (codeToTest || promoCode).trim().toUpperCase();
    if (code === 'NEURON20') {
      setAppliedDiscount({ code: 'NEURON20', percent: 20, type: 'percent' });
      setPromoMessage({ text: '20% discount applied successfully!', type: 'success' });
      addToast('🎉 Promo code NEURON20 applied: 20% OFF!', 'success');
    } else if (code === 'AIWELCOME') {
      setAppliedDiscount({ code: 'AIWELCOME', amount: 10, type: 'fixed' });
      setPromoMessage({ text: '$10 discount applied successfully!', type: 'success' });
      addToast('🎉 Promo code AIWELCOME applied: $10 OFF!', 'success');
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try NEURON20', type: 'error' });
      addToast('Invalid promo code. Use NEURON20', 'error');
    }
  };

  // Totals
  const subtotalUSD = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  let discountUSD = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percent') {
      discountUSD = (subtotalUSD * appliedDiscount.percent) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      discountUSD = Math.min(subtotalUSD, appliedDiscount.amount);
    }
  }
  const totalUSD = Math.max(0, subtotalUSD - discountUSD);

  // Generate new API Key
  const generateNewApiKey = (name = 'New Production Key') => {
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newKey = {
      id: `key_${Date.now()}`,
      name: name,
      key: `sk_synapse_live_${randomHex}`,
      created: 'Just now',
      status: 'Active',
      lastUsed: 'Never'
    };
    setApiKeys((prev) => [newKey, ...prev]);
    addToast(`Generated new API key: ${name}`, 'success');
    return newKey;
  };

  const revokeApiKey = (keyId) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    addToast('API key revoked successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        promoCode,
        setPromoCode,
        appliedDiscount,
        applyPromo,
        promoMessage,
        currency,
        setCurrency,
        formatPrice,
        subtotalUSD,
        discountUSD,
        totalUSD,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAccountOpen,
        setIsAccountOpen,
        selectedToolModal,
        setSelectedToolModal,
        toasts,
        addToast,
        removeToast,
        userSubscription,
        setUserSubscription,
        apiKeys,
        generateNewApiKey,
        revokeApiKey,
        purchasedLicenses,
        setPurchasedLicenses
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
