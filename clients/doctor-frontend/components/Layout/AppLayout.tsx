'use client';

import { useState, useEffect } from 'react';
import NavigationDrawer from './NavigationDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopDrawerCollapsed, setDesktopDrawerCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('navDrawerCollapsed');
    if (saved !== null) {
      setDesktopDrawerCollapsed(saved === 'true');
    }
  }, []);

  const toggleDesktopDrawer = () => {
    const newState = !desktopDrawerCollapsed;
    setDesktopDrawerCollapsed(newState);
    localStorage.setItem('navDrawerCollapsed', String(newState));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        isCollapsed={desktopDrawerCollapsed}
      />

      {/* Desktop Toggle Button - Positioned at drawer edge */}
      <button
        onClick={toggleDesktopDrawer}
        className={`hidden lg:flex fixed top-20 z-50 items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ${
          desktopDrawerCollapsed ? 'left-[72px]' : 'left-[248px]'
        }`}
        aria-label={desktopDrawerCollapsed ? "Expand navigation" : "Collapse navigation"}
        title={desktopDrawerCollapsed ? "Expand navigation" : "Collapse navigation"}
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {desktopDrawerCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          )}
        </svg>
      </button>

      {/* Main Content */}
      <div className={`lg:transition-all lg:duration-300 min-h-screen ${desktopDrawerCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md-icon-button"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-3 flex items-center gap-2">
            <span className="text-xl">💊</span>
            <span className="font-semibold text-gray-900">Prescription Maker</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
