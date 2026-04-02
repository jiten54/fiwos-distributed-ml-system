import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Cpu, Activity, Database, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SystemUpdate } from '../types';
import { cn } from '../lib/utils';

export default function Dashboard({ data }: { data: SystemUpdate }) {
  const stats = [
    { label: 'Active Nodes', value: data.nodes.length, icon: Cpu, color: 'text-blue-500' },
    { label: 'System Load', value: `${(data.nodes.reduce((acc, n) => acc + n.load, 0) / data.nodes.length * 100).toFixed(1)}%`, icon: Activity, color: 'text-orange-500' },
    { label: 'Model Version', value: `v${data.globalModel.version}`, icon: Layers, color: 'text-purple-500' },
    { label: 'Active Workflows', value: data.workflows.filter(w => w.status === 'running').length, icon: Database, color: 'text-green-500' },
  ];

  const chartData = data.nodes[0].logs.slice(-10).map((log, i) => ({
    time: i,
    load: Math.random() * 100,
    perf: 80 + Math.random() * 20
  }));

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0A0A0A] border border-[#141414] p-6 rounded-2xl group hover:border-orange-500/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Real-time</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{stat.value}</div>
            <div className="text-xs text-[#666] mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#141414] p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight">System Performance</h3>
              <p className="text-xs text-[#444] uppercase tracking-widest font-semibold">Aggregate metrics across all clusters</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] uppercase font-bold text-[#666]">Load</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] uppercase font-bold text-[#666]">Accuracy</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#141414" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #141414', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="load" stroke="#f97316" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
                <Area type="monotone" dataKey="perf" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Node Status List */}
        <div className="bg-[#0A0A0A] border border-[#141414] p-8 rounded-3xl">
          <h3 className="text-lg font-bold uppercase tracking-tight mb-6">Node Status</h3>
          <div className="space-y-4">
            {data.nodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-4 bg-[#050505] border border-[#141414] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    node.load > 0.8 ? "bg-red-500 animate-pulse" : "bg-green-500"
                  )} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">{node.id}</div>
                    <div className="text-[10px] font-mono text-[#444]">v{node.modelVersion}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-orange-500">{(node.load * 100).toFixed(0)}%</div>
                  <div className="text-[10px] uppercase font-bold text-[#444]">Load</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
