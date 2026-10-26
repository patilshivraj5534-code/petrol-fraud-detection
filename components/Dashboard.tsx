
import React, { useState, useMemo } from 'react';
import { ScanRecord } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  history: ScanRecord[];
  onStartScan: () => void;
  onAuditLog: (details: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onStartScan, onAuditLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = useMemo(() => {
    const fraudCount = history.filter(h => !h.isMatch).length;
    const totalFuel = history.reduce((acc, curr) => acc + curr.pumpVolume, 0);
    return { count: history.length, fraud: fraudCount, fuel: totalFuel };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(h => 
      h.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = [
      "ID", "Timestamp", "Customer Name", "Vehicle Plate", 
      "Payment Amount", "Pump Total", "Volume", "Currency", 
      "Match", "Discrepancy", "Summary"
    ];

    const rows = history.map(record => [
      record.id,
      new Date(record.timestamp || 0).toISOString(),
      `"${record.customerName}"`,
      `"${record.vehiclePlate}"`,
      record.paymentAmount,
      record.pumpTotalAmount,
      record.pumpVolume,
      record.currency,
      record.isMatch ? "YES" : "NO",
      record.discrepancy,
      `"${record.summary.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fraud_guard_logs_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onAuditLog(`Exported ${history.length} transaction records to CSV`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HUD-style Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ControlModule label="OPERATIONAL VOLUME" value={`${stats.fuel.toFixed(1)}L`} icon="fa-gas-pump" color="text-emerald-400" />
        <ControlModule label="FRAUD EVENTS" value={stats.fraud.toString()} icon="fa-skull-crossbones" color="text-red-500" alert={stats.fraud > 0} />
        <ControlModule label="TOTAL SESSIONS" value={stats.count.toString()} icon="fa-fingerprint" color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1e293b] p-8 border-2 border-slate-800 rounded-sm shadow-xl">
           <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-8 flex items-center">
             <div className="w-2 h-2 bg-yellow-500 mr-2"></div> FLOW DIAGNOSTIC TREND
           </h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.slice(-10).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="id" hide />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '10px' }}
                  />
                  <Area type="step" dataKey="paymentAmount" stroke="#facc15" fill="#facc15" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#1e293b] p-8 border-2 border-slate-800 rounded-sm shadow-xl flex flex-col justify-center">
           <h3 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-8">VERIFICATION QUOTA</h3>
           <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{name: 'OK', value: stats.count - stats.fraud}, {name: 'ERROR', value: stats.fraud}]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-4xl font-black font-digital text-white">{Math.round(((stats.count - stats.fraud) / (stats.count || 1)) * 100)}%</p>
                 <p className="text-[8px] font-bold text-slate-500 uppercase">Integrity</p>
              </div>
           </div>
        </div>
      </div>

      {/* Log Table with Industrial Styling */}
      <div className="bg-[#1e293b] border-2 border-slate-800 rounded-sm overflow-hidden shadow-2xl">
         <div className="p-6 bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-700">
            <h2 className="text-xl font-black italic">UNIT LOG STREAM</h2>
            <div className="flex gap-4 w-full md:w-auto">
               <input 
                 type="text" 
                 placeholder="FILTER LOGS..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-digital text-yellow-500 focus:border-yellow-500 outline-none rounded-sm w-full"
               />
               <div className="flex gap-2">
                 <button 
                  onClick={exportToCSV}
                  disabled={history.length === 0}
                  className="bg-slate-700 text-white px-4 py-2 font-black text-xs whitespace-nowrap hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                  title="Export to CSV"
                 >
                   <i className="fas fa-file-export mr-2"></i>DUMP_DATA
                 </button>
                 <button onClick={onStartScan} className="bg-yellow-500 text-black px-6 py-2 font-black text-xs whitespace-nowrap hover:bg-yellow-400">INITIATE_TASK</button>
               </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead>
                  <tr className="bg-slate-900/50 text-slate-500 font-bold border-b border-slate-800">
                     <th className="px-6 py-4 uppercase font-digital">Unit_ID</th>
                     <th className="px-6 py-4 uppercase font-digital">Subject</th>
                     <th className="px-6 py-4 uppercase font-digital">Plate_ID</th>
                     <th className="px-6 py-4 uppercase font-digital">Value</th>
                     <th className="px-6 py-4 uppercase font-digital">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                       <td className="px-6 py-4 font-digital text-slate-500">#{h.id.slice(0, 8)}</td>
                       <td className="px-6 py-4 font-bold text-white uppercase">{h.customerName}</td>
                       <td className="px-6 py-4 font-digital text-yellow-500 font-bold">{h.vehiclePlate}</td>
                       <td className="px-6 py-4 font-digital">{h.currency}{h.paymentAmount}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-sm font-black text-[9px] uppercase ${h.isMatch ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 'bg-red-900/40 text-red-400 border border-red-500/20 animate-pulse'}`}>
                            {h.isMatch ? 'Verified_Ok' : 'Fraud_Flag'}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const ControlModule = ({ label, value, icon, color, alert = false }: any) => (
  <div className={`bg-[#1e293b] p-6 border-2 rounded-sm shadow-xl flex items-center gap-6 group hover:border-yellow-500/50 transition-all ${alert ? 'border-red-500 bg-red-900/10' : 'border-slate-800'}`}>
     <div className={`w-16 h-16 bg-slate-900 rounded-sm flex items-center justify-center text-3xl shadow-inner ${color}`}>
        <i className={`fas ${icon} ${alert ? 'animate-bounce' : ''}`}></i>
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-3xl font-black font-digital ${alert ? 'text-red-500' : 'text-white'}`}>{value}</p>
     </div>
  </div>
);

export default Dashboard;
