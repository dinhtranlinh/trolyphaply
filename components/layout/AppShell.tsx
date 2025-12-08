'use client';

import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  headerRightAction?: React.ReactNode;
}

/**
 * AppShell - Main layout wrapper với Header và BottomNav
 * Mobile-first design với max-width constraint trên desktop
 */
export default function AppShell({
  children,
  showHeader = true,
  showBottomNav = true,
  headerTitle,
  showBackButton = false,
  headerRightAction,
}: AppShellProps) {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ 
        backgroundImage: 'url(/bgr.jpg)',
        backgroundColor: '#EEF2F8'
      }}
    >
      {/* Header */}
      {showHeader && (
        <Header
          title={headerTitle}
          showBackButton={showBackButton}
          rightAction={headerRightAction}
        />
      )}

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-24">
        {/* Max width constraint cho desktop */}
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
