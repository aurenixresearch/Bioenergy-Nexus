import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowRight, BookOpen, Globe, Shield, Sparkles, Leaf, User, FlaskConical, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreResearch: () => void;
  onRequestConsulting: () => void;
  onSignIn: () => void;
  user: any;
}

// ─── Interactive Particle Background ───────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const glowRef = useRef({ x: -999, y: -999, opacity: 0 });

  const PALETTE = ['#10b981', '#059669', '#34d399', '#008744', '#10b981'];
  const REPEL_RADIUS = 140;
  const REPEL_STRENGTH = 5.2;
  const RETURN_EASE = 0.085;
  const FRICTION = 0.83;
  const GRID_SIZE = 64; // Clean, elegant 64px grid cells

  const initParticles = useCallback((w: number, h: number) => {
    const cols = Math.ceil(w / GRID_SIZE) + 1;
    const rows = Math.ceil(h / GRID_SIZE) + 1;
    const particles: Particle[] = [];

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * GRID_SIZE;
        const y = row * GRID_SIZE;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 0.7 + 0.5, // Refined micro sparkles
          opacity: Math.random() * 0.35 + 0.45, // Clearly visible green sparkles
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Global pointer tracker over hero section
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const parent = canvas.parentElement || canvas;
      const rect = parent.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        mouse.current = { x: clientX - rect.left, y: clientY - rect.top };
        glowRef.current.opacity = Math.min(glowRef.current.opacity + 0.12, 1);
      } else {
        mouse.current = { x: -999, y: -999 };
      }
    };

    const handlePointerLeave = () => {
      mouse.current = { x: -999, y: -999 };
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Lerp glow position toward cursor
      glowRef.current.x += (mouse.current.x - glowRef.current.x) * 0.12;
      glowRef.current.y += (mouse.current.y - glowRef.current.y) * 0.12;

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const hasMouse = mx !== -999 && my !== -999;

      // ─── 1. DRAW CURSOR EMERALD GLOW BLOOM ────────────────────────
      if (glowRef.current.opacity > 0.01 && hasMouse) {
        const grd = ctx.createRadialGradient(
          glowRef.current.x, glowRef.current.y, 0,
          glowRef.current.x, glowRef.current.y, 180
        );
        grd.addColorStop(0, `rgba(16, 185, 129, ${0.14 * glowRef.current.opacity})`);
        grd.addColorStop(0.4, `rgba(52, 211, 153, ${0.06 * glowRef.current.opacity})`);
        grd.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      } else if (!hasMouse) {
        glowRef.current.opacity = Math.max(0, glowRef.current.opacity - 0.04);
      }

      // ─── 2. DRAW INTERACTIVE FINE GREY & EMERALD GRID LINES ────────
      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 1;
      const gridNodes: { x: number; y: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        gridNodes[r] = [];
        for (let c = 0; c < cols; c++) {
          const origX = c * GRID_SIZE;
          const origY = r * GRID_SIZE;
          let dispX = origX;
          let dispY = origY;

          if (hasMouse) {
            const dx = mx - origX;
            const dy = my - origY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160 && dist > 0) {
              const factor = Math.pow((160 - dist) / 160, 1.4) * 9; // Visible, elegant wave displacement
              dispX -= (dx / dist) * factor;
              dispY -= (dy / dist) * factor;
            }
          }
          gridNodes[r][c] = { x: dispX, y: dispY };
        }
      }

      // Draw Horizontal Grid Lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = gridNodes[r][c];
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }

        let lineProximity = 0;
        if (hasMouse) {
          const lineY = r * GRID_SIZE;
          const distY = Math.abs(my - lineY);
          if (distY < 150) {
            lineProximity = Math.max(0, 1 - distY / 150);
          }
        }

        ctx.lineWidth = 0.75 + lineProximity * 0.55;
        if (lineProximity > 0.08) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + lineProximity * 0.5})`;
        } else {
          ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)'; // Crisp, visible grey grid line
        }
        ctx.stroke();
      }

      // Draw Vertical Grid Lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = gridNodes[r][c];
          if (r === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }

        let lineProximity = 0;
        if (hasMouse) {
          const lineX = c * GRID_SIZE;
          const distX = Math.abs(mx - lineX);
          if (distX < 150) {
            lineProximity = Math.max(0, 1 - distX / 150);
          }
        }

        ctx.lineWidth = 0.75 + lineProximity * 0.55;
        if (lineProximity > 0.08) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + lineProximity * 0.5})`;
        } else {
          ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)'; // Crisp, visible grey grid line
        }
        ctx.stroke();
      }

      // ─── 3. UPDATE & DRAW INTERACTIVE GREEN SPARKLES (PARTICLES) ─
      for (const p of particlesRef.current) {
        if (hasMouse) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * REPEL_STRENGTH;
            p.vy -= Math.sin(angle) * force * REPEL_STRENGTH;
          }
        }

        p.vx += (p.originX - p.x) * RETURN_EASE;
        p.vy += (p.originY - p.y) * RETURN_EASE;

        p.vx *= FRICTION;
        p.vy *= FRICTION;

        p.x += p.vx;
        p.y += p.vy;

        const displacement = Math.sqrt((p.x - p.originX) ** 2 + (p.y - p.originY) ** 2);
        const brighten = Math.min(displacement / 16, 1);
        const finalOpacity = Math.min(p.opacity + brighten * 0.35, 0.9);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + brighten * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(finalOpacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        if (displacement > 2) {
          for (const other of particlesRef.current) {
            const ox = other.x - p.x;
            const oy = other.y - p.y;
            const od = Math.sqrt(ox * ox + oy * oy);
            if (od > 0 && od < 55) {
              const otherDisp = Math.sqrt((other.x - other.originX) ** 2 + (other.y - other.originY) ** 2);
              if (otherDisp > 2) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - od / 55) * 0.28})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      ro.disconnect();
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

// ─── Hero Component ─────────────────────────────────────────────────────────────
export default function Hero({ onExploreResearch, onRequestConsulting, onSignIn, user }: HeroProps) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24" id="hero" aria-label="Hero — Aurenix Research">
      {/* Interactive cursor-reactive canvas (renders responsive grid & green sparkles) */}
      <InteractiveBackground />

      {/* Very subtle static gradient accents */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute bottom-0 -left-24 w-72 h-72 bg-teal-50/40 rounded-full blur-3xl" style={{ zIndex: 0 }} aria-hidden="true" />

      {/* Content — sits above canvas */}
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/70 rounded-full text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider mx-auto lg:mx-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Africa's Research & Innovation Platform</span>
            </div>

            {/* Main Headline — SEO-optimised H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.1]">
              Africa's Premier{' '}
              <span className="text-emerald-600 relative inline-block">
                Research & Innovation
                <span className="absolute left-0 bottom-1 w-full h-1 bg-emerald-100/80 -z-10 rounded-full" aria-hidden="true" />
              </span>{' '}
              Platform
            </h1>

            {/* SEO-rich description */}
            <p className="max-w-2xl text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mx-auto lg:mx-0 px-2 sm:px-0">
              Aurenix is Africa's research and innovation platform dedicated to advancing energy, climate, and technology solutions. We connect students, researchers, institutions, and global stakeholders to document research, foster collaboration, and transform innovative ideas into real-world impact.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={user ? onExploreResearch : onSignIn}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99] rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-base"
                id="hero_start_documenting_btn"
                aria-label="Start documenting your research"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
                <span>Start Documenting</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                onClick={onExploreResearch}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-white text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/60 active:scale-[0.99] rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-xs sm:text-base border border-slate-200/80"
                id="hero_explore_btn"
                aria-label="Explore the research repository"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 shrink-0" aria-hidden="true" />
                <span>Explore Research Hub</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display">4+</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500 leading-snug">Core Research Areas</span>
              </div>
              <div className="border-x border-slate-200 px-1.5 sm:px-4 py-0 text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display whitespace-nowrap">3 Months</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500 leading-snug">Typical Project Cycle</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-xl sm:text-3xl font-bold text-slate-900 font-display">Pan</span>
                <span className="block text-[10px] sm:text-xs font-medium text-slate-500 leading-snug">African Focus &amp; Reach</span>
              </div>
            </div>

          </div>

          {/* Hero Right — Professional Research Status Panel */}
          <div className="lg:col-span-5 relative" id="hero_graphic_container">
            <motion.div 
              className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none"
              initial="hidden"
              animate={isDesktop ? "visible" : undefined}
              whileInView={!isDesktop ? "visible" : undefined}
              viewport={{ once: true, amount: 0.25 }}
            >
              {/* Main Research Status Card (Background scales up smoothly) */}
              <motion.div 
                className="relative p-6 sm:p-7 bg-white/90 backdrop-blur-sm rounded-3xl shadow-md z-10 border border-slate-100/80"
                variants={{
                  hidden: { scale: 0.1, opacity: 0 },
                  visible: { 
                    scale: 1, 
                    opacity: 1, 
                    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } 
                  }
                }}
              >
                {/* Card Header (Flies in from Top of Screen) */}
                <motion.div 
                  className="flex items-center justify-between mb-5"
                  variants={{
                    hidden: { opacity: 0, y: -450, x: -100, scale: 0.7, rotate: -8 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      x: 0, 
                      scale: 1, 
                      rotate: 0, 
                      transition: { duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] } 
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 rounded-lg">
                      <FlaskConical className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 tracking-tight">Research Overview</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    Active
                  </span>
                </motion.div>

                {/* Status Badges List */}
                <div className="space-y-3">
                  {/* Badge 1: Flies in from Far Left of Screen */}
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    variants={{
                      hidden: { opacity: 0, x: -800, y: -180, rotate: -18 },
                      visible: { 
                        opacity: 1, 
                        x: 0, 
                        y: 0, 
                        rotate: 0, 
                        transition: { duration: 1.25, delay: 0.45, ease: [0.16, 1, 0.3, 1] } 
                      }
                    }}
                  >
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <Shield className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-slate-800">Verified Technical Studies</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">100% Local Research Standards</div>
                    </div>
                    <Award className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" aria-hidden="true" />
                  </motion.div>

                  {/* Badge 2: Flies in from Far Right of Screen */}
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    variants={{
                      hidden: { opacity: 0, x: 800, y: -60, rotate: 18 },
                      visible: { 
                        opacity: 1, 
                        x: 0, 
                        y: 0, 
                        rotate: 0, 
                        transition: { duration: 1.25, delay: 0.60, ease: [0.16, 1, 0.3, 1] } 
                      }
                    }}
                  >
                    <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg shrink-0">
                      <Globe className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-slate-800">Waste-to-Energy Advocacy</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">Zero Emission Acceleration</div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-teal-500 shrink-0 ml-auto" aria-hidden="true" />
                  </motion.div>

                  {/* Badge 3: Flies in from Far Left of Screen */}
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    variants={{
                      hidden: { opacity: 0, x: -800, y: 180, rotate: -15 },
                      visible: { 
                        opacity: 1, 
                        x: 0, 
                        y: 0, 
                        rotate: 0, 
                        transition: { duration: 1.25, delay: 0.75, ease: [0.16, 1, 0.3, 1] } 
                      }
                    }}
                  >
                    <div className="p-1.5 bg-lime-100 text-lime-700 rounded-lg shrink-0">
                      <Leaf className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-slate-800">Circular Economy Research</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">Biomass &amp; Organic Waste Systems</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Bottom Trust Badge (Flies in diagonally from Far Bottom-Left of Screen) */}
              <motion.div 
                className="absolute -bottom-5 left-4 sm:-left-4 bg-slate-950/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-lg z-20 flex items-center gap-3 max-w-[220px] sm:max-w-xs"
                variants={{
                  hidden: { opacity: 0, x: -750, y: 400, scale: 0.3, rotate: -24 },
                  visible: { 
                    opacity: 1, 
                    x: 0, 
                    y: 0, 
                    scale: 1, 
                    rotate: 0, 
                    transition: { duration: 1.3, delay: 1.05, ease: [0.16, 1, 0.3, 1] } 
                  }
                }}
              >
                <div className="p-1.5 bg-emerald-600 rounded-xl text-white shrink-0">
                  <Globe className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-xs font-bold text-slate-100 truncate">Headquartered in Nigeria</span>
                  <span className="block text-[10px] font-mono text-slate-400">Lagos HQ • Pan-African Scope</span>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Institution Trust Bar */}
      <div className="mt-20 sm:mt-24 pt-8 sm:pt-10 overflow-hidden w-full px-0 relative" style={{ zIndex: 2 }}>
        <p className="text-center text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-center gap-2 px-4 sm:px-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Trusted Technical Partner &amp; Aligned with Leading African Institutions</span>
          <span className="sm:hidden">Aligned with Leading African Institutions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
        </p>
        <div className="relative w-full overflow-hidden py-3 lg:[mask-image:_linear-gradient(to_right,transparent_0,_black_80px,_black_calc(100%-80px),transparent_100%)]">
          <div className="animate-marquee flex items-center gap-5 py-2" role="list" aria-label="Partner institutions">
            {/* Set 1 */}
            <div className="flex items-center gap-5 shrink-0">
              {[
                { name: 'UNIVERSITY OF CAPE TOWN', tag: 'UCT', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-500' },
                { name: 'MAKERERE UNIVERSITY', tag: 'MAK', bg: 'border-sky-200 bg-sky-50/70 text-sky-800', dot: 'bg-sky-500' },
                { name: 'KNUST GHANA', tag: 'KNUST', bg: 'border-amber-200 bg-amber-50/70 text-amber-800', dot: 'bg-amber-500' },
                { name: 'UNIVERSITY OF LAGOS', tag: 'UNILAG', bg: 'border-teal-200 bg-teal-50/70 text-teal-800', dot: 'bg-teal-500' },
                { name: 'STELLENBOSCH UNIVERSITY', tag: 'SUN', bg: 'border-indigo-200 bg-indigo-50/70 text-indigo-800', dot: 'bg-indigo-500' },
                { name: 'CAIRO UNIVERSITY', tag: 'CU', bg: 'border-cyan-200 bg-cyan-50/70 text-cyan-800', dot: 'bg-cyan-500' },
                { name: 'UNIVERSITY OF NAIROBI', tag: 'UoN', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-500' },
                { name: 'UNIVERSITY OF IBADAN', tag: 'UI', bg: 'border-violet-200 bg-violet-50/70 text-violet-800', dot: 'bg-violet-500' },
                { name: 'AFRICAN DEVELOPMENT BANK', tag: 'AfDB', bg: 'border-blue-200 bg-blue-50/70 text-blue-800', dot: 'bg-blue-600' },
                { name: 'ECOWAS ECREEE', tag: 'ECREEE', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-600' },
                { name: 'AUDA-NEPAD', tag: 'NEPAD', bg: 'border-rose-200 bg-rose-50/70 text-rose-800', dot: 'bg-rose-500' },
                { name: 'IEA BIOMASS', tag: 'IEA', bg: 'border-lime-200 bg-lime-50/70 text-lime-900', dot: 'bg-lime-600' },
                { name: 'FAAN NIGERIA', tag: 'FAAN', bg: 'border-teal-200 bg-teal-50/70 text-teal-800', dot: 'bg-teal-500' },
              ].map((item, idx) => (
                <div key={`s1-${idx}`} className="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white shadow-xs border border-slate-200/90 hover:border-emerald-400/80 hover:shadow-md transition-all shrink-0" role="listitem">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} aria-hidden="true" />
                  <span className="font-display font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight whitespace-nowrap">{item.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.bg} whitespace-nowrap`}>{item.tag}</span>
                </div>
              ))}
            </div>
            {/* Set 2 — duplicate for seamless loop */}
            <div className="flex items-center gap-5 shrink-0" aria-hidden="true">
              {[
                { name: 'UNIVERSITY OF CAPE TOWN', tag: 'UCT', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-500' },
                { name: 'MAKERERE UNIVERSITY', tag: 'MAK', bg: 'border-sky-200 bg-sky-50/70 text-sky-800', dot: 'bg-sky-500' },
                { name: 'KNUST GHANA', tag: 'KNUST', bg: 'border-amber-200 bg-amber-50/70 text-amber-800', dot: 'bg-amber-500' },
                { name: 'UNIVERSITY OF LAGOS', tag: 'UNILAG', bg: 'border-teal-200 bg-teal-50/70 text-teal-800', dot: 'bg-teal-500' },
                { name: 'STELLENBOSCH UNIVERSITY', tag: 'SUN', bg: 'border-indigo-200 bg-indigo-50/70 text-indigo-800', dot: 'bg-indigo-500' },
                { name: 'CAIRO UNIVERSITY', tag: 'CU', bg: 'border-cyan-200 bg-cyan-50/70 text-cyan-800', dot: 'bg-cyan-500' },
                { name: 'UNIVERSITY OF NAIROBI', tag: 'UoN', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-500' },
                { name: 'UNIVERSITY OF IBADAN', tag: 'UI', bg: 'border-violet-200 bg-violet-50/70 text-violet-800', dot: 'bg-violet-500' },
                { name: 'AFRICAN DEVELOPMENT BANK', tag: 'AfDB', bg: 'border-blue-200 bg-blue-50/70 text-blue-800', dot: 'bg-blue-600' },
                { name: 'ECOWAS ECREEE', tag: 'ECREEE', bg: 'border-emerald-200 bg-emerald-50/70 text-emerald-800', dot: 'bg-emerald-600' },
                { name: 'AUDA-NEPAD', tag: 'NEPAD', bg: 'border-rose-200 bg-rose-50/70 text-rose-800', dot: 'bg-rose-500' },
                { name: 'IEA BIOMASS', tag: 'IEA', bg: 'border-lime-200 bg-lime-50/70 text-lime-900', dot: 'bg-lime-600' },
                { name: 'FAAN NIGERIA', tag: 'FAAN', bg: 'border-teal-200 bg-teal-50/70 text-teal-800', dot: 'bg-teal-500' },
              ].map((item, idx) => (
                <div key={`s2-${idx}`} className="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white shadow-xs border border-slate-200/90 hover:border-emerald-400/80 hover:shadow-md transition-all shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} aria-hidden="true" />
                  <span className="font-display font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight whitespace-nowrap">{item.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.bg} whitespace-nowrap`}>{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
