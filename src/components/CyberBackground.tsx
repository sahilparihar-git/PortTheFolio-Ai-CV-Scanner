"use client";

import { motion } from 'framer-motion';

export function CyberBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-background pointer-events-none">
      {/* 3D Perspective Grid */}
      <div 
        className="absolute inset-0 cyber-grid" 
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div 
          initial={{ rotateX: 60, y: -200 }}
          animate={{ 
            y: [-200, -100, -200],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="w-[200%] h-[200%] absolute -left-1/2 top-0 cyber-grid opacity-20"
        />
      </div>

      {/* Floating Particles/Data Packets */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-12 bg-primary/20"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: -100,
            opacity: 0 
          }}
          animate={{ 
            y: '120vh',
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}

      {/* Scanline Animation */}
      <div className="scanline" />

      {/* Vignette & CRT Grain */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
