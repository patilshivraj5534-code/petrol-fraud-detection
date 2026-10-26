
import React, { useState, useEffect } from 'react';

const steps = [
  "OPTIMIZING_IMAGERY_STREAM...",
  "EXTRACTING_RECEIPT_BIT_DATA...",
  "METER_READING_DIAGNOSTIC...",
  "CROSS_LOG_VALIDATION...",
  "PATTERN_ANOMALY_SCAN...",
  "FINALIZING_FRAUD_REPORT..."
];

const AnalysisLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + Math.random() * 4;
      });
    }, 300);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-[#1e293b] border-4 border-yellow-500 rounded-sm shadow-[0_0_50px_rgba(250,204,21,0.1)] p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
      {/* Hazard Border Overlay */}
      <div className="absolute top-0 left-0 w-full h-2 hazard-stripe opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 hazard-stripe opacity-20"></div>

      <div className="flex flex-col items-center space-y-8 relative z-10">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '0.8s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-radiation text-yellow-500 text-4xl animate-pulse"></i>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">AI_CORE_PROCESSING</h3>
          <div className="bg-black/40 px-4 py-1 rounded-sm">
             <p className="text-[10px] font-digital font-bold text-yellow-500 h-5 transition-all duration-500 tracking-widest uppercase">
               {steps[currentStep]}
             </p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>BIT_STREAM_INTEGRITY</span>
            <span className="text-yellow-500 font-digital">{Math.floor(progress)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-900 border-2 border-slate-800 rounded-sm overflow-hidden p-0.5">
            <div 
              className="h-full bg-yellow-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(250,204,21,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 w-full">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-sm transition-colors duration-500 ${
                currentStep >= i ? 'bg-yellow-500 shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>

        <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest max-w-xs mx-auto">
          Diagnostic sequence engaged. Analyzing visual artifacts for digital forgery and metadata mismatch.
        </p>
      </div>
    </div>
  );
};

export default AnalysisLoader;
