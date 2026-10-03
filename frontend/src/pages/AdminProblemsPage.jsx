import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { problemService } from '../services/problemService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Trash2, Edit, Terminal } from 'lucide-react';

const AdminProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await problemService.getProblems({ limit: 100 });
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch admin problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete problem #${id}?`)) return;
    try {
      await problemService.deleteProblem(id);
      setProblems(problems.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete problem.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-amber-400" />
              <span>Admin Problem Management</span>
            </h1>
            <p className="text-sm text-slate-400">Add, edit, or delete problem statements and test suites.</p>
          </div>

          <Link
            to="/admin/problems/create"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Problem</span>
          </Link>
        </div>

        <ErrorMessage message={error} onRetry={fetchProblems} />

        {loading ? (
          <LoadingSpinner label="Loading admin problems..." />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Limits</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-slate-800/50">
                    <td className="py-4 px-6 font-mono text-slate-500">#{prob.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-100">{prob.title}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {prob.time_limit}s / {prob.memory_limit}MB
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(prob.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded transition-colors"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default AdminProblemsPage;
