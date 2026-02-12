"use client";

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  useAnimationFrame
} from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, Search, Cpu, Globe,
  Mail, AlertTriangle, CheckCircle, Info, ArrowRight,
  Activity, Zap, Lock, Eye, LayoutDashboard, Database, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button';
import { SystemHealth, GlobalThreatStatus, ServiceStatus } from '@/components/CyberWidgets';
import { CyberTerminal } from '@/components/CyberTerminal';
import { SecurityAdvisor } from '@/components/SecurityAdvisor';

interface ScanResult {
  isPhishy: boolean;
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  advice?: string;
  usedAi?: boolean;
}

const GridPattern = ({ offsetX, offsetY }: { offsetX: any, offsetY: any }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="grid-pattern-main"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern-main)" />
    </svg>
  );
};

function SidebarContent() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 mb-2">Navigation</h2>
        <Button variant="secondary" className="w-full justify-start gap-3 bg-white/5 border-l-2 border-primary text-primary">
          <LayoutDashboard className="w-4 h-4" />
          DASHBOARD
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5">
          <Activity className="w-4 h-4" />
          LIVE_TRAFFIC
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5">
          <Database className="w-4 h-4" />
          THREAT_INTEL
        </Button>
      </div>

      <div className="pt-6">
        <SystemHealth />
      </div>

      <div className="pt-2">
        <GlobalThreatStatus />
      </div>

      <div className="mt-auto p-4 bg-primary/5 rounded border border-primary/10">
        <div className="text-[10px] font-mono text-primary mb-1 italic">ENCRYPTION_ACTIVE</div>
        <div className="text-[8px] font-mono text-muted-foreground truncate">SHA-512::8x9f2...k2j9</div>
      </div>
    </div>
  );
}

