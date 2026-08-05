import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

interface SystemBootLoaderProps {
  user: any;
  onComplete: () => void;
}

export default function SystemBootLoader({ user, onComplete }: SystemBootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing Research Environment...");
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const totalDuration = 3000; // Exact 3-seconds
    const intervalTime = 20; // 50 updates per second for ultra-smooth animation
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      // Cycle text perfectly according to progress percentage
      if (nextProgress < 25) {
        setLoadingText("Initializing Research Environment...");
      } else if (nextProgress < 50) {
        setLoadingText("Connecting to African Energy Knowledge Base...");
      } else if (nextProgress < 75) {
        setLoadingText("Preparing Research Workspace...");
      } else {
        setLoadingText("Loading Sustainable Energy Resources...");
      }

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          onCompleteRef.current();
        }, 150); // Fluid finish transition
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-between p-6 sm:p-10 font-sans select-none overflow-hidden" id="premium_white_loader">
      
      {/* CSS Keyframes for premium clean white-and-green theme */}
      <style>{`
        @keyframes spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-counterclockwise {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.15)); }
          50% { transform: scale(1.025); filter: drop-shadow(0 0 25px rgba(16, 185, 129, 0.35)); }
        }

        @keyframes drift-particle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(-15px, -25px) scale(1.2); opacity: 0.6; }
        }

        @keyframes drift-particle-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.3; }
          50% { transform: translate(20px, -15px) scale(0.9); opacity: 0.5; }
        }

        @keyframes drift-particle-3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.2; }
          50% { transform: translate(-10px, 20px) scale(1.15); opacity: 0.45; }
        }

        @keyframes drift-particle-4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(15px, 15px) scale(0.85); opacity: 0.55; }
        }

        .ring-cw {
          animation: spin-clockwise 12s linear infinite;
        }

        .ring-ccw {
          animation: spin-counterclockwise 16s linear infinite;
        }

        .logo-pulsing-core {
          animation: logo-pulse 3s ease-in-out infinite;
        }

        .particle-1 { animation: drift-particle-1 7s ease-in-out infinite; }
        .particle-2 { animation: drift-particle-2 8s ease-in-out infinite; }
        .particle-3 { animation: drift-particle-3 6s ease-in-out infinite; }
        .particle-4 { animation: drift-particle-4 9s ease-in-out infinite; }
      `}</style>

      {/* Decorative background grid matching the homepage */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"
        id="loader_grid_pattern"
      ></div>

      {/* Top spacing element to balance layout */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-widest pb-4 border-b border-slate-100 z-10" id="loader_top_meta">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>SVIC DATA SYNCING</span>
        </div>
        <div>
          <span>SECURE ENVIRONMENT v2.4</span>
        </div>
      </div>

      {/* CENTERPIECE: Logo with soft radial glow, rotating rings, pulse, and floating particles */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-12" id="loader_centerpiece_stage">
        
        {/* Soft green radial glow background */}
        <div 
          className="absolute w-80 h-80 bg-gradient-to-tr from-emerald-100/40 via-teal-50/20 to-transparent rounded-full filter blur-3xl pointer-events-none -z-10"
          id="loader_radial_glow"
        ></div>

        {/* Outer Orbit Area for rings & particles */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center" id="rings_and_logo_container">
          
          {/* Subtle Floating Green/Teal Particles */}
          <div className="absolute w-3 h-3 bg-emerald-400 rounded-full blur-[1px] particle-1 top-8 left-16"></div>
          <div className="absolute w-2 h-2 bg-teal-400 rounded-full blur-[0.5px] particle-2 top-16 right-12"></div>
          <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full blur-[1px] particle-3 bottom-16 left-12"></div>
          <div className="absolute w-1.5 h-1.5 bg-teal-500 rounded-full particle-4 bottom-12 right-20"></div>

          {/* Clockwise rotating ring (thin dashed green border) */}
          <div 
            className="absolute inset-2 border border-dashed border-emerald-300/60 rounded-full ring-cw"
            id="ring_outer_clockwise"
          ></div>

          {/* Counterclockwise rotating ring (another radius with different dash styling) */}
          <div 
            className="absolute inset-8 border border-dotted border-emerald-500/30 rounded-full ring-ccw"
            id="ring_inner_counterclockwise"
          ></div>

          {/* Premium Logo Centerpiece (Pulsing) */}
          <div className="absolute flex flex-col items-center gap-4 text-center logo-pulsing-core" id="loader_core_logo">
            {/* Logo Icon Container */}
            <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-2xl shadow-sm">
              <img 
                src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                alt="Aurenix Research Logo" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain"
              />
            </div>
            
            {/* Title / Brand Text */}
            <div>
              <span className="block text-2xl font-display font-extrabold tracking-tight text-slate-900 leading-none">
                Aurenix <span className="text-emerald-600">Research</span>
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-2">
                Research & Sustainability
              </span>
            </div>
          </div>

        </div>

        {/* Loading Indicators & Progress bar */}
        <div className="w-full max-w-sm px-4 mt-8 space-y-4" id="loader_status_area">
          
          {/* Animated Status Cycling Text */}
          <div className="h-6 flex items-center justify-center text-center" id="loader_status_text_wrapper">
            <motion.p
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold text-slate-600 tracking-wide font-mono"
            >
              {loadingText}
            </motion.p>
          </div>

          {/* Thin rounded green progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40" id="progress_bar_bg">
            <motion.div 
              className="h-full bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
              id="progress_bar_fill"
            ></motion.div>
          </div>

          {/* Simple digital counter */}
          <div className="text-center font-mono text-[10px] text-slate-400 font-bold" id="progress_digit">
            {progress}% COMPLETED
          </div>

        </div>

      </div>

      {/* Bottom Bar: Tagline "Empowering Africa's Energy Future Through Research" */}
      <div 
        className="w-full max-w-5xl flex items-center justify-center text-center pt-4 border-t border-slate-100 z-10" 
        id="loader_bottom_tagline"
      >
        <span className="text-xs text-slate-400 font-medium tracking-wide">
          Empowering Africa&apos;s Energy Future Through Research
        </span>
      </div>

    </div>
  );
}
