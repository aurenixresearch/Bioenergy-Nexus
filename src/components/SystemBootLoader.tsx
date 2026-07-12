import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Terminal, 
  Loader2, 
  Play, 
  CheckCircle2, 
  Gauge 
} from 'lucide-react';

interface SystemBootLoaderProps {
  user: any;
  onComplete: () => void;
}

export default function SystemBootLoader({ user, onComplete }: SystemBootLoaderProps) {
  const TOTAL_SECONDS = 120;
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [isBypassing, setIsBypassing] = useState(false);

  // Progressive simulation checkpoints matching Bioenergy research context
  const systemLogs = [
    { time: 0, text: "Initializing Nexus Core v2.1..." },
    { time: 4, text: "Securing SSL handshake & tokens with SVIC database..." },
    { time: 10, text: "Fetching credentials for " + (user?.displayName || "Scholar Guest") + "..." },
    { time: 18, text: "Calibrating biomass moisture sensors and infrared analyzers..." },
    { time: 28, text: "Compiling neural kinetics for anaerobic digester optimization model..." },
    { time: 40, text: "Simulating thermal gasification cracking at 850°C baseline..." },
    { time: 52, text: "Analyzing microbial fermentation feedback loops (Clostridium thermocellum)..." },
    { time: 66, text: "Updating dynamic carbon credit ledger on decentralized sandbox nodes..." },
    { time: 80, text: "Rendering high-precision SVG canvas for multi-project spatial graphs..." },
    { time: 94, text: "Testing instant sync webhook relays to secure AES-256 cloud endpoints..." },
    { time: 106, text: "Verifying authorization tokens with regional Bioenergy Cohort authorities..." },
    { time: 115, text: "Wrapping secure session sandbox - prepping responsive UI components..." },
    { time: 120, text: "System fully optimized. Redirecting to terminal..." }
  ];

  // Incremental seconds elapsed over 120s (2 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (prev >= TOTAL_SECONDS) {
          clearInterval(timer);
          onComplete();
          return TOTAL_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update logs as progress bar increases
  useEffect(() => {
    const currentActive = systemLogs.findIndex((log, i) => {
      const nextLog = systemLogs[i + 1];
      if (!nextLog) return true;
      return secondsElapsed >= log.time && secondsElapsed < nextLog.time;
    });
    if (currentActive !== -1) {
      setActiveLogIndex(currentActive);
    }
  }, [secondsElapsed]);

  const percentage = Math.min(100, Math.round((secondsElapsed / TOTAL_SECONDS) * 100));

  const handleBypass = () => {
    setIsBypassing(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a] text-slate-100 flex flex-col items-center justify-between p-6 sm:p-10 font-mono select-none overflow-hidden" id="bootloader_fullscreen">
      
      {/* Dynamic Keyframes injecting style block to create the smooth morphing fluid blob from the video */}
      <style>{`
        @keyframes blob-morph {
          0% {
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
          100% {
            border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
          }
        }

        @keyframes blob-rotate {
          0% {
            transform: rotate(0deg) scale(0.96);
          }
          50% {
            transform: rotate(180deg) scale(1.04);
          }
          100% {
            transform: rotate(360deg) scale(0.96);
          }
        }

        @keyframes color-cycle {
          0%, 100% {
            /* Vibrant Cyan / Teal edge */
            border-color: rgba(6, 182, 212, 0.85);
            background-color: rgba(6, 182, 212, 0.02);
            box-shadow: 
              0 0 60px rgba(6, 182, 212, 0.65),
              0 0 120px rgba(6, 182, 212, 0.2),
              inset 0 0 35px rgba(6, 182, 212, 0.45);
          }
          33% {
            /* Vibrant Purple / Magenta edge */
            border-color: rgba(168, 85, 247, 0.85);
            background-color: rgba(168, 85, 247, 0.02);
            box-shadow: 
              0 0 60px rgba(168, 85, 247, 0.65),
              0 0 120px rgba(168, 85, 247, 0.2),
              inset 0 0 35px rgba(168, 85, 247, 0.45);
          }
          66% {
            /* Vibrant Yellow / Amber edge */
            border-color: rgba(234, 179, 8, 0.85);
            background-color: rgba(234, 179, 8, 0.02);
            box-shadow: 
              0 0 60px rgba(234, 179, 8, 0.65),
              0 0 120px rgba(234, 179, 8, 0.2),
              inset 0 0 35px rgba(234, 179, 8, 0.45);
          }
        }

        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .blob-fluid-layer {
          animation: 
            blob-morph 10s ease-in-out infinite, 
            blob-rotate 16s linear infinite, 
            color-cycle 20s ease-in-out infinite;
        }

        .text-pulse {
          animation: pulse-soft 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle deep tech grid background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03] pointer-events-none"></div>
      
      {/* Top Header: Minimal System Status */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-4 z-10" id="boot_top_bar">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold tracking-widest text-slate-400">NEXUS TELEMETRY STREAM</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>PORT: 3000 (SANDBOX)</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">USER: {user?.displayName || "SCHOLAR"}</span>
        </div>
      </div>

      {/* CENTERPIECE: The Liquid Fluid Morphing Blob exactly like the video */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 z-10" id="boot_center_stage">
        
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center" id="fluid_blob_wrapper">
          
          {/* Backlit deep glow ball */}
          <div className="absolute inset-6 rounded-full bg-emerald-500/5 filter blur-[60px] pointer-events-none"></div>

          {/* Liquid Glass Fluid Orb (Animate border-radius, rotation, and glows) */}
          <div className="absolute w-52 h-52 sm:w-60 sm:h-60 bg-[#080d16]/95 border-2 border-transparent blob-fluid-layer flex items-center justify-center overflow-hidden" id="liquid_morphing_blob">
            
            {/* Shading, highlights and gloss simulation to give the 3D depth from the video */}
            <div className="absolute inset-2 bg-gradient-to-tr from-slate-950 via-transparent to-slate-800/40 rounded-full opacity-90 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.08)_0%,transparent_60%)] rounded-full"></div>
            <div className="absolute inset-3 border border-white/[0.03] rounded-full mix-blend-overlay"></div>

            {/* Subtle floating activity core */}
            <div className="flex flex-col items-center justify-center space-y-1 opacity-20">
              <Activity className="w-6 h-6 text-slate-400 animate-pulse" />
              <span className="text-[7px] tracking-widest font-bold">CORE</span>
            </div>

          </div>

        </div>

        {/* Loading text section */}
        <div className="text-center space-y-4 max-w-lg px-4" id="boot_loading_text_area">
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold tracking-[0.25em] text-slate-200 text-pulse" id="boot_loading_title">
              LOADING...
            </h2>
            <div className="text-emerald-400/90 font-mono text-xs font-bold tracking-widest">
              SYSTEM INITIALIZATION: {percentage}%
            </div>
          </div>

          {/* Active Terminal Command Line Stream */}
          <div className="h-10 flex items-center justify-center" id="boot_active_command_line">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLogIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-semibold max-w-sm sm:max-w-md bg-slate-950/60 px-4 py-2 border border-slate-900 rounded-xl shadow-inner text-center"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {systemLogs[activeLogIndex]?.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR: Bypass stream and Time Indicator */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-5 z-10 text-center sm:text-left" id="boot_bottom_bar">
        
        {/* Precise time tracker */}
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <div className="font-bold uppercase tracking-wider text-slate-400">SESSION CALIBRATION ACTIVE</div>
          <div>ELAPSED: {secondsElapsed}s / {TOTAL_SECONDS}s &bull; CALIBRATING TELEMETRY</div>
        </div>

        {/* Minimalist Bypass Control */}
        <motion.button
          type="button"
          onClick={handleBypass}
          disabled={isBypassing}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 bg-slate-950 hover:text-emerald-400 text-slate-400 font-bold rounded-xl border border-slate-900 hover:border-emerald-950 flex items-center gap-2 cursor-pointer transition-colors text-[10px] uppercase tracking-wider"
          id="boot_bypass_button"
        >
          {isBypassing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              Bypassing Stream...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              Bypass Stream
            </>
          )}
        </motion.button>

      </div>

    </div>
  );
}
