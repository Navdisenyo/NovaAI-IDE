import React from 'react';
import {
  Mic,
  Search,
  Image as ImageIcon,
  Youtube,
  FileText,
  LayoutTemplate,
  CheckSquare,
  Code2,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, SystemState } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  systemState: SystemState;
  wakeWordActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  systemState,
  wakeWordActive,
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'voice', label: 'Voice Assistant', icon: Mic, badge: systemState === 'speaking' ? 'Live' : undefined },
    { id: 'research', label: 'Web Research', icon: Search },
    { id: 'image_studio', label: 'Image Studio', icon: ImageIcon },
    { id: 'youtube', label: 'YouTube Player', icon: Youtube },
    { id: 'files', label: 'File Analyzer', icon: FileText },
    { id: 'website_builder', label: 'Website Builder', icon: LayoutTemplate },
    { id: 'productivity', label: 'Tasks & Notes', icon: CheckSquare },
    { id: 'business_coding', label: 'Business & Code', icon: Code2 },
    { id: 'privacy', label: 'Privacy Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-cyan-950/40 bg-[#060913]/95 backdrop-blur-2xl transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Pulsing Core Mini Logo */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-300 ring-2 ring-[#060913]" />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent font-mono">
                  NOVA AI
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono tracking-tight uppercase">
                  Personal Voice Agent
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 text-left truncate tracking-wide">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-white/5">
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                wakeWordActive ? 'bg-cyan-400' : 'bg-slate-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                wakeWordActive ? 'bg-cyan-400' : 'bg-slate-500'
              }`}
            />
          </span>

          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-mono text-slate-300">
                {wakeWordActive ? 'Wake Word: Ready' : 'Wake Word: Off'}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Local IndexedDB Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
