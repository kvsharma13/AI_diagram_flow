import { GanttPhase, PhaseColor } from '@/types/project';

export interface TemplateStyle {
  background: string;
  headerBg: string;
  headerText: string;
  rowBg: string;
  rowBorder: string;
  barStyle: 'rounded' | 'flat' | 'gradient' | 'glow' | 'outline';
  barBorder: string;
  monthHeaderBg: string;
  monthHeaderText: string;
  gridLines: string;
  shadow: string;
}

export interface GanttTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  timelineMonths: number;
  phases: Omit<GanttPhase, 'id'>[];
  icon: string;
  preview: string;
  style: TemplateStyle;
}

const createStylePhases = (colors: PhaseColor[]): Omit<GanttPhase, 'id'>[] => [
  { name: 'Phase 1', startMonth: 1, duration: 2, deliverables: 'Key deliverables', color: colors[0] },
  { name: 'Phase 2', startMonth: 2.5, duration: 2, deliverables: 'Key deliverables', color: colors[1] },
  { name: 'Phase 3', startMonth: 4.5, duration: 1.5, deliverables: 'Key deliverables', color: colors[2] },
  { name: 'Phase 4', startMonth: 6, duration: 2.5, deliverables: 'Key deliverables', color: colors[3] },
  { name: 'Phase 5', startMonth: 8.5, duration: 1.5, deliverables: 'Key deliverables', color: colors[4] },
  { name: 'Phase 6', startMonth: 10, duration: 2, deliverables: 'Key deliverables', color: colors[5] },
];

