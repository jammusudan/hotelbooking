import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(token, password);
      alert('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 pt-32 pb-16 px-4">
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl p-10 rounded-xl">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Reset Password</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">
            Secure your account access
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-bold border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">New Password</label>
              <input
                type="password"
                required
                minLength="6"
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-50 shadow-lg mt-4"
          >
            {loading ? 'Updating Access...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
