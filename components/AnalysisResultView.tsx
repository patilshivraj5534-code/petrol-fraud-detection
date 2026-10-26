
import React from 'react';
import { ScanRecord } from '../types';

interface AnalysisResultViewProps {
  result: ScanRecord;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result }) => {
  const { 
    paymentAmount, pumpVolume, pumpUnitPrice, pumpTotalAmount, 
    currency, isMatch, discrepancy, summary, warnings, notificationSent 
  } = result;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      {/* High Visibility Alert Header */}
      <div className={`border-4 ${isMatch ? 'border-emerald-500' : 'border-red-500'} bg-[#1e293b] p-8 rounded-sm shadow-2xl relative overflow-hidden`}>
         {!isMatch && <div className="absolute top-0 left-0 w-full h-2 hazard-stripe opacity-50"></div>}
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
               <div className={`w-20 h-20 rounded-sm flex items-center justify-center text-4xl shadow-xl ${isMatch ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white animate-pulse'}`}>
                  <i className={`fas ${isMatch ? 'fa-shield-check' : 'fa-biohazard'}`}></i>
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                    {isMatch ? 'Verification_Passed' : 'Security_Violation'}
                  </h2>
                  <p className="text-xs font-digital font-bold text-slate-500">
                    DIAGNOSTIC_COMPLETED: {new Date().toLocaleTimeString()}
                  </p>
               </div>
            </div>

            <div className="text-right">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Financial Variance</p>
               <p className={`text-3xl font-digital font-black ${isMatch ? 'text-emerald-400' : 'text-red-500'}`}>
                 {currency}{discrepancy.toFixed(2)}
               </p>
               {notificationSent && (
                 <div className="mt-2 inline-flex items-center gap-2 bg-red-600/20 text-red-500 border border-red-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                   <i className="fas fa-broadcast-tower animate-pulse"></i> Manager Alert Dispatched
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Technical Data Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataBlock label="RECEIPT_VALUE" value={`${currency}${paymentAmount}`} icon="fa-money-bill-transfer" />
        <DataBlock label="PUMP_DISPLAY" value={`${currency}${pumpTotalAmount}`} icon="fa-desktop" />
        <DataBlock label="FUEL_MASS" value={`${pumpVolume}L`} icon="fa-tint" />
        <DataBlock label="UNIT_COST" value={`${currency}${pumpUnitPrice}/L`} icon="fa-tag" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-900/50 p-8 border-2 border-slate-800 rounded-sm">
            <h3 className="text-[10px] font-black text-yellow-500 tracking-[0.3em] uppercase mb-6 flex items-center">
              <i className="fas fa-align-left mr-2"></i> SYSTEM ANALYSIS LOG
            </h3>
            <div className="p-6 bg-slate-900 border border-slate-800 font-digital text-sm text-slate-300 leading-relaxed min-h-[150px]">
              <span className="text-emerald-500 mr-2">&gt;</span> {summary}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase flex items-center">
              <i className="fas fa-fingerprint mr-2"></i> ANOMALY DETECTION
            </h3>
            {warnings && warnings.length > 0 ? (
              <div className="space-y-3">
                 {warnings.map((w, idx) => (
                   <div key={idx} className="flex gap-4 items-center bg-red-900/20 border-l-4 border-red-500 p-4">
                      <i className="fas fa-exclamation-circle text-red-500"></i>
                      <p className="text-xs font-bold text-red-200 uppercase tracking-tight">{w}</p>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="bg-emerald-900/10 border-l-4 border-emerald-500 p-8 text-center">
                 <i className="fas fa-check-double text-emerald-500 text-3xl mb-4"></i>
                 <p className="text-[10px] font-black text-emerald-500 uppercase">No Visual Manipulation Detected</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

const DataBlock = ({ label, value, icon }: any) => (
  <div className="bg-[#1e293b] p-6 border-2 border-slate-800 rounded-sm relative group overflow-hidden shadow-xl">
    <div className="absolute -right-2 -bottom-2 text-slate-800/20 text-5xl group-hover:text-yellow-500/10 transition-colors">
      <i className={`fas ${icon}`}></i>
    </div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">{label}</p>
    <p className="text-2xl font-black font-digital text-white">{value}</p>
  </div>
);

export default AnalysisResultView;
