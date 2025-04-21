import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  // State
  isOpen: boolean;         // For mobile: is sidebar open or closed
  isCollapsed: boolean;    // For desktop: is sidebar collapsed (icon-only) or expanded
  
  // Actions
  toggleSidebar: () => void;     // Toggle open/close (mobile)
  toggleCollapse: () => void;    // Toggle collapse/expand (desktop)
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Default state - sidebar is open on desktop, and expanded (not collapsed)
      isOpen: true,
      isCollapsed: false,
      
      // Actions
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setSidebarOpen: (open: boolean) => set({ isOpen: open }),
      setSidebarCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage', // Name for localStorage
      // Only persist the state values, not the actions
      partialize: (state) => ({
        isOpen: state.isOpen,
        isCollapsed: state.isCollapsed
      }),
    }
  )
); 