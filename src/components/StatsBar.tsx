import React, { useEffect, useState } from 'react';
import { DollarSign, Activity, Bot, RefreshCw } from 'lucide-react';

interface NetworkStats {
  volume_24h: number;
  total_fees_usd: number;
  total_bots: number;
}

export const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* 24h Volume */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">24h Routed Volume</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            ${stats ? stats.volume_24h.toLocaleString('en-US') : '0'}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium">Real-time RPC & Upstash Redis</span>
        </div>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Total Fees */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Fees Collected</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${stats ? stats.total_fees_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-zinc-400">Auto-routed to Fee Wallet</span>
        </div>
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Registered Bots */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Active Bot Agents</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {stats ? stats.total_bots : 0}
          </p>
          <span className="text-[11px] text-cyan-400 font-medium">Autonomous Capital Agents</span>
        </div>
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
          <Bot className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
