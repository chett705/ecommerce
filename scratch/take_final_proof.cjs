const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function test() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_proof_' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9411',
    '--headless=new',
    '--user-data-dir=' + tmpDir,
    '--window-size=1200,900'
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9411/json/list');
  const [p] = await res.json();
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && cb.has(m.id)) { cb.get(m.id)(m); cb.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (m, params = {}) => new Promise(r => { const mid = id++; cb.set(mid, r); ws.send(JSON.stringify({ id: mid, method: m, params })); });
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Homepage Navbar and Pricing
  const homeCheck = await send('Runtime.evaluate', {
    expression: `(function() {
      const navLinks = Array.from(document.querySelectorAll('.nav-link, .nav-cta')).map(a => a.innerText.trim());
      const hasPricingSection = !!document.getElementById('pricing');
      const heroTitle = document.querySelector('.hero-title')?.innerText.trim();
      return { navLinks, hasPricingSection, heroTitle };
    })()`,
    returnByValue: true
  });
  console.log('Homepage verification:', JSON.stringify(homeCheck.result?.result?.value, null, 2));

  // Screenshot homepage header
  const ssNav = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'final_nav_hero.png'), Buffer.from(ssNav.result.data, 'base64'));

  // Open checkout via window.__openCheckout(true)
  await send('Runtime.evaluate', {
    expression: 'window.__openCheckout(true)'
  });
  await new Promise(r => setTimeout(r, 1200));

  // Step 1: Click "Continue to Payment"
  await send('Runtime.evaluate', {
    expression: 'document.querySelector(".checkout-actions button[type=submit]")?.click()'
  });
  await new Promise(r => setTimeout(r, 3500));

  // Verify Step 2 DOM state
  const step2Info = await send('Runtime.evaluate', {
    expression: `(function() {
      const tabs = Array.from(document.querySelectorAll('.payment-tab')).map(t => t.innerText.replace(/\\n/g, ' '));
      const iframe = document.querySelector('iframe.khqr-live-iframe')?.src;
      const subtitle = document.querySelector('.step-sub')?.innerText;
      const khqrBtn = document.getElementById('btn-pay-now-khqr')?.innerText;
      const hasPaywayBtn = !!document.getElementById('btn-pay-now-payway');
      const hasPaywayCard = !!document.querySelector('.aba-pay-card');
      return {
        tabs,
        iframeSrc: iframe,
        subtitle,
        khqrBtn,
        hasPaywayBtn,
        hasPaywayCard
      };
    })()`,
    returnByValue: true
  });
  console.log('Step 2 Final DOM State:\n', JSON.stringify(step2Info.result?.result?.value, null, 2));

  // Capture Step 2 screenshot
  const ssStep2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'final_step2_verified.png'), Buffer.from(ssStep2.result.data, 'base64'));

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

test().catch(console.error);
