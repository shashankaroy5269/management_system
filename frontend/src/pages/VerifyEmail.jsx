import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const token = searchParams.get('token') || routeToken;
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const [loading, setLoading] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (token) {
      const performVerification = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await authApi.verifyEmail(token);
          if (res.data?.success) {
            setSuccess(true);
            const { accessToken, refreshToken, user } = res.data;
            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
              if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
              localStorage.setItem('user', JSON.stringify(user));
              updateUserProfile(user);
            }
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Verification link is invalid or has expired.');
        } finally {
          setLoading(false);
        }
      };

      performVerification();
    }
  }, [token]);

  // Auto-redirect to dashboard on success
  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (success && countdown === 0) {
      navigate('/dashboard');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendMsg('');
    setError('');

    try {
      const res = await authApi.resendVerification(resendEmail);
      if (res.data?.success) {
        setResendMsg('A new verification email has been dispatched! Please check your inbox.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-70" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          {/* Loading State */}
          {loading && (
            <div className="py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Verifying Your Email...</h2>
              <p className="text-xs text-slate-500">
                Please wait while we validate your security token.
              </p>
            </div>
          )}

          {/* Success State */}
          {!loading && success && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Email Verified Successfully!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your account is now fully active. Redirecting you to your workspace in{' '}
                <span className="font-bold text-blue-600">{countdown}s</span>...
              </p>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Workspace Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error State or Resend Request */}
          {!loading && !success && (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {error ? 'Verification Link Expired or Invalid' : 'Verify Your Email Address'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {error || 'Enter your registered email address to receive a fresh verification link.'}
                </p>
              </div>

              {resendMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                  {resendMsg}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resending || !resendEmail}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Sending Email...' : 'Resend Verification Link'}</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  &larr; Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
