'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { FileText, Briefcase } from 'lucide-react';

export default function TemplateLoader() {
  const { loadTemplate } = useProjectStore();

  const templates = [
    {
      id: 'sow',
      name: 'SOW Template',
      description:
        'Statement of Work template with 4 phases, 6 RACI tasks, 5 architecture components, and a complete authentication flowchart',
      icon: <FileText className="w-12 h-12 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'proposal',
      name: 'Proposal Template',
      description:
        'Project Proposal template with 3 phases, 4 RACI tasks, 3 architecture components, and a simple workflow',
      icon: <Briefcase className="w-12 h-12 text-green-600" />,
      color: 'bg-green-50 border-green-200',
    },
  ];

  const handleLoadTemplate = (templateId: string) => {
    if (
      confirm(
        'Loading a template will replace all current data. Are you sure you want to continue?'
      )
    ) {
      loadTemplate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Templates</h2>
        <p className="text-gray-600">
          Start quickly with pre-configured templates containing sample data for all
          editors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`${template.color} border-2 rounded-lg p-6 transition-all hover:shadow-lg`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{template.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-gray-700 text-sm mb-4">{template.description}</p>
                <button
                  onClick={() => handleLoadTemplate(template.id)}
                  className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Load Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Note</h4>
        <p className="text-sm text-yellow-800">
          Loading a template will replace all current project data. Make sure to save
          your work before loading a new template. Each template includes sample data
          across all editors (Gantt, RACI, Architecture, and Flowchart).
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Template Contents</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">SOW Template</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• 4 project phases spanning 12 months</li>
              <li>• 6 RACI tasks covering project lifecycle</li>
              <li>• 5 architecture components (Frontend, Backend, Database, Services)</li>
              <li>• 4 flowchart steps showing authentication flow</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Proposal Template</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• 3 proposal phases (Research, Development, Review)</li>
              <li>• 4 RACI tasks for proposal creation</li>
              <li>• 3 architecture components (Web, Server, Storage)</li>
              <li>• 3 flowchart steps showing proposal workflow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
