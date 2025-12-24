'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doctorProfileAPI } from '@/lib/api';


interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'New Prescription', href: '/prescription/new', icon: '📝' },
  { label: 'My Prescriptions', href: '/prescriptions', icon: '📋' },
  { label: 'Hospitals / Clinics', href: '/hospitals', icon: '🏥' },
  { label: 'Templates', href: '/templates', icon: '📄' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
  { label: 'Profile', href: '/profile', icon: '👨‍⚕️' },
];

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export default function NavigationDrawer({ isOpen, onClose, isCollapsed = false }: NavigationDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');

  // Fetch doctor profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await doctorProfileAPI.get();
        if (response.data?.profileImage) {
          setProfileImage(response.data.profileImage);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (user) {
      fetchProfileImage();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };


  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white z-50 transition-all duration-300 ease-in-out
          shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-gray-200 ${isCollapsed ? 'lg:justify-center lg:px-2' : 'px-6'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:flex-col lg:gap-0' : ''}`}>
            <div className="text-2xl">💊</div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Prescription</h1>
                <p className="text-xs text-gray-500">Maker</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info - Clickable Profile */}
        {user && (
          <Link 
            href="/profile"
            onClick={() => onClose()}
            className={`block py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${isCollapsed ? 'lg:px-2' : 'px-6'}`}
          >
            <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:flex-col lg:gap-1' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </Link>
        )}


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className={`space-y-1 ${isCollapsed ? 'lg:px-2' : 'px-3'}`}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isCollapsed ? 'lg:justify-center lg:flex-col lg:gap-1 lg:px-2 lg:py-3' : ''}
                      ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={isCollapsed ? 'lg:text-[10px] lg:leading-tight lg:text-center' : ''}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className={`border-t border-gray-200 ${isCollapsed ? 'lg:p-2' : 'p-3'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                     text-red-600 hover:bg-red-50 transition-all duration-200
                     ${isCollapsed ? 'lg:justify-center lg:flex-col lg:gap-1 lg:px-2 lg:py-3' : ''}`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <span className="text-xl">🚪</span>
            <span className={isCollapsed ? 'lg:text-[10px] lg:leading-tight' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
