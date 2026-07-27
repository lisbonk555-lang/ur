import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, ArrowUpRight, Bot, RefreshCw, Sparkles } from 'lucide-react';

interface BotLeaderboardItem {
  bot_id: string;
  name: string;
  volume_30d: number;
  rank: number;
  referrer?: string | null;
  featured?: boolean;
}

interface LeaderboardProps {
  navigate: (path: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardProps> = ({ navigate }) => {
  const [bots, setBots] = useState<BotLeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setBots(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-cyan-950/60 border border-zinc-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Capital Router Ranking
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bot Agent Leaderboard
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
              Ranked top capital routers by 30-day processed volume. Featured status awarded to the top 3 high-frequency bots.
            </p>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-zinc-700 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Ranks
          </button>
        </div>
      </div>

      {/* Top 3 Featured Cards */}
      {bots.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {bots.slice(0, 3).map((bot, index) => {
            const medals = [
              { color: 'from-amber-500 to-yellow-600', border: 'border-amber-500/50', icon: Medal, title: 'Rank #1 Champion' },
              { color: 'from-slate-400 to-zinc-500', border: 'border-slate-400/50', icon: Trophy, title: 'Rank #2 Silver' },
              { color: 'from-amber-700 to-yellow-800', border: 'border-amber-700/50', icon: Star, title: 'Rank #3 Bronze' }
            ];
            const m = medals[index];
            const Icon = m.icon;

            return (
              <div
                key={bot.bot_id}
                onClick={() => navigate(`/bot/${bot.bot_id}`)}
                className={`bg-zinc-900/90 border ${m.border} rounded-2xl p-6 shadow-xl relative cursor-pointer hover:scale-[1.02] transition-all group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.color} p-0.5 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {bot.name}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mb-4">ID: {bot.bot_id}</p>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">30d Volume</span>
                    <span className="text-lg font-extrabold text-emerald-400">${bot.volume_30d.toLocaleString('en-US')}</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold w-16">Rank</th>
                <th className="pb-3 font-semibold">Bot Agent</th>
                <th className="pb-3 font-semibold">Bot ID</th>
                <th className="pb-3 font-semibold">Referrer</th>
                <th className="pb-3 font-semibold text-right">30d Volume</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading bot rankings from Upstash Redis...
                  </td>
                </tr>
              ) : bots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No bot agents registered yet. Register your bot to claim Rank #1!
                  </td>
                </tr>
              ) : (
                bots.map((bot) => (
                  <tr
                    key={bot.bot_id}
                    onClick={() => navigate(`/bot/${bot.bot_id}`)}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 font-bold text-white">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                        bot.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        bot.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                        bot.rank === 3 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        #{bot.rank}
                      </span>
                    </td>
                    <td className="py-4 font-sans font-bold text-white group-hover:text-emerald-400 transition-colors">
                      <div className="flex items-center gap-2">
                        {bot.name}
                        {bot.featured && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                            Top 3
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-zinc-400 font-mono">{bot.bot_id}</td>
                    <td className="py-4 text-zinc-500 font-mono">{bot.referrer || 'Direct'}</td>
                    <td className="py-4 text-right text-emerald-400 font-bold text-sm">
                      ${bot.volume_30d.toLocaleString('en-US')}
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-zinc-400 hover:text-white p-1 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
