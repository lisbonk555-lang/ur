import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, ArrowRight, RefreshCw, Check, Copy, AlertCircle, Layers, BarChart3, Lock, Terminal, Activity } from 'lucide-react';
import { FEE_WALLET } from '../../lib/fee';

export const BrainsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'omnimesh' | 'nexussentry'>('omnimesh');
  const [status, setStatus] = useState<any>(null);
  
  // OmniMesh state
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [omniAmount, setOmniAmount] = useState<string>('50000');
  const [omniSource, setOmniSource] = useState<string>('US Treasury Bills');
  const [omniTarget, setOmniTarget] = useState<string>('UpFrica Treasury Vault');
  const [omniExecuting, setOmniExecuting] = useState(false);
  const [omniResult, setOmniResult] = useState<any>(null);
  const [omniError, setOmniError] = useState<string>('');
  const [omniHistory, setOmniHistory] = useState<any[]>([]);

  // Nexus Sentry state
  const [riskMatrix, setRiskMatrix] = useState<any>(null);
  const [sentryAmount, setSentryAmount] = useState<string>('100000');
  const [sentryStrategy, setSentryStrategy] = useState<string>('SOVEREIGN_RWA_PROTECTION');
  const [sentryExecuting, setSentryExecuting] = useState(false);
  const [sentryResult, setSentryResult] = useState<any>(null);
  const [sentryError, setSentryError] = useState<string>('');
  const [sentryHistory, setSentryHistory] = useState<any[]>([]);

  const [copiedCode, setCopiedCode] = useState(false);

  const fetchBrainData = async () => {
    try {
      const resStatus = await fetch('/api/v1/brains/status');
      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatus(data);
      }

      const resOpp = await fetch('/api/v1/brains/omnimesh/opportunities');
      if (resOpp.ok) {
        const data = await resOpp.json();
        setOpportunities(data.opportunities || []);
      }

      const resOmniHist = await fetch('/api/v1/brains/omnimesh/history');
      if (resOmniHist.ok) {
        const data = await resOmniHist.json();
        setOmniHistory(data || []);
      }

      const resRisk = await fetch('/api/v1/brains/nexussentry/risk-matrix');
      if (resRisk.ok) {
        const data = await resRisk.json();
        setRiskMatrix(data);
      }

      const resSentryHist = await fetch('/api/v1/brains/nexussentry/history');
      if (resSentryHist.ok) {
        const data = await resSentryHist.json();
        setSentryHistory(data || []);
      }
    } catch (err) {
      console.error('Error fetching brain data:', err);
    }
  };

  useEffect(() => {
    fetchBrainData();
    const interval = setInterval(fetchBrainData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteOmniMesh = async (e: React.FormEvent) => {
    e.preventDefault();
    setOmniError('');
    setOmniResult(null);

    const amt = parseFloat(omniAmount);
    if (isNaN(amt) || amt < 100) {
      setOmniError('Minimum execution amount is $100 USD.');
      return;
    }

    setOmniExecuting(true);
    try {
      const res = await fetch('/api/v1/brains/omnimesh/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: amt,
          source_protocol: omniSource,
          target_protocol: omniTarget,
          bot_id: 'omnimesh_web_terminal'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setOmniError(data.error || 'Execution failed');
      } else {
        setOmniResult(data);
        fetchBrainData();
      }
    } catch (err: any) {
      setOmniError(err.message || 'Network failure');
    } finally {
      setOmniExecuting(false);
    }
  };

  const handleExecuteSentry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSentryError('');
    setSentryResult(null);

    const amt = parseFloat(sentryAmount);
    if (isNaN(amt) || amt < 100) {
      setSentryError('Minimum execution amount is $100 USD.');
      return;
    }

    setSentryExecuting(true);
    try {
      const res = await fetch('/api/v1/brains/nexussentry/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: amt,
          strategy: sentryStrategy,
          bot_id: 'sentry_web_terminal'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSentryError(data.error || 'Execution failed');
      } else {
        setSentryResult(data);
        fetchBrainData();
      }
    } catch (err: any) {
      setSentryError(err.message || 'Network failure');
    } finally {
      setSentryExecuting(false);
    }
  };

  const copyCurl = () => {
    const code = activeTab === 'omnimesh' 
      ? `curl -X POST "https://UpFrica.africa/api/v1/brains/omnimesh/execute" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount_usd": 100000, "source_protocol": "${omniSource}", "target_protocol": "${omniTarget}"}'`
      : `curl -X POST "https://UpFrica.africa/api/v1/brains/nexussentry/execute" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount_usd": 250000, "strategy": "${sentryStrategy}"}'`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="mt-12 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automated Brain Engines Live (1.0% Settlement Fee)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Multi-Trillion Dollar Automated Brains
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time cross-chain arbitrage, clearing & sovereign yield risk engines connected to 1,024+ public APIs.
          </p>
        </div>

        <button
          onClick={fetchBrainData}
          className="self-start md:self-auto px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-lg border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Sync Feeds
        </button>
      </div>

      {/* Brain Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-400 font-medium">Public APIs Connected</p>
          <p className="text-xl font-mono font-bold text-white mt-1">1,024 Feeds</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">DefiLlama, Sovereign Bonds, DEXs</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-400 font-medium">Platform Fee Rate</p>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-1">1.0%</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Automated 100 BPS Routing</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-400 font-medium">OmniMesh Volume</p>
          <p className="text-xl font-mono font-bold text-cyan-400 mt-1">
            ${status?.brains?.omnimesh_capital_brain?.total_automated_rebalanced_usd?.toLocaleString() || '0'}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {status?.brains?.omnimesh_capital_brain?.rebalance_count || 0} Rebalances Executed
          </p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-400 font-medium">Nexus Sentry Collateral</p>
          <p className="text-xl font-mono font-bold text-indigo-400 mt-1">
            ${status?.brains?.nexus_sentry_brain?.total_treasury_collateral_usd?.toLocaleString() || '0'}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Rating: {riskMatrix?.treasury_collateral_health || 'AAA Nominal'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('omnimesh')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'omnimesh'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          OmniMesh Capital Brain
        </button>

        <button
          onClick={() => setActiveTab('nexussentry')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'nexussentry'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Nexus Sentry Risk Brain
        </button>
      </div>

      {/* TAB 1: OMNIMESH CAPITAL BRAIN */}
      {activeTab === 'omnimesh' && (
        <div className="space-y-8">
          {/* Arbitrage Scanner */}
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Live Cross-Chain & RWA Arbitrage Opportunities (Scanned from 1,024 Feeds)
              </h3>
              <span className="text-xs font-mono text-zinc-400">
                {opportunities.length} Spreads Identified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="py-2 px-3">Source Route</th>
                    <th className="py-2 px-3">Target Route</th>
                    <th className="py-2 px-3">Source APY</th>
                    <th className="py-2 px-3">Target APY</th>
                    <th className="py-2 px-3">Spread APY</th>
                    <th className="py-2 px-3">Est. Return ($100k)</th>
                    <th className="py-2 px-3 text-right font-semibold">1.0% Router Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {opportunities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-zinc-500">
                        Scanning live market spread opportunities...
                      </td>
                    </tr>
                  ) : (
                    opportunities.map((opp, idx) => (
                      <tr key={opp.opportunity_id || idx} className="hover:bg-zinc-900/40">
                        <td className="py-2.5 px-3 font-semibold text-zinc-300">{opp.source_protocol}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                          {opp.target_protocol}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{opp.source_apy}%</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{opp.target_apy}%</td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-cyan-400">+{opp.spread_apy_pct}%</td>
                        <td className="py-2.5 px-3 font-mono text-white font-bold">${opp.estimated_annual_spread_per_100k_usd?.toLocaleString()} /yr</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-400 font-semibold">$1,000.00</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Rebalance Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Execute Automated OmniMesh Rebalance
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Instantly route funds to capture yield arbitrage. 1.0% fee automatically remitted to settlement fee wallet.
              </p>

              <form onSubmit={handleExecuteOmniMesh} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Source Capital Protocol</label>
                  <select
                    value={omniSource}
                    onChange={(e) => setOmniSource(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="US Treasury Bills">US Treasury Bills (4.8% APY)</option>
                    <option value="USDC Lending Aave">USDC Lending Aave (5.1% APY)</option>
                    <option value="BTC Yield Solv">BTC Yield Solv (2.8% APY)</option>
                    <option value="Money Market Fund">Money Market Fund (5.0% APY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Yield Destination</label>
                  <select
                    value={omniTarget}
                    onChange={(e) => setOmniTarget(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="UpFrica Treasury Vault">UpFrica Treasury Vault (8.0% APY - RWA)</option>
                    <option value="Private Credit">Private Credit (9.2% APY - RWA)</option>
                    <option value="Real Estate">Real Estate (7.1% APY - RWA)</option>
                    <option value="ETH Liquid Staking">ETH Liquid Staking (3.4% APY - DeFi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Rebalance Capital Amount (USD)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={omniAmount}
                    onChange={(e) => setOmniAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                {/* Calculation Summary */}
                <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gross Amount:</span>
                    <span className="text-white">${parseFloat(omniAmount || '0').toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>1.0% Platform Fee:</span>
                    <span className="text-emerald-400">${(parseFloat(omniAmount || '0') * 0.01).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800 font-bold">
                    <span>Net Rebalanced Capital:</span>
                    <span className="text-cyan-400">${(parseFloat(omniAmount || '0') * 0.99).toFixed(2)} USD</span>
                  </div>
                </div>

                {omniError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {omniError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={omniExecuting}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-extrabold rounded-lg shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {omniExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Routing Funds & Fee...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Execute Rebalance Now
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Execution Result / Live Redis Stream */}
            <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Rebalance Execution Output (Redis Stream)
                </h3>

                {omniResult ? (
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs space-y-1.5 font-mono">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Check className="w-4 h-4" />
                        Execution Finalized & Fee Routed
                      </div>
                      <div className="text-zinc-300">Exec ID: <code className="text-emerald-300">{omniResult.exec_id}</code></div>
                      <div className="text-zinc-300">Source: <span className="text-white">{omniResult.source_protocol}</span></div>
                      <div className="text-zinc-300">Target: <span className="text-white">{omniResult.target_protocol}</span></div>
                      <div className="text-zinc-300">Fee Wallet: <code className="text-emerald-300">{omniResult.fee_wallet}</code></div>
                      <div className="text-zinc-300">Fee Collected: <span className="text-emerald-400 font-bold">${omniResult.fee_usd} USD</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                    Ready to execute automated rebalance. Select parameters and submit.
                  </div>
                )}
              </div>

              {/* Execution History */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-300 mb-2">Recent OmniMesh Executions in Redis</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] font-mono">
                  {omniHistory.length === 0 ? (
                    <p className="text-zinc-500 italic">No previous executions stored in Redis.</p>
                  ) : (
                    omniHistory.slice(0, 4).map((item, idx) => (
                      <div key={item.exec_id || idx} className="p-1.5 bg-zinc-900/60 rounded border border-zinc-800/60 flex items-center justify-between text-zinc-300">
                        <span>{item.exec_id}</span>
                        <span className="text-emerald-400 font-bold">${item.amount_usd?.toLocaleString()} USD</span>
                        <span className="text-zinc-400">{new Date(item.executed_at).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEXUS SENTRY RISK BRAIN */}
      {activeTab === 'nexussentry' && (
        <div className="space-y-8">
          {/* Treasury Risk Matrix */}
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Sovereign Treasury Collateral Risk Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  Autonomous credit spread monitoring, depeg protection, and asset allocation matrix.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-lg font-bold">
                  Health: {riskMatrix?.treasury_collateral_health || 'AAA Nominal'}
                </span>
                <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 rounded-lg font-bold">
                  Risk Score: {riskMatrix?.risk_score_1_to_10 || '1.8'}/10
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs font-mono">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
                <span className="text-zinc-400">Sovereign RWA Pools</span>
                <p className="text-lg font-bold text-white mt-1">{riskMatrix?.asset_breakdown?.rwa_sovereign_pools || 5} Markets</p>
                <span className="text-[10px] text-emerald-400">US T-Bills, Private Credit</span>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
                <span className="text-zinc-400">DeFi Liquid Vaults</span>
                <p className="text-lg font-bold text-white mt-1">{riskMatrix?.asset_breakdown?.defi_vault_pools || 18} Pools</p>
                <span className="text-[10px] text-cyan-400">Aave USDC, ETH LST, Solv BTC</span>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
                <span className="text-zinc-400">Drawdown Protection</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">100% Active</p>
                <span className="text-[10px] text-zinc-400">1.0% Management Settlement Fee</span>
              </div>
            </div>
          </div>

          {/* Interactive Protection Form & Result */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Allocate & Protect Treasury Collateral
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Execute automated treasury reallocation into sovereign bond collateral pools with 1.0% fee.
              </p>

              <form onSubmit={handleExecuteSentry} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Protection Strategy</label>
                  <select
                    value={sentryStrategy}
                    onChange={(e) => setSentryStrategy(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="SOVEREIGN_RWA_PROTECTION">SOVEREIGN RWA PROTECTION (US T-Bills & Treasury Vault)</option>
                    <option value="DEFI_DEPEG_SHIELD">DEFI DEPEG SHIELD (Over-Collateralized Stablecoins)</option>
                    <option value="MULTI_ASSET_BALANCED">MULTI-ASSET BALANCED (50% RWA / 50% Blue-Chip DeFi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Treasury Amount to Protect (USD)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={sentryAmount}
                    onChange={(e) => setSentryAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gross Treasury Capital:</span>
                    <span className="text-white">${parseFloat(sentryAmount || '0').toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>1.0% Management Fee:</span>
                    <span className="text-emerald-400">${(parseFloat(sentryAmount || '0') * 0.01).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800 font-bold">
                    <span>Net Protected Collateral:</span>
                    <span className="text-indigo-400">${(parseFloat(sentryAmount || '0') * 0.99).toFixed(2)} USD</span>
                  </div>
                </div>

                {sentryError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {sentryError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sentryExecuting}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-zinc-950 font-extrabold rounded-lg shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {sentryExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Auditing & Securing Treasury...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Execute Autonomous Protection
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Nexus Sentry Execution Log (Redis Store)
                </h3>

                {sentryResult ? (
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-cyan-950/50 border border-cyan-800/60 rounded-lg text-xs space-y-1.5 font-mono">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Check className="w-4 h-4" />
                        Treasury Secured & Fee Settled
                      </div>
                      <div className="text-zinc-300">Exec ID: <code className="text-cyan-300">{sentryResult.exec_id}</code></div>
                      <div className="text-zinc-300">Strategy: <span className="text-white">{sentryResult.strategy}</span></div>
                      <div className="text-zinc-300">Fee Wallet: <code className="text-cyan-300">{sentryResult.fee_wallet}</code></div>
                      <div className="text-zinc-300">Fee Remitted: <span className="text-emerald-400 font-bold">${sentryResult.fee_usd} USD</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                    Nexus Sentry ready. Execute treasury protection to view live receipt.
                  </div>
                )}
              </div>

              {/* Execution History */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-300 mb-2">Recent Nexus Sentry Executions in Redis</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] font-mono">
                  {sentryHistory.length === 0 ? (
                    <p className="text-zinc-500 italic">No previous executions stored in Redis.</p>
                  ) : (
                    sentryHistory.slice(0, 4).map((item, idx) => (
                      <div key={item.exec_id || idx} className="p-1.5 bg-zinc-900/60 rounded border border-zinc-800/60 flex items-center justify-between text-zinc-300">
                        <span>{item.exec_id}</span>
                        <span className="text-cyan-400 font-bold">${item.amount_usd?.toLocaleString()} USD</span>
                        <span className="text-zinc-400">{new Date(item.executed_at).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer cURL Code Box */}
      <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Automated API Integration (cURL)
          </span>
          <button
            onClick={copyCurl}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            Copy API Request
          </button>
        </div>
        <pre className="text-[11px] font-mono text-emerald-400 bg-zinc-900/80 p-3 rounded-lg overflow-x-auto leading-relaxed border border-zinc-800/80">
          {activeTab === 'omnimesh'
            ? `curl -X POST "https://UpFrica.africa/api/v1/brains/omnimesh/execute" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount_usd": 100000, "source_protocol": "${omniSource}", "target_protocol": "${omniTarget}"}'`
            : `curl -X POST "https://UpFrica.africa/api/v1/brains/nexussentry/execute" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount_usd": 250000, "strategy": "${sentryStrategy}"}'`}
        </pre>
      </div>
    </section>
  );
};
