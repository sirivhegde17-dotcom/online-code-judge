import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { submissionService } from '../services/submissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { History, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await submissionService.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch submission history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'WRONG_ANSWER':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'TIME_LIMIT_EXCEEDED':
      case 'MEMORY_LIMIT_EXCEEDED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'COMPILATION_ERROR':
      case 'RUNTIME_ERROR':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'RUNNING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <History className="w-6 h-6 text-indigo-500" />
              <span>Submission History</span>
            </h1>
            <p className="text-sm text-slate-400">View execution logs and submission outcomes across your solved problems.</p>
          </div>
        </div>

        <ErrorMessage message={error} onRetry={fetchSubmissions} />

        {loading ? (
          <LoadingSpinner label="Loading submissions..." />
        ) : submissions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            <p>No submissions found yet. Choose a problem and submit code to see execution history.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Problem</th>
                  <th className="py-4 px-6">Language</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Runtime</th>
                  <th className="py-4 px-6">Memory</th>
                  <th className="py-4 px-6 text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500">
                      <Link to={`/submissions/${sub.id}`} className="hover:underline text-indigo-400">
                        #{sub.id}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-100">
                      <Link to={`/problems/${sub.problem_id}`}>{sub.problem_title || `Problem #${sub.problem_id}`}</Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {sub.language}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {sub.execution_time !== null ? `${sub.execution_time}s` : '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {sub.memory_used !== null ? `${sub.memory_used}MB` : '-'}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmissionsPage;
