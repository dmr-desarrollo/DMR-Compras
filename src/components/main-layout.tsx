"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Home, PlusCircle, Loader2, LogOut, FileText, PanelLeft, LayoutDashboard } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import type { User as AppUser } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


function CustomSidebarTrigger() {
    const { toggleSidebar } = useSidebar();
    return (
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => toggleSidebar()}
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
}


export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
            id: firebaseUser.uid,
            name: firebaseUser.email || "Usuario",
            email: firebaseUser.email || "",
            avatar: "/placeholder-avatar.png",
        });
      } else {
        router.push("/");
      }
      setIsAuthenticating(false);
    });
     return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
        console.error("Error signing out:", error)
    }
  };
  
  if (isAuthenticating) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
           <Button variant="ghost" className="w-full justify-start text-lg font-bold" onClick={() => router.push('/dashboard')}>
             <span className={cn("duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0")}>Compras DMR</span>
             <span className={cn("duration-200 group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:w-auto hidden", "group-data-[collapsible=icon]:block")}>DMR</span>
           </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/dashboard")} tooltip={{children: "Panel"}}>
                <LayoutDashboard />
                <span className="group-data-[collapsible=icon]:opacity-0 duration-200">Panel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/requests/new")} tooltip={{children: "Nueva Solicitud"}}>
                <PlusCircle />
                <span className="group-data-[collapsible=icon]:opacity-0 duration-200">Nueva Solicitud</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/reports")} tooltip={{children: "Reportes"}}>
                <FileText />
                <span className="group-data-[collapsible=icon]:opacity-0 duration-200">Reportes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarTrigger className="w-full" />
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Cerrar Sesión"}}>
                      <LogOut />
                      <span className="group-data-[collapsible=icon]:opacity-0 duration-200">Cerrar Sesión</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:justify-end sm:px-6">
            <CustomSidebarTrigger />
            {user && <UserNav user={user} onLogout={handleLogout} />}
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
           <footer className="mt-auto p-4 text-center text-xs text-muted-foreground border-t">
              <div className="flex flex-col items-center justify-center gap-2">
                 <Image src="https://firebasestorage.googleapis.com/v0/b/compras-dmr.firebasestorage.app/o/logo_dmr_transparente.png?alt=media&token=15232ad0-a862-426a-9c9d-105ff07a0b76" alt="DMR Logo" width={80} height={32} style={{ height: 'auto' }} referrerPolicy="no-referrer" />
                 <span className="text-xs">© {new Date().getFullYear()} DMR. Todos los derechos reservados.</span>
              </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
