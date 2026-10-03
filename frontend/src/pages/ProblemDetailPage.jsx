import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector, { STARTER_CODE_TEMPLATES } from '../components/LanguageSelector';
import RunButton from '../components/RunButton';
import SubmitButton from '../components/SubmitButton';
import { Clock, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

const ProblemDetailPage = () => {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [language, setLanguage] = useState('PYTHON');
  const [code, setCode] = useState(STARTER_CODE_TEMPLATES.PYTHON);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // --------------------------------------------------
  // LOAD PROBLEM
  // --------------------------------------------------

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await problemService.getProblemById(id);
        setProblem(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          'Failed to load problem statement.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // --------------------------------------------------
  // LANGUAGE CHANGE
  // --------------------------------------------------

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(STARTER_CODE_TEMPLATES[newLanguage] || '');
    setExecutionResult(null);
  };

  // --------------------------------------------------
  // RUN CODE
  // --------------------------------------------------

  const handleRunCode = async () => {
    if (!code.trim()) {
      setExecutionResult({
        status: 'INTERNAL_ERROR',
        execution_time: 0,
        memory_used: 0,
        stdout: '',
        stderr: 'Please enter some code before running.',
        passed: 0,
        total: 0,
      });
      return;
    }

    setRunning(true);
    setExecutionResult(null);

    try {
      const res = await submissionService.runCode(
        id,
        language,
        code
      );

      setExecutionResult({
        status: res.status,
        execution_time: res.execution_time,
        memory_used: res.memory_used,
        stdout:
          res.stdout ||
          'Program executed cleanly with no stdout output.',
        stderr: res.stderr,
        passed: res.test_cases_passed,
        total: res.total_test_cases,
      });
    } catch (err) {
      setExecutionResult({
        status: 'INTERNAL_ERROR',
        execution_time: 0,
        memory_used: 0,
        stdout: '',
        stderr:
          err.response?.data?.detail ||
          'Execution request failed.',
        passed: 0,
        total: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  // --------------------------------------------------
  // SUBMIT SOLUTION
  // --------------------------------------------------

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      setExecutionResult({
        status: 'INTERNAL_ERROR',
        execution_time: 0,
        memory_used: 0,
        stdout: '',
        stderr: 'Please enter some code before submitting.',
        passed: 0,
        total: 0,
      });
      return;
    }

    setSubmitting(true);
    setExecutionResult(null);

    try {
      const sub = await submissionService.submitSolution(
        id,
        language,
        code
      );

      let attempts = 0;

      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const detail =
            await submissionService.getSubmissionById(sub.id);

          if (
            detail.status !== 'PENDING' &&
            detail.status !== 'RUNNING'
          ) {
            clearInterval(pollInterval);
            setSubmitting(false);

            setExecutionResult({
              status: detail.status,
              execution_time:
                detail.execution_time || 0,
              memory_used:
                detail.memory_used || 0,
              stdout:
                `Submission #${detail.id} evaluated. ` +
                `Status: ${detail.status}`,
              stderr:
                detail.results?.find(
                  (r) => r.stderr
                )?.stderr || '',
              passed:
                detail.results?.filter(
                  (r) => r.status === 'ACCEPTED'
                ).length || 0,
              total:
                detail.results?.length || 0,
            });
          } else if (attempts > 15) {
            clearInterval(pollInterval);
            setSubmitting(false);

            setExecutionResult({
              status: detail.status,
              execution_time: 0,
              memory_used: 0,
              stdout:
                `Submission #${detail.id} is still queued. ` +
                `Check the Submissions page for updates.`,
              stderr: '',
              passed: 0,
              total: 0,
            });
          }
        } catch (err) {
          clearInterval(pollInterval);
          setSubmitting(false);

          setExecutionResult({
            status: 'INTERNAL_ERROR',
            execution_time: 0,
            memory_used: 0,
            stdout: '',
            stderr:
              err.response?.data?.detail ||
              'Failed to check submission status.',
            passed: 0,
            total: 0,
          });
        }
      }, 1000);
    } catch (err) {
      setSubmitting(false);

      setExecutionResult({
        status: 'INTERNAL_ERROR',
        execution_time: 0,
        memory_used: 0,
        stdout: '',
        stderr:
          err.response?.data?.detail ||
          'Submission request failed.',
        passed: 0,
        total: 0,
      });
    }
  };

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------

  if (loading) {
    return (
      <LoadingSpinner label="Loading problem environment..." />
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        width: '100%',
        height: 'calc(100vh - 4rem)',
        overflow: 'hidden',
        backgroundColor: '#020617',
      }}
    >

      {/* ==================================================
          LEFT SIDE - PROBLEM
      ================================================== */}

      <div
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          padding: '24px',
          borderRight: '1px solid #1e293b',
          boxSizing: 'border-box',
        }}
        className="space-y-6"
      >

        {/* Title */}

        <div>
          <div className="flex items-center space-x-3 mb-2">

            <h1 className="text-2xl font-extrabold text-slate-100">
              {problem.title}
            </h1>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {problem.difficulty}
            </span>

          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">

            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              Time Limit: {problem.time_limit}s
            </span>

            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5" />
              Memory Limit: {problem.memory_limit}MB
            </span>

          </div>
        </div>

        {/* Description */}

        <div className="space-y-2">

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Description
          </h3>

          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {problem.description}
          </p>

        </div>

        {/* Constraints */}

        {problem.constraints && (
          <div className="space-y-2">

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Constraints
            </h3>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-line">
              {problem.constraints}
            </div>

          </div>
        )}

        {/* Input Format */}

        {problem.input_format && (
          <div className="space-y-2">

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Input Format
            </h3>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              {problem.input_format}
            </div>

          </div>
        )}

        {/* Output Format */}

        {problem.output_format && (
          <div className="space-y-2">

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Output Format
            </h3>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              {problem.output_format}
            </div>

          </div>
        )}

        {/* Sample Test Cases */}

        {problem.public_test_cases?.length > 0 && (
          <div className="space-y-4">

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sample Test Cases
            </h3>

            {problem.public_test_cases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2"
              >

                <p className="text-xs font-bold text-indigo-400">
                  Example {idx + 1}
                </p>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Input
                  </span>

                  <pre className="p-2 bg-slate-950 rounded text-xs font-mono text-slate-200 mt-1">
                    {tc.input}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Expected Output
                  </span>

                  <pre className="p-2 bg-slate-950 rounded text-xs font-mono text-emerald-400 mt-1">
                    {tc.expected_output}
                  </pre>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* ==================================================
          RIGHT SIDE - CODE EDITOR
      ================================================== */}

      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          overflow: 'hidden',
        }}
      >

        {/* Editor Header */}

        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">

          <LanguageSelector
            selectedLanguage={language}
            onChange={handleLanguageChange}
          />

          <div className="flex items-center space-x-2">

            <RunButton
              onClick={handleRunCode}
              loading={running}
              disabled={submitting}
            />

            <SubmitButton
              onClick={handleSubmitSolution}
              loading={submitting}
              disabled={running}
            />

          </div>

        </div>

        {/* Code Editor */}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            padding: '8px',
            backgroundColor: '#020617',
            overflow: 'hidden',
          }}
        >

          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            height="100%"
          />

        </div>

        {/* Results */}

        {executionResult && (
          <div className="border-t border-slate-800 bg-slate-900 p-4 space-y-3 max-h-48 overflow-y-auto">

            <div className="flex items-center justify-between">

              <div className="flex items-center space-x-2">

                {executionResult.status === 'ACCEPTED' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}

                <span
                  className={`text-sm font-bold ${executionResult.status === 'ACCEPTED'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                    }`}
                >
                  {executionResult.status}
                </span>

                {executionResult.total > 0 && (
                  <span className="text-xs text-slate-400">
                    ({executionResult.passed}/
                    {executionResult.total} test cases passed)
                  </span>
                )}

              </div>

              <div className="text-xs text-slate-400 space-x-3">

                <span>
                  Time: {executionResult.execution_time}s
                </span>

                <span>
                  Memory: {executionResult.memory_used}MB
                </span>

              </div>

            </div>

            {executionResult.stdout && (
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {executionResult.stdout}
              </pre>
            )}

            {executionResult.stderr && (
              <pre className="p-3 bg-slate-950 border border-rose-500/30 rounded text-xs font-mono text-rose-300 whitespace-pre-wrap">
                {executionResult.stderr}
              </pre>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default ProblemDetailPage;