import React, { useState } from 'react';
import { Cpu, ShieldCheck, FileText, Trophy, Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { FEE_WALLET } from '../../lib/fee.js';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [copied, setCopied] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(FEE_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                UpFrica
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 font-mono">
                v9.5.1
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Bot Network Router</p>
          </div>
        </div>

        {/* Verified Fee Wallet Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-zinc-400">Verified Fee Wallet:</span>
          <code className="text-emerald-300 font-mono text-[11px] font-semibold">
            {FEE_WALLET.slice(0, 6)}...{FEE_WALLET.slice(-4)}
          </code>
          <button 
            onClick={copyWallet}
            title="Copy Wallet Address"
            className="p-1 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPath === '/' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Router Hub
          </button>

          <button
            onClick={() => {
              if (currentPath !== '/') {
                navigate('/');
              }
              setTimeout(() => {
                const el = document.getElementById('brains-hub-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/40 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Automated Brains</span>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPath === '/leaderboard' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>

          <button
            onClick={() => navigate('/docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPath === '/docs' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            API Docs
          </button>
        </nav>

      </div>
    </header>
  );
};
