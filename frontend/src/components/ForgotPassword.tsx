import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Sign In</span>
      </button>

      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-purple-900 mb-2">Reset Your Password</h2>
        <p className="text-purple-600 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <p className="text-green-700 font-medium">Email sent successfully!</p>
          </div>
          <p className="text-green-600 text-sm">
            Check your email for a link to reset your password. The link expires in 24 hours.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-3"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
}