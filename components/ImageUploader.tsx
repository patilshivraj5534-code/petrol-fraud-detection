
import React, { useState } from 'react';

interface ImageUploaderProps {
  label: string;
  id: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  icon: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, id, image, onImageChange, icon }) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('INVALID_PAYLOAD_TYPE');
        return;
      }

      // Validate file size (e.g., 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('PAYLOAD_OVERSIZE_LIMIT');
        return;
      }

      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setUploadProgress(0);
      };

      reader.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      reader.onerror = () => {
        setError('BIT_STREAM_CORRUPTION');
        setUploadProgress(null);
      };

      reader.onloadend = () => {
        if (reader.error) {
          setError('READ_INTERFACE_FAILURE');
          setUploadProgress(null);
        } else {
          setTimeout(() => {
            onImageChange(reader.result as string);
            setUploadProgress(null);
          }, 500);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const resetSensor = () => {
    setError(null);
    setUploadProgress(null);
    onImageChange(null);
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="h-1 w-12 bg-slate-800"></div>
      </div>
      
      <div 
        className={`relative h-72 border-4 rounded-sm flex flex-col items-center justify-center transition-all overflow-hidden bg-[#0f172a] ${
          error ? 'border-red-600' : image ? 'border-yellow-500' : 'border-slate-800 border-double hover:border-slate-700'
        }`}
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

        {error ? (
          <div className="z-10 text-center space-y-4 px-10 animate-in fade-in zoom-in duration-300">
             <i className="fas fa-exclamation-triangle text-4xl text-red-500 animate-pulse"></i>
             <div className="space-y-1">
               <p className="text-[10px] font-digital text-red-500 font-bold uppercase tracking-widest">CRITICAL_MALFUNCTION</p>
               <p className="text-[9px] font-digital text-slate-400 uppercase">{error}</p>
             </div>
             <button 
                onClick={resetSensor}
                className="bg-red-600/20 text-red-500 border border-red-500/50 px-6 py-2 text-[10px] font-black uppercase hover:bg-red-600/40 transition-all rounded-sm"
             >
               REBOOT_SENSOR
             </button>
          </div>
        ) : uploadProgress !== null ? (
          <div className="z-10 text-center space-y-4 px-10 w-full">
             <i className="fas fa-satellite-dish text-4xl text-yellow-500 animate-pulse"></i>
             <div className="w-full bg-slate-900 h-4 border border-slate-800 rounded-sm overflow-hidden p-0.5">
                <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
             <p className="text-[10px] font-digital text-yellow-500 font-bold uppercase">BIT_STREAM_UPLOAD: {uploadProgress}%</p>
          </div>
        ) : image ? (
          <div className="relative w-full h-full group">
            <img src={image} alt={label} className="h-full w-full object-cover filter brightness-90 group-hover:brightness-50 transition-all" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={resetSensor}
                className="bg-red-600 text-white px-6 py-2 font-black text-xs rounded-sm shadow-2xl hover:bg-red-500 uppercase"
              >
                <i className="fas fa-trash-alt mr-2"></i> Eject Image
              </button>
            </div>
            <div className="absolute top-4 left-4 bg-yellow-500 text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter">Sensor_Linked</div>
          </div>
        ) : (
          <label htmlFor={id} className="cursor-pointer z-10 flex flex-col items-center p-10 text-center w-full h-full justify-center group">
            <div className="w-20 h-20 bg-slate-800/50 rounded-sm border-2 border-slate-700 flex items-center justify-center mb-6 text-slate-500 text-3xl group-hover:border-yellow-500 group-hover:text-yellow-500 transition-all rotate-45 shadow-lg">
               <i className={`fas ${icon} -rotate-45`}></i>
            </div>
            <span className="text-slate-400 font-black text-xs tracking-widest uppercase mb-1">Engage Sensor Input</span>
            <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Drop Data Chunk Here</span>
            <input id={id} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
