import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AxiosInstance from '../api/axios';
import Loader from '../components/Loader';
import { CheckCircle2, XCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
      setMessage('No verification token provided in the link.');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await AxiosInstance.get(`/auth/verify-email?token=${token}`);
      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message || 'Your email has been verified successfully!');
      }
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.response?.data?.message ||
          'Invalid or expired verification token. Please request a new link below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      const response = await AxiosInstance.post('/auth/resend-verification', {
        email: resendEmail,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Verification Link Sent',
          text: response.data.message,
        });
        setResendEmail('');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Resend',
        text: error.response?.data?.message || 'Could not send verification email',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 text-center">
          {loading ? (
            <div className="py-6">
              <Loader text="Verifying your email address..." />
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

              {/* Resend Verification Form */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Request New Verification Link
                </h3>
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your registered email..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Sending Email...' : 'Resend Email'}</span>
                  </button>
                </form>
              </div>

              <div className="pt-2">
                <Link to="/login" className="text-xs font-semibold text-blue-600 hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
