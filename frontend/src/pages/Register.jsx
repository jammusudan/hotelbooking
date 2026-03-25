import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Sparkles, Globe } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await register({ name, email, password, role });
      setSuccess(true);
      setTimeout(() => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'manager') navigate('/manager');
        else navigate('/hotels'); 
      }, 3000);
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD] py-24 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-transparent/5 blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-md w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-transparent to-transparent rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="relative space-y-8 bg-[#003049] border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 p-8 opacity-10">
             <UserPlus size={120} className="text-white" />
          </div>

          <div className="text-center relative z-10">
            <p className="text-xs font-black text-white uppercase tracking-widest leading-relaxed">
              Begin your journey with Navan.
            </p>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {success && (
              <div className="bg-green-950/20 text-green-400 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 animate-in zoom-in-95 leading-relaxed text-center">
                Verification anchor deployed. Redirecting to your estate...
              </div>
            )}
            {error && (
              <div className="bg-red-950/20 text-red-400 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-in zoom-in-95 leading-relaxed text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] ml-1">Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={16} />
                   <input type="text" required className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-white focus:border-transparent/50 outline-none transition-all font-medium text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] ml-1">Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={16} />
                   <input type="email" required className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-white focus:border-transparent/50 outline-none transition-all font-medium text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] ml-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={16} />
                   <input type="password" required className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-white focus:border-transparent/50 outline-none transition-all font-medium text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] ml-1">Select Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-transparent/50 outline-none transition-all font-medium text-sm appearance-none cursor-pointer">
                   <option value="customer" className="bg-[#EDF7BD]">Customer (Book Hotels)</option>
                   <option value="manager" className="bg-[#EDF7BD]">Manager (Manage Hotels)</option>
                   <option value="admin" className="bg-[#EDF7BD]">Admin (Control Center)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full group relative flex items-center justify-center gap-3 py-5 bg-transparent text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl hover:bg-white/10 transition-all transform active:scale-95 mt-8">
              Sign Up <Sparkles size={14} />
            </button>
          </form>

          <div className="text-center pt-8 border-t border-white/5 relative z-10">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Already have an account? 
              <Link to="/login" className="text-white font-black ml-2 hover:underline decoration-[transparent]/30 underline-offset-4">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
