import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldAlert, Cpu } from 'lucide-react';
import { FEE_WALLET, getFeeBps } from '../../lib/fee.js';

export const QuotePlayground: React.FC = () => {
  const [amountUsd, setAmountUsd] = useState<number>(250000);
  const [isBotToBot, setIsBotToBot] = useState<boolean>(false);
  const [targetBotsInput, setTargetBotsInput] = useState<string>('bot_alpha_01, bot_nexus_02');
  const [loading, setLoading] = useState<boolean>(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Execution state
  const [txHash, setTxHash] = useState<string>('');
  const [executing, setExecuting] = useState<boolean>(false);
  const [executeResult, setExecuteResult] = useState<any>(null);

  const calculateFeePreview = () => {
    const bps = getFeeBps(amountUsd, isBotToBot);
    const feeUsd = (amountUsd * bps) / 10000;
    return { bps, pct: (bps / 100).toFixed(2), feeUsd };
  };

  const feePreview = calculateFeePreview();

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExecuteResult(null);
    setLoading(true);

    const route_to_bots = isBotToBot
      ? targetBotsInput.split(',').map((b) => b.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch('/api/v1/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: amountUsd,
          route_to_bots
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to generate quote');
      } else {
        setQuoteResult(data);
        // Pre-fill a realistic EVM transaction hash for test execution
        setTxHash('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server network error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!quoteResult || !txHash) return;
    setExecuting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quoteResult.quote_id,
          tx_hash: txHash
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Execution failed');
      } else {
        setExecuteResult(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network execution error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Interactive Route & Quote Playground</h2>
          <p className="text-xs text-zinc-400">Simulate capital routing, fee calculations, and transaction settlement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Inputs */}
        <form onSubmit={handleGetQuote} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-300 mb-2">
              Routing Amount (USD) <span className="text-emerald-400 font-normal">(Min $100)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-mono">$</span>
              <input
                type="number"
                min="100"
                step="100"
                value={amountUsd}
                onChange={(e) => setAmountUsd(Math.max(100, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 50000, 1500000, 12000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountUsd(preset)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] font-mono text-zinc-300 transition-colors"
                >
                  ${preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Route Mode Toggle */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white">Bot-to-Bot Capital Routing</span>
                <p className="text-xs text-zinc-400">Direct bot peer routing with fixed 2.0% fee (200 BPS)</p>
              </div>
              <input
                type="checkbox"
                checked={isBotToBot}
                onChange={(e) => setIsBotToBot(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {isBotToBot && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Bot IDs (comma separated)</label>
                <input
                  type="text"
                  value={targetBotsInput}
                  onChange={(e) => setTargetBotsInput(e.target.value)}
                  placeholder="bot_alpha, bot_beta"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Real-time Fee Tier Indicator */}
          <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Calculated Fee Tier:</span>
            <span className="text-emerald-400 font-bold">
              {feePreview.pct}% ({feePreview.bps} BPS) = ${feePreview.feeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Generate Route Quote
          </button>
        </form>

        {/* Output & Execution Panel */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Quote Response</span>
              {quoteResult && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  TTL: 600s
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {!quoteResult && !errorMsg && (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Enter parameters and click "Generate Route Quote" to test the `/api/v1/quote` endpoint.
              </div>
            )}

            {quoteResult && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Quote ID:</span>
                  <span className="text-cyan-400 font-bold">{quoteResult.quote_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Fee Wallet Target:</span>
                  <span className="text-zinc-300">{quoteResult.fee_wallet.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gross / Net Amount:</span>
                  <span className="text-white">${quoteResult.amount_usd.toLocaleString()} / <span className="text-emerald-400 font-bold">${quoteResult.net_amount_usd.toLocaleString()}</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Allocation Strategy:</span>
                  <span className="text-emerald-300">
                    {JSON.stringify(quoteResult.allocation)}
                  </span>
                </div>

                {/* Settlement Execution Panel */}
                <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
                  <label className="block text-xs font-semibold text-zinc-300">Simulate Settlement (TX Hash)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    onClick={handleExecute}
                    disabled={executing || !txHash}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Execute Settlement (/api/v1/execute)
                  </button>
                </div>

                {executeResult && (
                  <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Settlement Confirmed & Recorded!
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-300">
                      Volume & Fees updated in Redis store.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
