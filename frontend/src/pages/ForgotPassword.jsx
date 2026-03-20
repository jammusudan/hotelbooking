import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      await forgotPassword(email);
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 pt-32 pb-16 px-4">
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl p-10 rounded-xl">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Forgot Password</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">
            Enter your email to reset
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm text-center font-bold border border-green-100">{message}</div>}
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-bold border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <input
              type="email"
              required
              className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-xs font-black text-gray-400 hover:text-black uppercase tracking-widest transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
