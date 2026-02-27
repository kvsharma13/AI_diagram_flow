'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { Trash2, Plus, Settings, GripHorizontal, Calendar, ChevronDown, Download, X, Sparkles, Code, Type } from 'lucide-react';
import { useState, useRef } from 'react';
import { PhaseColor } from '@/types/project';
import GanttTemplateSelector from '@/components/gantt/GanttTemplateSelector';
import { GanttTemplate } from '@/lib/ganttTemplates';
import CodeImportModal from '@/components/CodeImportModal';
import AIImportModal from '@/components/AIImportModal';

export default function GanttEditor() {
  const { project, addPhase, updatePhase, deletePhase, setTimelineMonths, setTimelineUnit, loadGanttTemplate, importGanttFromCode } = useProjectStore();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showTimelineSettings, setShowTimelineSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAIImportModal, setShowAIImportModal] = useState(false);
  const [draggingPhase, setDraggingPhase] = useState<string | null>(null);
  const [resizingPhase, setResizingPhase] = useState<{ id: string; type: 'start' | 'end' } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; startMonth: number; duration: number; containerWidth: number } | null>(null);
  const [exportMode, setExportMode] = useState(false);
  const [editingPhaseName, setEditingPhaseName] = useState<string | null>(null);
  const [editingPhaseDeliverables, setEditingPhaseDeliverables] = useState<string | null>(null);
  const [editingBarLabel, setEditingBarLabel] = useState<string | null>(null);
  const [showBarText, setShowBarText] = useState(true);
  const [exportHeading, setExportHeading] = useState('');
  const [showHeadingInput, setShowHeadingInput] = useState(false);
  const [timelineHeading, setTimelineHeading] = useState('Timeline View');
  const [editingTimelineHeading, setEditingTimelineHeading] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  if (!project) return null;

  const timelineMonths = project.timelineMonths || 12;
  const timelineUnit = project.timelineUnit || 'months';
  const unitLabel = timelineUnit === 'weeks' ? 'Week' : 'Month';
  const unitLabelPlural = timelineUnit === 'weeks' ? 'Weeks' : 'Months';

  const handleAddPhase = () => {
    const defaultColors: PhaseColor[] = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];
    const usedColors = project.ganttPhases.map(p => p.color);
    const availableColor = defaultColors.find(c => !usedColors.includes(c)) || 'purple';

    addPhase({
      name: 'New Phase',
      startMonth: 1,
      duration: 2,
      deliverables: '',
      color: availableColor,
    });
  };

  const handleLoadTemplate = (template: GanttTemplate) => {
    loadGanttTemplate(template.phases, template.timelineMonths, template.style);
  };

  const handleImport = (data: any) => {
    importGanttFromCode(data);
    setShowImportModal(false);
  };

  const colorConfig: Record<PhaseColor, { bg: string; gradient: string; text: string; light: string; border: string }> = {
    purple: { bg: '#8B5CF6', gradient: 'from-purple-500 to-purple-600', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200' },
    blue: { bg: '#3B82F6', gradient: 'from-blue-500 to-blue-600', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
    green: { bg: '#10B981', gradient: 'from-green-500 to-green-600', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' },
    orange: { bg: '#F59E0B', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
    pink: { bg: '#EC4899', gradient: 'from-pink-500 to-pink-600', text: 'text-pink-700', light: 'bg-pink-50', border: 'border-pink-200' },
    teal: { bg: '#14B8A6', gradient: 'from-teal-500 to-teal-600', text: 'text-teal-700', light: 'bg-teal-50', border: 'border-teal-200' },
    red: { bg: '#EF4444', gradient: 'from-red-500 to-red-600', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' },
    indigo: { bg: '#6366F1', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-700', light: 'bg-indigo-50', border: 'border-indigo-200' },
    yellow: { bg: '#EAB308', gradient: 'from-yellow-500 to-yellow-600', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' },
    cyan: { bg: '#06B6D4', gradient: 'from-cyan-500 to-cyan-600', text: 'text-cyan-700', light: 'bg-cyan-50', border: 'border-cyan-200' },
  };

  const getColorConfig = (colorName?: PhaseColor) => {
    return colorConfig[colorName || 'purple'];
  };

  // Get template style or default
  const templateStyle = project.ganttTemplateStyle;

  // Helper to get bar styling based on template
  const getBarStyle = (color: { bg: string; gradient: string }) => {
    if (!templateStyle) {
      return {
        className: 'rounded-lg shadow-md hover:shadow-lg bg-gradient-to-r',
        gradient: color.gradient,
        border: '',
      };
    }

    const baseClasses = [];
    const inlineStyles: React.CSSProperties = {};

    // Bar shape
    if (templateStyle.barStyle === 'rounded') {
      baseClasses.push('rounded-lg');
    } else if (templateStyle.barStyle === 'flat') {
      baseClasses.push('rounded-none');
    } else if (templateStyle.barStyle === 'glow') {
      baseClasses.push('rounded-lg');
    } else {
      baseClasses.push('rounded-lg');
    }

    // Border
    if (templateStyle.barBorder && templateStyle.barBorder !== 'none') {
      inlineStyles.border = templateStyle.barBorder;
    }

    // Shadow
    if (templateStyle.shadow) {
      inlineStyles.boxShadow = templateStyle.shadow;
    }

    // Background
    if (templateStyle.barStyle === 'gradient') {
      baseClasses.push('bg-gradient-to-r');
    } else if (templateStyle.barStyle === 'glow') {
      inlineStyles.filter = 'drop-shadow(0 0 10px currentColor)';
    }

    return {
      className: baseClasses.join(' '),
      gradient: color.gradient,
      inlineStyles,
    };
  };

  const handleBarMouseDown = (e: React.MouseEvent, phaseId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    e.stopPropagation();

    const phase = project.ganttPhases.find(p => p.id === phaseId);
    if (!phase) return;

    const container = timelineRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    setDragStart({
      x: e.clientX,
      startMonth: phase.startMonth,
      duration: phase.duration,
      containerWidth: rect.width,
    });

    if (type === 'move') {
      setDraggingPhase(phaseId);
    } else {
      setResizingPhase({ id: phaseId, type: type === 'resize-start' ? 'start' : 'end' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || (!draggingPhase && !resizingPhase)) return;

    const deltaX = e.clientX - dragStart.x;
    const monthsPerPixel = timelineMonths / dragStart.containerWidth;
    const deltaMonths = deltaX * monthsPerPixel;

    if (draggingPhase) {
      const newStartMonth = dragStart.startMonth + deltaMonths;
      const clampedStart = Math.max(1, Math.min(timelineMonths - dragStart.duration + 1, newStartMonth));

      updatePhase(draggingPhase, {
        startMonth: Math.round(clampedStart * 100) / 100 // Round to 2 decimal places for smooth movement
      });
    } else if (resizingPhase) {
      const phase = project.ganttPhases.find(p => p.id === resizingPhase.id);
      if (!phase) return;

      if (resizingPhase.type === 'start') {
        const newStartMonth = dragStart.startMonth + deltaMonths;
        const newDuration = dragStart.duration - deltaMonths;

        if (newDuration >= 0.5 && newStartMonth >= 1) {
          updatePhase(resizingPhase.id, {
            startMonth: Math.round(newStartMonth * 100) / 100,
            duration: Math.round(newDuration * 100) / 100
          });
        }
      } else {
        const newDuration = dragStart.duration + deltaMonths;
        const maxDuration = timelineMonths - dragStart.startMonth + 1;

        if (newDuration >= 0.5 && newDuration <= maxDuration) {
          updatePhase(resizingPhase.id, {
            duration: Math.round(newDuration * 100) / 100
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingPhase(null);
    setResizingPhase(null);
    setDragStart(null);
  };

  const timelinePresets = timelineUnit === 'weeks'
    ? [
        { label: '4W', value: 4 },
        { label: '8W', value: 8 },
        { label: '12W', value: 12 },
        { label: '24W', value: 24 },
        { label: '52W', value: 52 },
      ]
    : [
        { label: '3M', value: 3 },
        { label: '6M', value: 6 },
        { label: '12M', value: 12 },
        { label: '18M', value: 18 },
        { label: '24M', value: 24 },
      ];

  const handleExportScreenshot = async () => {
    setExportMode(true);
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) {
      alert('Export area not found. Please try again.');
      return;
    }

    try {
      const htmlToImage = await import('html-to-image');

      console.log('Starting export...');

      const element = exportRef.current;

      // Find the modal container (parent with max-h-[90vh])
      const modalContainer = element.closest('.max-h-\\[90vh\\]') as HTMLElement;
      const modalOriginalStyles = modalContainer ? {
        overflow: modalContainer.style.overflow,
        maxHeight: modalContainer.style.maxHeight,
      } : null;

      // Remove overflow from modal container
      if (modalContainer) {
        modalContainer.style.overflow = 'visible';
        modalContainer.style.maxHeight = 'none';
      }

      // Store original styles of export element
      const originalStyles = {
        overflow: element.style.overflow,
        maxHeight: element.style.maxHeight,
        height: element.style.height,
      };

      // Temporarily make content fully visible
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      element.style.height = 'auto';

      // Find and expand ALL nested scrollable elements
      const overflowElements = element.querySelectorAll('.overflow-auto, .overflow-x-auto, [style*="overflow"]');
      const originalOverflows: { el: HTMLElement; overflow: string; maxHeight: string }[] = [];

      overflowElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          originalOverflows.push({
            el,
            overflow: el.style.overflow,
            maxHeight: el.style.maxHeight,
          });
          el.style.overflow = 'visible';
          el.style.maxHeight = 'none';
        }
      });

      // Wait for layout to fully adjust
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Capturing full content...');

      // Get dimensions and ensure landscape format
      const width = Math.max(element.scrollWidth, 1200);
      const height = element.scrollHeight;

      // Force landscape aspect ratio (minimum 4:3)
      const minLandscapeHeight = width * 0.6; // Max 60% of width
      const finalHeight = Math.min(height, minLandscapeHeight);

      console.log('Export dimensions:', { width, height: finalHeight, originalHeight: height });

      // Capture the image with landscape dimensions
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: width,
        height: height, // Use actual height to capture all content
      });

      // Restore modal container styles
      if (modalContainer && modalOriginalStyles) {
        modalContainer.style.overflow = modalOriginalStyles.overflow;
        modalContainer.style.maxHeight = modalOriginalStyles.maxHeight;
      }

      // Restore export element styles
      element.style.overflow = originalStyles.overflow;
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.height = originalStyles.height;

      // Restore nested elements
      originalOverflows.forEach(({ el, overflow, maxHeight }) => {
        el.style.overflow = overflow;
        el.style.maxHeight = maxHeight;
      });

      console.log('Downloading...');

      // Download
      const link = document.createElement('a');
      link.download = `${project.name}-timeline.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Export complete!');
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper to format month display
  const formatMonth = (month: number) => {
    return Math.round(month * 10) / 10; // Display with 1 decimal place
  };

  // Export View Modal
  if (exportMode) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto">
          {/* Export Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Timeline</h2>
              <p className="text-sm text-gray-500 mt-0.5">Screenshot-ready view for documents</p>
            </div>
            <div className="flex gap-2 items-center">
              {/* Custom Heading Input */}
              {showHeadingInput ? (
                <input
                  type="text"
                  value={exportHeading}
                  onChange={(e) => setExportHeading(e.target.value)}
                  placeholder={project.name}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              ) : (
                <button
                  onClick={() => setShowHeadingInput(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {exportHeading ? `"${exportHeading}"` : 'Customize Heading'}
                </button>
              )}
              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={() => setExportMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Clean Export View - Landscape Format */}
          <div ref={exportRef} className="p-8 bg-white" style={{ minWidth: '1200px', maxWidth: '100%' }}>
            {/* Project Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exportHeading || project.name}</h1>
              <p className="text-gray-600">
                {timelineHeading} • {project.ganttPhases.length} Phases • {timelineMonths} {unitLabelPlural} Duration
              </p>
            </div>

            {/* Timeline Chart */}
            <div
              className="rounded-xl shadow-sm border overflow-hidden"
              style={{
                background: templateStyle?.background || '#ffffff',
                borderColor: templateStyle?.rowBorder || '#e5e7eb',
              }}
            >
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Month Headers */}
                  <div
                    className="flex border-b-2"
                    style={{
                      background: templateStyle?.monthHeaderBg || 'linear-gradient(to bottom, #f9fafb, #ffffff)',
                      borderColor: templateStyle?.gridLines || '#d1d5db',
                    }}
                  >
                    <div
                      className="w-64 flex-shrink-0 px-6 py-4 border-r-2"
                      style={{
                        borderColor: templateStyle?.gridLines || '#d1d5db',
                      }}
                    >
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ color: templateStyle?.monthHeaderText || '#374151' }}
                      >
                        Phase Name
                      </span>
                    </div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineMonths}, minmax(80px, 1fr))` }}>
                      {Array.from({ length: timelineMonths }, (_, i) => (
                        <div
                          key={i}
                          className="px-2 py-4 text-center border-r last:border-r-0"
                          style={{
                            borderColor: templateStyle?.gridLines || '#e5e7eb',
                          }}
                        >
                          <div
                            className="text-sm font-bold"
                            style={{ color: templateStyle?.monthHeaderText || '#1f2937' }}
                          >
                            {unitLabel} {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Rows */}
                  <div>
                    {project.ganttPhases.map((phase, index) => {
                      const color = getColorConfig(phase.color);
                      const barStyle = getBarStyle(color);

                      return (
                        <div
                          key={phase.id}
                          className="flex items-center border-b"
                          style={{
                            background: templateStyle?.rowBg || (index % 2 === 0 ? '#ffffff' : 'rgba(249, 250, 251, 0.5)'),
                            borderColor: templateStyle?.gridLines || '#e5e7eb',
                          }}
                        >
                          {/* Phase Info */}
                          <div
                            className="w-64 flex-shrink-0 px-6 py-5 border-r"
                            style={{
                              borderColor: templateStyle?.gridLines || '#e5e7eb',
                            }}
                          >
                            <div
                              className="font-semibold mb-1"
                              style={{ color: templateStyle?.headerText || '#111827' }}
                            >
                              {phase.name}
                            </div>
                            {phase.deliverables && (
                              <div
                                className="text-xs"
                                style={{ color: templateStyle?.monthHeaderText || '#4b5563' }}
                              >
                                {phase.deliverables}
                              </div>
                            )}
                          </div>

                          {/* Timeline Grid */}
                          <div className="flex-1 relative py-5">
                            <div className="grid h-12" style={{ gridTemplateColumns: `repeat(${timelineMonths}, minmax(80px, 1fr))` }}>
                              {Array.from({ length: timelineMonths }, (_, monthIndex) => (
                                <div
                                  key={monthIndex}
                                  className="border-r last:border-r-0"
                                  style={{
                                    borderColor: templateStyle?.gridLines || '#f3f4f6',
                                  }}
                                />
                              ))}
                            </div>

                            {/* Phase Bar */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2"
                              style={{
                                left: `calc(${((phase.startMonth - 1) / timelineMonths) * 100}% + 0.5rem)`,
                                width: `calc(${(phase.duration / timelineMonths) * 100}% - 1rem)`,
                              }}
                            >
                              <div
                                className={`h-10 bg-gradient-to-r ${barStyle.gradient} flex items-center justify-center px-4 ${barStyle.className}`}
                                style={barStyle.inlineStyles}
                              >
                                {showBarText && (
                                  <span className="text-sm font-semibold text-white truncate">
                                    {phase.barLabel || phase.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6">
              <div className="flex gap-6 flex-wrap">
                {project.ganttPhases.map((phase) => {
                  const color = getColorConfig(phase.color);
                  return (
                    <div key={phase.id} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded bg-gradient-to-r ${color.gradient}`}
                      />
                      <span className="text-sm text-gray-700">{phase.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Project Timeline</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {project.ganttPhases.length} phases • {timelineMonths} {unitLabelPlural.toLowerCase()} duration
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bar Text Toggle */}
              <button
                onClick={() => setShowBarText(!showBarText)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showBarText
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={showBarText ? 'Hide text in bars' : 'Show text in bars'}
              >
                <Type className="w-4 h-4" />
                <span className="font-medium text-sm">Bar Text</span>
              </button>

              {/* Unit Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimelineUnit('months')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timelineUnit === 'months'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Months
                </button>
                <button
                  onClick={() => setTimelineUnit('weeks')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timelineUnit === 'weeks'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weeks
                </button>
              </div>

              {/* Timeline Presets */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {timelinePresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setTimelineMonths(preset.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      timelineMonths === preset.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAIImportModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI Import</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <Code className="w-4 h-4" />
                <span className="font-medium">Import Code</span>
              </button>

              <button
                onClick={handleExportScreenshot}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
                title="Export for Screenshot"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>

              <button
                onClick={() => setShowTimelineSettings(!showTimelineSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Timeline Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Templates</span>
              </button>

              <button
                onClick={handleAddPhase}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Phase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom Timeline Settings */}
        {showTimelineSettings && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Custom Duration:</label>
              <input
                type="number"
                min="1"
                max="60"
                value={timelineMonths}
                onChange={(e) => setTimelineMonths(parseInt(e.target.value) || 12)}
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{unitLabelPlural.toLowerCase()} (max 60)</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full space-y-6">

          {/* Phase Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {project.ganttPhases.map((phase) => {
              const color = getColorConfig(phase.color);
              const isSelected = selectedPhase === phase.id;

              return (
                <div
                  key={phase.id}
                  onClick={() => setSelectedPhase(isSelected ? null : phase.id)}
                  className={`group relative bg-white rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? `${color.border} shadow-lg scale-[1.02]`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="p-4">
                    {/* Color Bar */}
                    <div
                      className={`h-1 w-12 rounded-full mb-3 bg-gradient-to-r ${color.gradient}`}
                    />

                    {/* Phase Name */}
                    <h3 className="font-semibold text-gray-900 mb-1 pr-8">{phase.name}</h3>

                    {/* Timeline Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {unitLabel.charAt(0)}{formatMonth(phase.startMonth)} - {unitLabel.charAt(0)}{formatMonth(phase.startMonth + phase.duration)} ({formatMonth(phase.duration)}{unitLabel.charAt(0).toLowerCase()})
                      </span>
                    </div>

                    {/* Deliverables Preview */}
                    {phase.deliverables && (
                      <p className="text-xs text-gray-600 line-clamp-2">{phase.deliverables}</p>
                    )}

                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhase(phase.id);
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Phase Card */}
            {project.ganttPhases.length < 12 && (
              <button
                onClick={handleAddPhase}
                className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center min-h-[140px]"
              >
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600 font-medium">Add Phase</span>
                </div>
              </button>
            )}
          </div>

          {/* Phase Details Panel */}
          {selectedPhase && (() => {
            const phase = project.ganttPhases.find(p => p.id === selectedPhase);
            if (!phase) return null;
            const color = getColorConfig(phase.color);

            return (
              <div className={`bg-white rounded-xl border-2 ${color.border} shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phase Name</label>
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                      className="w-full text-xl font-semibold text-gray-900 mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setSelectedPhase(null)}
                    className="text-gray-400 hover:text-gray-600 ml-4"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bar Label (text in box)</label>
                    <input
                      type="text"
                      value={phase.barLabel ?? ''}
                      onChange={(e) => updatePhase(phase.id, { barLabel: e.target.value })}
                      placeholder={phase.name}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</label>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {(Object.keys(colorConfig) as PhaseColor[]).slice(0, 6).map((colorName) => (
                        <button
                          key={colorName}
                          onClick={() => updatePhase(phase.id, { color: colorName })}
                          className={`w-8 h-8 rounded-lg transition-all ${
                            phase.color === colorName
                              ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: colorConfig[colorName].bg }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start {unitLabel}</label>
                    <input
                      type="number"
                      min="1"
                      max={timelineMonths}
                      step="0.1"
                      value={phase.startMonth}
                      onChange={(e) => updatePhase(phase.id, { startMonth: parseFloat(e.target.value) || 1 })}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration ({unitLabelPlural.toLowerCase()})</label>
                    <input
                      type="number"
                      min="0.1"
                      max={timelineMonths - phase.startMonth + 1}
                      step="0.1"
                      value={phase.duration}
                      onChange={(e) => updatePhase(phase.id, { duration: parseFloat(e.target.value) || 1 })}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deliverables</label>
                  <textarea
                    value={phase.deliverables}
                    onChange={(e) => updatePhase(phase.id, { deliverables: e.target.value })}
                    placeholder="List key deliverables and milestones..."
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Monthly Breakdown */}
                {phase.months && phase.months.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      Monthly Breakdown
                    </h3>
                    <div className="space-y-4">
                      {phase.months.map((monthData, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${color.gradient}`}>
                              Month {monthData.month}
                            </div>
                            <h4 className="font-semibold text-gray-900">{monthData.title}</h4>
                          </div>

                          {monthData.highlights && monthData.highlights.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Highlights</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {monthData.highlights.map((highlight, hIdx) => (
                                  <li key={hIdx} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {monthData.deliverables && monthData.deliverables.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Deliverables</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {monthData.deliverables.map((deliverable, dIdx) => (
                                  <li key={dIdx} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {monthData.milestones && monthData.milestones.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Milestones</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {monthData.milestones.map((milestone, mIdx) => (
                                  <li key={mIdx} className="flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">★</span>
                                    <span className="font-medium">{milestone}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Professional Gantt Timeline */}
          {project.ganttPhases.length > 0 && (
            <div
              className="rounded-xl shadow-sm border overflow-hidden"
              style={{
                background: templateStyle?.background || '#ffffff',
                borderColor: templateStyle?.rowBorder || '#e5e7eb',
              }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  background: templateStyle?.headerBg || '#f9fafb',
                  borderColor: templateStyle?.rowBorder || '#e5e7eb',
                  color: templateStyle?.headerText || '#374151',
                }}
              >
                {editingTimelineHeading ? (
                  <input
                    type="text"
                    value={timelineHeading}
                    onChange={(e) => setTimelineHeading(e.target.value)}
                    onBlur={() => setEditingTimelineHeading(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingTimelineHeading(false);
                      if (e.key === 'Escape') setEditingTimelineHeading(false);
                    }}
                    className="text-sm font-semibold uppercase tracking-wide bg-white border-2 border-blue-400 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: templateStyle?.headerText || '#374151' }}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-sm font-semibold uppercase tracking-wide cursor-text hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                    onClick={() => setEditingTimelineHeading(true)}
                    title="Click to edit heading"
                  >
                    {timelineHeading}
                  </h2>
                )}
              </div>

              <div
                ref={timelineRef}
                className="overflow-x-auto"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="min-w-max">
                  {/* Month Headers */}
                  <div
                    className="flex border-b sticky top-0 z-10"
                    style={{
                      background: templateStyle?.monthHeaderBg || 'linear-gradient(to bottom, #f9fafb, #ffffff)',
                      borderColor: templateStyle?.gridLines || '#e5e7eb',
                    }}
                  >
                    <div
                      className="w-64 flex-shrink-0 px-6 py-3 border-r"
                      style={{
                        borderColor: templateStyle?.gridLines || '#e5e7eb',
                      }}
                    >
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: templateStyle?.monthHeaderText || '#6b7280' }}
                      >
                        Phase
                      </span>
                    </div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineMonths}, minmax(80px, 1fr))` }}>
                      {Array.from({ length: timelineMonths }, (_, i) => (
                        <div
                          key={i}
                          className="px-2 py-3 text-center border-r last:border-r-0"
                          style={{
                            borderColor: templateStyle?.gridLines || '#f3f4f6',
                          }}
                        >
                          <div
                            className="text-xs font-semibold"
                            style={{ color: templateStyle?.monthHeaderText || '#374151' }}
                          >
                            {unitLabel} {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Rows */}
                  <div>
                    {project.ganttPhases.map((phase, index) => {
                      const color = getColorConfig(phase.color);
                      const isSelected = selectedPhase === phase.id;
                      const barStyle = getBarStyle(color);

                      return (
                        <div
                          key={phase.id}
                          className="flex items-center border-b hover:opacity-90 transition-opacity"
                          style={{
                            background: templateStyle?.rowBg || (index % 2 === 0 ? '#ffffff' : 'rgba(249, 250, 251, 0.5)'),
                            borderColor: templateStyle?.gridLines || '#f3f4f6',
                          }}
                        >
                          {/* Phase Info */}
                          <div
                            className="w-64 flex-shrink-0 px-6 py-4 border-r"
                            style={{
                              borderColor: templateStyle?.gridLines || '#e5e7eb',
                            }}
                          >
                            {/* Editable Phase Name */}
                            {editingPhaseName === phase.id ? (
                              <input
                                type="text"
                                value={phase.name}
                                onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                                onBlur={() => setEditingPhaseName(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingPhaseName(null);
                                  if (e.key === 'Escape') setEditingPhaseName(null);
                                }}
                                className="w-full font-medium text-sm mb-1 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ color: templateStyle?.headerText || '#111827' }}
                                autoFocus
                              />
                            ) : (
                              <div
                                className="font-medium text-sm mb-1 cursor-text hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                style={{ color: templateStyle?.headerText || '#111827' }}
                                onClick={() => setEditingPhaseName(phase.id)}
                                title="Click to edit"
                              >
                                {phase.name}
                              </div>
                            )}

                            {/* Editable Deliverables */}
                            {editingPhaseDeliverables === phase.id ? (
                              <input
                                type="text"
                                value={phase.deliverables}
                                onChange={(e) => updatePhase(phase.id, { deliverables: e.target.value })}
                                onBlur={() => setEditingPhaseDeliverables(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingPhaseDeliverables(null);
                                  if (e.key === 'Escape') setEditingPhaseDeliverables(null);
                                }}
                                placeholder="Add deliverables..."
                                className="w-full text-xs px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ color: templateStyle?.monthHeaderText || '#6b7280' }}
                                autoFocus
                              />
                            ) : (
                              <div
                                className="text-xs line-clamp-1 cursor-text hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                style={{ color: templateStyle?.monthHeaderText || '#6b7280' }}
                                onClick={() => setEditingPhaseDeliverables(phase.id)}
                                title="Click to edit deliverables"
                              >
                                {phase.deliverables || 'Add deliverables...'}
                              </div>
                            )}
                          </div>

                          {/* Timeline Grid */}
                          <div className="flex-1 relative py-4">
                            <div className="grid h-12" style={{ gridTemplateColumns: `repeat(${timelineMonths}, minmax(80px, 1fr))` }}>
                              {Array.from({ length: timelineMonths }, (_, monthIndex) => (
                                <div
                                  key={monthIndex}
                                  className="border-r last:border-r-0"
                                  style={{
                                    borderColor: templateStyle?.gridLines || '#f3f4f6',
                                  }}
                                />
                              ))}
                            </div>

                            {/* Phase Bar with Smooth Drag & Drop */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 group"
                              style={{
                                left: `calc(${((phase.startMonth - 1) / timelineMonths) * 100}% + 0.5rem)`,
                                width: `calc(${(phase.duration / timelineMonths) * 100}% - 1rem)`,
                                transition: draggingPhase === phase.id || resizingPhase?.id === phase.id ? 'none' : 'all 0.15s ease-out',
                              }}
                              onMouseDown={(e) => {
                                // Only start dragging if not editing bar label
                                if (editingBarLabel !== phase.id) {
                                  handleBarMouseDown(e, phase.id, 'move');
                                }
                              }}
                            >
                              <div
                                className={`h-10 transition-shadow bg-gradient-to-r ${barStyle.gradient} flex items-center justify-between px-4 relative overflow-visible ${barStyle.className}`}
                                style={barStyle.inlineStyles}
                              >
                                {/* Resize Handle - Start */}
                                <div
                                  className="absolute left-0 top-0 h-full w-3 cursor-ew-resize hover:bg-white/30 transition-colors z-10"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleBarMouseDown(e, phase.id, 'resize-start');
                                  }}
                                >
                                  <GripHorizontal className="w-3 h-3 text-white/70 absolute top-1/2 -translate-y-1/2 left-0" />
                                </div>

                                {/* Bar Label - Independent text inside the bar */}
                                <div className="flex-1 px-4 flex items-center justify-center">
                                  {showBarText && (
                                    <>
                                      {editingBarLabel === phase.id ? (
                                        <input
                                          type="text"
                                          value={phase.barLabel ?? phase.name}
                                          onChange={(e) => updatePhase(phase.id, { barLabel: e.target.value })}
                                          onBlur={() => setEditingBarLabel(null)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') setEditingBarLabel(null);
                                            if (e.key === 'Escape') {
                                              setEditingBarLabel(null);
                                              e.stopPropagation();
                                            }
                                            e.stopPropagation();
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          onMouseDown={(e) => e.stopPropagation()}
                                          className="w-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold text-center px-2 py-1 rounded border-2 border-white/50 focus:outline-none focus:border-white focus:bg-white/30"
                                          autoFocus
                                          placeholder="Bar text..."
                                        />
                                      ) : (
                                        <span
                                          className="text-sm font-semibold text-white truncate cursor-text hover:underline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBarLabel(phase.id);
                                          }}
                                          title="Click to edit bar text"
                                        >
                                          {phase.barLabel || phase.name}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Resize Handle - End */}
                                <div
                                  className="absolute right-0 top-0 h-full w-3 cursor-ew-resize hover:bg-white/30 transition-colors z-10"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleBarMouseDown(e, phase.id, 'resize-end');
                                  }}
                                >
                                  <GripHorizontal className="w-3 h-3 text-white/70 absolute top-1/2 -translate-y-1/2 right-0" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Helper */}
              <div
                className="px-6 py-3 border-t"
                style={{
                  background: templateStyle?.headerBg || '#f9fafb',
                  borderColor: templateStyle?.rowBorder || '#e5e7eb',
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: templateStyle?.monthHeaderText || '#6b7280' }}
                >
                  💡 <span className="font-medium">Toggle "Bar Text"</span> button to show/hide text in boxes •
                  <span className="font-medium"> Click text inside bars</span> to edit (when visible) •
                  <span className="font-medium"> Drag bars</span> to move •
                  <span className="font-medium"> Drag edges</span> to resize
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {project.ganttPhases.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No phases yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by adding your first project phase. You can customize duration, deliverables, and timeline.
              </p>
              <button
                onClick={handleAddPhase}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow font-medium"
              >
                Create First Phase
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template Selector Modal */}
      <GanttTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Code Import Modal */}
      <CodeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="gantt"
      />

      {/* AI Import Modal */}
      <AIImportModal
        isOpen={showAIImportModal}
        onClose={() => setShowAIImportModal(false)}
        onImport={handleImport}
        type="gantt"
      />
    </div>
  );
}
