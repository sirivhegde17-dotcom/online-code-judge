import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { submissionService } from '../services/submissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CodeEditor from '../components/CodeEditor';
import { CheckCircle2, AlertTriangle, Clock, Cpu, FileCode } from 'lucide-react';

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await submissionService.getSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch submission details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading submission details..." />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <ErrorMessage message={error} />

        {submission && (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Submission #{submission.id}</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Problem:{' '}
                  <Link to={`/problems/${submission.problem_id}`} className="text-indigo-400 font-semibold hover:underline">
                    {submission.problem_title || `#${submission.problem_id}`}
                  </Link>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
                  {submission.language}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    submission.status === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {submission.status}
                </span>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Execution Time</p>
                  <p className="text-base font-bold text-slate-100">
                    {submission.execution_time !== null ? `${submission.execution_time}s` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Memory Used</p>
                  <p className="text-base font-bold text-slate-100">
                    {submission.memory_used !== null ? `${submission.memory_used}MB` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Timestamp</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Source Code Viewer */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Source Code</h3>
              <div className="h-96">
                <CodeEditor
                  language={submission.language}
                  value={submission.source_code}
                  readOnly={true}
                  height="100%"
                />
              </div>
            </div>

            {/* Per Test Case Output Details */}
            {submission.results?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Case Evaluations</h3>
                <div className="grid grid-cols-1 gap-3">
                  {submission.results.map((res, idx) => (
                    <div key={res.id || idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">Test Case #{idx + 1}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            res.status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      {res.stdout && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Stdout</p>
                          <pre className="p-2 bg-slate-950 rounded text-xs font-mono text-slate-300 mt-1">{res.stdout}</pre>
                        </div>
                      )}
                      {res.stderr && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Stderr</p>
                          <pre className="p-2 bg-slate-950 border border-rose-500/30 rounded text-xs font-mono text-rose-300 mt-1">{res.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SubmissionDetailPage;
