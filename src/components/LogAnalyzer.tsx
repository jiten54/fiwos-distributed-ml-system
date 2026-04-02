import React, { useState } from 'react';
import { Terminal, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Node } from '../types';
import { cn } from '../lib/utils';

export default function LogAnalyzer({ nodes }: { nodes: Node[] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const allLogs = nodes.flatMap(n => n.logs.map(l => ({ ...l, nodeId: n.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: allLogs.slice(0, 20) })
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Log Stream */}
      <div className="bg-[#0A0A0A] border border-[#141414] rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-6 border-b border-[#141414] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold uppercase tracking-tight">System Logs</h3>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Live Stream</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-[11px]">
          {allLogs.map((log, i) => (
            <div key={i} className="flex gap-4 group hover:bg-[#141414] p-1 rounded transition-colors">
              <span className="text-[#333] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={cn(
                "shrink-0 font-bold",
                log.type === 'ERROR' ? 'text-red-500' : log.type === 'WARN' ? 'text-orange-500' : 'text-blue-500'
              )}>
                [{log.type}]
              </span>
              <span className="text-[#666] shrink-0">[{log.nodeId}]</span>
              <span className="text-[#AAA]">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-[#0A0A0A] border border-[#141414] rounded-3xl p-8 flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight">AI Root Cause Analysis</h3>
            <p className="text-xs text-[#444] uppercase tracking-widest font-semibold">LLM-powered diagnostics</p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#222] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#222] transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-orange-500" />}
            Analyze
          </button>
        </div>

        <div className="flex-1 bg-[#050505] border border-[#141414] rounded-2xl p-6 overflow-y-auto">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-[#444]">
              <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Gemini is processing logs...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-[#AAA] leading-relaxed whitespace-pre-wrap font-sans">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-[#444] opacity-50">
              <AlertCircle className="w-12 h-12" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-center">
                Select "Analyze" to trigger<br />AI diagnostics on current log stream
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">System Insight</span>
          </div>
          <p className="text-[10px] text-[#666] leading-relaxed">
            AI analysis correlates events across distributed nodes to identify cascading failures and suggest proactive maintenance schedules.
          </p>
        </div>
      </div>
    </div>
  );
}
