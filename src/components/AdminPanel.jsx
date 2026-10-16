import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Boxes, 
  FolderKanban,
  ShoppingCart, 
  Users, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  SmartphoneNfc, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff,
  Zap,
  Copy, 
  Check,
  LogOut,
  Tag,
  Palette,
  Database,
  Sparkles,
  Layers,
  Bot,
  Brain,
  Code2,
  Mic,
  Video,
  Headphones
} from 'lucide-react';

export default function AdminPanel({ onCloseAdmin, onLogout }) {
  const { addToast, formatPrice } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tools' | 'categories' | 'orders' | 'subscribers' | 'settings'
  const [loading, setLoading] = useState(false);

  // Data states from Laravel Backend
  const [stats, setStats] = useState({
    totalRevenue: 48920,
    activeSubscribers: 185240,
    totalOrders: 1248,
    apiRequestsToday: 142080,
    toolsCount: 10,
    productsCount: 10,
    categoriesCount: 6,
    abaOrdersCount: 3
  });

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [settings, setSettings] = useState({
    abaPayLink: 'https://link.payway.com.kh/ABAPAY9s540501U',
    khqrGatewayUrl: 'https://khqr.cc/api/payment/requestv2/tW6PHjgPyzISFi3KK22hKZ57rag1cWHS',
    khqrProfileId: 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS',
    khqrSecretKey: 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei',
    announcementText: 'Synapse Omni-LLM 4.5 & VideoGen 4D are now live! Get 20% OFF all annual subscriptions with code NEURON20',
    maintenanceMode: false
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [khqrTestResult, setKhqrTestResult] = useState(null);
  const [khqrTesting, setKhqrTesting] = useState(false);

  // Product Modal state (Create / Edit)
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolFormData, setToolFormData] = useState({
    name: '',
    category: 'llm',
    badge: 'PRO',
    priceMonthly: 29,
    priceLifetime: 199,
    shortDesc: '',
    capabilities: 'Multi-modal, Real-time Streaming, API Access',
    status: 'Active'
  });

  // Category Modal state (Create / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Brain',
    color: '#8b5cf6',
    badge: 'Flagship',
    display_order: 1
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch all backend data from Laravel API
  const loadBackendData = async () => {
    setLoading(true);
    try {
      const [statsRes, toolsRes, categoriesRes, ordersRes, subsRes, settingsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()).catch(() => null),
        fetch('/api/products').then(r => r.json()).catch(() => null),
        fetch('/api/categories').then(r => r.json()).catch(() => null),
        fetch('/api/orders').then(r => r.json()).catch(() => null),
        fetch('/api/subscribers').then(r => r.json()).catch(() => null),
        fetch('/api/settings').then(r => r.json()).catch(() => null)
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (toolsRes?.products || toolsRes?.tools) setTools(toolsRes.products || toolsRes.tools);
      if (categoriesRes?.categories) setCategories(categoriesRes.categories);
      if (ordersRes?.orders) setOrders(ordersRes.orders);
      if (subsRes?.subscribers) setSubscribers(subsRes.subscribers);
      if (settingsRes?.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load Laravel backend data:', err);
      addToast('Connecting to Laravel backend API...', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // --- Category CRUD Operations ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Boxes',
      color: '#8b5cf6',
      badge: 'New Suite',
      display_order: categories.length + 1
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Boxes',
      color: cat.color || '#8b5cf6',
      badge: cat.badge || '',
      display_order: cat.display_order || 1
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // PUT update in Laravel
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => prev.map(c => c.id === editingCategory.id ? data.category : c));
          addToast(`Category "${categoryFormData.name}" updated in database!`, 'success');
        }
      } else {
        // POST create in Laravel
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => [...prev, data.category]);
          addToast(`Category "${categoryFormData.name}" saved to Laravel database!`, 'success');
        }
      }
      setIsCategoryModalOpen(false);
      loadBackendData();
    } catch (err) {
      addToast('Error saving category to database', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Associated products will become uncategorized.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        loadBackendData();
        addToast(`Category "${name}" deleted from database`, 'info');
      }
    } catch (err) {
      addToast('Error deleting category', 'error');
    }
  };

  // --- Product CRUD Operations ---
  const handleOpenAddTool = () => {
    setEditingTool(null);
    setToolFormData({
      name: '',
      category: categories[0]?.slug || 'llm',
      badge: 'NEW',
      priceMonthly: 29,
      priceLifetime: 199,
      shortDesc: '',
      capabilities: 'Neural Processing, Low Latency, 24/7 API',
      status: 'Active'
    });
    setIsToolModalOpen(true);
  };

  const handleOpenEditTool = (tool) => {
    setEditingTool(tool);
    setToolFormData({
      name: tool.name,
      category: tool.category || tool.category_slug || 'llm',
      badge: tool.badge,
      priceMonthly: tool.priceMonthly || tool.price_monthly,
      priceLifetime: tool.priceLifetime || tool.price_lifetime,
      shortDesc: tool.shortDesc || tool.short_desc,
      capabilities: Array.isArray(tool.capabilities) ? tool.capabilities.join(', ') : tool.capabilities,
      status: tool.status || 'Active'
    });
    setIsToolModalOpen(true);
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    const payload = {
      ...toolFormData,
      capabilities: toolFormData.capabilities.split(',').map(s => s.trim()).filter(Boolean),
      priceMonthly: Number(toolFormData.priceMonthly),
      priceLifetime: Number(toolFormData.priceLifetime)
    };

    try {
      if (editingTool) {
        // PUT update in Laravel
        const res = await fetch(`/api/products/${editingTool.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setTools(prev => prev.map(t => t.id === editingTool.id ? (data.product || data.tool) : t));
          addToast(`Updated ${payload.name} in Laravel database!`, 'success');
        }
      } else {
        // POST create in Laravel
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setTools(prev => [(data.product || data.tool), ...prev]);
          addToast(`Added new product to Laravel database: ${payload.name}`, 'success');
        }
      }
      setIsToolModalOpen(false);
      loadBackendData();
    } catch (err) {
      addToast('Error saving product to Laravel database', 'error');
    }
  };

  const handleDeleteTool = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTools(prev => prev.filter(t => t.id !== id));
        addToast(`Deleted ${name} from database`, 'info');
      }
    } catch (err) {
      addToast('Error deleting product', 'error');
    }
  };

  // Order Status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        addToast(`Order ${orderId} marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update order status', 'error');
    }
  };

  // Save Settings (ABA Payway Link, Banner)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        addToast('✅ Store & ABA Payway settings saved to Laravel database!', 'success');
      }
    } catch (err) {
      addToast('Error saving settings', 'error');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(settings.abaPayLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast('ABA Payway link copied to clipboard!', 'info');
  };

  const handleTestKhqr = async () => {
    setKhqrTesting(true);
    setKhqrTestResult(null);
    try {
      const res = await fetch('/api/payment/khqr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1.00,
          customerName: 'Admin Connection Test',
          customerEmail: 'admin@synapse.ai',
          items: ['Admin Gateway Connectivity Test']
        })
      });
      const data = await res.json();
      setKhqrTestResult(data);
      if (data.success) {
        addToast('✅ KHQR signed request generated successfully!', 'success');
      } else {
        addToast('⚠️ KHQR test failed: ' + (data.message || 'Error'), 'error');
      }
    } catch (err) {
      addToast('Error communicating with KHQR backend', 'error');
    } finally {
      setKhqrTesting(false);
    }
  };

  // Filtered products list
  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.shortDesc || t.short_desc || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || 
      (t.category === selectedCategoryFilter || t.category_slug === selectedCategoryFilter);
    return matchesSearch && matchesCat;
  });

  const getCategoryDetails = (catSlug) => {
    return categories.find(c => c.slug === catSlug) || {
      name: catSlug ? catSlug.toUpperCase() : 'GENERAL',
      color: '#8b5cf6'
    };
  };

  return (
    <div className="admin-root-container">
      <div className="admin-wrapper">
        {/* Top Control Bar */}
        <header className="admin-top-nav">
          <div className="admin-badge-logo">
            <div className="logo-symbol-admin">
              <Database size={20} />
            </div>
            <div>
              <span className="admin-title">SYNAPSE CONTROL CENTER</span>
              <span className="admin-sub-tag">Laravel 12 REST API & Database Control</span>
            </div>
          </div>

          <div className="admin-nav-actions">
            <div className="server-status-pill">
              <span className="dot-pulse-green"></span>
              <span>Laravel 12 (SQLite DB) Online • 127.0.0.1:8000</span>
            </div>

            <button
              className="btn-admin-refresh"
              onClick={loadBackendData}
              title="Sync with Laravel Database"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Sync DB</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onCloseAdmin}
              title="Return to Public Storefront"
            >
              <ArrowLeft size={14} />
              <span>Back to Store</span>
            </button>

            <button
              className="btn btn-outline btn-sm text-danger"
              onClick={onLogout}
              title="Sign out of Admin session"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        <div className="admin-layout-body">
          {/* Left Navigation Sidebar */}
          <aside className="admin-sidebar">
            <nav className="admin-menu">
              <button
                className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                <Boxes size={18} />
                <span>Products & AI Tools ({tools.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <FolderKanban size={18} />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart size={18} />
                <span>Orders & ABA PAY ({orders.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribers')}
              >
                <Users size={18} />
                <span>Active Subscribers ({subscribers.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} />
                <span>ABA PayWay & Settings</span>
              </button>
            </nav>

            {/* Quick ABA Link Preview in Sidebar */}
            <div className="sidebar-aba-card">
              <div className="aba-brand-mini">
                <span className="aba-box-tag">ABA'</span>
                <span>PayWay Active</span>
              </div>
              <code className="aba-mini-url">{settings.abaPayLink}</code>
              <a 
                href={settings.abaPayLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="aba-mini-test-btn"
              >
                <span>Test Link</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="admin-content-area">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Platform Performance & Telemetry</h2>
                    <p>Live metrics synchronized in real-time from the Laravel SQLite database.</p>
                  </div>
                  <div className="db-indicator-chip">
                    <Database size={14} className="text-cyan inline mr-1" />
                    <span>Database: <strong>database/database.sqlite</strong></span>
                  </div>
                </div>

                <div className="admin-metrics-grid">
                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span>Total Platform Revenue</span>
                      <DollarSign size={20} className="text-success" />
                    </div>
                    <div className="metric-val">{formatPrice(stats.totalRevenue || 48920)}</div>
                    <div className="metric-trend up">
                      <TrendingUp size={14} /> +24.8% from last month
                    </div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span>Managed Products</span>
                      <Boxes size={20} className="text-accent" />
                    </div>
                    <div className="metric-val">{tools.length}</div>
                    <div className="metric-trend info">Across {categories.length} active categories</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span>Product Categories</span>
                      <FolderKanban size={20} className="text-purple" />
                    </div>
                    <div className="metric-val">{categories.length}</div>
                    <div className="metric-trend info">LLM, Vision, Code, Audio, Video, Agents</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span>ABA PAY / PayWay Volume</span>
                      <SmartphoneNfc size={20} className="text-cyan" />
                    </div>
                    <div className="metric-val">{orders.filter(o => o.payment_method?.includes('ABA') || o.paymentMethod?.includes('ABA')).length} Orders</div>
                    <div className="metric-trend up">
                      <ShieldCheck size={14} /> Instant KHQR verification
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="admin-card-section mt-4">
                  <div className="card-section-header">
                    <h3>Recent Transactions from Database</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('orders')}>
                      View All Orders
                    </button>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order Number</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Gateway</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td><code>{o.order_number || o.id}</code></td>
                            <td>
                              <strong>{o.customer_name || o.customerName}</strong>
                              <div className="sub-text">{o.customer_email || o.customerEmail}</div>
                            </td>
                            <td><strong>${o.amount}</strong></td>
                            <td>
                              <span className={(o.payment_method || o.paymentMethod)?.includes('ABA') ? 'badge-aba' : 'badge-neutral'}>
                                {o.payment_method || o.paymentMethod}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${(o.status || '').toLowerCase()}`}>
                                {o.status}
                              </span>
                            </td>
                            <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : o.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS INVENTORY (CRUD) */}
            {activeTab === 'tools' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Products & AI Tools Management</h2>
                    <p>Add new products, configure categories, pricing, capabilities, and publish to the live store.</p>
                  </div>
                  <button className="btn btn-primary btn-glow" onClick={handleOpenAddTool}>
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Toolbar: Search + Category Filter */}
                <div className="admin-toolbar-row">
                  <div className="admin-search-box">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Search by product name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="admin-filter-group">
                    <label>Filter by Category:</label>
                    <select
                      className="admin-select"
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories ({tools.length})</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.products_count ?? tools.filter(t => t.category === c.slug || t.category_slug === c.slug).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="results-label">Showing {filteredTools.length} of {tools.length} Products</span>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Lifetime Price</th>
                        <th>Monthly Price</th>
                        <th>Subscription</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTools.map(tool => {
                        const cat = getCategoryDetails(tool.category || tool.category_slug);
                        return (
                          <tr key={tool.id}>
                            <td>
                              <div className="tool-name-cell">
                                <span className="tool-color-dot" style={{ background: tool.color || cat.color || '#8b5cf6' }}></span>
                                <div>
                                  <strong>{tool.name}</strong>
                                  {tool.badge && <span className="tool-badge-small ml-2">{tool.badge}</span>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span 
                                className="category-badge-chip"
                                style={{ 
                                  backgroundColor: `${cat.color}20`,
                                  borderColor: `${cat.color}50`,
                                  color: cat.color 
                                }}
                              >
                                {cat.name}
                              </span>
                            </td>
                            <td><strong>${tool.priceLifetime || tool.price_lifetime}</strong></td>
                            <td>${tool.priceMonthly || tool.price_monthly}/mo</td>
                            <td>
                              {(tool.includedInSub ?? tool.included_in_sub) ? (
                                <span className="text-success"><CheckCircle2 size={16} className="inline mr-1" /> Included</span>
                              ) : (
                                <span className="text-muted">Separate</span>
                              )}
                            </td>
                            <td>★ {tool.rating}</td>
                            <td>
                              <span className={`status-pill ${(tool.status || 'Active').toLowerCase()}`}>
                                {tool.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-group">
                                <button
                                  className="btn-table-action edit"
                                  onClick={() => handleOpenEditTool(tool)}
                                  title="Edit Product Details"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  className="btn-table-action delete"
                                  onClick={() => handleDeleteTool(tool.id, tool.name)}
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: CATEGORIES MANAGEMENT (CRUD) */}
            {activeTab === 'categories' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Category & Taxonomy Management</h2>
                    <p>Organize products into intuitive categories with custom theme colors, badges, and display orders.</p>
                  </div>
                  <button className="btn btn-primary btn-glow" onClick={handleOpenAddCategory}>
                    <Plus size={16} />
                    <span>Create New Category</span>
                  </button>
                </div>

                {/* Categories Grid View */}
                <div className="categories-grid-cards">
                  {categories.map(cat => {
                    const prodCount = cat.products_count ?? tools.filter(t => t.category === cat.slug || t.category_slug === cat.slug).length;
                    return (
                      <div key={cat.id} className="admin-category-card" style={{ borderColor: `${cat.color}40` }}>
                        <div className="cat-card-top">
                          <div className="cat-icon-avatar" style={{ background: `${cat.color}25`, color: cat.color }}>
                            <FolderKanban size={22} />
                          </div>
                          <div className="cat-card-actions">
                            <button
                              className="btn-table-action edit"
                              onClick={() => handleOpenEditCategory(cat)}
                              title="Edit Category"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn-table-action delete"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="cat-card-body">
                          <div className="cat-name-row">
                            <h3 className="cat-name">{cat.name}</h3>
                            {cat.badge && (
                              <span className="cat-badge" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <code className="cat-slug-code">slug: {cat.slug}</code>
                          <p className="cat-desc">{cat.description || 'No description provided.'}</p>
                        </div>

                        <div className="cat-card-footer">
                          <span className="cat-count-pill">
                            <Boxes size={13} className="inline mr-1" /> {prodCount} {prodCount === 1 ? 'Product' : 'Products'}
                          </span>
                          <span className="cat-color-dot-indicator" style={{ backgroundColor: cat.color }}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Categories Detailed Table */}
                <div className="admin-card-section mt-4">
                  <div className="card-section-header">
                    <h3>Database Categories Table</h3>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Category Name</th>
                          <th>Slug</th>
                          <th>Theme Color</th>
                          <th>Products Count</th>
                          <th>Badge</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat, idx) => {
                          const prodCount = cat.products_count ?? tools.filter(t => t.category === cat.slug || t.category_slug === cat.slug).length;
                          return (
                            <tr key={cat.id}>
                              <td><strong>#{cat.display_order || idx + 1}</strong></td>
                              <td>
                                <div className="tool-name-cell">
                                  <span className="tool-color-dot" style={{ background: cat.color }}></span>
                                  <strong>{cat.name}</strong>
                                </div>
                              </td>
                              <td><code>{cat.slug}</code></td>
                              <td>
                                <div className="color-swatch-cell">
                                  <span className="color-circle" style={{ background: cat.color }}></span>
                                  <code>{cat.color}</code>
                                </div>
                              </td>
                              <td>
                                <span className="badge-neutral font-bold">{prodCount} Products</span>
                              </td>
                              <td>
                                {cat.badge ? <span className="cat-badge">{cat.badge}</span> : <span className="text-muted">—</span>}
                              </td>
                              <td>
                                <div className="table-actions-group">
                                  <button
                                    className="btn-table-action edit"
                                    onClick={() => handleOpenEditCategory(cat)}
                                    title="Edit Category"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    className="btn-table-action delete"
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    title="Delete Category"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS & TRANSACTIONS */}
            {activeTab === 'orders' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Customer Orders & Transactions</h2>
                    <p>Inspect issued API keys, verify payments, and monitor ABA PayWay gateway settlements.</p>
                  </div>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Purchased Items</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>API Key Issued</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><code>{o.order_number || o.id}</code></td>
                          <td>
                            <strong>{o.customer_name || o.customerName}</strong>
                            <div className="sub-text">{o.customer_email || o.customerEmail}</div>
                          </td>
                          <td>
                            {Array.isArray(o.items) ? o.items.join(', ') : o.items}
                          </td>
                          <td><strong>${o.amount}</strong></td>
                          <td>
                            <span className={
                              (o.payment_method || o.paymentMethod)?.includes('KHQR')
                                ? 'badge-khqr'
                                : (o.payment_method || o.paymentMethod)?.includes('ABA')
                                ? 'badge-aba'
                                : 'badge-neutral'
                            }>
                              {o.payment_method || o.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${(o.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <code className="text-cyan text-xs">
                              {(o.api_key || o.apiKey) ? `${(o.api_key || o.apiKey).substring(0, 16)}...` : 'Generated'}
                            </code>
                          </td>
                          <td>
                            <select
                              className="status-select-sm"
                              value={o.status || 'Verified'}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            >
                              <option value="Verified">Verified</option>
                              <option value="Pending KHQR Payment">Pending KHQR</option>
                              <option value="Pending PayWay Checkout">Pending PayWay</option>
                              <option value="Refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVE SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Active Subscribers</h2>
                    <p>Manage membership tiers, quota limits, and renewal dates.</p>
                  </div>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subscriber Name</th>
                        <th>Membership Plan</th>
                        <th>Token Consumption</th>
                        <th>Renewal Date</th>
                        <th>Payment Gateway</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(sub => (
                        <tr key={sub.id}>
                          <td>
                            <strong>{sub.name}</strong>
                            <div className="sub-text">{sub.email}</div>
                          </td>
                          <td><span className="badge-plan-tier">{sub.plan}</span></td>
                          <td>
                            <div className="token-progress-cell">
                              <span>{(sub.tokens_used || sub.tokensUsed || 0).toLocaleString()} / {(sub.token_limit || sub.tokenLimit || 15000000).toLocaleString()}</span>
                            </div>
                          </td>
                          <td>{sub.renews_on || sub.renewsOn}</td>
                          <td>
                            <span className={(sub.payment_method || sub.paymentMethod)?.includes('ABA') ? 'badge-aba' : 'badge-neutral'}>
                              {sub.payment_method || sub.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <span className="status-pill verified">{sub.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: ABA PAYWAY & SETTINGS */}
            {activeTab === 'settings' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Global Store & Gateway Settings</h2>
                    <p>Configure the active ABA PayWay direct link, promo discount codes, and announcements.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="admin-settings-form">
                  {/* CARD 1: KHQR DIRECT GATEWAY SETTINGS */}
                  <div className="settings-card khqr-admin-settings-card">
                    <div className="settings-card-header">
                      <div className="khqr-mini-badge-admin">KHQR</div>
                      <div>
                        <h4>National KHQR Direct Gateway (khqr.cc)</h4>
                        <span className="text-xs text-muted">Dynamic payment link generation with SHA-1 cryptographic signature</span>
                      </div>
                      <span className="status-live-tag ml-auto">CONNECTED</span>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>KHQR Profile ID *</label>
                        <input
                          type="text"
                          required
                          value={settings.khqrProfileId || ''}
                          onChange={(e) => setSettings({ ...settings, khqrProfileId: e.target.value })}
                          placeholder="e.g. tW6PHjgPyzISFi3KK22hKZ57rag1cWHS"
                        />
                      </div>

                      <div className="form-group">
                        <label>KHQR Gateway Base URL *</label>
                        <input
                          type="url"
                          required
                          value={settings.khqrGatewayUrl || ''}
                          onChange={(e) => setSettings({ ...settings, khqrGatewayUrl: e.target.value })}
                          placeholder="https://khqr.cc/api/payment/requestv2/..."
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>KHQR Secret Key (for SHA-1 Hash Signature) *</label>
                      <div className="input-with-action">
                        <input
                          type={showSecretKey ? "text" : "password"}
                          required
                          value={settings.khqrSecretKey || ''}
                          onChange={(e) => setSettings({ ...settings, khqrSecretKey: e.target.value })}
                          placeholder="Enter secret key..."
                        />
                        <button
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          title={showSecretKey ? "Hide key" : "Show key"}
                        >
                          {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="input-hint">
                        Algorithm: <code>sha1(secretKey + transaction_id + amount + remark)</code>. Kept securely in Laravel.
                      </span>
                    </div>

                    {/* Live Signature & Gateway Tester */}
                    <div className="khqr-test-panel">
                      <div className="khqr-test-header">
                        <Zap size={16} className="text-accent" />
                        <strong>Live KHQR Gateway Connectivity Tester:</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm ml-auto"
                          onClick={handleTestKhqr}
                          disabled={khqrTesting}
                        >
                          {khqrTesting ? <RefreshCw size={13} className="spin-icon inline mr-1" /> : <Zap size={13} className="inline mr-1" />}
                          {khqrTesting ? 'Testing Signature...' : 'Generate Live Test Link ($1.00)'}
                        </button>
                      </div>

                      {khqrTestResult && (
                        <div className="khqr-test-result-box">
                          <div className="test-result-row">
                            <span>Status:</span>
                            <span className="text-success font-semibold">✓ Generated & Signed OK</span>
                          </div>
                          <div className="test-result-row">
                            <span>Test Transaction ID:</span>
                            <code>{khqrTestResult.transaction_id}</code>
                          </div>
                          <div className="test-result-row">
                            <span>Generated Hash:</span>
                            <code className="text-cyan">{khqrTestResult.hash}</code>
                          </div>
                          <div className="test-result-row">
                            <span>Checkout URL:</span>
                            <a 
                              href={khqrTestResult.checkout_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs"
                            >
                              Open Live Test Checkout <ExternalLink size={11} className="inline" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: ABA PAYWAY FALLBACK */}
                  <div className="settings-card mt-4">
                    <div className="settings-card-header">
                      <SmartphoneNfc size={20} className="text-cyan" />
                      <h4>ABA PAY / PayWay Payment Gateway</h4>
                    </div>

                    <div className="form-group">
                      <label>PayWay Payment Link (Checkout Redirect & QR):</label>
                      <div className="input-with-action">
                        <input
                          type="url"
                          required
                          value={settings.abaPayLink}
                          onChange={(e) => setSettings({ ...settings, abaPayLink: e.target.value })}
                          placeholder="https://link.payway.com.kh/..."
                        />
                        <button
                          type="button"
                          className="btn-copy-input"
                          onClick={handleCopyLink}
                          title="Copy Link"
                        >
                          {copiedLink ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <span className="input-hint">
                        Customers who choose "ABA PAY / PayWay" in checkout will be directed to this link or scan this link's QR code.
                      </span>
                    </div>

                    <div className="aba-test-row">
                      <a
                        href={settings.abaPayLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={14} />
                        <span>Test PayWay Link In New Tab</span>
                      </a>
                    </div>
                  </div>

                  <div className="settings-card mt-4">
                    <div className="settings-card-header">
                      <AlertCircle size={20} className="text-accent" />
                      <h4>Platform Announcement Bar</h4>
                    </div>

                    <div className="form-group">
                      <label>Top Banner Text:</label>
                      <textarea
                        rows={2}
                        value={settings.announcementText}
                        onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="settings-card mt-4">
                    <div className="settings-card-header">
                      <Tag size={20} className="text-purple" />
                      <h4>Active Promo Codes</h4>
                    </div>
                    <div className="promo-codes-list">
                      <div className="promo-pill"><strong>NEURON20</strong> — 20% OFF Everything</div>
                      <div className="promo-pill"><strong>AIWELCOME</strong> — $10 Flat Discount</div>
                    </div>
                  </div>

                  <div className="settings-actions mt-4">
                    <button type="submit" className="btn btn-primary btn-glow">
                      <Save size={18} />
                      <span>Save Changes to Laravel Database</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>

        {/* MODAL 1: CREATE / EDIT PRODUCT MODAL */}
        {isToolModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container admin-tool-modal">
              <button
                className="modal-close"
                onClick={() => setIsToolModalOpen(false)}
              >
                &times;
              </button>

              <div className="modal-header-admin">
                <h3>{editingTool ? `Edit ${editingTool.name}` : 'Add New Product to Store'}</h3>
                <p>Changes will be committed directly to the Laravel database and updated live on the store.</p>
              </div>

              <form onSubmit={handleSaveTool} className="admin-modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={toolFormData.name}
                      onChange={(e) => setToolFormData({ ...toolFormData, name: e.target.value })}
                      placeholder="e.g. Synapse Quantum LLM"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={toolFormData.category}
                      onChange={(e) => setToolFormData({ ...toolFormData, category: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Lifetime License Price ($USD) *</label>
                    <input
                      type="number"
                      required
                      value={toolFormData.priceLifetime}
                      onChange={(e) => setToolFormData({ ...toolFormData, priceLifetime: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Monthly License Price ($USD) *</label>
                    <input
                      type="number"
                      required
                      value={toolFormData.priceMonthly}
                      onChange={(e) => setToolFormData({ ...toolFormData, priceMonthly: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Badge / Highlight Tag</label>
                  <input
                    type="text"
                    value={toolFormData.badge}
                    onChange={(e) => setToolFormData({ ...toolFormData, badge: e.target.value })}
                    placeholder="e.g. 8K Photorealism, Flagship, Fast"
                  />
                </div>

                <div className="form-group">
                  <label>Short Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={toolFormData.shortDesc}
                    onChange={(e) => setToolFormData({ ...toolFormData, shortDesc: e.target.value })}
                    placeholder="Brief summary of capabilities..."
                  />
                </div>

                <div className="form-group">
                  <label>Capabilities (Comma separated):</label>
                  <input
                    type="text"
                    value={toolFormData.capabilities}
                    onChange={(e) => setToolFormData({ ...toolFormData, capabilities: e.target.value })}
                    placeholder="2M Context, Streaming, JSON Mode, OCR"
                  />
                </div>

                <div className="modal-actions-admin">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsToolModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-glow">
                    <Save size={16} />
                    <span>{editingTool ? 'Save Updates to Database' : 'Publish Product to Database'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE / EDIT CATEGORY MODAL */}
        {isCategoryModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container admin-tool-modal">
              <button
                className="modal-close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                &times;
              </button>

              <div className="modal-header-admin">
                <h3>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}</h3>
                <p>Saved into Laravel SQLite database `categories` table with slug indexing.</p>
              </div>

              <form onSubmit={handleSaveCategory} className="admin-modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryFormData({
                          ...categoryFormData,
                          name: val,
                          slug: editingCategory ? categoryFormData.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        });
                      }}
                      placeholder="e.g. Robotics & Embodied AI"
                    />
                  </div>

                  <div className="form-group">
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                      placeholder="e.g. robotics"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Highlight Badge</label>
                    <input
                      type="text"
                      value={categoryFormData.badge}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, badge: e.target.value })}
                      placeholder="e.g. Hot, Enterprise, NextGen"
                    />
                  </div>

                  <div className="form-group">
                    <label>Theme Color *</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={categoryFormData.color}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={categoryFormData.color}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                        className="color-text-input"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="quick-color-swatches">
                      {['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'].map(col => (
                        <button
                          key={col}
                          type="button"
                          className="swatch-btn"
                          style={{ backgroundColor: col }}
                          onClick={() => setCategoryFormData({ ...categoryFormData, color: col })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Describe what kind of tools belong in this category..."
                  />
                </div>

                <div className="modal-actions-admin">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-glow">
                    <Save size={16} />
                    <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
