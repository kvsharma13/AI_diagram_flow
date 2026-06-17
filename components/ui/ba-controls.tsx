'use client';

import { CSSProperties, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Sparkles, X, ChevronDown, type LucideIcon } from 'lucide-react';

/* Dark-themed form controls + modal, matching the app's CSS-var system.
   (The base UI kit only ships Button/Card/Badge/Skeleton.) */

const controlStyle: CSSProperties = {
  background: 'var(--surface-3)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

export function TextInput({ className = '', style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
      style={{ ...controlStyle, ...style }}
    />
  );
}

export function TextArea({ className = '', style, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y ${className}`}
      style={{ ...controlStyle, ...style }}
    />
  );
}

export function Select({ className = '', style, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer ${className}`}
        style={{ ...controlStyle, ...style }}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </label>
  );
}

/* AI actions get a distinct gradient + Sparkles, matching the app's existing
   AI-button convention so users recognize an AI action. */
export function AIButton({
  onClick, children, disabled, className = '', title,
}: { onClick?: () => void; children: ReactNode; disabled?: boolean; className?: string; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick, children, disabled, icon: Icon, className = '',
}: { onClick?: () => void; children: ReactNode; disabled?: boolean; icon?: LucideIcon; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40 ${className}`}
      style={{ background: 'var(--accent)' }}
      onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function ToolbarButton({
  onClick, children, disabled, icon: Icon, title,
}: { onClick?: () => void; children?: ReactNode; disabled?: boolean; icon?: LucideIcon; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
      style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function Modal({
  isOpen, onClose, title, icon, children, footer, maxWidth = 'max-w-2xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl flex flex-col max-h-[88vh] overflow-hidden`}
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.7)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {icon}
            <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-3)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-auto p-5 flex-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
