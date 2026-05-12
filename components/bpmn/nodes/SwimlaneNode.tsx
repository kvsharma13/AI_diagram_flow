'use client';

export default function SwimlaneNode({ data }: any) {
  return (
    <div className="rounded-lg border border-gray-200 bg-blue-50/30 relative" style={{ minWidth: data.width || '800px', minHeight: data.height || '150px' }}>
      <div className="absolute top-0 left-0 w-8 h-full rounded-l-lg flex items-center justify-center" style={{ backgroundColor: data.color || '#6366f1' }}>
        <span className="text-white text-xs font-bold writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {data.label || 'Lane'}
        </span>
      </div>
    </div>
  );
}
