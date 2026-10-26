
import React, { useState } from 'react';
import { StaffDetails } from '../types';

interface ProfileFormProps {
  staff: StaffDetails;
  onSave: (data: StaffDetails) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ staff, onSave }) => {
  const [formData, setFormData] = useState<StaffDetails>({ ...staff });

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="h-10 w-2 bg-yellow-500"></div>
        <h2 className="text-4xl font-black text-white italic uppercase">Terminal_Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unit Info Section */}
        <div className="bg-[#1e293b] p-8 border-2 border-slate-800 rounded-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 hazard-stripe h-1 w-24"></div>
          <h3 className="text-[10px] font-black text-yellow-500 tracking-[0.3em] uppercase mb-8 flex items-center">
            <i className="fas fa-id-card-clip mr-2"></i> OPERATOR_IDENT
          </h3>
          
          <div className="space-y-6">
            <IndustrialInput 
              label="Staff Identifier" 
              value={formData.name} 
              onChange={(v) => setFormData({ ...formData, name: v })}
              placeholder="e.g. OPERATOR_01"
              icon="fa-user"
            />
            <IndustrialInput 
              label="Employee Token ID" 
              value={formData.employeeId} 
              onChange={(v) => setFormData({ ...formData, employeeId: v })}
              placeholder="TX-0099"
              icon="fa-barcode"
              mono
            />
            <IndustrialInput 
              label="Station Assignment" 
              value={formData.stationName} 
              onChange={(v) => setFormData({ ...formData, stationName: v })}
              placeholder="SECTOR_7_GATE"
              icon="fa-gas-pump"
            />
          </div>
        </div>

        {/* Escalation/Security Section */}
        <div className="bg-[#1e293b] p-8 border-2 border-slate-800 rounded-sm shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase mb-8 flex items-center">
              <i className="fas fa-shield-halved mr-2"></i> SECURITY_ESCALATION
            </h3>
            
            <div className="space-y-6">
              <IndustrialInput 
                label="Manager Comms Link (Email)" 
                value={formData.managerEmail} 
                onChange={(v) => setFormData({ ...formData, managerEmail: v })}
                placeholder="HQ_COMMAND@SECTOR.COM"
                icon="fa-satellite"
              />
              
              <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-sm">
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider mb-1">AUTO_NOTIFY_PROTOCOL</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Automated dispatch on risk detection</p>
                </div>
                <button 
                  onClick={() => setFormData({ ...formData, autoNotify: !formData.autoNotify })}
                  className={`w-14 h-8 rounded-sm transition-all border-2 flex items-center px-1 ${formData.autoNotify ? 'bg-yellow-500 border-yellow-400 justify-end' : 'bg-slate-800 border-slate-700 justify-start'}`}
                >
                  <div className={`w-4 h-4 rounded-sm ${formData.autoNotify ? 'bg-black' : 'bg-slate-600'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
             <button 
              onClick={() => onSave(formData)}
              className="w-full bg-yellow-500 text-black py-4 rounded-sm font-black text-sm hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 uppercase shadow-xl"
            >
              <i className="fas fa-save"></i> Commit_Changes_to_Database
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-sm">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed text-center">
          Warning: Unauthorized profile modifications are logged in the persistent audit trail. Database encryption is active.
        </p>
      </div>
    </div>
  );
};

const IndustrialInput = ({ label, value, onChange, placeholder, icon, mono = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <i className={`fas ${icon} text-[8px]`}></i> {label}
    </label>
    <input 
      type="text" 
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-900 border-2 border-slate-800 px-4 py-3 text-sm focus:border-yellow-500 outline-none transition-all rounded-sm ${mono ? 'font-digital text-yellow-500 font-bold' : 'text-white'}`}
    />
  </div>
);

export default ProfileForm;
