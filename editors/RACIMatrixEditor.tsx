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
    if (!value) return 'bg-gray-100 text-gray-400 hover:bg-gray-200';

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
      default: return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
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

            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left border-b-2 border-r-2 border-gray-300 font-bold text-gray-800 uppercase tracking-wide">
                      Task / Stakeholder
                    </th>
                    {stakeholders.map((sh) => (
                      <th key={sh.id} className="px-4 py-4 text-center border-b-2 border-r-2 border-gray-300 last:border-r-0">
                        <div className="font-bold text-gray-900">{sh.name}</div>
                        {sh.role && <div className="text-xs text-gray-600 font-normal mt-1">{sh.role}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={task.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 border-b border-r-2 border-gray-300">
                        <div className="font-semibold text-gray-900">{task.taskName}</div>
                        {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                      </td>
                      {stakeholders.map((sh) => {
                        const value = getRACIValue(task.id, sh.id);
                        return (
                          <td key={sh.id} className="px-4 py-4 text-center border-b border-r border-gray-300 last:border-r-0">
                            {value && (
                              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${getRACIColor(value)}`}>
                                {value}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Responsible (R)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-700">Accountable (A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Consulted (C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-purple-500"></div>
                  <span className="text-sm text-gray-700">Informed (I)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">RACI Matrix</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {tasks.length} tasks • {stakeholders.length} stakeholders
              </p>
            </div>
            <div className="flex items-center gap-3">
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
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 How to use:</span> Click individual R/A/C/I buttons to toggle multiple values (dual marks like R/A, C/I).
              Click the cell background to cycle single values. Double-click headers to edit names.
            </p>
          </div>

          {/* RACI Matrix Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-b from-gray-50 to-white border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left border-r-2 border-gray-300 min-w-[250px]">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Task / Stakeholder
                      </span>
                    </th>
                    {stakeholders.map((sh) => (
                      <th key={sh.id} className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0 min-w-[120px] group relative">
                        {editingStakeholder === sh.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={sh.name}
                              onChange={(e) => updateStakeholder(sh.id, { name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onBlur={() => setEditingStakeholder(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingStakeholder(null)}
                            />
                            <input
                              type="text"
                              value={sh.role || ''}
                              onChange={(e) => updateStakeholder(sh.id, { role: e.target.value })}
                              placeholder="Role"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => setEditingStakeholder(sh.id)}
                            className="cursor-pointer"
                          >
                            <div className="font-semibold text-gray-900">{sh.name}</div>
                            {sh.role && <div className="text-xs text-gray-600 mt-1">{sh.role}</div>}
                          </div>
                        )}
                        <button
                          onClick={() => deleteStakeholder(sh.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={task.id} className={`border-b border-gray-200 group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 border-r-2 border-gray-200 relative">
                        {editingTask === task.id ? (
                          <div className="space-y-2 pr-8">
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) => updateTask(task.id, { taskName: e.target.value })}
                              className="w-full px-2 py-1 text-sm font-semibold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onBlur={() => setEditingTask(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingTask(null)}
                            />
                            <input
                              type="text"
                              value={task.description || ''}
                              onChange={(e) => updateTask(task.id, { description: e.target.value })}
                              placeholder="Description"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => setEditingTask(task.id)}
                            className="cursor-pointer pr-8"
                          >
                            <div className="font-medium text-gray-900">{task.taskName}</div>
                            {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                          </div>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                      {stakeholders.map((sh) => {
                        const value = getRACIValue(task.id, sh.id);
                        const letters = value ? value.split('/') : [];

                        return (
                          <td key={sh.id} className="px-4 py-4 text-center border-r border-gray-100 last:border-r-0">
                            <div className="flex flex-col items-center gap-2">
                              {/* Main cell display */}
                              <div
                                onClick={() => handleCellClick(task.id, sh.id)}
                                className={`w-12 h-12 rounded-lg font-bold text-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer flex items-center justify-center ${getRACIColor(value)}`}
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
                                        isActive
                                          ? colorMap[letter]
                                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                      }`}
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
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">RACI Legend</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <div className="font-medium text-gray-900">Responsible</div>
                  <div className="text-xs text-gray-600">Does the work</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="font-medium text-gray-900">Accountable</div>
                  <div className="text-xs text-gray-600">Ultimately answerable</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold">C</div>
                <div>
                  <div className="font-medium text-gray-900">Consulted</div>
                  <div className="text-xs text-gray-600">Provides input</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">I</div>
                <div>
                  <div className="font-medium text-gray-900">Informed</div>
                  <div className="text-xs text-gray-600">Kept up-to-date</div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {tasks.length === 0 && stakeholders.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No RACI Matrix yet</h3>
              <p className="text-gray-600 mb-6">
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
