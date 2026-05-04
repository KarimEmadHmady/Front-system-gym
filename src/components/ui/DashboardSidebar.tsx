'use client';

import React, { useState } from 'react';

interface DashboardTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  showAlert?: boolean;
}

interface DashboardSidebarProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onMoreClick?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  header,
  children,
  defaultOpen = true,
  onMoreClick,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Chevron icons (inline SVG, can be replaced with Lucide/Heroicons if available)
  const ChevronLeft = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
  const ChevronRight = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7 " />
    </svg>
  );

  // Hamburger icon (animated to X if open)
  const HamburgerIcon = (
    <div className="relative w-6 h-6 flex flex-col items-center justify-center">
      <span className={`block absolute h-0.5 w-6 bg-blue-600 rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
      <span className={`block absolute h-0.5 w-4 bg-blue-600 rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'top-3'}`}></span>
      <span className={`block absolute h-0.5 w-6 bg-blue-600 rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
    </div>
  );

  // Sidebar content
  const sidebarContent = (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg rtl:right-0 rtl:left-auto transition-all duration-300 ${open ? 'w-56' : 'w-14'} relative`}>
      {/* Toggle button (desktop only) - Fixed at middle right of sidebar */}
      <button
        type="button"
        className="hidden items-center justify-center absolute top-1/2 right-0 rtl:right-auto rtl:left-0 -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2 z-20 w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors min-[1400px]:flex"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
      >
        <span className={`transition-colors ${open ? 'text-blue-600' : 'text-gray-400'}`}>
          {open ? ChevronRight : ChevronLeft}
        </span>
      </button>
      {header && open && <div className="p-4 border-b border-gray-100 dark:border-gray-800">{header}</div>}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 scrollbar-none hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
            className={`flex items-center w-full px-2 py-3 text-right transition-colors text-sm font-medium gap-3
              ${activeTab === tab.id
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold shadow rounded-full '
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg'}
              ${!open ? 'justify-center' : ''}
            `}
          >
            <span className="relative text-lg">
              {tab.icon}
              {!open && tab.showAlert && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </span>
            {open && <span className="flex-1 text-right">{tab.name}</span>}
            {open && tab.showAlert && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>
        ))}
        {onMoreClick && (
          <button
            onClick={() => onMoreClick()}
            className={`flex items-center w-full px-2 py-3 text-right transition-colors text-sm font-medium gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${!open ? 'justify-center' : ''}`}
            title="خدمات إضافية"
          >
            <span className="text-lg">⋯</span>
            {open && <span className="flex-1 text-right">المزيد</span>}
          </button>
        )}
      </nav>
      {children && open && <div className="p-4 border-t border-gray-100 dark:border-gray-800">{children}</div>}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — visible only at 1400px and above */}
      <aside className="hidden fixed top-0 bottom-0 right-0 rtl:right-0 rtl:left-auto z-40 h-full min-[1400px]:flex">
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Drawer — visible below 1400px */}
      <div className="fixed top-4 right-4 rtl:right-4 rtl:left-auto z-50 min-[1400px]:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 dark:backdrop-blur-xs shadow hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          aria-label="Open menu"
        >
          {HamburgerIcon}
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
        )}
        <div
          className={`fixed top-0 bottom-0 right-0 rtl:right-0 rtl:left-auto z-50 h-full w-56 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} min-[1400px]:hidden`}
          style={{ transitionProperty: 'transform' }}
        >
          <div className="flex justify-end p-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Always open in mobile/tablet */}
          <div className="flex flex-col h-full w-56 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg rtl:right-0 rtl:left-auto">
            {header && <div className="p-4 border-b border-gray-100 dark:border-gray-800">{header}</div>}
            <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 hide-scrollbar mb-[95px]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                  className={`flex items-center w-full px-3 py-3 rounded-lg text-right transition-colors text-sm font-medium gap-3
                    ${activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold shadow'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="flex-1 text-right">{tab.name}</span>
                  {tab.showAlert && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              ))}
              {onMoreClick && (
                <button
                  onClick={() => { onMoreClick(); setMobileOpen(false); }}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-right transition-colors text-sm font-medium gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="خدمات إضافية"
                >
                  <span className="text-lg">⋯</span>
                  <span className="flex-1 text-right">المزيد</span>
                </button>
              )}
            </nav>
            {children && <div className="p-4 border-t border-gray-100 dark:border-gray-800">{children}</div>}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default DashboardSidebar;