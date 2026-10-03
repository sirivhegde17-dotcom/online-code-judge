import React from 'react';
import { Play, Loader2 } from 'lucide-react';

const RunButton = ({ onClick, loading = false, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 shadow transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
      ) : (
        <Play className="w-3.5 h-3.5 text-amber-400" />
      )}
      <span>{loading ? 'Running...' : 'Run Code'}</span>
    </button>
  );
};

export default RunButton;
