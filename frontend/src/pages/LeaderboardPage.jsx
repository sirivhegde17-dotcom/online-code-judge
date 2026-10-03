import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Trophy, Medal, Award, Star } from 'lucide-react';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await leaderboardService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch leaderboard rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-amber-400 inline" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 inline" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 inline" />;
    return <span className="font-mono text-slate-400">#{rank}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <span>Global Leaderboard</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Top programmers ranked by problems solved, accuracy rate, and total points scored.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchLeaderboard} />

      {loading ? (
        <LoadingSpinner label="Fetching leaderboard rankings..." />
      ) : leaderboard.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
          No rankings recorded yet. Be the first to solve a problem!
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Problems Solved</th>
                <th className="py-4 px-6">Submissions</th>
                <th className="py-4 px-6">Acceptance Rate</th>
                <th className="py-4 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {leaderboard.map((entry) => (
                <tr key={entry.user_id} className={`hover:bg-slate-800/50 transition-colors ${entry.rank <= 3 ? 'bg-amber-500/5' : ''}`}>
                  <td className="py-4 px-6 font-bold">{getRankBadge(entry.rank)}</td>
                  <td className="py-4 px-6 font-bold text-slate-100 flex items-center space-x-2">
                    <span>{entry.username}</span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-emerald-400">
                    {entry.problems_solved}
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs font-mono">
                    {entry.accepted_submissions} / {entry.total_submissions}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-300">
                    {entry.acceptance_rate}%
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-amber-400 flex items-center justify-end space-x-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                    <span>{entry.score} pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
