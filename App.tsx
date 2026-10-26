
import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResultView from './components/AnalysisResultView';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import AuditLogView from './components/AuditLogView';
import GuideView from './components/GuideView';
import AnalysisLoader from './components/AnalysisLoader';
import { analyzePetrolImages } from './services/geminiService';
import { playFraudBeep } from './services/audioService';
import { sendManagerAlert } from './services/notificationService';
import { db } from './services/dbService';
import { 
  UploadedImages, 
  AnalysisStatus, 
  AppView, 
  StaffDetails, 
  ScanRecord,
  AuditLog
} from './types';

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [staff, setStaff] = useState<StaffDetails>({ 
    name: '', 
    employeeId: '', 
    stationName: '', 
    managerEmail: '', 
    autoNotify: true 
  });
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [images, setImages] = useState<UploadedImages>({ receipt: null, pump: null });
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Initial Boot Sequence
  useEffect(() => {
    const boot = async () => {
      try {
        await db.init();
        const [savedStaff, savedHistory, savedAudit] = await Promise.all([
          db.getSettings(),
          db.getAllScans(),
          db.getAllAuditLogs()
        ]);
        
        if (savedStaff) setStaff(savedStaff);
        setHistory(savedHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        setAuditLogs(savedAudit.sort((a, b) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Database connection failed", e);
      } finally {
        setIsBooting(false);
      }
    };
    boot();
  }, []);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
      details,
      operator: staff.name || 'ANONYMOUS'
    };
    await db.saveAuditLog(newLog);
    setAuditLogs(prev => [newLog, ...prev]);
  }, [staff.name]);

  const handleAnalysis = async () => {
    if (!images.receipt || !images.pump || !customerName.trim() || !vehiclePlate.trim()) {
      setError("Incomplete data. Fill all fields.");
      return;
    }

    addAuditLog('SCAN_INITIATED', `Subject: ${customerName}, Plate: ${vehiclePlate}`);
    setStatus(AnalysisStatus.LOADING);
    setError(null);

    try {
      const data = await analyzePetrolImages(images.receipt, images.pump);
      let notificationSent = false;
      const isHighRisk = !data.isMatch || data.warnings.length > 0;

      if (isHighRisk) {
        playFraudBeep();
        addAuditLog('RISK_DETECTED', `Discrepancy: ${data.currency}${data.discrepancy}`);
        if (staff.autoNotify && staff.managerEmail) {
          notificationSent = await sendManagerAlert({ ...data, id: 'temp', vehiclePlate, customerName }, staff);
          addAuditLog('NOTIFICATION_SENT', `Manager notified: ${staff.managerEmail}`);
        }
      }

      const newRecord: ScanRecord = {
        ...data,
        id: crypto.randomUUID(),
        vehiclePlate: vehiclePlate.toUpperCase(),
        customerName: customerName,
        timestamp: Date.now(),
        notificationSent: notificationSent
      };

      await db.saveScan(newRecord);
      setHistory(prev => [newRecord, ...prev]);
      setResult(newRecord);
      setStatus(AnalysisStatus.SUCCESS);
      addAuditLog('SCAN_COMPLETED_SUCCESS', `Verification Status: ${data.isMatch ? 'PASS' : 'FAIL'}`);
      setActiveView('results');
    } catch (err) {
      setError("Diagnostic Error: AI failed to parse visuals.");
      addAuditLog('SCAN_FAILED', 'Computer Vision interface error');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleProfileSave = async (updatedStaff: StaffDetails) => {
    await db.saveSettings(updatedStaff);
    setStaff(updatedStaff);
    addAuditLog('PROFILE_CONFIG_UPDATED', `Station: ${updatedStaff.stationName}, ID: ${updatedStaff.employeeId}`);
    setActiveView('dashboard');
  };

  const handleClearAudit = async () => {
    if (window.confirm("CONFIRM_AUDIT_WIPE? This action is irreversible.")) {
      await db.clearAuditLogs();
      setAuditLogs([]);
    }
  };

  const loadSample = (type: 'match' | 'fraud') => {
    // These are high-quality generic placeholders representing receipt/pump meter
    const dummyReceipt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; 
    const dummyPump = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    setImages({ receipt: dummyReceipt, pump: dummyPump });
    setCustomerName(type === 'match' ? 'John Doe (SIM)' : 'Mark Smith (SIM)');
    setVehiclePlate(type === 'match' ? 'KLA-2024' : 'FRD-4190');
    addAuditLog('SIMULATION_LAB_ENGAGED', `Loaded ${type} sample dataset`);
  };

  const resetScan = () => {
    setImages({ receipt: null, pump: null });
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
    setCustomerName('');
    setVehiclePlate('');
    setActiveView('scan');
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center space-y-4">
        <i className="fas fa-microchip text-yellow-500 text-5xl animate-pulse"></i>
        <p className="font-digital text-yellow-500 font-bold tracking-widest animate-pulse">BOOTING_CORE_DATABASE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Heavy Industrial Header */}
      <header className="border-b-4 border-yellow-500 bg-[#1e293b] py-6 px-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-500 flex items-center justify-center rounded-sm rotate-3 shadow-lg">
            <i className="fas fa-gas-pump text-black text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white leading-none">FRAUD GUARD <span className="text-yellow-500 font-digital">v2.5</span></h1>
            <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-[0.2em] font-digital">Persistence Terminal Activated</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block border-r border-slate-700 pr-6">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Operator</p>
             <p className="text-sm font-digital text-yellow-500 font-bold">{staff.name || 'ID_PENDING'}</p>
           </div>
           <button 
             onClick={() => setActiveView('profile')}
             className="flex items-center gap-2 hover:bg-slate-700 p-2 rounded transition-colors group"
           >
             <div className="w-10 h-10 rounded bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-yellow-500">
               <i className="fas fa-user-shield"></i>
             </div>
           </button>
        </div>
      </header>

      {/* Control Navigation (Industrial Tabs) */}
      <nav className="flex justify-center bg-[#1e293b] border-b border-slate-800">
        <div className="flex w-full max-w-6xl">
          <NavTab active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} label="UNIT LOGS" icon="fa-database" />
          <NavTab active={activeView === 'scan'} onClick={() => setActiveView('scan')} label="SCAN INTERCEPT" icon="fa-bolt" />
          <NavTab active={activeView === 'audit'} onClick={() => setActiveView('audit')} label="AUDIT TRAIL" icon="fa-list-check" />
          <NavTab active={activeView === 'guide'} onClick={() => setActiveView('guide')} label="GUIDE" icon="fa-book-open" />
          <NavTab active={activeView === 'profile'} onClick={() => setActiveView('profile')} label="UNIT CONFIG" icon="fa-cog" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {activeView === 'dashboard' && (
          <Dashboard 
            history={history} 
            onStartScan={resetScan} 
            onAuditLog={(details) => addAuditLog('DATA_EXPORTED', details)}
          />
        )}
        
        {activeView === 'profile' && (
          <ProfileForm 
            staff={staff} 
            onSave={handleProfileSave} 
          />
        )}

        {activeView === 'audit' && (
          <AuditLogView 
            logs={auditLogs} 
            onClear={handleClearAudit} 
          />
        )}

        {activeView === 'guide' && <GuideView />}

        {activeView === 'scan' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-2 bg-yellow-500"></div>
                    <h2 className="text-4xl font-black text-white italic uppercase">Initiate_Scan_Protocol</h2>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => loadSample('match')} className="bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-[10px] font-black uppercase hover:bg-emerald-500/20 transition-all rounded-sm">
                      <i className="fas fa-flask mr-2"></i> LOAD_MATCH_SAMPLE
                   </button>
                   <button onClick={() => loadSample('fraud')} className="bg-red-900/40 text-red-400 border border-red-500/20 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all rounded-sm">
                      <i className="fas fa-flask mr-2"></i> LOAD_FRAUD_SAMPLE
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Panel: Customer Data */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-[#1e293b] p-8 rounded-sm border-2 border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 hazard-stripe h-1 w-24"></div>
                      <h3 className="text-xs font-black text-yellow-500 mb-6 tracking-[0.3em] font-digital uppercase">Identification Input</h3>
                      
                      <div className="space-y-6">
                        <IndustrialInput 
                          label="Customer Name" 
                          value={customerName} 
                          onChange={setCustomerName} 
                          placeholder="SCANNING NAME..." 
                        />
                        <IndustrialInput 
                          label="Vehicle Plate" 
                          value={vehiclePlate} 
                          onChange={(v) => setVehiclePlate(v.toUpperCase())} 
                          placeholder="ABC-0000" 
                          mono
                        />
                      </div>
                   </div>

                   <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-relaxed">
                        <i className="fas fa-info-circle mr-2"></i> Quick Tip: Use the simulation buttons above to test the AI's logic with pre-optimized bitstreams.
                      </p>
                   </div>
                </div>

                {/* Right Panel: Image Capture */}
                <div className="lg:col-span-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ImageUploader 
                        label="Receipt Verification" 
                        id="receipt-up" 
                        image={images.receipt} 
                        onImageChange={(val) => setImages(prev => ({ ...prev, receipt: val }))}
                        icon="fa-file-invoice-dollar"
                      />
                      <ImageUploader 
                        label="Meter Diagnostic" 
                        id="pump-up" 
                        image={images.pump} 
                        onImageChange={(val) => setImages(prev => ({ ...prev, pump: val }))}
                        icon="fa-microchip"
                      />
                   </div>

                   <div className="flex flex-col items-center">
                      {status === AnalysisStatus.LOADING ? (
                        <AnalysisLoader />
                      ) : (
                        <button 
                          disabled={!images.receipt || !images.pump || !customerName.trim() || !vehiclePlate.trim()}
                          onClick={handleAnalysis}
                          className={`w-full py-6 rounded-sm font-black text-2xl tracking-tighter flex items-center justify-center gap-4 transition-all shadow-2xl ${
                            images.receipt && images.pump && customerName.trim() && vehiclePlate.trim()
                              ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:translate-y-1' 
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
                          }`}
                        >
                          <i className="fas fa-radiation animate-spin-slow"></i>
                          RUN FRAUD DIAGNOSTIC
                        </button>
                      )}
                      {error && (
                        <div className="mt-4 bg-red-600 text-white px-8 py-3 rounded-sm font-black uppercase text-xs animate-bounce italic">
                          <i className="fas fa-exclamation-triangle mr-2"></i> {error}
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeView === 'results' && result && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex justify-between items-center mb-10">
                <button onClick={() => setActiveView('dashboard')} className="font-digital font-bold text-yellow-500 flex items-center hover:translate-x-[-4px] transition-transform">
                  <i className="fas fa-chevron-left mr-2"></i> BACK_TO_LOGS
                </button>
                <button onClick={resetScan} className="bg-white text-black px-6 py-2 font-black text-sm rounded-sm hover:bg-yellow-500 transition-colors">
                  NEW_SCAN_INIT
                </button>
             </div>
             <AnalysisResultView result={result} />
          </div>
        )}
      </main>

      {/* Bottom Shift Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t-2 border-slate-800 px-6 py-3 flex items-center justify-between text-[10px] font-digital font-bold text-slate-500 z-50">
        <div className="flex gap-4">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> DB_SYNC_OK</span>
           <span className="hidden sm:block">STATION: {staff.stationName || 'N/A'}</span>
        </div>
        <div className="flex gap-4">
          <div>TRAIL: {auditLogs.length}</div>
          <div className="text-yellow-500">PERSISTED_SESSIONS: {history.length}</div>
        </div>
      </footer>
    </div>
  );
};

const NavTab = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 flex flex-col items-center gap-1 border-b-4 transition-all ${
      active ? 'bg-slate-800 border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-300'
    }`}
  >
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-black tracking-widest">{label}</span>
  </button>
);

const IndustrialInput = ({ label, value, onChange, placeholder, mono = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-900 border-2 border-slate-800 p-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors rounded-sm ${mono ? 'font-digital text-yellow-500 font-bold' : 'text-white'}`}
    />
  </div>
);

export default App;
