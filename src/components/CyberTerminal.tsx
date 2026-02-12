"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  isScanning: boolean;
}

export function CyberTerminal({ logs, isScanning }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full cyber-border bg-black/60 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-primary">
          <TerminalIcon className="w-3 h-3" />
          <span>LIVE_EXECUTION_LOG</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-primary shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className="text-muted-foreground shrink-0">$</span>
              <span className={log.includes('CRITICAL') || log.includes('THREAT') ? 'text-red-400' : 'text-white/80'}>
                {log}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isScanning && (
          <div className="flex gap-2 items-center">
            <span className="text-primary">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className="text-muted-foreground">$</span>
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-primary"
            />
          </div>
        )}

        {!isScanning && logs.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
            <TerminalIcon className="w-8 h-8 opacity-10" />
            <span>WAITING_FOR_INPUT...</span>
          </div>
        )}
      </div>

      <div className="px-3 py-1 border-t border-white/5 bg-white/5 text-[8px] text-muted-foreground flex justify-between">
        <span>SESSION: PG-{Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span>AUTH: ENCRYPTED_AES_256</span>
      </div>
    </div>
  );
}
