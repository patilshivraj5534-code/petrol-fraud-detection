
import React from 'react';

const GuideView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-10 w-2 bg-yellow-500"></div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Operational_Manual</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GuideCard 
          step="01" 
          title="RECEIPT CAPTURE" 
          icon="fa-receipt" 
          desc="Ensure the 'Total Paid' and 'Timestamp' are clearly legible. Avoid folding or creasing the paper across critical numerical data."
        />
        <GuideCard 
          step="02" 
          title="METER ALIGNMENT" 
          icon="fa-gauge-high" 
          desc="Point sensor directly at the pump LED. Glare from overhead station lights can corrupt the AI OCR process."
        />
        <GuideCard 
          step="03" 
          title="IDENTITY LINK" 
          icon="fa-car-side" 
          desc="Input the vehicle plate number exactly as seen. This links the financial audit to a physical asset for legal documentation."
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-yellow-500 tracking-[0.3em] uppercase flex items-center">
          <i className="fas fa-eye mr-2"></i> VISUAL_REFERENCE_MODELS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <VisualExample 
            title="STANDARD_RECEIPT" 
            imgUrl="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800&auto=format&fit=crop"
            status="VALID_INPUT"
            note="High contrast, sharp edges, readable totals."
          />
          <VisualExample 
            title="PUMP_DISPLAY" 
            imgUrl="https://images.unsplash.com/photo-1542330952-424683056157?q=80&w=800&auto=format&fit=crop"
            status="VALID_INPUT"
            note="Centered display, minimal glare, distinct digits."
          />
        </div>
      </div>

      <div className="bg-[#1e293b] border-2 border-slate-800 p-10 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 hazard-stripe h-1 w-32"></div>
        <h3 className="text-xl font-black text-white uppercase italic mb-8">Optimal_Scan_Parameters</h3>
        
        <div className="space-y-6">
          <ParamRow label="Resolution" detail="Minimum 1080p recommended for precise digit extraction." />
          <ParamRow label="Lighting" detail="Diffused ambient light is ideal. High-contrast shadows may cause OCR misreads." />
          <ParamRow label="Angle" detail="Keep camera parallel to the display plane (0-15 degree variance tolerated)." />
          <ParamRow label="Network" detail="High-speed data connection required for Gemini AI cloud diagnostic." />
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-sm">
        <h4 className="text-red-500 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-warning"></i> PROHIBITED_ACTIONS
        </h4>
        <ul className="text-xs text-slate-400 font-bold space-y-2 uppercase leading-relaxed">
          <li>• DO NOT ATTEMPT TO SCAN EDITED SCREENSHOTS (SYSTEM DETECTS PIXEL MANIPULATION)</li>
          <li>• DO NOT SCAN PARTIAL DISPLAYS WHERE TOTALS ARE TRUNCATED</li>
          <li>• DO NOT REUSE PREVIOUSLY LOGGED UNIT_IDS FOR DIFFERENT CUSTOMERS</li>
        </ul>
      </div>
    </div>
  );
};

const GuideCard = ({ step, title, icon, desc }: any) => (
  <div className="bg-[#1e293b] p-8 border-2 border-slate-800 rounded-sm hover:border-yellow-500 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-slate-900 border border-slate-700 flex items-center justify-center text-yellow-500 text-xl group-hover:bg-yellow-500 group-hover:text-black transition-colors">
        <i className={`fas ${icon}`}></i>
      </div>
      <span className="font-digital text-slate-700 font-black text-2xl tracking-tighter group-hover:text-yellow-500/20">{step}</span>
    </div>
    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">{title}</h4>
    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">{desc}</p>
  </div>
);

const VisualExample = ({ title, imgUrl, status, note }: any) => (
  <div className="bg-slate-900 border-2 border-slate-800 rounded-sm overflow-hidden group">
    <div className="h-48 overflow-hidden relative">
      <img src={imgUrl} alt={title} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
      <div className="absolute top-3 left-3 bg-emerald-500 text-black px-2 py-0.5 text-[8px] font-black uppercase">{status}</div>
    </div>
    <div className="p-4 bg-[#1e293b]">
      <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{title}</h5>
      <p className="text-[9px] text-slate-500 font-bold uppercase">{note}</p>
    </div>
  </div>
);

const ParamRow = ({ label, detail }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-slate-800 gap-2">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-digital text-yellow-500 font-bold">{detail}</span>
  </div>
);

export default GuideView;
