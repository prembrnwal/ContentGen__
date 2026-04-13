import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, ArrowRight, Layers, Bot, LayoutTemplate, Fingerprint, Zap, BarChart2, Shield } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Animated AI Node Canvas Background ────────────────────────────────────
const NODE_COUNT = 38;
const MAX_LINK_DIST = 180;

function AINodeBackground({ mouseX, mouseY }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init nodes
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1.5,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const nodes = nodesRef.current;
      const mx = mouseX.get();
      const my = mouseY.get();

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // Gentle mouse repulsion
        const dx = n.x - mx, dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.6;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force;
        }
      });

      // Draw links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_LINK_DIST) {
            const alpha = (1 - d / MAX_LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,179,237,0.5)';
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.55 }}
    />
  );
}

// ─── Arc Reactor Background Centrepiece ──────────────────────────────────────
function ArcReactor() {
  return (
    <div
      className="relative pointer-events-none"
      style={{ width: 520, height: 520, opacity: 0.22 }}
    >
        {/* Outer bloom */}
        <div className="absolute inset-0 rounded-full bg-primaryAccent/20 blur-[90px]" />
        <svg viewBox="0 0 480 480" width="480" height="480" className="absolute inset-0">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#93c5fd" stopOpacity="1"/>
              <stop offset="45%"  stopColor="#3b82f6" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="segFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1"/>
            </linearGradient>
            <filter id="arcGlow">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Outermost rings */}
          <circle cx="240" cy="240" r="228" fill="none" stroke="#3b82f6" strokeWidth="1"   opacity=".5"/>
          <circle cx="240" cy="240" r="220" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="8 5" opacity=".4"/>

          {/* 8 triangular fin blades */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            const ir = 92, or = 195, hw = 20;
            const ca = Math.cos(a), sa = Math.sin(a);
            const cp = Math.cos(a + Math.PI/2), sp = Math.sin(a + Math.PI/2);
            return (
              <polygon key={i}
                points={`${240+ir*ca},${240+ir*sa} ${240+or*ca+hw*cp},${240+or*sa+hw*sp} ${240+or*ca-hw*cp},${240+or*sa-hw*sp}`}
                fill="url(#segFill)" stroke="#60a5fa" strokeWidth="0.8" opacity=".7" filter="url(#arcGlow)"
              />
            );
          })}

          {/* Structural rings */}
          <circle cx="240" cy="240" r="200" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity=".5"/>
          <circle cx="240" cy="240" r="160" fill="none" stroke="#3b82f6" strokeWidth="7"   opacity=".2"/>
          <circle cx="240" cy="240" r="157" fill="none" stroke="#93c5fd" strokeWidth="1"   opacity=".6"/>

          {/* 6 hex node dots */}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * 60 * Math.PI) / 180;
            return <circle key={i} cx={240+132*Math.cos(a)} cy={240+132*Math.sin(a)} r="7" fill="#60a5fa" opacity=".5" filter="url(#arcGlow)"/>;
          })}
          <circle cx="240" cy="240" r="132" fill="none" stroke="#3b82f6" strokeWidth="0.7" strokeDasharray="4 7" opacity=".4"/>

          {/* Mid band */}
          <circle cx="240" cy="240" r="100" fill="none" stroke="#1d4ed8" strokeWidth="9"   opacity=".25"/>
          <circle cx="240" cy="240" r="96"  fill="none" stroke="#93c5fd" strokeWidth="1"   opacity=".6"/>

          {/* Spokes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return <line key={i}
              x1={240+96*Math.cos(a)} y1={240+96*Math.sin(a)}
              x2={240+62*Math.cos(a)} y2={240+62*Math.sin(a)}
              stroke="#93c5fd" strokeWidth="1" opacity=".4"
            />;
          })}

          {/* Inner core */}
          <circle cx="240" cy="240" r="60"  fill="#050d1a" opacity=".9"/>
          <circle cx="240" cy="240" r="55"  fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity=".8"/>
          <circle cx="240" cy="240" r="44"  fill="url(#coreGlow)"/>
          <circle cx="240" cy="240" r="22"  fill="#bfdbfe" opacity=".35" filter="url(#arcGlow)"/>
          <circle cx="240" cy="240" r="10"  fill="white"   opacity=".9"  filter="url(#arcGlow)"/>
        </svg>

        {/* Rotating dashed outer overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px dashed rgba(59,130,246,0.3)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        />
        {/* Counter-rotate inner ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 44, border: '1px dashed rgba(6,182,212,0.2)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pulsing core glow */}
        <motion.div
          className="absolute rounded-full bg-primaryAccent/20 blur-3xl"
          style={{ inset: 100 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
    </div>
  );
}

