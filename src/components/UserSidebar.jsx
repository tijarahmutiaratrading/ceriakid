import React from 'react';
import { Users, Settings, Palette, BookOpen, UserCircle, BarChart3, UserPlus, Trophy, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import ReusableSidebar from '@/components/ReusableSidebar';

const USER_GROUPS = [
  { key: 'keluarga', label: 'Keluarga', icon: Users,
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

export default function UserSidebar() {
  const { user, isAuthenticated, logout } = useAuth() || {};

  if (!isAuthenticated) return null;

  return (
    <ReusableSidebar
      menuItems={[]}
      userGroups={USER_GROUPS}
      logoLabel="CeriaKid"
      logoSub="User Dashboard"
      user={user}
      onMenuClick={() => {}}
      onLogout={() => logout?.()}
    />
  );
}