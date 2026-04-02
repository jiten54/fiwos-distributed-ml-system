import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node as FlowNode,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Workflow } from '../types';

const nodeTypes = {};

export default function WorkflowGraph({ workflows }: { workflows: Workflow[] }) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: FlowNode[] = workflows.map((wf, i) => ({
      id: wf.id,
      data: { label: (
        <div className="p-4 bg-[#0A0A0A] border border-[#141414] rounded-xl min-w-[200px] shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{wf.id}</span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-bold ${
              wf.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
            }`}>
              {wf.status}
            </span>
          </div>
          <div className="text-xs font-bold text-white mb-3">{wf.name}</div>
          <div className="w-full bg-[#141414] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-orange-500 h-full transition-all duration-500" 
              style={{ width: `${wf.progress}%` }} 
            />
          </div>
        </div>
      ) },
      position: { x: 50, y: i * 150 + 50 },
      style: { background: 'transparent', border: 'none', padding: 0 },
    }));

    const flowEdges: Edge[] = [];
    for (let i = 0; i < flowNodes.length - 1; i++) {
      flowEdges.push({
        id: `e${i}-${i+1}`,
        source: flowNodes[i].id,
        target: flowNodes[i+1].id,
        animated: workflows[i].status === 'running',
        style: { stroke: '#f97316', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#f97316',
        },
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [workflows]);

  return (
    <div className="h-[calc(100vh-180px)] w-full bg-[#050505] border border-[#141414] rounded-3xl overflow-hidden relative">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-lg font-bold uppercase tracking-tight">Workflow Orchestration</h3>
        <p className="text-xs text-[#444] uppercase tracking-widest font-semibold">Real-time job execution graph</p>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-[#050505]"
      >
        <Background color="#141414" gap={20} />
        <Controls className="bg-[#0A0A0A] border-[#141414] fill-white" />
      </ReactFlow>
    </div>
  );
}