// ─── AI-Themed Hover-Reactive Floating Elements ──────────────────────────
// Each element floats autonomously AND drifts/glows when the user hovers it.
const AI_ELEMENTS = [

  // Brain SVG
  {
    x: '7%',  y: '14%', delay: 0,   drift: [-12, 12], rotate: [-8, 8],
    content: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-primaryAccent/50">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  // Binary string chip
  {
    x: '85%', y: '10%', delay: 0.8, drift: [14, -10], rotate: [5, -5],
    content: (
      <span className="font-mono text-[11px] text-tertiaryAccent/40 tracking-widest select-none">01101<br/>11010<br/>00111</span>
    ),
  },
  // Neural node cluster
  {
    x: '78%', y: '55%', delay: 0.4, drift: [-16, 10], rotate: [-6, 6],
    content: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="8"  cy="22" r="4" stroke="#3b82f6" strokeWidth="1" opacity=".5"/>
        <circle cx="22" cy="8"  r="4" stroke="#06b6d4" strokeWidth="1" opacity=".5"/>
        <circle cx="36" cy="22" r="4" stroke="#8b5cf6" strokeWidth="1" opacity=".5"/>
        <circle cx="22" cy="36" r="4" stroke="#3b82f6" strokeWidth="1" opacity=".5"/>
        <circle cx="22" cy="22" r="5" stroke="#fff" strokeWidth="1" opacity=".2"/>
        <line x1="12" y1="22" x2="17" y2="22" stroke="#3b82f6" strokeWidth="1" opacity=".4"/>
        <line x1="22" y1="12" x2="22" y2="17" stroke="#06b6d4" strokeWidth="1" opacity=".4"/>
        <line x1="27" y1="22" x2="32" y2="22" stroke="#8b5cf6" strokeWidth="1" opacity=".4"/>
        <line x1="22" y1="27" x2="22" y2="32" stroke="#3b82f6" strokeWidth="1" opacity=".4"/>
      </svg>
    ),
  },
  // Code brackets
  {
    x: '15%', y: '72%', delay: 1.2, drift: [10, -14], rotate: [-10, 10],
    content: (
      <span className="font-mono text-2xl font-bold text-secondaryAccent/30 select-none">{'{ }'}</span>
    ),
  },
  // Token/tag chip
  {
    x: '50%', y: '5%',  delay: 0.2, drift: [-10, 12], rotate: [-4, 4],
    content: (
      <span className="px-2.5 py-1 rounded-full border border-primaryAccent/20 text-[10px] font-bold text-primaryAccent/50 font-mono uppercase tracking-widest bg-primaryAccent/5 select-none">token</span>
    ),
  },
  // Waveform bars
  {
    x: '90%', y: '40%', delay: 1.6, drift: [12, 10], rotate: [0, 0],
    content: (
      <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
        {[4,10,2,14,6,18,8].map((h, i) => (
          <rect key={i} x={i*4+1} y={28-h} width="2.5" height={h} rx="1" fill="#06b6d4" opacity="0.35"/>
        ))}
      </svg>
    ),
  },
  // Cursor pointer with AI sparkle
  {
    x: '60%', y: '80%', delay: 0.6, drift: [-14, -10], rotate: [-5, 5],
    content: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.3" opacity=".45">
        <path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/>
        <path d="m13.5 13.5 4 4"/>
      </svg>
    ),
  },
  // Small dashed circle ring
  {
    x: '30%', y: '18%', delay: 1.0, drift: [8, -12], rotate: [0, 360],
    content: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="17" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity=".3"/>
        <circle cx="20" cy="20" r="3"  fill="#3b82f6" opacity=".4"/>
      </svg>
    ),
  },
  // Output label chip
  {
    x: '5%', y: '50%', delay: 1.4, drift: [12, 8], rotate: [-3, 3],
    content: (
      <span className="px-2.5 py-1 rounded-lg border border-tertiaryAccent/20 text-[10px] font-bold text-tertiaryAccent/40 font-mono bg-tertiaryAccent/5 select-none">output</span>
    ),
  },
  // Accuracy % badge
  {
    x: '42%', y: '88%', delay: 0.3, drift: [-8, 14], rotate: [-4, 4],
    content: (
      <span className="px-2.5 py-1.5 rounded-full border border-emerald-500/20 text-[11px] font-bold text-emerald-400/50 bg-emerald-500/5 font-mono select-none">98.4%</span>
    ),
  },
  // LLM label
  {
    x: '68%', y: '6%', delay: 0.9, drift: [10, -12], rotate: [-6, 6],
    content: (
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondaryAccent/35 font-bold select-none">LLM</span>
    ),
  },
  // Attention matrix (3×3 mini grid)
  {
    x: '22%', y: '40%', delay: 1.7, drift: [-10, 10], rotate: [-3, 3],
    content: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {[0,1,2].map(r => [0,1,2].map(c => (
          <rect key={`${r}-${c}`} x={c*11+1} y={r*11+1} width="9" height="9" rx="1.5"
            fill="#3b82f6" opacity={0.08 + (r + c) * 0.07}/>
        )))}
      </svg>
    ),
  },
  // Infinity / loop symbol
  {
    x: '55%', y: '70%', delay: 0.5, drift: [12, -8], rotate: [0, 0],
    content: (
      <svg width="42" height="22" viewBox="0 0 42 22" fill="none" stroke="#8b5cf6" strokeWidth="1.4" opacity=".35">
        <path d="M14 11c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7z"/>
        <path d="M21 11c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7z"/>
      </svg>
    ),
  },
  // Data flow right arrows
  {
    x: '38%', y: '3%', delay: 1.1, drift: [-6, 10], rotate: [0, 0],
    content: (
      <svg width="44" height="16" viewBox="0 0 44 16" fill="none">
        {[0,12,24].map(x => (
          <polyline key={x} points={`${x+1},8 ${x+8},4 ${x+8},12`} stroke="#06b6d4" strokeWidth="1.2" opacity=".35" fill="none"/>
        ))}
      </svg>
    ),
  },
  // [prompt] chip
  {
    x: '80%', y: '82%', delay: 0.7, drift: [8, -14], rotate: [-5, 5],
    content: (
      <span className="font-mono text-[10px] text-primaryAccent/40 border border-primaryAccent/15 px-2 py-0.5 rounded bg-primaryAccent/5 select-none">[prompt]</span>
    ),
  },
  // Sparkle cluster
  {
    x: '93%', y: '65%', delay: 1.3, drift: [-10, 8], rotate: [-8, 8],
    content: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity=".35">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  // Hexagon cell
  {
    x: '3%', y: '28%', delay: 1.9, drift: [14, -10], rotate: [0, 30],
    content: (
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" stroke="#3b82f6" strokeWidth="1" opacity=".3">
        <polygon points="16,2 30,10 30,26 16,34 2,26 2,10"/>
      </svg>
    ),
  },
  // Latency counter
  {
    x: '62%', y: '93%', delay: 0.15, drift: [-8, -12], rotate: [-2, 2],
    content: (
      <span className="font-mono text-[10px] text-tertiaryAccent/40 select-none">~42ms</span>
    ),
  },
  // Circuit trace
  {
    x: '48%', y: '55%', delay: 2.1, drift: [10, 12], rotate: [0, 0],
    content: (
      <svg width="50" height="30" viewBox="0 0 50 30" fill="none" stroke="#06b6d4" strokeWidth="1" opacity=".25">
        <path d="M2 15h10l5-10h6l5 10h6l5-10h9"/>
        <circle cx="12" cy="15" r="2" fill="#06b6d4" opacity=".4"/>
        <circle cx="38" cy="15" r="2" fill="#06b6d4" opacity=".4"/>
      </svg>
    ),
  },
  // Gradient bar (progress/loading)
  {
    x: '12%', y: '60%', delay: 0.35, drift: [10, -8], rotate: [0, 0],
    content: (
      <div className="flex flex-col gap-1 select-none">
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primaryAccent/40 to-transparent"/>
        <div className="w-10 h-1 rounded-full bg-gradient-to-r from-tertiaryAccent/30 to-transparent"/>
        <div className="w-12 h-1 rounded-full bg-gradient-to-r from-secondaryAccent/25 to-transparent"/>
      </div>
    ),
  },
  // <AI/> JSX tag
  {
    x: '73%', y: '32%', delay: 1.5, drift: [-12, 8], rotate: [-4, 4],
    content: (
      <span className="font-mono text-[11px] text-primaryAccent/35 select-none">{'<AI />'}</span>
    ),
  },
  // GPU chip icon
  {
    x: '35%', y: '62%', delay: 0.8, drift: [8, -16], rotate: [0, 0],
    content: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity=".35">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
      </svg>
    ),
  },
  // Dashed horizontal rule
  {
    x: '58%', y: '22%', delay: 1.0, drift: [-8, 12], rotate: [-2, 2],
    content: (
      <div className="flex items-center gap-1 select-none">
        <div className="w-2 h-[1px] bg-white/15"/>
        <div className="w-8 h-[1px] bg-primaryAccent/25"/>
        <div className="w-2 h-[1px] bg-white/15"/>
      </div>
    ),
  },
  // Tensor shape label
  {
    x: '25%', y: '8%', delay: 2.3, drift: [10, 10], rotate: [-3, 3],
    content: (
      <span className="font-mono text-[10px] text-tertiaryAccent/35 select-none">[512×768]</span>
    ),
  },
  // Small radar / ping ripple
  {
    x: '88%', y: '30%', delay: 0.6, drift: [-12, 14], rotate: [0, 0],
    content: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="4"  fill="#3b82f6" opacity=".5"/>
        <circle cx="18" cy="18" r="9"  stroke="#3b82f6" strokeWidth="1" opacity=".25"/>
        <circle cx="18" cy="18" r="15" stroke="#3b82f6" strokeWidth="0.7" opacity=".12"/>
      </svg>
    ),
  },
  // Model name tag
  {
    x: '2%', y: '80%', delay: 1.8, drift: [14, -10], rotate: [-5, 5],
    content: (
      <span className="px-2 py-0.5 rounded border border-secondaryAccent/20 font-mono text-[9px] text-secondaryAccent/40 bg-secondaryAccent/5 select-none">GPT-4o</span>
    ),
  },
  // Arrow up-right (signal)
  {
    x: '44%', y: '75%', delay: 0.45, drift: [-10, -10], rotate: [0, 15],
    content: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity=".3">
        <path d="M7 17L17 7M17 7H7M17 7v10"/>
      </svg>
    ),
  },
  // Vertical key-value pair
  {
    x: '96%', y: '55%', delay: 2.0, drift: [-12, 8], rotate: [-2, 2],
    content: (
      <div className="font-mono text-[9px] text-white/20 select-none leading-[1.6]">
        <div><span className="text-tertiaryAccent/35">temp</span>: 0.7</div>
        <div><span className="text-tertiaryAccent/35">top_p</span>: 0.9</div>
      </div>
    ),
  },
  // Small cross / plus
  {
    x: '70%', y: '95%', delay: 1.6, drift: [8, -10], rotate: [0, 45],
    content: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity=".3">
        <path d="M9 2v14M2 9h14"/>
      </svg>
    ),
  },
  // Vertical binary column
  {
    x: '32%', y: '85%', delay: 0.9, drift: [-6, 12], rotate: [0, 0],
    content: (
      <div className="font-mono text-[9px] text-primaryAccent/25 leading-[1.4] select-none">
        1<br/>0<br/>1<br/>1<br/>0<br/>1
      </div>
    ),
  },
  // Diamond shape
  {
    x: '18%', y: '20%', delay: 1.2, drift: [12, -8], rotate: [0, 45],
    content: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#06b6d4" strokeWidth="1" opacity=".3">
        <polygon points="10,1 19,10 10,19 1,10"/>
      </svg>
    ),
  },
  // Embed vector row
  {
    x: '75%', y: '48%', delay: 0.25, drift: [10, 12], rotate: [0, 0],
    content: (
      <span className="font-mono text-[9px] text-secondaryAccent/30 select-none">[-0.23, 0.87, ...]</span>
    ),
  },
  // Small network icon
  {
    x: '52%', y: '38%', delay: 1.75, drift: [-8, -10], rotate: [-5, 5],
    content: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1" opacity=".3">
        <circle cx="12" cy="5"  r="2"/><circle cx="5"  cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
        <path d="M12 7v5M12 12l-5.5 5M12 12l5.5 5"/>
      </svg>
    ),
  },
  // Glowing dot trio (RGB)
  {
    x: '40%', y: '18%', delay: 0.6, drift: [-10, 10], rotate: [0, 0],
    content: (
      <div className="flex gap-1.5 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-primaryAccent/50 shadow-[0_0_6px_#3b82f6]"/>
        <span className="w-1.5 h-1.5 rounded-full bg-secondaryAccent/50 shadow-[0_0_6px_#8b5cf6]"/>
        <span className="w-1.5 h-1.5 rounded-full bg-tertiaryAccent/50 shadow-[0_0_6px_#06b6d4]"/>
      </div>
    ),
  },
];

