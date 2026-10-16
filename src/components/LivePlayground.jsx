import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  PenTool, 
  Code2, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Zap, 
  Sliders, 
  Loader2 
} from 'lucide-react';

const COPY_PRESETS = {
  cyber: {
    label: 'Cyber Hero',
    prompt: 'Write an irresistible high-conversion landing page hero copy for a cyber-security AI startup with a confident, modern tone.',
    result: `## UNBREAKABLE NEURAL DEFENSE FOR CLOUD ARCHITECTURES

### Stop zero-day attacks before they touch your microservices.
Powered by autonomous agent swarms, Sentinel AI analyzes 400M telemetry events per millisecond, neutralizing adversarial intrusions with zero false positives.

* **Autonomous Mitigation:** 12ms mean-time-to-remediate without human bottleneck.
* **Cryptographic Sovereignty:** Zero prompt retention, SOC2 Type II and ISO-27001 audited.
* **Instant Helm Deployment:** Protect your entire Kubernetes cluster with a single CLI command.

[Deploy Sentinel Agent Free]  [Schedule Live Red-Team Simulation]`
  },
  viral: {
    label: 'Viral Post',
    prompt: 'Create a 3-part viral LinkedIn thought-leadership post about autonomous AI agents replacing manual CRM workflows.',
    result: `90% of sales reps spend 4 hours a day updating CRM fields.
By 2027, this number will drop to zero.

Here is what most revenue leaders are missing about autonomous agent swarms:

1. Passive Capture > Manual Data Entry
AI agents listen to Google Meets, transcribe action items, calculate deal-probability scores, and update Salesforce objects asynchronously.

2. Context-Aware Deal Acceleration
Instead of canned email cadences, agents read the prospect's latest 10-K report, pinpoint margin pressures, and draft hyper-specific value propositions.

3. The New Sales Stack
The top 1% of account executives aren't grinding cold calls—they are orchestrating 5 specialized AI subagents that do 80% of the prep work.

Are you training your team on AI workflows, or waiting until your competitors outpace your quota?

#ArtificialIntelligence #SaaS #FutureOfWork #Productivity`
  },
  enterprise: {
    label: 'Enterprise Pitch',
    prompt: 'Craft a persuasive elevator pitch to close a $50,000 enterprise annual contract for automated customer support.',
    result: `Executive Briefing: Accelerating Tier-1 Resolution to 4.2 Seconds

"Marcus, your team handled 1.2M support inquiries last quarter, costing $4.10 per resolution with an average queue time of 18 minutes.

With Synapse Omni-LLM deployed across your Zendesk and Slack instances, 78% of tier-1 and tier-2 tickets are solved end-to-end in under 5 seconds—with 99.2% customer satisfaction.

At $50,000 annually, this generates an immediate $310,000 net labor savings in year one while eliminating off-hours escalation backlog.

Let's run a 14-day parallel proof-of-concept on 5% of your inbound queue so you can inspect the telemetry before committing."`
  }
};

