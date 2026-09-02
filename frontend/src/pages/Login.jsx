import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { Shield, Lock, Mail, Layers, ArrowRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid email or password.';
      setError(errMsg);
      if (err.response?.status === 403 && errMsg.toLowerCase().includes('verif')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await authApi.resendVerification(email);
      if (res.data?.success) {
        setResendMsg('Verification link sent to your email! Please check your inbox.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  // 1-Click Quick Fill Demo Credentials for Live Interviews
  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123456');
    } else if (role === 'manager') {
      setEmail('manager.sneha@example.com');
      setPassword('Manager@123456');
    } else if (role === 'employee') {
      setEmail('employee.rahul@example.com');
      setPassword('Employee@123456');
    }
    setError('');
    setIsUnverified(false);
    setResendMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-70" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            TaskFlow RBAC
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Enterprise Role-Based Task & Assignment Management
          </p>
        </div>

        {/* Demo Credentials Quick Bar for Live Interviews */}
        <div className="mb-4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Live Interview Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-bold transition-all hover:scale-105 flex flex-col items-center"
            >
              <span>👑 Vikram</span>
              <span className="text-[10px] text-purple-600 font-medium">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('manager')}
              className="px-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold transition-all hover:scale-105 flex flex-col items-center"
            >
              <span>💼 Sneha</span>
              <span className="text-[10px] text-blue-600 font-medium">Manager</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('employee')}
              className="px-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all hover:scale-105 flex flex-col items-center"
            >
              <span>👨‍💻 Rahul</span>
              <span className="text-[10px] text-emerald-600 font-medium">Employee</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>

                {isUnverified && (
                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="text-xs text-blue-600 hover:text-blue-700 underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>Resend Verification Link to My Email</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {resendMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{resendMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
