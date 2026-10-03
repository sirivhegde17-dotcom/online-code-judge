import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, Filter, Terminal, ArrowUpDown } from 'lucide-react';

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [sortBy, setSortBy] = useState('id');

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await problemService.getProblems({
        search: search || undefined,
        difficulty: difficulty || undefined,
        tag: tag || undefined,
        sort_by: sortBy,
      });
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load problems list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [difficulty, tag, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'EASY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'HARD':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <Terminal className="w-8 h-8 text-indigo-500" />
            <span>Coding Problems</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse our curated problem set, test your code, and level up your algorithm skills.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search problems by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="difficulty">Sort by Difficulty</option>
          <option value="created_at">Sort by Date Created</option>
        </select>
      </div>

      <ErrorMessage message={error} onRetry={fetchProblems} />

      {loading ? (
        <LoadingSpinner label="Fetching problem list..." />
      ) : problems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          No problems found matching your filters.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Difficulty</th>
                <th className="py-4 px-6">Tags</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {problems.map((prob) => (
                <tr key={prob.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-500">#{prob.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                    <Link to={`/problems/${prob.id}`}>{prob.title}</Link>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDifficultyBadge(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {prob.tags?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">
                          {t}
                        </span>
                      )) || <span className="text-slate-600">-</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/problems/${prob.id}`}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors inline-block"
                    >
                      Solve
                    </Link>
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

export default ProblemsPage;