function AIFloatingElements() {
  return (
    <>
      {AI_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute cursor-pointer"
          style={{ left: el.x, top: el.y }}
          /* Autonomous idle float */
          animate={{
            y: [el.drift[0], el.drift[1], el.drift[0]],
            rotate: [el.rotate[0], el.rotate[1], el.rotate[0]],
          }}
          transition={{
            duration: 7 + i * 0.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: el.delay,
          }}
          /* On hover: spring away + glow */
          whileHover={{
            scale: 1.35,
            x: el.drift[1] * 2.5,
            y: el.drift[0] * 2.5,
            filter: 'brightness(2) drop-shadow(0 0 12px #3b82f6)',
            transition: { type: 'spring', stiffness: 180, damping: 12 },
          }}
        >
          {el.content}
        </motion.div>
      ))}
    </>
  );
}

// ─── Fake sparkline data for preview card ─────────────────────────────────
const CHART_DATA = [
  { v: 2 }, { v: 5 }, { v: 3 }, { v: 8 }, { v: 6 }, { v: 11 }, { v: 9 }, { v: 14 },
  { v: 10 }, { v: 17 }, { v: 13 }, { v: 20 }, { v: 16 }, { v: 24 },
];

// ─── Features ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Bot,           title: 'Advanced AI Models',   desc: 'Powered by state-of-the-art language models fine-tuned for content creation.' },
  { icon: LayoutTemplate, title: 'Smart Templates',     desc: 'Specialized templates for blogs, ads, LinkedIn posts, emails and more.' },
  { icon: Fingerprint,   title: 'Voice Matching',       desc: 'Generate content that perfectly mirrors your brand tone and style.' },
  { icon: Zap,           title: 'Instant Generation',   desc: 'Go from idea to polished draft in seconds, not hours.' },
  { icon: BarChart2,     title: 'Progress Insights',    desc: 'Track your output volume and quality with a personal analytics dashboard.' },
  { icon: Shield,        title: 'Secure & Private',     desc: 'Your content and credentials never leave your own Supabase instance.' },
];

