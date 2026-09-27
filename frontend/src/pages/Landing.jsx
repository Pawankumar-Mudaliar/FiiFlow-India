import { useState, useEffect } from 'react';
import { 
    Activity, 
    Database, 
    Cpu, 
    Bell, 
    ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const [mockupData, setMockupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchDashboardData = async () => {
          try {
              // Fetch the latest snapshot to populate the landing page mockup
              const response = await api.get('/fii/latest');
              // Grab just the top 4 records for the visual
              setMockupData(response.data.data.slice(0, 4));
          } catch (error) {
              console.error("Error fetching mockup data:", error);
          } finally {
              setIsLoading(false);
          }
      };

      fetchDashboardData();
  }, []);

  return (
    <div className="bg-[#0B1120] min-h-screen text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-16 px-6 flex flex-col items-center text-center">
        
        <div className="flex items-center space-x-2 border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse"></span>
            <span className="text-[#00F0FF] text-xs font-bold tracking-widest uppercase">
                V2.0 LAUNCHED - THE TERMINAL IS NOW LIVE
            </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mb-6 leading-tight">
            Track Foreign Institutional <br className="hidden md:block"/>
            Money with Surgical Precision
        </h1>
        
        <p className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
            Stop guessing where the smart money is moving. Our platform extracts, structures, and alerts you on institutional holding shifts before they hit mainstream news.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={() => navigate('/dashboard')} className="bg-[#00F0FF] text-black px-8 py-3.5 rounded font-bold text-sm tracking-wide hover:bg-[#00d9e6] transition-colors w-full sm:w-auto">
                LAUNCH TERMINAL
            </button>
            <button className="flex items-center border border-slate-600 text-white px-8 py-3.5 rounded font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors w-full sm:w-auto">
                EXPLORE METHODOLOGY <ChevronRight className="ml-2 w-4 h-4" />
            </button>
        </div>

        {/* Dashboard UI Mockup with Real Data Integration */}
        <div className="mt-20 w-full max-w-5xl rounded-xl border border-slate-800 bg-[#0A0F1C] shadow-[0_20px_50px_rgba(0,240,255,0.05)] overflow-hidden">
            <div className="h-8 border-b border-slate-800 flex items-center px-4 space-x-2 bg-[#050810]">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                
                {/* Left Graph area (Visualizing FII Holding Percentage) */}
                <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-500 tracking-wider mb-2">TOP INSTITUTIONAL HOLDINGS</div>
                    <div className="space-y-3 mt-6">
                        {isLoading ? (
                            // Skeleton Loader Bars
                            <>
                                <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-4"><div className="w-3/4 h-2 bg-[#00F0FF] rounded"></div></div>
                                <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-4"><div className="w-1/2 h-2 bg-[#00F0FF] rounded"></div></div>
                                <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-4"><div className="w-5/6 h-2 bg-[#00F0FF] rounded"></div></div>
                                <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-4"><div className="w-1/3 h-2 bg-[#FF5252] rounded"></div></div>
                            </>
                        ) : (
                            // Real Data Bars
                            mockupData.map((stock, index) => {
                                const holdPct = parseFloat(stock.fii_hold_pct) || 0;
                                // Cap visual width at 100% just in case
                                const barWidth = Math.min(holdPct, 100); 
                                const isPositive = parseFloat(stock.chg_in_fii_pct) >= 0;

                                return (
                                    <div key={stock.id || index} className="w-full h-8 bg-slate-800/50 rounded flex items-center px-4 relative overflow-hidden group">
                                        <div 
                                            className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out ${isPositive ? 'bg-[#00F0FF]/20' : 'bg-[#FF5252]/20'}`}
                                            style={{ width: `${barWidth}%` }}
                                        ></div>
                                        <div className="relative z-10 w-full flex justify-between items-center text-xs">
                                            <span className="font-bold text-white truncate max-w-[150px]">{stock.company_name}</span>
                                            <span className="text-slate-400">{holdPct.toFixed(2)}% Owned</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right List area (Recent Shifts) */}
                <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-500 tracking-wider mb-4">LATEST ACTIVITY</div>
                    {isLoading ? (
                        // Skeleton Loader List
                        [1,2,3,4].map(i => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-slate-800"></div>
                                    <div>
                                        <div className="h-3 w-20 bg-slate-700 rounded mb-1"></div>
                                        <div className="h-2 w-12 bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-4 w-16 bg-[#00F0FF]/20 rounded"></div>
                            </div>
                        ))
                    ) : (
                        // Real Data List
                        mockupData.map((stock, index) => {
                            const cmp = parseFloat(stock.cmp);
                            const chgPct = parseFloat(stock.chg_in_fii_pct);
                            const isPositive = chgPct > 0;

                            return (
                                <div key={stock.id || index} className="flex justify-between items-center py-2 border-b border-slate-800/50 hover:bg-slate-800/20 px-2 -mx-2 rounded transition-colors">
                                    <div className="flex items-center space-x-3">
                                        {/* Auto-generate a 2-letter logo from the company name */}
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {stock.company_name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white truncate max-w-[120px]">{stock.company_name}</div>
                                            <div className="text-xs text-slate-500">₹{!isNaN(cmp) ? cmp.toFixed(2) : "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                                        isPositive ? 'bg-[#0A2E1F] text-[#00E676]' : 'bg-[#3A1015] text-[#FF5252]'
                                    }`}>
                                        {isPositive ? "+" : ""}{!isNaN(chgPct) ? chgPct.toFixed(2) : "0.00"}%
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-20 px-6 bg-[#080C17] border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-[#00F0FF] text-xs font-bold tracking-widest uppercase border border-[#00F0FF]/30 px-3 py-1 rounded-full">CORE FEATURES</span>
                <h2 className="text-3xl font-bold text-white mt-6 mb-4">Smarter Analytics, Faster Actions</h2>
                <p className="text-slate-400">Institutional grade tooling built specifically for the Indian equity markets.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-xl hover:border-[#00F0FF]/50 transition-colors">
                    <Database className="w-8 h-8 text-[#00F0FF] mb-6" />
                    <h3 className="text-lg font-bold text-white mb-3">NSDL/CDSL Daily Ledger Extraction</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Automated pipelines scrape and structure the raw daily depository files into queryable relational databases.</p>
                </div>
                <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-xl hover:border-[#00F0FF]/50 transition-colors">
                    <Cpu className="w-8 h-8 text-[#00F0FF] mb-6" />
                    <h3 className="text-lg font-bold text-white mb-3">Smart Accumulation Algos</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Detect hidden block purchases spread over multiple trading days using our volume-weighted detection engine.</p>
                </div>
                <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-xl hover:border-[#00F0FF]/50 transition-colors">
                    <Bell className="w-8 h-8 text-[#00F0FF] mb-6" />
                    <h3 className="text-lg font-bold text-white mb-3">Liquidity Alerts & Watchlists</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Set threshold triggers. Be instantly notified via webhook or email the second institutional ownership crosses your parameters.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 3. MECHANICS SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
                <span className="text-[#00F0FF] text-xs font-bold tracking-widest uppercase border border-[#00F0FF]/30 px-3 py-1 rounded-full">PIPELINE</span>
                <h2 className="text-3xl font-bold text-white mt-6 mb-4">Flow Mapping Mechanics</h2>
                <p className="text-slate-400">How raw exchange data becomes actionable institutional alpha.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left relative">
                <div className="hidden md:block absolute top-8 left-16 right-16 h-px bg-slate-800 -z-10"></div>
                <div>
                    <h4 className="text-6xl font-bold text-[#00F0FF] mb-6">01</h4>
                    <h3 className="text-xl font-bold text-white mb-3">Regulatory Data Ingestion</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Our scraper connects to BSE & NSE endpoints to pull daily holding disclosures at exactly 6:00 PM market close.</p>
                </div>
                <div>
                    <h4 className="text-6xl font-bold text-[#00F0FF] mb-6">02</h4>
                    <h3 className="text-xl font-bold text-white mb-3">Securities Assignment Match</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Automated scripts sanitize the ISIN codes and match them against over 5,000 listed equities in our database.</p>
                </div>
                <div>
                    <h4 className="text-6xl font-bold text-[#00F0FF] mb-6">03</h4>
                    <h3 className="text-xl font-bold text-white mb-3">Terminal Feed Broadcast</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">The snapshot is instantly pushed to the frontend React UI and broadcast out via our real-time API endpoints.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. SECTOR MAPPING & 5. CTA & 6. FOOTER REMAIN UNCHANGED BELOW */}
      <section className="py-20 px-6 bg-[#080C17] border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1 space-y-6">
                <span className="text-[#00F0FF] text-xs font-bold tracking-widest uppercase border border-[#00F0FF]/30 px-3 py-1 rounded-full">MACRO VIEW</span>
                <h2 className="text-3xl font-bold text-white mt-4">Sector Holding Mapping</h2>
                <p className="text-slate-400 leading-relaxed">
                    View net institutional flows across entire sectors. See whether foreign money is rotating into IT tech, or actively dumping financials.
                </p>
                <button className="bg-[#00F0FF] text-black px-6 py-2.5 rounded font-bold text-sm tracking-wide hover:bg-[#00d9e6] transition-colors mt-4">
                    EXPLORE SECTOR MAPS
                </button>
            </div>
            <div className="lg:col-span-2 bg-[#0B1120] border border-slate-800 rounded-xl p-8">
                <div className="text-xs font-bold text-slate-500 tracking-wider mb-6">LIVE INSTITUTIONAL BIAS</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-white mb-4">BFSI (Banking, Fin)</h4>
                        <span className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-2 py-1 rounded">LONG</span>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-white mb-4">IT Tech</h4>
                        <span className="text-xs font-bold text-[#b452ff] bg-[#2a103a] px-2 py-1 rounded">SHORT</span>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-white mb-4">Energy & Power</h4>
                        <span className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-2 py-1 rounded">LONG</span>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-white mb-4">Consumer Goods</h4>
                        <span className="text-xs font-bold text-[#b452ff] bg-[#2a103a] px-2 py-1 rounded">SHORT</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00F0FF]/5 rounded-full blur-[100px] -z-10"></div>
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Market Intel?</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Join 5,000+ traders already tracking the footprints of foreign money. 
            Start mapping institutional activity today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-[#00F0FF] text-black px-8 py-3.5 rounded font-bold text-sm tracking-wide hover:bg-[#00d9e6] transition-colors w-full sm:w-auto">
                REQUEST API ACCESS
            </button>
            <button className="flex items-center border border-slate-600 text-white px-8 py-3.5 rounded font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors w-full sm:w-auto">
                VIEW DOCUMENTATION & RESOURCES
            </button>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-[#00F0FF]" />
                    <span className="text-xl font-bold text-white">FIIFlow</span>
                </div>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                    The single source of truth for institutional equity holdings in the Indian stock market. 
                    Built for quantitative funds, research analysts, and retail alpha hunters.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">ANALYSIS</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">Historical Screens</a></li>
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">Live Dashboards</a></li>
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">Sector Maps</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">COMPANY</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">API Documentation</a></li>
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">Methodology</a></li>
                    <li><a href="#" className="hover:text-[#00F0FF] transition-colors">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
            <p>© 2026 FlowInvest India. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Not financial advice. Trade at your own risk. Past performance does not guarantee future results.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;