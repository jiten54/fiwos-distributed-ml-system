export interface Node {
  id: string;
  status: 'idle' | 'running' | 'training' | 'error';
  performance: number;
  load: number;
  modelVersion: number;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

export interface GlobalModel {
  weights: number[];
  version: number;
}

export interface SystemUpdate {
  nodes: Node[];
  workflows: Workflow[];
  globalModel: GlobalModel;
}
