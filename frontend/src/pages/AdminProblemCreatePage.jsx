import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { problemService } from '../services/problemService';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Trash2, Save } from 'lucide-react';

const AdminProblemCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [constraints, setConstraints] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [tags, setTags] = useState('Array, Hash Table');
  const [timeLimit, setTimeLimit] = useState(2.0);
  const [memoryLimit, setMemoryLimit] = useState(128);

  const [testCases, setTestCases] = useState([
    { input: '1\n2', expected_output: '3', is_hidden: false },
    { input: '5\n10', expected_output: '15', is_hidden: true },
  ]);

  const addTestCaseField = () => {
    setTestCases([...testCases, { input: '', expected_output: '', is_hidden: false }]);
  };

  const removeTestCaseField = (index) => {
    setTestCases(testCases.filter((_, idx) => idx !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      await problemService.createProblem({
        title,
        description,
        difficulty,
        constraints,
        input_format: inputFormat,
        output_format: outputFormat,
        tags: tagArray,
        time_limit: parseFloat(timeLimit),
        memory_limit: parseInt(memoryLimit, 10),
        test_cases: testCases,
      });
      navigate('/admin/problems');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-slate-100">Create Problem Statement</h1>
          <p className="text-sm text-slate-400">Define problem description, constraints, and test suites.</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200">Basic Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. Two Sum"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Time Limit (sec)</label>
                <input
                  type="number"
                  step="0.5"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Memory Limit (MB)</label>
                <input
                  type="number"
                  value={memoryLimit}
                  onChange={(e) => setMemoryLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Problem Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Detailed problem statement..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
              />
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-200">Test Cases</h3>
              <button
                type="button"
                onClick={addTestCaseField}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-semibold text-indigo-400 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>

            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Test Case #{idx + 1}</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.is_hidden}
                        onChange={(e) => handleTestCaseChange(idx, 'is_hidden', e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                      />
                      <span>Hidden Test Case</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTestCaseField(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Input</label>
                    <textarea
                      rows={3}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Expected Output</label>
                    <textarea
                      rows={3}
                      value={tc.expected_output}
                      onChange={(e) => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Publishing Problem...' : 'Publish Problem'}</span>
          </button>
        </form>
      </main>
    </div>
  );
};

export default AdminProblemCreatePage;