// ─── Stats row ────────────────────────────────────────────────────────────
const STATS = [
  { value: '100+', label: 'Content Pieces' },
  { value: '6+',   label: 'Templates' },
  { value: '24+',  label: 'Active Users' },
  { value: '4+',   label: 'AI Models' },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function LandingPage({ setPage }) {
  const containerRef = useRef(null);

  // Raw mouse position for the canvas
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  // Smoothed for parallax layers
  const springX = useSpring(rawMouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawMouseY, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawMouseX.set(e.clientX - rect.left);
    rawMouseY.set(e.clientY - rect.top);
  }, [rawMouseX, rawMouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden flex flex-col bg-darkBg"
    >
      {/* ── Animated Background (no pointer events) ──────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AINodeBackground mouseX={rawMouseX} mouseY={rawMouseY} />

        {/* Parallax blobs reacting to mouse */}
        <motion.div
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primaryAccent/10 blur-[130px]"
          style={{ x: springX, y: springY, translateX: '-30%', translateY: '-30%' }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-secondaryAccent/10 blur-[120px]"
          style={{ x: springX, y: springY, translateX: '30%', translateY: '30%' }}
        />
        <motion.div
          className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-tertiaryAccent/5 blur-[100px]"
          style={{ x: springX, y: springY }}
        />
      </div>

      {/* ── AI Floating Elements – hoverable own layer ────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <AIFloatingElements />
        </div>
      </div>

      {/* ── Hero Section ────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-24">

        {/* Arc Reactor sits centered behind the headline */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <ArcReactor />
        </div>

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 mb-8 text-xs font-semibold text-textMuted"
        >
          {/* Avatar stack */}
          <span className="flex -space-x-1.5">
            {['#3b82f6','#8b5cf6','#06b6d4'].map((c, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full border border-darkBg flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: c }}
              >{String.fromCharCode(65 + i)}</span>
            ))}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Join 24+ creators already generating
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold max-w-4xl mx-auto leading-[1.05] tracking-tight mb-6"
        >
          Master Content Generation
          <br />
          <span className="text-white/90 italic font-bold drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]">
            with ContentGen Pro
          </span>
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Generate curated AI content across 100+ scenarios — from quick social posts to advanced technical assets.
          Real-time AI. Instant feedback. Track your progress.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <button
            onClick={() => setPage('login')}
            className="group relative px-8 py-4 rounded-xl bg-white text-darkBg font-bold text-base shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Generating — Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>

          <button
            onClick={() => setPage('login')}
            className="group px-8 py-4 rounded-xl glass-panel border border-white/10 text-white font-semibold text-base hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Layers size={18} className="text-primaryAccent" />
            Explore Templates
          </button>
        </motion.div>
      </div>

      {/* ── Stats Row ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.45 }}
        className="relative z-10 w-full border-y border-white/5 py-10"
      >
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-x-20 gap-y-8">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <div className="text-4xl font-display font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-xs font-bold text-textMuted uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Activity Preview Card (sparkline) ──────────── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl border border-white/5 p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primaryAccent/5 via-transparent to-tertiaryAccent/5 pointer-events-none" />
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end justify-between mb-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-2">Live Preview</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Your Generation Activity</h2>
              <p className="text-textMuted text-sm mt-2">See your AI output volume grow over time.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-textMuted shrink-0">
              <span className="w-2 h-2 rounded-full bg-primaryAccent animate-pulse" />
              Content Generated / Week
            </div>
          </div>

          <div className="h-52 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#161922', border: '1px solid #292d3b', borderRadius: 10 }}
                  itemStyle={{ color: '#fff', fontWeight: 700 }}
                  formatter={(v) => [v, 'Pieces']}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#landingGrad)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Feature Grid ───────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold text-primaryAccent uppercase tracking-widest mb-4">Why ContentGen Pro</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Everything you need to create at scale
          </h2>
          <p className="text-textMuted max-w-xl mx-auto">
            From first draft to final copy — our AI handles the heavy lifting so you can focus on strategy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-panel p-7 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.025] transition-all group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primaryAccent/10 border border-primaryAccent/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primaryAccent/20 transition-all">
                <f.icon size={22} className="text-primaryAccent" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-textMuted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ──────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primaryAccent/20 bg-gradient-to-br from-primaryAccent/10 via-darkSurface to-tertiaryAccent/10 p-12 text-center"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          />
          <BrainCircuit size={36} className="text-primaryAccent mx-auto mb-5 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to create your first piece?
          </h2>
          <p className="text-textMuted max-w-lg mx-auto mb-8">
            Pick a template, write a prompt, and let our AI do the work. No credit card required.
          </p>
          <button
            onClick={() => setPage('login')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-darkBg font-bold text-base shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all group"
          >
            <Sparkles size={18} className="text-primaryAccent group-hover:animate-spin" />
            Start Generating Free
          </button>
        </motion.div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-textMuted">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <BrainCircuit size={16} className="text-primaryAccent" />
          <span className="font-semibold text-white">ContentGen</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
