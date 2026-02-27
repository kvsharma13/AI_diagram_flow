'use client';

import { useState } from 'react';
import {
  Calendar,
  Users,
  Network,
  GitBranch,
  FileText,
  ChevronDown,
  Search,
  Bell,
  Settings,
  User,
  Plus,
  Folder,
  Menu,
  X,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { EditorType } from '@/types/project';

export default function ModernNavbar() {
  const { currentEditor, setCurrentEditor } = useProjectStore();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('My Workspace');

  const menuItems: { id: EditorType; label: string; icon: React.ReactNode }[] = [
    { id: 'architecture', label: 'Architecture', icon: <Network className="w-4 h-4" /> },
    { id: 'flowchart', label: 'Flowchart', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'gantt', label: 'Gantt Chart', icon: <Calendar className="w-4 h-4" /> },
    { id: 'raci', label: 'RACI Matrix', icon: <Users className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
  ];

  const workspaces = [
    { id: 1, name: 'My Workspace', projects: 12 },
    { id: 2, name: 'Team Projects', projects: 8 },
    { id: 3, name: 'Client Work', projects: 5 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                DiagramPro
              </span>
            </div>

            {/* Workspace Selector */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all group"
              >
                <Folder className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{currentWorkspace}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform" />
              </button>

              {workspaceOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setWorkspaceOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
                        Workspaces
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => {
                            setCurrentWorkspace(workspace.name);
                            setWorkspaceOpen(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <Folder className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">{workspace.name}</p>
                              <p className="text-xs text-gray-500">{workspace.projects} projects</p>
                            </div>
                          </div>
                          {currentWorkspace === workspace.name && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Workspace
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Editor Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentEditor(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentEditor === item.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 hidden lg:inline">Search...</span>
              <kbd className="hidden lg:inline px-2 py-0.5 text-xs bg-white rounded border border-gray-300 text-gray-500">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all">
              <User className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white hidden md:inline">Profile</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentEditor(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentEditor === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
