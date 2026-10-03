import React from 'react';

const LoadingSpinner = ({ label = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
