'use client';

import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard },
    { name: 'Projects',      href: '/dashboard/projects',     icon: FolderKanban },
    { name: 'Subscription',  href: '/dashboard/subscription', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 flex flex-col z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-60'
        }`}
        style={{
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-5 py-5 transition-colors hover:bg-white/[0.03] ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          style={{ borderBottom: '1px solid var(--divider)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ProjectFlow <span style={{ color: 'var(--accent-hover)' }}>AI</span>
            </span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={sidebarCollapsed ? item.name : ''}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                style={
                  isActive
                    ? {
                        background: 'var(--accent-soft-bg)',
                        border: '1px solid var(--accent-soft-bd)',
                        color: '#fff',
                      }
                    : {
                        color: 'var(--text-secondary)',
                        border: '1px solid transparent',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 pb-3" style={{ borderTop: '1px solid var(--divider)', paddingTop: '12px' }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div
          className={`p-4 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <UserButton afterSignOutUrl="/" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`h-screen overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-60'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
