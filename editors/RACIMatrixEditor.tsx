'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { Plus, Trash2, Download, X, Edit2, Check, Code, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { RACIValue } from '@/types/project';
import CodeImportModal from '@/components/CodeImportModal';
import AIImportModal from '@/components/AIImportModal';

export default function RACIMatrixEditor() {
  const {
    project,
    addTask,
    updateTask,
    deleteTask,
    addStakeholder,
    updateStakeholder,
    deleteStakeholder,
    setRACIValue,
    importRACIFromCode
  } = useProjectStore();

  const [exportMode, setExportMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAIImportModal, setShowAIImportModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  if (!project) return null;

  const tasks = project.raciTasks || [];
  const stakeholders = project.raciStakeholders || [];
  const assignments = project.raciAssignments || [];

  const getRACIValue = (taskId: string, stakeholderId: string): RACIValue => {
    const assignment = assignments.find(
      (a) => a.taskId === taskId && a.stakeholderId === stakeholderId
    );
    return assignment?.value || null;
  };

  const handleCellClick = (taskId: string, stakeholderId: string, letter?: 'R' | 'A' | 'C' | 'I') => {
    const currentValue = getRACIValue(taskId, stakeholderId);

    if (letter) {
      // Toggle specific letter in dual/multi mode
      const currentLetters = currentValue ? currentValue.split('/') : [];

      if (currentLetters.includes(letter)) {
        // Remove the letter
        const newLetters = currentLetters.filter(l => l !== letter);
        const newValue = newLetters.length > 0 ? newLetters.join('/') : null;
        setRACIValue(taskId, stakeholderId, newValue);
      } else {
        // Add the letter (maintain RACI order: R, A, C, I)
        const allLetters = ['R', 'A', 'C', 'I'];
        const newLetters = [...currentLetters, letter].sort((a, b) =>
          allLetters.indexOf(a) - allLetters.indexOf(b)
        );
        setRACIValue(taskId, stakeholderId, newLetters.join('/'));
      }
    } else {
      // Simple cycle mode (for backward compatibility)
      const values: RACIValue[] = [null, 'R', 'A', 'C', 'I'];
      const currentIndex = values.indexOf(currentValue);
      const nextValue = values[(currentIndex + 1) % values.length];
      setRACIValue(taskId, stakeholderId, nextValue);
    }
  };

  const getRACIColor = (value: RACIValue) => {
    if (!value) return 'text-[#52525B] hover:bg-[rgba(255,255,255,0.06)]';

    // For dual/multi values, use gradient
    const letters = value.split('/');
    if (letters.length > 1) {
      return 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 text-white';
    }

    switch (value) {
      case 'R': return 'bg-blue-500 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'I': return 'bg-purple-500 text-white';
      default: return 'text-[#52525B] hover:bg-[rgba(255,255,255,0.06)]';
    }
  };

  const handleImport = (data: any) => {
    importRACIFromCode(data);
    setShowImportModal(false);
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) {
      alert('Export area not found. Please try again.');
      return;
    }

    try {
      const htmlToImage = await import('html-to-image');

      console.log('Starting RACI export...');

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

      console.log('Export dimensions:', { width, height });

      // Capture the image with landscape dimensions
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: width,
        height: height,
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
      link.download = `${project.name}-raci-matrix.png`;
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

  // Export View
  if (exportMode) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export RACI Matrix</h2>
              <p className="text-sm text-gray-500 mt-0.5">Screenshot-ready view for documents</p>
            </div>
            <div className="flex gap-2">
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

          <div ref={exportRef} className="p-8 bg-white" style={{ minWidth: '1200px', maxWidth: '100%' }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">RACI Matrix</h1>
              <p className="text-gray-600">
                Responsibility Assignment Matrix • {tasks.length} Tasks • {stakeholders.length} Stakeholders
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900 to-blue-800">
                    <th className="px-4 py-3 text-left border border-gray-400 font-bold text-white text-sm uppercase tracking-wide">
                      Task / Activity
                    </th>
                    {stakeholders.map((sh) => (
                      <th key={sh.id} className="px-3 py-3 text-center border border-gray-400">
                        <div className="font-bold text-white text-sm">{sh.name}</div>
                        {sh.role && <div className="text-xs text-blue-200 font-normal mt-0.5">{sh.role}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={task.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2.5 border border-gray-300">
                        <div className="font-semibold text-gray-900 text-sm">{task.taskName}</div>
                        {task.description && <div className="text-xs text-gray-600 mt-0.5">{task.description}</div>}
                      </td>
                      {stakeholders.map((sh) => {
                        const value = getRACIValue(task.id, sh.id);
                        const getTextColor = (val: RACIValue) => {
                          if (!val) return '';
                          const letters = val.split('/');
                          if (letters.includes('R')) return 'text-blue-600';
                          if (letters.includes('A')) return 'text-green-600';
                          if (letters.includes('C')) return 'text-orange-600';
                          if (letters.includes('I')) return 'text-purple-600';
                          return 'text-gray-900';
                        };
                        return (
                          <td key={sh.id} className="px-3 py-2.5 text-center border border-gray-300">
                            {value && (
                              <span className={`font-bold text-base ${getTextColor(value)}`}>
                                {value}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 text-lg">R</span>
                  <span className="text-gray-700">= Responsible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 text-lg">A</span>
                  <span className="text-gray-700">= Accountable</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-600 text-lg">C</span>
                  <span className="text-gray-700">= Consulted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600 text-lg">I</span>
                  <span className="text-gray-700">= Informed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="raci-export-area" className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>RACI Matrix</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {tasks.length} tasks • {stakeholders.length} stakeholders
              </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 flex-wrap lg:flex-nowrap">
              <button
                onClick={() => setShowAIImportModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI Import</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Code className="w-4 h-4" />
                <span className="font-medium">Import Code</span>
              </button>
              <button
                onClick={() => setExportMode(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>
              <button
                onClick={() => addStakeholder({ name: 'New Stakeholder', role: '' })}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Stakeholder</span>
              </button>
              <button
                onClick={() => addTask({ taskName: 'New Task', description: '' })}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-full">
          {/* Instructions */}
          <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>💡 How to use:</span> Click individual R/A/C/I buttons to toggle multiple values (dual marks like R/A, C/I).
              Click the cell background to cycle single values. Double-click headers to edit names.
            </p>
          </div>

          {/* RACI Matrix Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '2px solid var(--border)' }}>
                    <th className="px-6 py-4 text-left min-w-[250px]" style={{ borderRight: '2px solid var(--border)' }}>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Task / Stakeholder
                      </span>
                    </th>
                    {stakeholders.map((sh) => (
                      <th key={sh.id} className="px-4 py-3 text-center min-w-[120px] group relative" style={{ borderRight: '1px solid var(--border)' }}>
                        {editingStakeholder === sh.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={sh.name}
                              onChange={(e) => updateStakeholder(sh.id, { name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                              autoFocus
                              onBlur={() => setEditingStakeholder(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingStakeholder(null)}
                            />
                            <input
                              type="text"
                              value={sh.role || ''}
                              onChange={(e) => updateStakeholder(sh.id, { role: e.target.value })}
                              placeholder="Role"
                              className="w-full px-2 py-1 text-xs rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            />
                          </div>
                        ) : (
                          <div onDoubleClick={() => setEditingStakeholder(sh.id)} className="cursor-pointer">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sh.name}</div>
                            {sh.role && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sh.role}</div>}
                          </div>
                        )}
                        <button
                          onClick={() => deleteStakeholder(sh.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr
                      key={task.id}
                      className="group"
                      style={{
                        background: idx % 2 === 0 ? 'var(--surface-1)' : 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--divider)',
                      }}
                    >
                      <td className="px-6 py-4 relative" style={{ borderRight: '2px solid var(--border)' }}>
                        {editingTask === task.id ? (
                          <div className="space-y-2 pr-8">
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) => updateTask(task.id, { taskName: e.target.value })}
                              className="w-full px-2 py-1 text-sm font-semibold border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                              autoFocus
                              onBlur={() => setEditingTask(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingTask(null)}
                            />
                            <input
                              type="text"
                              value={task.description || ''}
                              onChange={(e) => updateTask(task.id, { description: e.target.value })}
                              placeholder="Description"
                              className="w-full px-2 py-1 text-xs rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            />
                          </div>
                        ) : (
                          <div onDoubleClick={() => setEditingTask(task.id)} className="cursor-pointer pr-8">
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{task.taskName}</div>
                            {task.description && <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{task.description}</div>}
                          </div>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                      {stakeholders.map((sh) => {
                        const value = getRACIValue(task.id, sh.id);
                        const letters = value ? value.split('/') : [];

                        return (
                          <td key={sh.id} className="px-4 py-4 text-center" style={{ borderRight: '1px solid var(--divider)' }}>
                            <div className="flex flex-col items-center gap-2">
                              {/* Main cell display */}
                              <div
                                onClick={() => handleCellClick(task.id, sh.id)}
                                className={`w-16 h-10 rounded-lg font-bold text-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer flex items-center justify-center ${getRACIColor(value)}`}
                                style={!value ? { background: 'var(--surface-3)' } : {}}
                              >
                                {value || ''}
                              </div>

                              {/* Individual letter toggles */}
                              <div className="flex gap-1">
                                {(['R', 'A', 'C', 'I'] as const).map((letter) => {
                                  const isActive = letters.includes(letter);
                                  const colorMap = {
                                    R: 'bg-blue-500 text-white',
                                    A: 'bg-green-500 text-white',
                                    C: 'bg-yellow-500 text-white',
                                    I: 'bg-purple-500 text-white',
                                  };

                                  return (
                                    <button
                                      key={letter}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(task.id, sh.id, letter);
                                      }}
                                      className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                                        isActive ? colorMap[letter] : 'text-[#52525B] hover:text-white'
                                      }`}
                                      style={!isActive ? { background: 'var(--surface-hover)' } : {}}
                                    >
                                      {letter}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>RACI Legend</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Responsible</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Does the work</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Accountable</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ultimately answerable</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold">C</div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Consulted</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Provides input</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">I</div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Informed</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Kept up-to-date</div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {tasks.length === 0 && stakeholders.length === 0 && (
            <div className="rounded-xl border-2 border-dashed p-16 text-center mt-6" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No RACI Matrix yet</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Start by adding stakeholders and tasks to create your responsibility matrix.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => addStakeholder({ name: 'New Stakeholder', role: '' })}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Add Stakeholder
                </button>
                <button
                  onClick={() => addTask({ taskName: 'New Task', description: '' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Import Modal */}
      <CodeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="raci"
      />

      {/* AI Import Modal */}
      <AIImportModal
        isOpen={showAIImportModal}
        onClose={() => setShowAIImportModal(false)}
        onImport={handleImport}
        type="raci"
      />
    </div>
  );
}
