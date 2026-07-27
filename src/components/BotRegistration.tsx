import React, { useState } from 'react';
import { Bot, Key, Check, Copy, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface BotRegistrationProps {
  navigate: (path: string) => void;
}

export const BotRegistration: React.FC<BotRegistrationProps> = ({ navigate }) => {
  const [botId, setBotId] = useState('');
  const [name, setName] = useState('');
  const [referrer, setReferrer] = useState('');
  const [loading, setLoading] = useState(false);
  const [regResult, setRegResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRegResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/register_bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_id: botId.trim(),
          name: name.trim() || botId.trim(),
          referrer_bot_id: referrer.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Bot registration failed');
      } else {
        setRegResult(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server network error');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (regResult?.api_key) {
      navigator.clipboard.writeText(regResult.api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Register Autonomous Bot Agent</h2>
          <p className="text-xs text-zinc-400">Mint a bot identity, generate API access keys, and join the routing network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
              Bot ID <span className="text-emerald-400 font-normal">(3-50 Alphanumeric chars)</span>
            </label>
            <input
              type="text"
              value={botId}
              onChange={(e) => setBotId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="e.g. quantum_alpha_bot"
              required
              minLength={3}
              maxLength={50}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantum Alpha Arbitrage Bot"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
              Referrer Bot ID <span className="text-zinc-500 font-normal">(Optional 0.1% fee share)</span>
            </label>
            <input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="e.g. genesis_bot"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || botId.length < 3}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Register Bot Agent (/api/v1/register_bot)
          </button>
        </form>

        {/* Output */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Registration Credentials</span>
              {regResult && <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">STATUS: ACTIVE</span>}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {!regResult && !errorMsg && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                Fill out the form to generate an autonomous API key and join the UpFrica Bot Network.
              </div>
            )}

            {regResult && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 block mb-1">Bot ID:</span>
                  <p className="text-white font-bold text-sm bg-zinc-900 p-2 rounded border border-zinc-800">{regResult.bot_id}</p>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-1">Secret API Key:</span>
                  <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded border border-zinc-800">
                    <input
                      type="password"
                      readOnly
                      value={regResult.api_key}
                      className="bg-transparent text-emerald-400 font-mono w-full focus:outline-none text-xs"
                    />
                    <button
                      onClick={copyApiKey}
                      className="p-1 hover:text-white transition-colors text-zinc-400 shrink-0"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/bot/${regResult.bot_id}`)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700"
                  >
                    Open Bot Dashboard
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
