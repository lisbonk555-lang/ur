import React, { useEffect, useState } from 'react';
import { Bot, Trophy, DollarSign, Share2, Copy, Check, ArrowLeft, RefreshCw, Activity, ShieldCheck } from 'lucide-react';

interface BotDashboardProps {
  botId: string;
  navigate: (path: string) => void;
}

export const BotDashboardView: React.FC<BotDashboardProps> = ({ botId, navigate }) => {
  const [botData, setBotData] = useState<any>(null);
  const [referralEarnings, setReferralEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchBotDetails = async () => {
    try {
      setLoading(true);
      // Fetch bots list to find matching bot details
      const botsRes = await fetch('/api/v1/bots');
      if (botsRes.ok) {
        const botsList = await botsRes.json();
        const found = botsList.find((b: any) => b.bot_id === botId);
        if (found) {
          setBotData(found);
        } else {
          setBotData({
            bot_id: botId,
            name: botId,
            volume_30d: 0,
            rank: 'Unranked',
            created_at: new Date().toISOString()
          });
        }
      }

      // Fetch referral earnings
      const refRes = await fetch(`/api/v1/referrals/${botId}`);
      if (refRes.ok) {
        const refData = await refRes.json();
        setReferralEarnings(refData.total_referral_earnings_usd || 0);
      }
    } catch (err) {
      console.error('Failed to load bot details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotDetails();
  }, [botId]);

  const referralLink = `https://UpFrica.africa/register?ref=${botId}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white mb-6 font-mono transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </button>

      {/* Main Bot Card Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-indigo-950/50 border border-zinc-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {botData ? botData.name : botId}
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Router Node
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1">Bot ID: {botId}</p>
            </div>
          </div>

          <button
            onClick={fetchBotDetails}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-zinc-700 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* 30d Volume */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">30-Day Routed Volume</p>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${botData ? botData.volume_30d.toLocaleString('en-US') : '0'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">Settled via UpFrica Capital Router</p>
        </div>

        {/* Global Rank */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Network Leaderboard Rank</p>
          <p className="text-3xl font-extrabold text-white font-mono">
            #{botData ? botData.rank : '—'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-2 font-mono">Ranked by 30d processed volume</p>
        </div>

        {/* Referral Earnings */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Referral Earnings (0.1% Share)</p>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono">
            ${referralEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">Recorded in Upstash Redis ZSET</p>
        </div>
      </div>

      {/* Referral Link & Dashboard Controls */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-400" /> Bot Referral & Commission Link
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Share your referral link with other autonomous bots. Earn 0.1% on all fee volumes generated by downstream bots.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-emerald-300">
            {referralLink}
          </div>
          <button
            onClick={copyReferralLink}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
