import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper functions for Database read/write
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { tools: [], orders: [], subscribers: [], settings: {}, stats: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Check Admin Credentials
  if ((email.toLowerCase() === 'admin@synapse.ai' || email.toLowerCase() === 'admin') && password === 'admin123') {
    return res.json({
      success: true,
      user: {
        id: 'admin_master',
        name: 'Master Admin',
        email: 'admin@synapse.ai',
        role: 'admin',
        permissions: ['all']
      },
      token: 'jwt_synapse_admin_session_token_98a7'
    });
  }

  // Regular user login
  if (password === 'user123' || password.length >= 6) {
    return res.json({
      success: true,
      user: {
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'Subscriber',
        email: email,
        role: 'user',
        permissions: ['standard']
      },
      token: 'jwt_synapse_user_session_token'
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. For Admin use admin@synapse.ai / admin123' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Synapse Backend API', timestamp: new Date().toISOString() });
});

// Stats overview for Admin Panel
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders
    .filter(o => o.status === 'Verified')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const stats = {
    ...db.stats,
    totalRevenue: totalRevenue || db.stats.totalRevenue,
    totalOrders: db.orders.length,
    toolsCount: db.tools.length,
    subscribersCount: db.subscribers.length,
    abaOrdersCount: db.orders.filter(o => o.paymentMethod?.includes('ABA')).length
  };
  res.json({ success: true, stats });
});

// Global Store Settings (ABA PAY link, Announcement, Promos)
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({ success: true, settings: db.settings, abaPayLink: db.settings?.abaPayLink });
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Settings updated successfully', settings: db.settings });
});

// AI Tools Catalog CRUD
app.get('/api/tools', (req, res) => {
  const db = readDB();
  res.json({ success: true, tools: db.tools });
});

app.post('/api/tools', (req, res) => {
  const db = readDB();
  const newTool = {
    id: req.body.id || `tool_${Date.now()}`,
    name: req.body.name || 'Untitled AI Tool',
    category: req.body.category || 'llm',
    badge: req.body.badge || 'PRO',
    rating: req.body.rating || 4.95,
    reviewsCount: req.body.reviewsCount || 100,
    usersCount: req.body.usersCount || '10k+',
    shortDesc: req.body.shortDesc || '',
    capabilities: req.body.capabilities || ['Neural Processing', 'API Access'],
    priceMonthly: Number(req.body.priceMonthly) || 29,
    priceLifetime: Number(req.body.priceLifetime) || 199,
    includedInSub: req.body.includedInSub ?? true,
    engineVersion: req.body.engineVersion || 'v1.0-Core',
    latency: req.body.latency || '20ms',
    icon: req.body.icon || 'Brain',
    color: req.body.color || '#8b5cf6',
    status: req.body.status || 'Active'
  };

  db.tools.unshift(newTool);
  writeDB(db);
  res.status(201).json({ success: true, tool: newTool });
});

app.put('/api/tools/:id', (req, res) => {
  const db = readDB();
  const toolIndex = db.tools.findIndex(t => t.id === req.params.id);
  if (toolIndex === -1) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }

  db.tools[toolIndex] = { ...db.tools[toolIndex], ...req.body };
  writeDB(db);
  res.json({ success: true, tool: db.tools[toolIndex] });
});

app.delete('/api/tools/:id', (req, res) => {
  const db = readDB();
  const initialLength = db.tools.length;
  db.tools = db.tools.filter(t => t.id !== req.params.id);
  if (db.tools.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Tool deleted successfully' });
});

// Orders & Payments Management
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.orders });
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const orderId = `SYN-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const apiKey = `sk_synapse_live_${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const newOrder = {
    id: orderId,
    customerName: req.body.customerName || 'Customer',
    customerEmail: req.body.customerEmail || 'user@example.com',
    company: req.body.company || '',
    items: req.body.items || ['Pro AI Suite'],
    amount: Number(req.body.amount) || 49,
    paymentMethod: req.body.paymentMethod || 'ABA PAY / PayWay',
    abaLink: db.settings?.abaPayLink || 'https://link.payway.com.kh/ABAPAY9s540501U',
    status: 'Verified',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    apiKey: apiKey
  };

  db.orders.unshift(newOrder);

  // If subscription, also add or update subscriber
  const hasSubscription = newOrder.items.some(item => typeof item === 'string' && item.toLowerCase().includes('suite') || item.toLowerCase().includes('membership'));
  if (hasSubscription) {
    const existingSubIndex = db.subscribers.findIndex(s => s.email === newOrder.customerEmail);
    const subRecord = {
      id: `sub_${Date.now()}`,
      name: newOrder.customerName,
      email: newOrder.customerEmail,
      plan: 'Pro AI Suite (Annual)',
      tier: 'pro',
      tokensUsed: 0,
      tokenLimit: 15000000,
      status: 'Active',
      renewsOn: '2027-10-16',
      paymentMethod: newOrder.paymentMethod
    };
    if (existingSubIndex >= 0) {
      db.subscribers[existingSubIndex] = { ...db.subscribers[existingSubIndex], status: 'Active' };
    } else {
      db.subscribers.unshift(subRecord);
    }
  }

  writeDB(db);
  res.status(201).json({ success: true, order: newOrder, apiKey });
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  db.orders[orderIndex].status = req.body.status || 'Verified';
  writeDB(db);
  res.json({ success: true, order: db.orders[orderIndex] });
});

// Subscribers Management
app.get('/api/subscribers', (req, res) => {
  const db = readDB();
  res.json({ success: true, subscribers: db.subscribers });
});

app.put('/api/subscribers/:id/tokens', (req, res) => {
  const db = readDB();
  const subIndex = db.subscribers.findIndex(s => s.id === req.params.id);
  if (subIndex === -1) {
    return res.status(404).json({ success: false, message: 'Subscriber not found' });
  }

  if (req.body.tokensUsed !== undefined) {
    db.subscribers[subIndex].tokensUsed = Number(req.body.tokensUsed);
  }
  if (req.body.tokenLimit !== undefined) {
    db.subscribers[subIndex].tokenLimit = Number(req.body.tokenLimit);
  }
  if (req.body.status !== undefined) {
    db.subscribers[subIndex].status = req.body.status;
  }

  writeDB(db);
  res.json({ success: true, subscriber: db.subscribers[subIndex] });
});

app.listen(PORT, () => {
  console.log(`🚀 Synapse Backend Server running on http://localhost:${PORT}`);
  console.log(`💳 ABA PAY Link configured: ${readDB().settings?.abaPayLink}`);
});
