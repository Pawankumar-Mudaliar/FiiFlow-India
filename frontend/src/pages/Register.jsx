import { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    firmName: '',
    sebiId: '',
    email: '',
    password: ''
  });
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
      // Combine first and last name to match the 'username' column in your DB
      const payload = {
        username: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        // You can pass firmName and sebiId if you add those columns to your DB later
      };

      await api.post('/auth/register', payload);
      
      // Redirect to login page on successful registration
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] px-4 py-12 font-sans selection:bg-[#00F0FF] selection:text-black">
      
      <div className="w-full max-w-lg bg-[#0B1120] border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,1)]">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center justify-center w-12 h-12 bg-[#00F0FF] rounded-xl mb-6">
            <TrendingUp className="text-black w-7 h-7 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Request Terminal Access</h1>
          <p className="text-sm text-slate-400">Provide your professional details for institutional onboarding</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FF5252]/10 border border-[#FF5252]/50 rounded-lg flex items-center space-x-3 text-[#FF5252] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                First Name
              </label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Rajesh"
                className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                Last Name
              </label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Mehta"
                className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Firm / Institution Name
            </label>
            <input 
              type="text" 
              name="firmName"
              value={formData.firmName}
              onChange={handleChange}
              placeholder="e.g. Mumbai Quantitative Partners"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              SEBI Registration ID (Optional)
            </label>
            <input 
              type="text" 
              name="sebiId"
              value={formData.sebiId}
              onChange={handleChange}
              placeholder="e.g. INA000012345"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Corporate Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. rmehta@mqpartners.in"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Choose Terminal Password
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#050810] border border-slate-800 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors tracking-widest"
              required
              minLength={6}
            />
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <input 
              type="checkbox" 
              id="certification"
              className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-700 bg-[#050810] checked:bg-[#00F0FF] checked:border-[#00F0FF] focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none transition-colors relative after:content-[''] after:absolute after:hidden checked:after:block after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:left-[5px] after:top-[2px]"
              required
            />
            <label htmlFor="certification" className="text-[12px] text-slate-400 leading-relaxed cursor-pointer hover:text-slate-300 transition-colors">
              I certify that I am representing an institutional fund manager, qualified client, or accredited advisor and agree to the SEBI Safe-Harbor provisions.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-black font-bold text-sm tracking-wide py-4 rounded-lg mt-4 transition-colors ${
              isLoading ? 'bg-[#00F0FF]/50 cursor-not-allowed' : 'bg-[#00F0FF] hover:bg-[#00d9e6]'
            }`}
          >
            {isLoading ? 'PROCESSING...' : 'SUBMIT CREDENTIALS FOR ONBOARDING'}
          </button>

        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-[#00F0FF] font-semibold hover:text-[#00d9e6] transition-colors">
            Log In Directly
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;