const CODE_PRESETS = {
  javascript: {
    name: 'rateLimiter.js',
    prompt: 'Write a Node.js Express rate-limiter middleware using Redis token-bucket algorithm with IP whitelisting.',
    code: `import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Token-Bucket Rate Limiter Middleware
 * @param {Object} options - Capacity and refill parameters
 */
export function createRateLimiter({ capacity = 60, refillRatePerSec = 1, whitelist = [] }) {
  return async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    // Check whitelist bypass
    if (whitelist.includes(clientIp)) {
      return next();
    }

    const key = \`rate_limit:\${clientIp}\`;
    const now = Math.floor(Date.now() / 1000);

    const pipeline = redis.pipeline();
    pipeline.hget(key, 'tokens');
    pipeline.hget(key, 'lastRefill');
    const [[, currentTokens], [, lastRefill]] = await pipeline.exec();

    let tokens = currentTokens !== null ? parseFloat(currentTokens) : capacity;
    const lastTimestamp = lastRefill !== null ? parseInt(lastRefill, 10) : now;

    // Compute token refill
    const deltaSeconds = Math.max(0, now - lastTimestamp);
    tokens = Math.min(capacity, tokens + deltaSeconds * refillRatePerSec);

    if (tokens < 1) {
      const retryAfter = Math.ceil((1 - tokens) / refillRatePerSec);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please throttle requests.',
        retryAfterSeconds: retryAfter
      });
    }

    // Decrement token and store state
    tokens -= 1;
    await redis.hmset(key, 'tokens', tokens, 'lastRefill', now);
    await redis.expire(key, 3600);

    res.setHeader('X-RateLimit-Remaining', Math.floor(tokens));
    next();
  };
}`
  },
  python: {
    name: 'vector_search.py',
    prompt: 'Build a Python async FastAPI endpoint that calculates cosine similarity across vector embeddings with batch caching.',
    code: `import numpy as np
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import asyncio

app = FastAPI(title="Vector Similarity Service")

class QueryRequest(BaseModel):
    query_vector: List[float]
    top_k: int = 5

class DocumentMatch(BaseModel):
    doc_id: str
    similarity_score: float

# In-memory mock vector index (e.g. 1536-dimensional embeddings)
DOCUMENT_INDEX = {
    f"doc_{i}": np.random.randn(1536).astype(np.float32)
    for i in range(100)
}

def normalize_vector(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    return v / norm if norm > 0 else v

@app.post("/api/v1/search", response_model=List[DocumentMatch])
async def search_similar_documents(request: QueryRequest):
    query_vec = np.array(request.query_vector, dtype=np.float32)
    if len(query_vec) != 1536:
        raise HTTPException(status_code=400, detail="Query vector dimension must match 1536")

    norm_query = normalize_vector(query_vec)
    results = []

    # Batch cosine calculation across cluster
    for doc_id, doc_vec in DOCUMENT_INDEX.items():
        norm_doc = normalize_vector(doc_vec)
        cosine_sim = float(np.dot(norm_query, norm_doc))
        results.append(DocumentMatch(doc_id=doc_id, similarity_score=round(cosine_sim, 4)))

    results.sort(key=lambda x: x.similarity_score, reverse=True)
    return results[:request.top_k]`
  },
  typescript: {
    name: 'useWebSocketStream.ts',
    prompt: 'Create a React custom hook useWebSocketStream with auto-reconnect, exponential backoff, and heartbeat ping.',
    code: `import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketStreamOptions<T> {
  url: string;
  onMessage?: (data: T) => void;
  maxRetries?: number;
  heartbeatIntervalMs?: number;
}

export function useWebSocketStream<T = any>({
  url,
  onMessage,
  maxRetries = 5,
  heartbeatIntervalMs = 30000
}: WebSocketStreamOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastData, setLastData] = useState<T | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastData(parsed);
          onMessage?.(parsed);
        } catch {
          setLastData(event.data as any);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (retryCountRef.current < maxRetries) {
          const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
          retryCountRef.current += 1;
          setTimeout(connect, timeout);
        }
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, [url, maxRetries, onMessage]);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  return { isConnected, lastData };
}`
  }
};

