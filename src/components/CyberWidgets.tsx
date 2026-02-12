"use client";

import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Globe, Server, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SystemHealth() {
  return (
    <div className="space-y-4 p-4 cyber-border bg-black/40">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-primary">
          <Activity className="w-3 h-3" />
          SYSTEM_HEALTH
        </h3>
        <Badge variant="outline" className="text-[10px] border-primary/50 text-primary animate-pulse">
          OPTIMAL
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>AI_CORE_LOAD</span>
          <span className="text-primary">12%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: '12%' }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>NEURAL_LATENCY</span>
          <span className="text-primary">42ms</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: '42%' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="p-2 border border-white/5 rounded bg-white/5">
          <div className="text-[8px] text-muted-foreground font-mono">NODE_ID</div>
          <div className="text-[10px] font-mono text-primary truncate">PG-ALPHA-7</div>
        </div>
        <div className="p-2 border border-white/5 rounded bg-white/5">
          <div className="text-[8px] text-muted-foreground font-mono">UPTIME</div>
          <div className="text-[10px] font-mono text-primary">99.99%</div>
        </div>
      </div>
    </div>
  );
}

export function GlobalThreatStatus() {
  return (
    <div className="space-y-4 p-4 cyber-border bg-black/40">
      <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-primary">
        <Shield className="w-3 h-3" />
        THREAT_MONITOR
      </h3>

      <div className="space-y-3">
        {[
          { label: 'DOM_SQUATTING', count: 124, status: 'high' },
          { label: 'ZERO_DAY_URLS', count: 12, status: 'med' },
          { label: 'EMAIL_SPOOF', count: 452, status: 'high' }
        ].map((threat, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">{threat.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white">{threat.count}</span>
              <div className={`w-1 h-1 rounded-full ${threat.status === 'high' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-yellow-500'}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
        <p className="text-[10px] font-mono text-red-400 leading-tight">
          <Zap className="w-3 h-3 inline mr-1" />
          ACTIVE_OUTBREAK: &quot;MISTRAL-PAY-SCAM&quot; SPREADING IN EU-WEST-1
        </p>
      </div>
    </div>
  );
}

export function ServiceStatus() {
  return (
    <div className="flex gap-4 px-6 py-3 border-y border-white/5 bg-black/20">
      {[
        { icon: Globe, label: 'WEB_GATEWAY', status: 'ONLINE' },
        { icon: Server, label: 'SCAN_NODE_01', status: 'ONLINE' },
        { icon: Database, label: 'THREAT_DB', status: 'SYNC' }
      ].map((service, i) => (
        <div key={i} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <service.icon className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground">{service.label}</span>
          <span className="text-[10px] font-mono text-primary">[{service.status}]</span>
        </div>
      ))}
    </div>
  );
}
