import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Terminal, PlusCircle, Users, History, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/problems"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/problems')
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Problem Archive</span>
        </Link>
        <Link
          to="/submissions"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/submissions')
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Submissions</span>
        </Link>
        <Link
          to="/leaderboard"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/leaderboard')
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </Link>
      </div>

      {isAdmin && (
        <div className="space-y-1 pt-4 border-t border-slate-800">
          <p className="px-3 text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2">Admin Panel</p>
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>Admin Overview</span>
          </Link>
          <Link
            to="/admin/problems"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/problems')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Manage Problems</span>
          </Link>
          <Link
            to="/admin/problems/create"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/problems/create')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create Problem</span>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