export default function LivePlayground() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('copy'); // 'copy' | 'code' | 'vision'

  // Copy Tab State
  const [copyPrompt, setCopyPrompt] = useState(COPY_PRESETS.cyber.prompt);
  const [copyTone, setCopyTone] = useState('Executive & High-Impact');
  const [creativity, setCreativity] = useState('0.7');
  const [copyOutput, setCopyOutput] = useState(COPY_PRESETS.cyber.result);
  const [isCopyGenerating, setIsCopyGenerating] = useState(false);
  const [copyTokens, setCopyTokens] = useState(384);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Code Tab State
  const [codeLang, setCodeLang] = useState('javascript');
  const [codePrompt, setCodePrompt] = useState(CODE_PRESETS.javascript.prompt);
  const [codeOutput, setCodeOutput] = useState(CODE_PRESETS.javascript.code);
  const [codeFileName, setCodeFileName] = useState(CODE_PRESETS.javascript.name);
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Vision Tab State
  const [visionPrompt, setVisionPrompt] = useState(
    'Futuristic holographic laboratory with floating neon geometric light sculptures and hyper-detailed cybernetic interfaces, 8k cinematic.'
  );
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isVisionSynthesizing, setIsVisionSynthesizing] = useState(false);
  const [diffusionProgress, setDiffusionProgress] = useState(100);

  // Run Copy Generation Simulation
  const handleRunCopy = (promptOverride) => {
    const textToUse = promptOverride || copyPrompt;
    setIsCopyGenerating(true);
    setCopyOutput('');
    setCopyTokens(0);

    let targetText = COPY_PRESETS.cyber.result;
    if (textToUse.toLowerCase().includes('viral') || textToUse.toLowerCase().includes('linkedin')) {
      targetText = COPY_PRESETS.viral.result;
    } else if (textToUse.toLowerCase().includes('pitch') || textToUse.toLowerCase().includes('enterprise')) {
      targetText = COPY_PRESETS.enterprise.result;
    } else {
      targetText = `## SYNAPSE NEURAL SYNTHESIS // CUSTOM QUERY
Generated with temperature ${creativity} and ${copyTone} tone:

"${textToUse}"

### Key Strategic Findings:
1. High-velocity market resonance with autonomous AI agents.
2. Latency reduction directly increases end-user retention by 34%.
3. Full commercial IP rights guaranteed under Synapse Enterprise terms.

[Execute Next Iteration]  [Export to JSON / Markdown]`;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 12;
      if (currentIndex >= targetText.length) {
        setCopyOutput(targetText);
        setCopyTokens(Math.round(targetText.length / 3.8));
        setIsCopyGenerating(false);
        clearInterval(interval);
      } else {
        setCopyOutput(targetText.slice(0, currentIndex) + ' ▌');
        setCopyTokens(Math.round(currentIndex / 3.8));
      }
    }, 25);
  };

  // Run Code Generation Simulation
  const handleRunCode = (lang = codeLang) => {
    setIsCodeGenerating(true);
    const selectedPreset = CODE_PRESETS[lang] || CODE_PRESETS.javascript;
    setCodeFileName(selectedPreset.name);
    setCodeOutput('// DeepCode Copilot v4.5 analyzing AST & synthesizing AST nodes...\n// Loading framework types...');

    setTimeout(() => {
      setCodeOutput(selectedPreset.code);
      setIsCodeGenerating(false);
      addToast(`Generated ${selectedPreset.name} with DeepCode!`, 'success');
    }, 600);
  };

  // Run Vision Synthesis Simulation
  const handleRunVision = () => {
    setIsVisionSynthesizing(true);
    setDiffusionProgress(0);

    const stepInterval = setInterval(() => {
      setDiffusionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(stepInterval);
          setIsVisionSynthesizing(false);
          addToast('8K Latent Diffusion Render Complete!', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleCopyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'copy') {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } else {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
    addToast('Copied to clipboard!', 'info');
  };

  return (
    <section className="playground-section" id="playground">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <Sparkles size={14} /> HANDS-ON DEMO
          </span>
          <h2 className="section-title">
            Test Our AI Engines <span className="gradient-text">Live In Real-Time</span>
          </h2>
          <p className="section-desc">
            Experience the raw speed, precision, and intelligence of our neural models right inside your browser before subscribing.
          </p>
        </div>

        <div className="playground-card">
          {/* Tabs */}
          <div className="playground-tabs" role="tablist">
            <button
              className={`playground-tab ${activeTab === 'copy' ? 'active' : ''}`}
              onClick={() => setActiveTab('copy')}
            >
              <PenTool size={16} />
              <span>Prompt & Copywriter</span>
              <span className="pill-badge">Omni-LLM</span>
            </button>

            <button
              className={`playground-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={16} />
              <span>DeepCode Assistant</span>
              <span className="pill-badge">DeepCode 4.5</span>
            </button>

            <button
              className={`playground-tab ${activeTab === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveTab('vision')}
            >
              <ImageIcon size={16} />
              <span>Visionary Diffusion</span>
              <span className="pill-badge">Diffusion X</span>
            </button>
          </div>

          {/* Tab 1: AI Prompt & Copy */}
          {activeTab === 'copy' && (
            <div className="playground-panel active">
              <div className="playground-grid">
                <div className="playground-input-side">
                  <div className="input-header">
                    <label className="input-label">Describe what you want to create:</label>
                    <div className="preset-chips">
                      <span className="preset-label">Presets:</span>
                      {Object.entries(COPY_PRESETS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          className="preset-chip"
                          onClick={() => {
                            setCopyPrompt(item.prompt);
                            handleRunCopy(item.prompt);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    className="playground-textarea"
                    value={copyPrompt}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    placeholder="Enter prompt description..."
                  />

                  <div className="playground-controls">
                    <div className="control-item">
                      <label>Tone of Voice:</label>
                      <select
                        value={copyTone}
                        onChange={(e) => setCopyTone(e.target.value)}
                        className="control-select"
                      >
                        <option value="Executive & High-Impact">Executive & High-Impact</option>
                        <option value="Futuristic & Bold">Futuristic & Bold</option>
                        <option value="Conversational & Engaging">Conversational & Engaging</option>
                        <option value="Technical & Precise">Technical & Precise</option>
                      </select>
                    </div>

                    <div className="control-item">
                      <label>Creativity (Temp): {creativity}</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={creativity}
                        onChange={(e) => setCreativity(e.target.value)}
                        className="control-range"
                      />
                    </div>

                    <button
                      className="btn btn-primary btn-glow"
                      onClick={() => handleRunCopy()}
                      disabled={isCopyGenerating}
                    >
                      {isCopyGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Streaming Tensors...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Generate With Omni-LLM</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="playground-output-side">
                  <div className="output-header">
                    <div className="output-title">
                      <Terminal size={15} />
                      <span>Model Output Stream</span>
                    </div>
                    <div className="output-actions">
                      <span className="latency-badge">
                        <Zap size={12} /> 14ms TTFT
                      </span>
                      <button
                        className="btn-copy-output"
                        onClick={() => handleCopyText(copyOutput, 'copy')}
                        title="Copy text to clipboard"
                      >
                        {copiedSuccess ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        <span>{copiedSuccess ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="output-viewport">
                    <div className="output-text whitespace-pre-wrap">
                      {copyOutput}
                    </div>
                  </div>

                  <div className="output-footer">
                    <span className="token-count">Tokens Generated: {copyTokens}</span>
                    <span className="model-tag">Engine: Synapse-Omni-LLM-4.5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: DeepCode Assistant */}
          {activeTab === 'code' && (
            <div className="playground-panel active">
              <div className="playground-grid">
                <div className="playground-input-side">
                  <div className="input-header">
                    <label className="input-label">Select Code Snippet / Goal:</label>
                    <div className="preset-chips">
                      <span className="preset-label">Samples:</span>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setCodeLang('javascript');
                          setCodePrompt(CODE_PRESETS.javascript.prompt);
                          handleRunCode('javascript');
                        }}
                      >
                        Express Limiter
                      </button>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setCodeLang('python');
                          setCodePrompt(CODE_PRESETS.python.prompt);
                          handleRunCode('python');
                        }}
                      >
                        FastAPI Vectors
                      </button>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setCodeLang('typescript');
                          setCodePrompt(CODE_PRESETS.typescript.prompt);
                          handleRunCode('typescript');
                        }}
                      >
                        React WS Hook
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    className="playground-textarea font-mono"
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                  />

                  <div className="playground-controls">
                    <div className="control-item">
                      <label>Target Language:</label>
                      <select
                        value={codeLang}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCodeLang(val);
                          handleRunCode(val);
                        }}
                        className="control-select"
                      >
                        <option value="javascript">JavaScript (Node.js)</option>
                        <option value="python">Python 3.12 (FastAPI)</option>
                        <option value="typescript">TypeScript (React 19)</option>
                      </select>
                    </div>

                    <button
                      className="btn btn-primary btn-glow"
                      onClick={() => handleRunCode(codeLang)}
                      disabled={isCodeGenerating}
                    >
                      {isCodeGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Compiling AST...</span>
                        </>
                      ) : (
                        <>
                          <Code2 size={16} />
                          <span>Generate Code Solution</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="playground-output-side">
                  <div className="output-header">
                    <div className="output-title">
                      <Terminal size={15} />
                      <span className="font-mono text-cyan">{codeFileName}</span>
                    </div>
                    <div className="output-actions">
                      <span className="latency-badge text-success">
                        <Check size={12} /> Tests 100% Passed
                      </span>
                      <button
                        className="btn-copy-output"
                        onClick={() => handleCopyText(codeOutput, 'code')}
                        title="Copy Code"
                      >
                        {codeCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        <span>{codeCopied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="output-viewport font-mono">
                    <pre className="code-block">
                      <code>{codeOutput}</code>
                    </pre>
                  </div>

                  <div className="output-footer">
                    <span className="token-count">Agent: DeepCode-Copilot-v4.5</span>
                    <span className="model-tag">Zero Vulnerabilities Detected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Visionary Diffusion */}
          {activeTab === 'vision' && (
            <div className="playground-panel active">
              <div className="playground-grid">
                <div className="playground-input-side">
                  <div className="input-header">
                    <label className="input-label">Image Generation Prompt:</label>
                    <div className="preset-chips">
                      <span className="preset-label">Styles:</span>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setVisionPrompt('Futuristic holographic laboratory with floating neon geometric light sculptures, 8k cinematic render.');
                          handleRunVision();
                        }}
                      >
                        Holo Studio
                      </button>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setVisionPrompt('Hyper-minimalist luxury modern villa floating on turquoise crystal ocean at sunset, architectural photography.');
                          handleRunVision();
                        }}
                      >
                        Modern Villa
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    className="playground-textarea"
                    value={visionPrompt}
                    onChange={(e) => setVisionPrompt(e.target.value)}
                  />

                  <div className="playground-controls">
                    <div className="control-item">
                      <label>Aspect Ratio:</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="control-select"
                      >
                        <option value="16:9">16:9 Widescreen Cinema</option>
                        <option value="1:1">1:1 Square</option>
                        <option value="9:16">9:16 Vertical Story</option>
                      </select>
                    </div>

                    <button
                      className="btn btn-primary btn-glow"
                      onClick={handleRunVision}
                      disabled={isVisionSynthesizing}
                    >
                      {isVisionSynthesizing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Synthesizing Diffusion Tensors...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Synthesize 8K Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="playground-output-side">
                  <div className="output-header">
                    <div className="output-title">
                      <ImageIcon size={15} />
                      <span>Diffusion Neural Canvas</span>
                    </div>
                    <div className="output-actions">
                      <span className="latency-badge">
                        <Sparkles size={12} /> 40 Latent Steps
                      </span>
                    </div>
                  </div>

                  <div className="vision-canvas-container">
                    <img
                      src="/assets/images/vision.jpg"
                      alt="AI Generated Showcase Preview"
                      className="vision-result-img"
                    />

                    {isVisionSynthesizing && (
                      <div className="vision-loading-overlay">
                        <div className="spinner-neon"></div>
                        <p className="loading-label">Synthesizing latent diffusion tensors ({diffusionProgress}%)...</p>
                        <div className="progress-bar-wrap">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${diffusionProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="output-footer">
                    <span className="token-count">
                      <Sliders size={12} className="inline mr-1" /> Seed: 8492049182 • CFG: 7.5
                    </span>
                    <span className="model-tag">Visionary-Diffusion-X Pro</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