export const ganttTemplates: GanttTemplate[] = [
  {
    id: 'purple-gold-bold',
    name: 'Purple Gold Bold',
    description: 'Bold purple background with golden bars and thick borders',
    category: 'Bold',
    timelineMonths: 12,
    icon: '👑',
    preview: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
    phases: createStylePhases(['purple', 'pink', 'purple', 'pink', 'purple', 'pink']),
    style: {
      background: 'linear-gradient(135deg, #7C3AED 10%, #9333EA 90%)',
      headerBg: '#5B21B6',
      headerText: '#FFFFFF',
      rowBg: '#C4B5A0',
      rowBorder: '#7C3AED',
      barStyle: 'flat',
      barBorder: '3px solid #7C3AED',
      monthHeaderBg: '#7C3AED',
      monthHeaderText: '#FFFFFF',
      gridLines: '#7C3AED',
      shadow: '0 4px 6px rgba(124, 58, 237, 0.3)',
    },
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark Glow',
    description: 'Dark background with glowing neon purple and cyan bars',
    category: 'Dark',
    timelineMonths: 12,
    icon: '🌃',
    preview: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    phases: createStylePhases(['purple', 'cyan', 'indigo', 'teal', 'purple', 'cyan']),
    style: {
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      headerBg: '#1E293B',
      headerText: '#A78BFA',
      rowBg: 'rgba(30, 41, 59, 0.5)',
      rowBorder: '#7C3AED',
      barStyle: 'glow',
      barBorder: '2px solid rgba(124, 58, 237, 0.8)',
      monthHeaderBg: 'rgba(124, 58, 237, 0.3)',
      monthHeaderText: '#E0E7FF',
      gridLines: 'rgba(124, 58, 237, 0.3)',
      shadow: '0 0 20px rgba(124, 58, 237, 0.6)',
    },
  },
  {
    id: 'clean-business',
    name: 'Clean Business',
    description: 'White background with colorful category bands',
    category: 'Professional',
    timelineMonths: 12,
    icon: '💼',
    preview: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    phases: createStylePhases(['purple', 'green', 'blue', 'pink', 'orange', 'red']),
    style: {
      background: '#FFFFFF',
      headerBg: '#F9FAFB',
      headerText: '#111827',
      rowBg: '#FFFFFF',
      rowBorder: '#E5E7EB',
      barStyle: 'rounded',
      barBorder: '1px solid rgba(0,0,0,0.1)',
      monthHeaderBg: '#F3F4F6',
      monthHeaderText: '#374151',
      gridLines: '#E5E7EB',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'minimal-green',
    name: 'Minimal Green',
    description: 'Light background with green hexagonal headers',
    category: 'Minimal',
    timelineMonths: 12,
    icon: '🌿',
    preview: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    phases: createStylePhases(['green', 'teal', 'green', 'cyan', 'green', 'teal']),
    style: {
      background: 'linear-gradient(to bottom, #F0FDF4, #FFFFFF)',
      headerBg: '#065F46',
      headerText: '#FFFFFF',
      rowBg: '#F9FAFB',
      rowBorder: '#D1D5DB',
      barStyle: 'rounded',
      barBorder: 'none',
      monthHeaderBg: '#ECFDF5',
      monthHeaderText: '#065F46',
      gridLines: '#E5E7EB',
      shadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
  },
  {
    id: 'gradient-rainbow',
    name: 'Gradient Rainbow',
    description: 'Vibrant gradient background with rainbow bars',
    category: 'Colorful',
    timelineMonths: 12,
    icon: '🌈',
    preview: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
    phases: createStylePhases(['pink', 'orange', 'yellow', 'green', 'cyan', 'purple']),
    style: {
      background: 'linear-gradient(135deg, #FEE2E2 0%, #DBEAFE 100%)',
      headerBg: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
      headerText: '#FFFFFF',
      rowBg: 'rgba(255, 255, 255, 0.9)',
      rowBorder: 'rgba(0,0,0,0.1)',
      barStyle: 'gradient',
      barBorder: 'none',
      monthHeaderBg: 'rgba(255, 255, 255, 0.8)',
      monthHeaderText: '#374151',
      gridLines: 'rgba(0,0,0,0.05)',
      shadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue and gray theme',
    category: 'Professional',
    timelineMonths: 12,
    icon: '📊',
    preview: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    phases: createStylePhases(['blue', 'indigo', 'cyan', 'blue', 'indigo', 'cyan']),
    style: {
      background: '#F8FAFC',
      headerBg: '#1E40AF',
      headerText: '#FFFFFF',
      rowBg: '#FFFFFF',
      rowBorder: '#CBD5E1',
      barStyle: 'flat',
      barBorder: '1px solid rgba(30, 64, 175, 0.2)',
      monthHeaderBg: '#EFF6FF',
      monthHeaderText: '#1E40AF',
      gridLines: '#E2E8F0',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Warm oranges and reds with soft glow',
    category: 'Warm',
    timelineMonths: 12,
    icon: '🌅',
    preview: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
    phases: createStylePhases(['orange', 'red', 'yellow', 'orange', 'pink', 'red']),
    style: {
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF2F2 100%)',
      headerBg: 'linear-gradient(90deg, #F97316, #DC2626)',
      headerText: '#FFFFFF',
      rowBg: 'rgba(255, 255, 255, 0.95)',
      rowBorder: '#FED7AA',
      barStyle: 'rounded',
      barBorder: 'none',
      monthHeaderBg: '#FFEDD5',
      monthHeaderText: '#9A3412',
      gridLines: '#FED7AA',
      shadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
    },
  },
  {
    id: 'glass-modern',
    name: 'Glass Modern',
    description: 'Glassmorphism with frosted glass effect',
    category: 'Modern',
    timelineMonths: 12,
    icon: '✨',
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
    phases: createStylePhases(['indigo', 'purple', 'pink', 'cyan', 'teal', 'blue']),
    style: {
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      headerBg: 'rgba(255, 255, 255, 0.2)',
      headerText: '#FFFFFF',
      rowBg: 'rgba(255, 255, 255, 0.1)',
      rowBorder: 'rgba(255, 255, 255, 0.2)',
      barStyle: 'rounded',
      barBorder: '1px solid rgba(255, 255, 255, 0.3)',
      monthHeaderBg: 'rgba(255, 255, 255, 0.15)',
      monthHeaderText: '#FFFFFF',
      gridLines: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    },
  },
  {
    id: 'retro-vintage',
    name: 'Retro Vintage',
    description: 'Vintage brown and beige with classic feel',
    category: 'Vintage',
    timelineMonths: 12,
    icon: '📜',
    preview: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    phases: createStylePhases(['orange', 'yellow', 'red', 'orange', 'yellow', 'red']),
    style: {
      background: '#FEF3C7',
      headerBg: '#78350F',
      headerText: '#FEF3C7',
      rowBg: '#FFFBEB',
      rowBorder: '#92400E',
      barStyle: 'flat',
      barBorder: '2px solid #92400E',
      monthHeaderBg: '#FDE68A',
      monthHeaderText: '#78350F',
      gridLines: '#D97706',
      shadow: '0 2px 4px rgba(120, 53, 15, 0.2)',
    },
  },
  {
    id: 'pastel-soft',
    name: 'Pastel Soft',
    description: 'Soft pastel colors with gentle gradients',
    category: 'Soft',
    timelineMonths: 12,
    icon: '🎀',
    preview: 'linear-gradient(135deg, #FDE2E4 0%, #E2ECE9 100%)',
    phases: createStylePhases(['pink', 'orange', 'yellow', 'teal', 'cyan', 'purple']),
    style: {
      background: 'linear-gradient(135deg, #FDE2E4 0%, #E2ECE9 100%)',
      headerBg: '#FDB4C4',
      headerText: '#831843',
      rowBg: 'rgba(255, 255, 255, 0.7)',
      rowBorder: '#F9C8D5',
      barStyle: 'rounded',
      barBorder: 'none',
      monthHeaderBg: '#FCE4EC',
      monthHeaderText: '#881337',
      gridLines: '#FBCFE8',
      shadow: '0 2px 4px rgba(244, 114, 182, 0.15)',
    },
  },
];

export function getTemplateById(id: string): GanttTemplate | undefined {
  return ganttTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): GanttTemplate[] {
  return ganttTemplates.filter(t => t.category === category);
}

export const templateCategories = Array.from(new Set(ganttTemplates.map(t => t.category)));
