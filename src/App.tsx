import React, { useState, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PinBiometricModal } from './components/PinBiometricModal';
import { ReceiptModal } from './components/ReceiptModal';
import { WhatsAppModal } from './components/WhatsAppModal';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { UserInformationView } from './views/UserInformationView';
import { TeamsMembersModuleView } from './views/TeamsMembersModuleView';
import { VarganiModuleView } from './views/VarganiModuleView';
import { EventsModuleView } from './views/EventsModuleView';
import { PublicBroadcastView } from './views/PublicBroadcastView';
import { SettingsView } from './views/SettingsView';

const MainAppContent: React.FC = () => {
  const { currentUser, currentView, setCurrentView } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // If not logged in, show Mobile OTP authentication screen
  if (!currentUser) {
    return <LoginView />;
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    // 1. Home / Dashboard
    if (currentView === 'dashboard' || currentView === 'home') {
      return <DashboardView onNavigate={handleNavigate} />;
    }

    // 2. User Information ("My Information")
    if (currentView === 'user-info' || currentView === 'profile') {
      return <UserInformationView />;
    }

    // 3. Teams / Members Module
    if (currentView.startsWith('org') || currentView === 'teams' || currentView === 'teams-members') {
      return <TeamsMembersModuleView initialSubTab={currentView} onNavigateSub={handleNavigate} />;
    }

    // 4. Vargani & Donations Module
    if (currentView.startsWith('vargani') || currentView.startsWith('donation')) {
      return <VarganiModuleView initialSubTab={currentView} onNavigateSub={handleNavigate} />;
    }

    // 5. Events & Navratri Module
    if (currentView.startsWith('events')) {
      return <EventsModuleView initialSubTab={currentView} onNavigateSub={handleNavigate} />;
    }

    // Secondary Admin Modules
    if (currentView.startsWith('broadcast')) {
      return <PublicBroadcastView />;
    }

    if (currentView.startsWith('settings')) {
      return <SettingsView initialTab={currentView} />;
    }

    // Default to Home Dashboard
    return <DashboardView onNavigate={handleNavigate} />;
  };

  return (
    <div className="h-screen h-[100dvh] bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Desktop Sidebar (Windows PC ERP layout) */}
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-slate-900 shadow-2xl z-50 h-full flex flex-col">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                isMobileDrawer={true}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto min-h-0 pb-24 lg:pb-8 overscroll-contain">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Instagram-inspired 5 sections) */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Global Modals */}
      <PinBiometricModal />
      <ReceiptModal />
      <WhatsAppModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
