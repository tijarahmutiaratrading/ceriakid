import React from 'react';
import { LayoutDashboard, Users, Settings, Gamepad2, Home, Palette, BookOpen, UserCircle, BarChart3, UserPlus, Trophy } from 'lucide-react';
import ReusableSidebar from '@/components/ReusableSidebar';

const ADMIN_MENU = [
  { key: 'dashboard', label: 'Dashboard', sub: 'Order & Analytics', icon: LayoutDashboard, tab: 'analytics' },
  { key: 'customers', label: 'Pelanggan', sub: 'Customer Database', icon: Users, tab: 'customers' },
  { key: 'gamemanager', label: 'Game Manager', sub: 'Generator & QC', icon: Gamepad2, tab: 'gamemanager' },
  { key: 'settings', label: 'Settings', sub: 'Payment & Pixel', icon: Settings, tab: 'settings' },
];

const USER_GROUPS = [
  { key: 'user_dashboard', label: 'Dashboard Pengguna', icon: Home, path: '/dashboard' },
  {
    key: 'keluarga', label: 'Keluarga', icon: Users,
    submenu: [
      { path: '/children-profiles', label: 'Profil Anak', icon: UserCircle },
      { path: '/parent-dashboard', label: 'Prestasi Anak', icon: BarChart3 },
      { path: '/settings', label: 'Tetapan', icon: Settings },
    ],
  },
  {
    key: 'aktiviti', label: 'Aktiviti', icon: Palette,
    submenu: [
      { path: '/drawing', label: 'Studio Lukisan', icon: Palette },
      { path: '/story-kid', label: 'Story Kid', icon: BookOpen },
    ],
  },
  {
    key: 'sosial', label: 'Sosial', icon: UserPlus,
    submenu: [
      { path: '/friends', label: 'Kawan', icon: UserPlus },
      { path: '/challenges', label: 'Cabaran', icon: Trophy },
    ],
  },
];

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  return (
    <ReusableSidebar
      menuItems={ADMIN_MENU}
      userGroups={USER_GROUPS}
      logoLabel="Admin Panel"
      logoSub="CeriaKid Control"
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onMenuClick={() => {}}
    />
  );
}