export default function PhishGuard() {
  const [inputType, setInputType] = useState<'url' | 'content' | 'headers'>('url');
  const [inputValue, setInputValue] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.5) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.5) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), msg]);
  };

  const handleScan = async () => {
    if (!inputValue) return;

    setIsScanning(true);
    setResult(null);
    setLogs([]);

    addLog(`INITIALIZING SECURITY SCAN: TYPE=${inputType.toUpperCase()}`);
    addLog(`SECURITY_PROTOCOL: v4.2.0_MISTRAL_STABLE`);

    let steps = [
      'ANALYZING DOMAIN STRUCTURE...',
      'CHECKING SSL CERTIFICATE INTEGRITY...',
      'SCANNING FOR HOMOGLYPH ATTACKS...',
      'VERIFYING PROTOCOL COMPLIANCE...',
      'FETCHING THREAT DATABASE SIGNATURES...',
      'EXECUTING AI DEEP NEURAL SCAN...'
    ];

    if (inputType === 'headers') {
      steps = [
        'PARSING EMAIL ENVELOPE...',
        'VERIFYING SPF/DKIM RECORDS...',
        'ANALYZING HOP LATENCY...',
        'CHECKING RETURN-PATH ALIGNMENT...',
        'SCANNING SENDER REPUTATION...',
        'EXECUTING AI HEADER ANALYSIS...'
      ];
    }

    for (const step of steps) {
      if (!useAi && step.includes('AI')) continue;
      addLog(step);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
    }

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: inputType, value: inputValue, useAi })
      });

      const data = await response.json();

      if (data.isPhishy) {
        addLog(`CRITICAL THREAT DETECTED: RISK_SCORE=${data.score}`);
        addLog(`MALICIOUS PATTERNS IDENTIFIED: ${data.reasons.length} FLAGS`);
      } else {
        addLog(`SCAN COMPLETE: NO IMMEDIATE THREATS IDENTIFIED`);
        addLog(`VERDICT: CLEAN`);
      }

      setResult(data);

      // Auto-scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      addLog(`CRITICAL ERROR: SCAN_PROTOCOL_FAILURE`);
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-black relative overflow-x-hidden"
    >
      {/* Full-page animated grid background */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      <motion.div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-orange-500/40 dark:bg-orange-600/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/40 dark:bg-blue-600/20 blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <nav className="h-16 md:h-[5.75rem] border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 transition-all duration-300 relative">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative group">
            <img
              src="/logo.png"
              className="w-12 h-12 md:w-[4.75rem] md:h-[4.75rem] object-contain mix-blend-screen drop-shadow-[0_0_12px_rgba(0,255,153,0.4)]"
              alt="PhishGuard Logo"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-black tracking-tighter text-white leading-none">PHISHGUARD</h1>
            <span className="text-[8px] md:text-[9px] font-mono text-primary tracking-widest">COMMAND_CENTER</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <ServiceStatus />
        </div>
      </nav>

      <main className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col border-r border-white/5 bg-black/20 p-6 space-y-6 sticky top-[5.75rem] h-[calc(100vh-5.75rem)] overflow-y-auto z-10 transition-all duration-300">
          <SidebarContent />
        </aside>

        <div className="flex-1 flex flex-col p-4 md:p-8 relative z-10 min-h-screen">
          <div className="max-w-5xl mx-auto w-full space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2 border-primary/20 text-primary font-mono text-[9px] md:text-[10px]">
                  STATION: PG-MAIN-01
                </Badge>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                  THREAT_SCANNER
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-1.5 md:w-2 h-6 md:h-8 bg-primary"
                  />
                </h2>
                <p className="text-muted-foreground font-mono text-[10px] md:text-xs">Deep heuristic analysis for digital threat detection.</p>
              </div>

              <MetalButton
                variant={useAi ? 'gold' : 'default'}
                onClick={() => setUseAi(!useAi)}
                className="min-w-auto px-4 py-2"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 md:w-4 md:h-4" />
                  ENHANCED_AI: {useAi ? 'ON' : 'OFF'}
                </span>
              </MetalButton>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Input Section */}
              <div className="xl:col-span-2 space-y-6">
                <div className="cyber-border bg-black/60 p-0.5 md:p-1">
                  <div className="bg-background/80 p-4 md:p-6 space-y-6">
                    <Tabs value={inputType} onValueChange={(v) => setInputType(v as 'url' | 'content' | 'headers')}>
                      <div className="grid w-full grid-cols-3 gap-2 mb-6">
                        <MetalButton
                          variant={inputType === 'url' ? 'primary' : 'default'}
                          onClick={() => setInputType('url')}
                          className="w-full text-[10px] md:text-sm"
                        >
                          URL_VECTOR
                        </MetalButton>
                        <MetalButton
                          variant={inputType === 'content' ? 'primary' : 'default'}
                          onClick={() => setInputType('content')}
                          className="w-full text-[10px] md:text-sm"
                        >
                          CONTENT
                        </MetalButton>
                        <MetalButton
                          variant={inputType === 'headers' ? 'primary' : 'default'}
                          onClick={() => setInputType('headers')}
                          className="w-full text-[10px] md:text-sm"
                        >
                          HEADERS
                        </MetalButton>
                      </div>

                      <div className="min-h-[160px] md:min-h-[200px] flex flex-col justify-center">
                        <TabsContent value="url" className="mt-0">
                          <div className="relative group">
                            <Input
                              placeholder="INPUT SOURCE URL..."
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              className="h-12 md:h-16 bg-black/40 border-white/10 focus:border-primary text-base md:text-xl font-mono transition-all pr-10 md:pr-12 text-primary placeholder:text-primary/100"
                            />
                            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary">
                              <Globe className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="content" className="mt-0">
                          <Textarea
                            placeholder="PASTE RAW MESSAGE CONTENT FOR DEEP HEURISTIC ANALYSIS..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="min-h-[160px] md:min-h-[200px] bg-black/40 border-white/10 focus:border-primary font-mono text-primary placeholder:text-primary/100 text-sm md:text-base"
                          />
                        </TabsContent>

                        <TabsContent value="headers" className="mt-0">
                          <Textarea
                            placeholder="PASTE RAW EMAIL HEADERS (X-SENDER, RECEIVED, SPF, etc.)"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="min-h-[160px] md:min-h-[200px] bg-black/40 border-white/10 focus:border-primary font-mono text-primary placeholder:text-primary/100 text-sm md:text-base"
                          />
                        </TabsContent>
                      </div>

                      <div className="mt-6 md:mt-8">
                        <MetalButton
                          variant="primary"
                          onClick={handleScan}
                          disabled={isScanning || !inputValue}
                          className="w-full h-12 md:h-16 text-base md:text-xl font-black group overflow-hidden relative"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isScanning ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                  <Activity className="w-5 h-5 md:w-6 md:h-6" />
                                </motion.div>
                                ANALYZING...
                              </>
                            ) : (
                              <>
                                INITIATE_DEEP_SCAN
                                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                              </>
                            )}
                          </span>
                        </MetalButton>
                      </div>
                    </Tabs>
                  </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="space-y-6"
                      ref={resultsRef}
                    >
                      <div className={`cyber-border p-0.5 md:p-1 bg-gradient-to-br ${result.isPhishy ? 'from-red-500/20 to-orange-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'from-emerald-500/20 to-cyan-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
                        <div className="bg-background/90 p-4 md:p-8 space-y-6 md:space-y-8">
                          {/* Header Result */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6 md:pb-8">
                            <div className="flex items-center gap-4 md:gap-6">
                              <div className={`p-3 md:p-5 rounded-none border-2 ${result.isPhishy ? 'border-red-500/50 bg-red-500/10' : 'border-emerald-500/50 bg-emerald-500/10'}`}>
                                {result.isPhishy ? (
                                  <ShieldAlert className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
                                ) : (
                                  <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-emerald-500" />
                                )}
                              </div>
                              <div>
                                <h2 className={`text-2xl md:text-5xl font-black tracking-tighter ${result.isPhishy ? 'text-red-500 glitch-text' : 'text-emerald-500'}`} data-text={result.isPhishy ? 'THREAT DETECTED' : 'SECURE SCAN'}>
                                  {result.isPhishy ? 'THREAT DETECTED' : 'SECURE SCAN'}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                                  <Badge className={`${result.isPhishy ? 'bg-red-500' : 'bg-emerald-500'} text-black font-bold uppercase text-[9px] md:text-xs`}>
                                    {result.severity} RISK
                                  </Badge>
                                  {result.usedAi && (
                                    <Badge variant="outline" className="border-primary text-primary font-bold animate-pulse text-[9px] md:text-xs">
                                      AI_ENHANCED
                                    </Badge>
                                  )}
                                  <span className="text-[9px] md:text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                    VERDICT: {result.isPhishy ? 'MALICIOUS' : 'CLEAN'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left md:text-right flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-0">
                              <div className="text-[9px] md:text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">SCORE</div>
                              <div className="text-3xl md:text-6xl font-black font-mono flex items-baseline gap-1 leading-none">
                                <span className={result.isPhishy ? 'text-red-500' : 'text-emerald-500'}>{result.score}</span>
                                <span className="text-sm md:text-xl text-muted-foreground">/100</span>
                              </div>
                            </div>
                          </div>

                          <Progress value={result.score} className={`h-1.5 md:h-2 ${result.isPhishy ? 'bg-red-500' : 'bg-emerald-500'}`} />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {/* Analysis */}
                            <div className="space-y-4 md:space-y-6">
                              <h3 className="text-xs md:text-sm font-bold font-mono flex items-center gap-3 text-white">
                                <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                VECTOR_ANALYSIS
                              </h3>
                              <div className="space-y-3 md:space-y-4">
                                {result.reasons.map((reason, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-3 md:p-4 border border-white/5 bg-white/5 relative group hover:bg-white/10 transition-colors"
                                  >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                    <p className="text-xs md:text-sm text-muted-foreground font-mono leading-relaxed pl-2">
                                      <span className="text-primary mr-2 font-bold">{'>'}</span>
                                      {reason}
                                    </p>
                                  </motion.div>
                                ))}
                                {result.reasons.length === 0 && (
                                  <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs md:text-sm font-mono italic">
                                    [NO_ANOMALIES_DETECTED_IN_CORE_PROTOCOLS]
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* AI Advice */}
                            <div className="space-y-4 md:space-y-6">
                              <h3 className="text-xs md:text-sm font-bold font-mono flex items-center gap-3 text-white">
                                <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                NEURAL_MITIGATION
                              </h3>
                              <div className="cyber-border bg-primary/5 p-4 md:p-6 relative group overflow-hidden">
                                <div className="absolute -top-12 -right-12 opacity-10 md:opacity-20 pointer-events-none">
                                  <img
                                    src="/logo.png"
                                    className="w-40 h-40 md:w-56 md:h-56 object-contain mix-blend-screen drop-shadow-[0_0_20px_rgba(0,255,153,0.1)]"
                                    alt="Logo"
                                  />
                                </div>
                                <p className="text-xs md:text-sm leading-relaxed text-muted-foreground font-mono relative z-10">
                                  {result.advice || "No critical threats identified. System monitoring remains active. Please verify the sender's identity before sharing sensitive data."}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 text-[8px] md:text-[9px] font-mono text-muted-foreground uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_var(--emerald-500)]" />
                                PROTECTION: ACTIVE [NODE_8]
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => setResult(null)}
                        className="w-full h-10 md:h-12 text-muted-foreground hover:text-primary transition-colors font-mono text-[10px] md:text-xs border border-white/5"
                      >
                        {'>'} RE-INITIALIZE_SCAN_INTERFACE
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Terminal Section */}
              <div className="h-[400px] md:h-[600px] xl:h-auto">
                <CyberTerminal logs={logs} isScanning={isScanning} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-auto md:h-14 border-t border-white/5 bg-black/60 px-4 md:px-6 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4 z-50 relative">
        <div className="flex flex-wrap gap-4 md:gap-6 items-center justify-center md:justify-start">
          <div className="text-[9px] md:text-[10px] font-mono text-muted-foreground flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            CORE_SYNC: ONLINE
          </div>
          <div className="text-[9px] md:text-[10px] font-mono text-muted-foreground flex items-center gap-3 md:gap-4">
            <span>Made by Sahil Parihar</span>
            <a
              href="https://www.linkedin.com/in/sahilparihar25"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:scale-110 transition-all"
            >
              <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </a>
          </div>
        </div>
        <div className="text-[8px] md:text-[9px] font-mono text-muted-foreground/40 tracking-widest uppercase text-center md:text-right">
          [PHISHGUARD_SEC_COMMAND] &copy; 2025 // NO_REPRO_ALLOWED
        </div>
      </footer>
      <SecurityAdvisor />
    </div>
  );
}
