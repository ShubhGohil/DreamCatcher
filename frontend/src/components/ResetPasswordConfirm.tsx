import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Call the new Django endpoint
      await api.post('/auth/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword
      });

      setSuccess(true);
      // Optional: Redirect after a few seconds
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Complete</h2>
          <p className="text-gray-600">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <KeyRound className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-purple-900">Set New Password</h2>
          <p className="text-purple-600 text-sm">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}