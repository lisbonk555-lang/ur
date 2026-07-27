import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Search, ShieldCheck } from 'lucide-react';

interface YieldPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
}

export const YieldsTable: React.FC = () => {
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('ALL');

  const fetchYields = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/yields');
      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.pools || []);
        setPools(raw.map((p: any) => ({
          pool: p.pool || p.protocol || 'pool',
          project: p.protocol || p.project || 'Protocol',
          symbol: p.symbol || p.category || 'USD',
          chain: p.chain || p.category || 'Multi',
          tvlUsd: p.tvl_usd ?? p.tvlUsd ?? 0,
          apy: p.apy || 0,
          apyBase: p.apyBase || p.apy || 0,
          apyReward: p.apyReward || 0
        })));
      }
    } catch (err) {
      console.error('Error fetching yields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYields();
  }, []);

  const chains = ['ALL', ...Array.from(new Set(pools.map((p) => p.chain))).filter(Boolean)];

  const filteredPools = pools.filter((p) => {
    const matchesChain = selectedChain === 'ALL' || p.chain === selectedChain;
    const matchesSearch =
      p.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChain && matchesSearch;
  });

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">DeFi & RWA Yield Aggregator</h2>
            <p className="text-xs text-zinc-400">Live aggregated capital yield feeds (DefiLlama + UpFrica RWA Vaults).</p>
          </div>
        </div>

        <button
          onClick={fetchYields}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Yields
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search protocol, symbol, or chain..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {chains.slice(0, 6).map((chain) => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                selectedChain === chain
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Protocol / Vault</th>
              <th className="pb-3 font-semibold">Asset</th>
              <th className="pb-3 font-semibold">Chain</th>
              <th className="pb-3 font-semibold text-right">TVL (USD)</th>
              <th className="pb-3 font-semibold text-right">APY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                  Fetching live yield feeds from RPC & DefiLlama...
                </td>
              </tr>
            ) : filteredPools.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  No yield pools found matching search filter.
                </td>
              </tr>
            ) : (
              filteredPools.map((p, idx) => (
                <tr key={p.pool || idx} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 font-sans font-medium text-white flex items-center gap-2">
                    {p.project}
                    {p.project.includes('UpFrica') && (
                      <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3" /> Native RWA
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-emerald-300 font-bold">{p.symbol}</td>
                  <td className="py-3 text-zinc-400">{p.chain}</td>
                  <td className="py-3 text-right text-zinc-300">${p.tvlUsd ? p.tvlUsd.toLocaleString('en-US') : '—'}</td>
                  <td className="py-3 text-right text-emerald-400 font-bold text-sm">
                    {p.apy}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
