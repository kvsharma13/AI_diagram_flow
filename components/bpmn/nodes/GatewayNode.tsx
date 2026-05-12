'use client';

import { Handle, Position } from 'reactflow';

const gatewaySymbols: Record<string, string> = {
  exclusiveGateway: 'X',
  parallelGateway: '+',
  inclusiveGateway: 'O',
};

export default function GatewayNode({ data, selected }: any) {
  const symbol = gatewaySymbols[data.gatewayType || 'exclusiveGateway'] || 'X';

  return (
    <div className="relative w-12 h-12">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-amber-500 !border-none" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-amber-500 !border-none" style={{ top: '50%' }} />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-500 !border-none" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-500 !border-none" />
      <div
        className={`w-12 h-12 flex items-center justify-center border-2 transition-all ${selected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white' : ''}`}
        style={{
          transform: 'rotate(45deg)',
          borderColor: '#f59e0b',
          backgroundColor: '#fffbeb',
        }}
      >
        <span className="text-amber-700 font-bold text-sm" style={{ transform: 'rotate(-45deg)' }}>
          {symbol}
        </span>
      </div>
    </div>
  );
}
