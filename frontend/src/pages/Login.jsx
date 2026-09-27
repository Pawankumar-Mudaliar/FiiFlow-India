import { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      
      // Store user session data locally so the dashboard knows who is logged in
      localStorage.setItem('fiiUser', JSON.stringify(res.data.user));
      
      // Route immediately to the terminal dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] px-4 font-sans selection:bg-[#00F0FF] selection:text-black">
      
      <div className="w-full max-w-md bg-[#0B1120] border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,1)]">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center justify-center w-12 h-12 bg-[#00F0FF] rounded-xl mb-6">
            <TrendingUp className="text-black w-7 h-7 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to FlowInvest</h1>
          <p className="text-sm text-slate-400">Enter your credentials to access the terminal</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-[#FF5252]/10 border border-[#FF5252]/50 rounded-lg flex items-center space-x-3 text-[#FF5252] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Work Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. fundmanager@mumbaiquant.com"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Password
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors tracking-widest"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-700 bg-[#050810] checked:bg-[#00F0FF] checked:border-[#00F0FF] focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none transition-colors relative after:content-[''] after:absolute after:hidden checked:after:block after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:left-[5px] after:top-[2px]"
              />
              <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember this terminal</span>
            </label>
            <Link to="#" className="text-[#00F0FF] font-semibold hover:text-[#00d9e6] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-black font-bold text-sm tracking-wide py-4 rounded-lg mt-2 transition-colors ${
              isLoading ? 'bg-[#00F0FF]/50 cursor-not-allowed' : 'bg-[#00F0FF] hover:bg-[#00d9e6]'
            }`}
          >
            {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}
          </button>

        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have terminal credentials?{' '}
          <Link to="/register" className="text-[#00F0FF] font-semibold hover:text-[#00d9e6] transition-colors">
            Request Client Access
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;