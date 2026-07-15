import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barra sup, solo visible en celu con el boton de menu */}
          <header className='md:hidden flex items-center gap-3 px-4 py-3 border-b bordder-border bg-white sticky top-0 z-40'>
            <SidebarTrigger className='h-9 w-9 p-0 text-primary hover:bg-accent rounded-md'>
              <Menu className='h-5 w-5' />
            </SidebarTrigger>
            <span className="font-bold text-foreground">FeliVet 🐾</span>
          </header>

          {/* Main */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Componente wrapper para páginas que necesitan layout
export function withLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <Layout>
        <Component {...props} />
      </Layout>
    );
  };
}

export default Layout;