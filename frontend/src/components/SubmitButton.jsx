import React from 'react';
import { Send, Loader2 } from 'lucide-react';

const SubmitButton = ({ onClick, loading = false, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Send className="w-3.5 h-3.5" />
      )}
      <span>{loading ? 'Submitting...' : 'Submit Solution'}</span>
    </button>
  );
};

export default SubmitButton;
