import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ShieldAlert, Terminal, Users, Database, CheckCircle, Ban } from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sysStats, userList] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getUsers(),
      ]);
      setStats(sysStats);
      setUsers(userList);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId, currentActive) => {
    const action = currentActive ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} user #${userId}?`)) return;

    try {
      const updatedUser = await adminService.toggleUserStatus(userId, !currentActive);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} user.`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400 flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6" />
              <span>Admin Control Center</span>
            </h1>
            <p className="text-sm text-slate-400">System management, problem creation, test case auditing, and platform metrics.</p>
          </div>
        </div>

        <ErrorMessage message={error} onRetry={fetchAdminData} />

        {loading ? (
          <LoadingSpinner label="Loading admin system overview..." />
        ) : (
          <>
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Problems</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_problems || 0}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Registered Users</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_users || 0}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Submissions</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_submissions || 0}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Accepted Rate</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {stats?.total_submissions > 0
                      ? `${round((stats.accepted_submissions / stats.total_submissions) * 100, 1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>

            {/* Registered Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>User Accounts</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-mono text-slate-500">#{u.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-100">{u.username}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              u.is_active
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {u.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                            className={`px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1 ml-auto transition-colors ${
                              u.is_active
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{u.is_active ? 'Disable' : 'Enable'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

function round(val, decimals) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}

export default AdminDashboardPage;
