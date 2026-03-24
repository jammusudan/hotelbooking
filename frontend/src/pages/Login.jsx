import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogIn, Shield, Briefcase, Settings, Globe, Sparkles } from "lucide-react";

const Login = ({ role = "customer" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "manager") navigate("/manager/dashboard");
      else navigate("/customer/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === "admin") navigate("/admin/dashboard");
      else if (loggedInUser.role === "manager") navigate("/manager/dashboard");
      else navigate("/customer/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    }
  };

  const roleConfigs = {
    customer: {
      title: "Customer",
      desc: "Step into the world of curated luxury.",
      icon: <LogIn size={32} />,
      registerLink: true
    },
    manager: {
      title: "Manager",
      desc: "Manage your hotel portfolio.",
      icon: <Briefcase size={32} />,
      registerLink: true
    },
    admin: {
      title: "Admin",
      desc: "Full system control center.",
      icon: <Settings size={32} />,
      registerLink: false
    },
  };

  const config = roleConfigs[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] py-24 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gold-900/5 blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-md w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-900 via-gold-600 to-gold-900 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="relative space-y-8 bg-[#111113] border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Globe size={120} className="text-gold-500" />
          </div>

          <div className="text-center relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-3xl text-gold-500 mb-8 border border-white/5 shadow-inner">
              {config.icon}
            </div>
            <h2 className="text-4xl font-serif font-black text-white uppercase tracking-tighter italic mb-4">{config.title}</h2>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-relaxed">
              {config.desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-950/20 text-red-400 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-in zoom-in-95 leading-relaxed text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] ml-1">Email</label>
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-gold-500/50 outline-none transition-all font-medium text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] ml-1">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-gold-500/50 outline-none transition-all font-medium text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" size="sm" className="text-[9px] font-black text-gray-600 hover:text-gold-500 uppercase tracking-[0.3em] transition-colors">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full group relative flex items-center justify-center gap-3 py-5 bg-gold-500 text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl hover:bg-white transition-all transform active:scale-95"
            >
              Login <Sparkles size={14} />
            </button>
          </form>

          {role !== 'admin' && (
            <>
              <div className="relative py-4 relative z-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-600">
                  <span className="bg-[#111113] px-4 tracking-[0.4em]">External Links</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <a
                  href={`http://localhost:5001/api/auth/google?role=${role}`}
                  className="flex items-center justify-center gap-3 border border-white/5 p-4 rounded-xl hover:bg-white/5 font-black text-[10px] uppercase tracking-widest transition-all text-gray-400 hover:text-white"
                >
                  Google
                </a>
                <a
                  href={`http://localhost:5001/api/auth/github?role=${role}`}
                  className="flex items-center justify-center gap-3 bg-white/5 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all text-white"
                >
                  GitHub
                </a>
              </div>
            </>
          )}

          {config.registerLink && (
            <p className="text-center text-[10px] text-gray-600 mt-8 font-black uppercase tracking-[0.2em] relative z-10">
              New here?
              <Link
                to="/register"
                className="text-gold-500 font-black ml-2 hover:underline decoration-gold-500/30 underline-offset-4"
              >
                Sign Up here
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;