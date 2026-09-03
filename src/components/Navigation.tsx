import React from 'react';
import {
  LayoutDashboard,
  Building,
  GraduationCap,
  Layers,
  Users,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Settings,
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType =
  | 'dashboard'
  | 'institution'
  | 'teachers'
  | 'classes'
  | 'students'
  | 'subjects'
  | 'sheets'
  | 'reports'
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentRole: UserRole;
  studentsCount?: number;
  sheetsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  studentsCount = 0,
  sheetsCount = 0,
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      roles: ['admin', 'examiner', 'data_entry'],
    },
    {
      id: 'institution',
      label: 'إدارة المؤسسة',
      icon: Building,
      roles: ['admin'],
    },
    {
      id: 'teachers',
      label: 'الأساتذة والمهام',
      icon: GraduationCap,
      roles: ['admin'],
    },
    {
      id: 'classes',
      label: 'المستويات والأفواج',
      icon: Layers,
      roles: ['admin'],
    },
    {
      id: 'students',
      label: 'التلاميذ وتقسيم الفئات',
      icon: Users,
      roles: ['admin', 'data_entry'],
      badge: studentsCount > 0 ? `${studentsCount}` : undefined,
    },
    {
      id: 'subjects',
      label: 'المواد ومعايير الرائز',
      icon: BookOpen,
      roles: ['admin'],
    },
    {
      id: 'sheets',
      label: 'أوراق التمرير والطباعة',
      icon: FileSpreadsheet,
      roles: ['admin', 'examiner', 'data_entry'],
      badge: sheetsCount > 0 ? `${sheetsCount} ورقة` : undefined,
    },
    {
      id: 'reports',
      label: 'التقارير والإحصائيات',
      icon: BarChart3,
      roles: ['admin', 'examiner', 'data_entry'],
    },
    {
      id: 'settings',
      label: 'الإعدادات والحفظ',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(currentRole));

  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs no-print overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 space-x-reverse py-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-900 text-emerald-100'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
