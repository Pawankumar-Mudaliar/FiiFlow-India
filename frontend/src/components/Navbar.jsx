import { useEffect, useState } from 'react';
import { TrendingUp, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Check for authenticated user every time the route changes
  useEffect(() => {
    const storedUser = localStorage.getItem('fiiUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0B1120] border-b border-slate-800 w-full">
      
      {/* Left Side: Logo AND Brand Name (Now wrapped in a Link to home) */}
      <Link to="/" className="flex items-center space-x-4 cursor-pointer group">
        <div className="flex items-center justify-center w-11 h-11 bg-[#00F0FF] rounded-lg shrink-0 group-hover:scale-105 transition-transform">
          <TrendingUp className="text-black w-6 h-6 stroke-[3]" />
        </div>
        <span className="text-white text-xl font-semibold tracking-wide whitespace-nowrap group-hover:text-[#00F0FF] transition-colors">
          FlowInvest India
        </span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center space-x-12 text-slate-300 font-medium text-[15px]">
        {/* Only show Dashboard link if user is logged in */}
        {user && (
          <Link to="/dashboard" className="text-[#00F0FF] font-semibold hover:text-white transition-colors">
            Dashboard
          </Link>
        )}
        <a href="#" className="hover:text-white transition-colors">Historical Analysis</a>
        <Link to="/sector-mapping" className="hover:text-white transition-colors">Sector Mapping</Link>
        <a href="#" className="hover:text-white transition-colors">Institutional APIs</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </div>

      {/* Right Side: User Profile OR Login Button */}
      <div>
        {user ? (
          // Logged In State: Show User Badge
          <div className="flex items-center space-x-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg">
            <div className="w-7 h-7 bg-[#00F0FF] rounded-full flex items-center justify-center">
              <User className="text-black w-4 h-4" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">
              {user.username}
            </span>
          </div>
        ) : (
          // Logged Out State: Show Login Button
          <button 
            onClick={() => navigate('/login')} 
            className="bg-[#00F0FF] text-black px-7 py-2.5 rounded-md font-bold text-sm tracking-wide hover:bg-[#00d9e6] transition-colors whitespace-nowrap"
          >
            Login
          </button>
        )}
      </div>
      
    </nav>
  );
}

export default Navbar;