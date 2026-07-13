import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface SystemBootLoaderProps {
  user: any;
  onComplete: () => void;
}

export default function SystemBootLoader({ user, onComplete }: SystemBootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Configuring secure environment...");

  // Smooth 3-second (3000ms) progress loader
  useEffect(() => {
    const totalDuration = 3000; // 3 seconds
    const intervalTime = 30; // Update every 30ms
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      // Simple, elegant status updates during the 3-second load
      if (nextProgress < 35) {
        setLoadingText("Configuring secure workspace...");
      } else if (nextProgress < 70) {
        setLoadingText("Synchronizing research files...");
      } else if (nextProgress < 95) {
        setLoadingText("Optimizing workspace layout...");
      } else {
        setLoadingText("Ready!");
      }

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 150); // Small fluid delay to let the user feel the "100%" completion state
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#06080e] text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none overflow-hidden" id="bootloader_simple">
      
      {/* Interactive liquid fluid orb styles injected directly */}
      <style>{`
        @keyframes blob-morph {
          0%, 100% {
            border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
          }
          25% {
            border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%;
          }
          50% {
            border-radius: 30% 70% 60% 40% / 50% 60% 40% 50%;
          }
          75% {
            border-radius: 60% 40% 40% 60% / 40% 50% 60% 50%;
          }
        }

        @keyframes blob-rotate {
          0% {
            transform: rotate(0deg) scale(0.97);
          }
          50% {
            transform: rotate(180deg) scale(1.03);
          }
          100% {
            transform: rotate(360deg) scale(0.97);
          }
        }

        @keyframes color-cycle {
          0%, 100% {
            border-color: rgba(6, 182, 212, 0.85);
            background-color: rgba(6, 182, 212, 0.02);
            box-shadow: 
              0 0 50px rgba(6, 182, 212, 0.5),
              0 0 100px rgba(6, 182, 212, 0.15),
              inset 0 0 30px rgba(6, 182, 212, 0.4);
          }
          33% {
            border-color: rgba(168, 85, 247, 0.85);
            background-color: rgba(168, 85, 247, 0.02);
            box-shadow: 
              0 0 50px rgba(168, 85, 247, 0.5),
              0 0 100px rgba(168, 85, 247, 0.15),
              inset 0 0 30px rgba(168, 85, 247, 0.4);
          }
          66% {
            border-color: rgba(234, 179, 8, 0.85);
            background-color: rgba(234, 179, 8, 0.02);
            box-shadow: 
              0 0 50px rgba(234, 179, 8, 0.5),
              0 0 100px rgba(234, 179, 8, 0.15),
              inset 0 0 30px rgba(234, 179, 8, 0.4);
          }
        }

        .blob-fluid-layer {
          animation: 
            blob-morph 8s ease-in-out infinite, 
            blob-rotate 12s linear infinite, 
            color-cycle 15s ease-in-out infinite;
        }

        .pulse-text {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Subtle tech background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-[0.02] pointer-events-none"></div>

      {/* Main container with staggered load-in animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-10"
        id="bootloader_content"
      >
        {/* Dynamic Fluid Orb - matches the gorgeous organic liquid shader video */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center" id="fluid_orb_container">
          
          {/* Backlight soft ambient light */}
          <div className="absolute inset-4 rounded-full bg-cyan-500/5 filter blur-[50px] pointer-events-none"></div>

          {/* Liquid Glass Fluid Core */}
          <div 
            className="absolute w-44 h-44 sm:w-52 sm:h-52 bg-slate-950/90 border-2 border-transparent blob-fluid-layer flex items-center justify-center overflow-hidden" 
            id="fluid_orb_core"
          >
            {/* Shading layer to produce that 3D glass look */}
            <div className="absolute inset-1.5 bg-gradient-to-tr from-slate-950 via-transparent to-white/[0.04] rounded-full mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06)_0%,transparent_50%)] rounded-full"></div>
            
            {/* Minimal loader spinner inside core */}
            <Loader2 className="w-5 h-5 text-slate-400/30 animate-spin" />
          </div>

        </div>

        {/* Text Section */}
        <div className="text-center space-y-3 px-4" id="bootloader_label_wrapper">
          <h2 className="text-sm font-bold tracking-[0.3em] text-slate-400 uppercase pulse-text" id="bootloader_status">
            Loading...
          </h2>
          
          {/* Dynamic Percentage Count */}
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight" id="bootloader_percentage">
            {progress}%
          </div>

          {/* Subtext description of current task */}
          <p className="text-[11px] text-slate-500 font-mono tracking-wider h-4 flex items-center justify-center transition-all" id="bootloader_desc">
            {loadingText}
          </p>
        </div>

      </motion.div>

    </div>
  );
}
