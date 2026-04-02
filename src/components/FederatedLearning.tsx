import React from 'react';
import { motion } from 'motion/react';
import { Network, Cpu, Database, ArrowRight, Layers } from 'lucide-react';
import { Node, GlobalModel } from '../types';

export default function FederatedLearning({ nodes, globalModel }: { nodes: Node[], globalModel: GlobalModel }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Federated Architecture Visualization */}
        <div className="bg-[#0A0A0A] border border-[#141414] p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Network className="w-64 h-64" />
          </div>

          <h3 className="text-lg font-bold uppercase tracking-tight mb-8">Federated Architecture</h3>
          
          <div className="flex flex-col items-center gap-12 relative py-12">
            {/* Global Model Node */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 bg-orange-500 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.2)] z-10"
            >
              <Layers className="text-black w-8 h-8 mb-2" />
              <span className="text-[10px] font-bold text-black uppercase">Global Model</span>
              <span className="text-xs font-mono text-black font-bold">v{globalModel.version}</span>
            </motion.div>

            {/* Connection Lines */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
              <svg className="w-full h-full">
                {nodes.map((_, i) => (
                  <motion.line
                    key={i}
                    x1="50%"
                    y1="30%"
                    x2={`${25 + i * 25}%`}
                    y2="70%"
                    stroke="#141414"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>
            </div>

            {/* Worker Nodes */}
            <div className="flex justify-between w-full px-12">
              {nodes.map((node, i) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-[#141414] border border-[#222] rounded-2xl flex items-center justify-center group hover:border-orange-500/50 transition-all">
                    <Cpu className="text-[#444] group-hover:text-orange-500 w-6 h-6 transition-colors" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest">{node.id}</div>
                    <div className="text-[8px] font-mono text-[#444]">Local Weights: {node.modelVersion}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Weights Visualization */}
        <div className="bg-[#0A0A0A] border border-[#141414] p-8 rounded-3xl">
          <h3 className="text-lg font-bold uppercase tracking-tight mb-8">Model Weights Distribution</h3>
          <div className="space-y-6">
            {globalModel.weights.map((weight, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Parameter Layer {i + 1}</span>
                  <span className="text-xs font-mono text-orange-500">{(weight * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-[#141414]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${weight * 100}%` }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[#050505] border border-[#141414] rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-500" />
              Federated Averaging (FedAvg)
            </h4>
            <p className="text-xs text-[#666] leading-relaxed">
              The system uses secure multi-party computation to aggregate local model updates from edge nodes without exposing raw training data. This ensures privacy-preserving intelligence across the distributed network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
