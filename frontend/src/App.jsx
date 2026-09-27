import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TickerBanner from './components/TickerBanner';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import SectorMapping from './pages/SectorMapping';

function App() {
  return (
    <Router>
      {/* Global Wrapper: Flexbox ensures headers stay top, content fills the rest */}
      <div className="h-screen bg-[#0B1120] flex flex-col overflow-hidden">
        
        {/* Global Headers applied to ALL pages */}
        <TickerBanner />
        <Navbar />
        
        {/* Main Content Area: Takes up remaining height, prevents page-level scrolling */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Terminal Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/sector-mapping" element={<SectorMapping />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;