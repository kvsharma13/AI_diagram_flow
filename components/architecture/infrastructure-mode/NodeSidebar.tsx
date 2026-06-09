'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import { PALETTE_SERVICES, resolveIcon } from '@/lib/architecture/iconMap';
import ServiceIcon from '@/components/architecture/ServiceIcon';

interface Props {
  onClose: () => void;
}

export default function NodeSidebarDropdown({ onClose }: Props) {
  const { addNode } = useArchitectureStore();

  const handleAddNode = (service: string, label: string) => {
    addNode({
      label,
      type: service,
      position: { x: 360, y: 180 },
      data: {
        service,
        type: service,
      },
    });
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/50 px-3 py-2 max-h-44 overflow-y-auto">
      <div className="flex flex-wrap gap-1">
        {PALETTE_SERVICES.map((item) => {
          const spec = resolveIcon({ service: item.service, label: item.label });
          return (
            <button
              key={item.service}
              onClick={() => handleAddNode(item.service, item.label)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors group"
              title={`Add ${item.label}`}
            >
              <ServiceIcon spec={spec} size={15} />
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
