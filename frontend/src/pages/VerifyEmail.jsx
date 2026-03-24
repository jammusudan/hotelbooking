import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useContext(AuthContext);
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      }
    };
    performVerification();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#EDF7BD] pt-32 pb-16 px-4">
      <div className="max-w-md w-full py-12 px-10 bg-white shadow-2xl rounded-xl text-center space-y-8 transition-all duration-700">
        {status === 'verifying' && (
          <div className="animate-in fade-in duration-1000 space-y-6">
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Authenticating</h2>
            <p className="text-[#281C59] text-sm font-bold uppercase tracking-widest">Verifying your credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in zoom-in duration-500 space-y-6">
            <div className="mx-auto h-24 w-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-5xl border-4 border-green-100 shadow-inner">
              ✓
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Access Granted</h2>
            <p className="text-[#281C59] text-sm font-medium leading-relaxed px-4">
              Your identity has been confirmed. You now have full access to our luxury collection.
            </p>
            <Link to="/login" className="inline-block w-full bg-[#EDF7BD] text-[#281C59] py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#EDF7BD] transition-all shadow-lg mt-4">
              Step Inside
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in shake-in duration-500 space-y-6">
            <div className="mx-auto h-24 w-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-5xl border-4 border-red-100 shadow-inner">
              ✕
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Access Denied</h2>
            <p className="text-[#281C59] text-sm font-medium leading-relaxed px-4">
              {message || 'The verification link has expired or is invalid.'}
            </p>
            <Link to="/register" className="inline-block w-full border-2 border-black text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#EDF7BD] transition-all mt-4">
              Try Registering Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
