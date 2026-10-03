import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { leaderboardService } from '../services/leaderboardService';
import { submissionService } from '../services/submissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle2, Award, Clock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [myStats, subs] = await Promise.all([
          leaderboardService.getMyStats(),
          submissionService.getSubmissions({ limit: 5 }),
        ]);
        setStats(myStats);
        setRecentSubmissions(subs);
      } catch (err) {
        setError('Could not load user metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome, {user?.username}!</h1>
            <p className="text-sm text-slate-400">Track your coding performance and submission statistics.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold">
            Role: {user?.role}
          </span>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <LoadingSpinner label="Loading dashboard metrics..." />
        ) : (
          <>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Problems Solved</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.problems_solved || 0}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Submissions</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_submissions || 0}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Acceptance Rate</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.acceptance_rate || 0.0}%</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Leaderboard Rank</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {stats?.rank ? `#${stats.rank}` : '# -'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-slate-100">Recent Submissions</h2>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  <p>No recent submissions found. Start solving problems from the Problem Archive!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {recentSubmissions.map((sub) => (
                    <div key={sub.id} className="py-3 flex items-center justify-between">
                      <div>
                        <Link to={`/problems/${sub.problem_id}`} className="font-semibold text-slate-200 hover:text-indigo-400">
                          {sub.problem_title || `Problem #${sub.problem_id}`}
                        </Link>
                        <p className="text-xs text-slate-500">{new Date(sub.submitted_at).toLocaleString()}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          sub.status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
