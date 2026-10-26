
import React from 'react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
  onClear: () => void;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onClear }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-yellow-500"></div>
          <h2 className="text-4xl font-black text-white italic uppercase">Audit_Trail_Log</h2>
        </div>
        <button 
          onClick={onClear}
          className="bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-2 font-black text-[10px] uppercase hover:bg-red-600/40 transition-all rounded-sm"
        >
          WIPE_LOCAL_TRAIL
        </button>
      </div>

      <div className="bg-[#1e293b] border-2 border-slate-800 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 font-bold border-b border-slate-800">
                <th className="px-6 py-4 uppercase font-digital">Timestamp</th>
                <th className="px-6 py-4 uppercase font-digital">Action_Event</th>
                <th className="px-6 py-4 uppercase font-digital">Operator_ID</th>
                <th className="px-6 py-4 uppercase font-digital">Terminal_Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-digital">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-600 font-black tracking-[0.2em] uppercase italic">
                    <i className="fas fa-ghost mb-4 text-4xl block opacity-20"></i>
                    No_History_Detected_In_Buffer
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className={`px-2 py-0.5 rounded-sm ${
                        log.action.includes('ERROR') || log.action.includes('FLAG') 
                        ? 'bg-red-500/20 text-red-500' 
                        : log.action.includes('SUCCESS') || log.action.includes('VERIFIED')
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {log.operator || 'SYSTEM_AUTO'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest leading-relaxed flex items-start gap-3">
          <i className="fas fa-shield-alt mt-1"></i>
          <span>
            This audit log is stored in the local terminal buffer. Security protocols recommend periodic export of this trail to central management systems for compliance audits.
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuditLogView;
