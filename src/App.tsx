import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { QuotePlayground } from './components/QuotePlayground';
import { BotRegistration } from './components/BotRegistration';
import { YieldsTable } from './components/YieldsTable';
import { LeaderboardView } from './components/LeaderboardView';
import { DocsView } from './components/DocsView';
import { BotDashboardView } from './components/BotDashboardView';
import { FEE_WALLET } from '../lib/fee';
import { Terminal, Trophy, ShieldCheck, ArrowRight, Zap, Globe, Layers, Cpu, Check, Copy } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [copiedFooterWallet, setCopiedFooterWallet] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyFooterWallet = () => {
    navigator.clipboard.writeText(FEE_WALLET);
    setCopiedFooterWallet(true);
    setTimeout(() => setCopiedFooterWallet(false), 2000);
  };

  // Route matches
  const isLeaderboard = currentPath === '/leaderboard';
  const isDocs = currentPath === '/docs';
  const isBotDashboard = currentPath.startsWith('/bot/');
  const botIdFromPath = isBotDashboard ? currentPath.replace('/bot/', '') : '';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950 flex flex-col justify-between">
      <div>
        <Navbar currentPath={currentPath} navigate={navigate} />

        {isLeaderboard ? (
          <LeaderboardView navigate={navigate} />
        ) : isDocs ? (
          <DocsView />
        ) : isBotDashboard ? (
          <BotDashboardView botId={botIdFromPath} navigate={navigate} />
        ) : (
          /* Main Home Page / Router Hub */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-12 relative">
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full mb-6 text-xs shadow-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-300 font-medium">Verified Settlement Wallet:</span>
                <code className="text-emerald-400 font-mono font-bold">{FEE_WALLET}</code>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
                UpFrica Bot Network
              </h1>

              <p className="text-lg sm:text-xl text-zinc-300 font-medium max-w-3xl mx-auto leading-relaxed mb-8">
                The Router to Global Capital. Unlimited API for $660T Markets. 2% Bot-to-Bot Fee.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => navigate('/docs')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-extrabold rounded-xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer text-sm"
                >
                  <Terminal className="w-4 h-4" />
                  API Docs
                </button>

                <button
                  onClick={() => navigate('/leaderboard')}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 transition-all cursor-pointer text-sm"
                >
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  Leaderboard
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4">
                  <Zap className="w-5 h-5 text-emerald-400 mb-2" />
                  <h3 className="text-sm font-bold text-white">Sub-Second Execution</h3>
                  <p className="text-xs text-zinc-400 mt-1">High-frequency capital routing across RWA and multi-chain liquidity.</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4">
                  <Globe className="w-5 h-5 text-cyan-400 mb-2" />
                  <h3 className="text-sm font-bold text-white">Dynamic Fee Tiers</h3>
                  <p className="text-xs text-zinc-400 mt-1">0.1% (&lt;$1M), 0.5% (&lt;$10M), 1.0% (&gt;$10M), and 2.0% for Bot-to-Bot.</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4">
                  <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                  <h3 className="text-sm font-bold text-white">0.1% Referral Network</h3>
                  <p className="text-xs text-zinc-400 mt-1">Accrue continuous passive referral fees in Upstash Redis.</p>
                </div>
              </div>
            </div>

            {/* Live Network Analytics */}
            <StatsBar />

            {/* Interactive Route Quote Playground */}
            <QuotePlayground />

            {/* Register Bot Agent Form */}
            <BotRegistration navigate={navigate} />

            {/* Live Yields Aggregator Table */}
            <YieldsTable />
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-sans">Powered by UpFrica</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Fee Wallet:</span>
            <code className="text-emerald-400 font-bold">{FEE_WALLET}</code>
            <button
              onClick={copyFooterWallet}
              className="p-1 hover:text-white transition-colors"
              title="Copy Wallet Address"
            >
              {copiedFooterWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <button onClick={() => navigate('/docs')} className="hover:text-zinc-300 transition-colors">API Docs</button>
            <button onClick={() => navigate('/leaderboard')} className="hover:text-zinc-300 transition-colors">Leaderboard</button>
            <span>v9.5.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
