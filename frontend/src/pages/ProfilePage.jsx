import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-slate-100">User Profile</h1>
          <p className="text-sm text-slate-400">Manage your credentials and personal settings.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 text-slate-300 pb-3 border-b border-slate-800">
            <User className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">Username:</span>
            <span className="text-slate-100">{user?.username}</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300 pb-3 border-b border-slate-800">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">Email:</span>
            <span className="text-slate-100">{user?.email}</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300 pb-3 border-b border-slate-800">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">Role:</span>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">Member Since:</span>
            <span className="text-slate-100">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
