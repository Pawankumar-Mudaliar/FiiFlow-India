import { useState, useEffect } from 'react';
import api from '../services/api'; // Ensure this path is correct for your structure

function TickerBanner() {
    const [tickerData, setTickerData] = useState([]);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                const response = await api.get('/fii/latest');
                setTickerData(response.data.data.slice(0, 20));
            } catch (error) {
                console.error("Error fetching ticker data:", error);
            }
        };

        fetchTickerData();
    }, []);

    const seamlessData = [...tickerData, ...tickerData];

    if (tickerData.length === 0) {
        return (
            <div className="flex bg-[#0B1120] border-b border-slate-800 h-12 items-center px-4">
                <div className="flex items-center space-x-2 font-bold text-[#00E5FF] tracking-wide text-sm">
                    <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></span>
                    <span>LOADING LIVE FII DATA...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#0B1120] border-b border-slate-800 h-12 overflow-hidden items-center relative">
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4 bg-[#0B1120] border-r border-slate-700 shadow-[10px_0_15px_-3px_rgba(11,17,32,0.9)]">
                <div className="flex items-center space-x-2 font-bold text-[#00E5FF] tracking-wide text-sm whitespace-nowrap">
                    <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></span>
                    <span>LIVE FII INDEX ACTIVITY</span>
                </div>
            </div>

            <div className="flex animate-ticker pl-[250px]">
                {seamlessData.map((stock, index) => {
                    // Convert PostgreSQL strings to JavaScript numbers
                    const cmpValue = parseFloat(stock.cmp);
                    const chgPctValue = parseFloat(stock.chg_in_fii_pct);
                    
                    const isPositive = chgPctValue > 0;
                    const isNegative = chgPctValue < 0;
                    
                    return (
                        <div key={`${stock.id}-${index}`} className="flex items-center space-x-3 mx-6 whitespace-nowrap">
                            <span className="font-bold text-white tracking-wide text-sm">
                                {stock.company_name.toUpperCase()}
                            </span>
                            
                            <span className="text-gray-400 font-medium text-sm">
                                {!isNaN(cmpValue) ? cmpValue.toFixed(2) : "N/A"}
                            </span>
                            
                            <div className={`flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                isPositive ? "bg-[#0A2E1F] text-[#00E676]" : 
                                isNegative ? "bg-[#3A1015] text-[#FF5252]" : 
                                "bg-slate-700 text-slate-300"
                            }`}>
                                {isPositive && <span className="mr-1">↑</span>}
                                {isNegative && <span className="mr-1">↓</span>}
                                <span>
                                    {isPositive ? "+" : ""}
                                    {!isNaN(chgPctValue) ? chgPctValue.toFixed(2) : "0.00"}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TickerBanner;