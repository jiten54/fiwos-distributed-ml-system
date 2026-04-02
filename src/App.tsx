import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  LayoutDashboard, 
  Network, 
  Terminal, 
  Workflow as WorkflowIcon,
  Zap,
  AlertCircle,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { SystemUpdate, Node, Workflow, GlobalModel } from './types';
import Dashboard from './components/Dashboard';
import WorkflowGraph from './components/WorkflowGraph';
import FederatedLearning from './components/FederatedLearning';
import LogAnalyzer from './components/LogAnalyzer';
import { cn } from './lib/utils';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<SystemUpdate | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflow' | 'federated' | 'logs'>('dashboard');
  const [isAggregating, setIsAggregating] = useState(false);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on('system_update', (update: SystemUpdate) => {
      setData(update);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const triggerAggregation = async () => {
    setIsAggregating(true);
    try {
      await fetch('/api/federated/aggregate', { method: 'POST' });
    } finally {
      setTimeout(() => setIsAggregating(false), 2000);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm font-mono tracking-widest uppercase opacity-50">Initializing FIWOS Core...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflow', label: 'Workflows', icon: WorkflowIcon },
    { id: 'federated', label: 'Federated Learning', icon: Network },
    { id: 'logs', label: 'Log Analysis', icon: Terminal },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans selection:bg-orange-500 selection:text-black">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 border-r border-[#141414] bg-[#050505] flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
          <Zap className="text-black w-6 h-6 fill-current" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group relative",
                activeTab === tab.id ? "bg-[#141414] text-orange-500" : "text-[#444] hover:text-[#888]"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="absolute left-16 bg-[#141414] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#222]">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className={cn(
            "w-2 h-2 rounded-full",
            socket?.connected ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"
          )} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 min-h-screen">
        <header className="h-20 border-b border-[#141414] flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
              FIWOS <span className="text-orange-500 font-mono text-xs opacity-50 font-normal">v2.4.0-stable</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#444] font-semibold">Federated Intelligent Workflow Optimization System</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#444] font-bold">Global Model</span>
              <span className="text-xs font-mono text-orange-500">v{data.globalModel.version}</span>
            </div>
            <button 
              onClick={triggerAggregation}
              disabled={isAggregating}
              className={cn(
                "px-4 py-2 bg-orange-500 text-black text-xs font-bold uppercase tracking-widest rounded transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100",
                isAggregating && "animate-pulse"
              )}
            >
              {isAggregating ? "Aggregating..." : "Trigger FedAvg"}
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard data={data} />}
              {activeTab === 'workflow' && <WorkflowGraph workflows={data.workflows} />}
              {activeTab === 'federated' && <FederatedLearning nodes={data.nodes} globalModel={data.globalModel} />}
              {activeTab === 'logs' && <LogAnalyzer nodes={data.nodes} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
