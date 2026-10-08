import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Phone,
  BookOpen,
  X,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}! 🎓`, 'success');
        navigate('/dashboard');
      } else {
        showToast(res.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Login failed. Please check your credentials.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login Helper
  const handleQuickLogin = async (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setLoading(true);
    try {
      const res = await login(demoId, demoPass);
      if (res.success) {
        showToast(`Logged in as ${res.user.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast('Quick demo login error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetNewPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setResetLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        identifier: resetIdentifier,
        phone: resetPhone,
        newPassword: resetNewPassword,
      });

      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIdentifier(resetIdentifier);
        setPassword(resetNewPassword);
        setForgotModalOpen(false);
        setResetIdentifier('');
        setResetPhone('');
        setResetNewPassword('');
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Verification failed. Please check your details.',
        'error'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ArrowLeftRight className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Log in to CampusSwap
          </h1>
          <p className="text-xs text-slate-500">
            Enter your College Email or Student ERP ID to access your campus account
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Instant Demo Logins
            </span>
            <span className="text-[10px] text-brand-600 font-semibold">ERP / Mobile No. Enabled</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('CS-2024-042', '9823456789')}
              className="px-2.5 py-2 bg-white hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl text-left transition-all group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-brand-600">
                Atharva (Student ERP)
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">ERP: CS-2024-042</span>
              <span className="text-[9px] text-slate-400 block">Pass: Mobile No.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@college.edu', 'admin123')}
              className="px-2.5 py-2 bg-white hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-xl text-left transition-all group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-rose-600">
                Admin (Moderator)
              </span>
              <span className="text-[10px] text-slate-500 block">admin@college.edu</span>
              <span className="text-[9px] text-slate-400 block">Pass: admin123</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email or ERP Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              College Email or Student ERP / Roll No.
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="atharva@college.edu or CS-2024-042"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetIdentifier(identifier);
                  setForgotModalOpen(true);
                }}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type="password"
                required
                placeholder="Mobile No. or Custom Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
              Default password is your registered Mobile No.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Log In to CampusSwap'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Join CampusSwap here
            </Link>
          </p>
        </div>

      </div>

      {/* Forgot / Reset Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-sm">Reset Student Password</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Verify your registered student ERP ID or College Email along with your Mobile Number to create a new custom password.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Email or Student ERP ID *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. atharva@college.edu or CS-2024-042"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9823456789"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used for identity verification on campus records
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create New Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {resetLoading ? 'Verifying & Updating...' : 'Set New Password'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
