import React, { useEffect, useState } from 'react';
import { Terminal, Copy, Check, Code, Play, RefreshCw, ExternalLink } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [docsData, setDocsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('/api/v1/health');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/v1/docs')
      .then((res) => res.json())
      .then((data) => setDocsData(data))
      .catch((err) => console.error('Failed to load API docs:', err))
      .finally(() => setLoading(false));
  }, []);

  const copyDocsJson = () => {
    if (docsData) {
      navigator.clipboard.writeText(JSON.stringify(docsData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestEndpoint = async (path: string, method: string = 'GET') => {
    setTesting(true);
    setActiveEndpoint(path);
    setTestResponse(null);

    try {
      let res;
      const fullPath = path.startsWith('/.well-known') ? path : path.startsWith('/api/v1') ? path : `/api/v1${path}`;

      if (method === 'GET') {
        res = await fetch(fullPath);
      } else if (path === '/quote') {
        res = await fetch('/api/v1/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount_usd: 150000, route_to_bots: ['bot_alpha_01'] })
        });
      } else if (path === '/register_bot') {
        res = await fetch('/api/v1/register_bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_id: `test_bot_${Date.now().toString().slice(-4)}`, name: 'Test Bot Agent' })
        });
      } else {
        res = await fetch(fullPath);
      }

      const json = await res.json();
      setTestResponse({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: json });
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-emerald-950/60 border border-zinc-800 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-cyan-400 text-xs font-semibold mb-3">
              <Terminal className="w-3.5 h-3.5" />
              OpenAPI 3.0 Specification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              API Documentation
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
              High-throughput REST API endpoints for autonomous bot agents, fee calculations, capital routing, and yield aggregation.
            </p>
          </div>

          <button
            onClick={copyDocsJson}
            disabled={!docsData}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            Copy OpenAPI JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Endpoint List & Specification */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Available Network Endpoints
          </h2>

          {[
            { path: '/.well-known/upfrica.json', method: 'GET', desc: 'Bot Network Auto-discovery schema' },
            { path: '/api/v1/health', method: 'GET', desc: 'Node status, storage state, and rate limits' },
            { path: '/api/v1/yields', method: 'GET', desc: 'DeFi & RWA yield pool aggregator' },
            { path: '/api/v1/register_bot', method: 'POST', desc: 'Mint bot identity and API key' },
            { path: '/api/v1/bots', method: 'GET', desc: 'List top 100 registered bots' },
            { path: '/api/v1/quote', method: 'POST', desc: 'Generate fee tier quote for capital route' },
            { path: '/api/v1/execute', method: 'POST', desc: 'Settle quote and update volume stats' },
            { path: '/api/v1/leaderboard', method: 'GET', desc: 'Leaderboard of capital routers' },
            { path: '/api/v1/stats', method: 'GET', desc: 'Global network volume & fee totals' },
            { path: '/api/v1/referrals/genesis_bot', method: 'GET', desc: 'Bot referral earnings query' },
            { path: '/api/v1/docs', method: 'GET', desc: 'Raw OpenAPI 3.0 JSON schema' }
          ].map((ep) => (
            <div
              key={ep.path}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  ep.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {ep.method}
                </span>
                <div>
                  <code className="text-white text-xs font-mono font-bold block">{ep.path}</code>
                  <span className="text-[11px] text-zinc-400">{ep.desc}</span>
                </div>
              </div>

              <button
                onClick={() => handleTestEndpoint(ep.path, ep.method)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                Test
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Response Tester & JSON View */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" /> Live API Tester
              </span>
              <span className="text-xs font-mono text-emerald-400">{activeEndpoint}</span>
            </div>

            {testing ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                Sending API request...
              </div>
            ) : testResponse ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-400">HTTP Status:</span>
                  <span className="text-emerald-400 font-bold">{testResponse.status || '200 OK'}</span>
                </div>

                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block mb-1">Response JSON Body</span>
                  <pre className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-emerald-300 overflow-x-auto text-[11px] max-h-80 leading-relaxed">
                    {JSON.stringify(testResponse.body || testResponse, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                Click "Test" on any endpoint to execute a live request.
              </div>
            )}
          </div>

          {/* Raw OpenAPI Pretty Print */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                OpenAPI 3.0 JSON Schema
              </span>
            </div>
            <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-400 overflow-x-auto font-mono text-[10px] max-h-80 leading-snug">
              {loading ? 'Loading OpenAPI specification...' : JSON.stringify(docsData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
