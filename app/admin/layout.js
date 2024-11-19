'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import AppBreadcrumb from "@/components/app-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("isChief") === "true") {
      setIsLoggedIn(true);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full h-screen">
        <AppBreadcrumb className="sticky top-0 h-12 lg:h-14 bg-background/25 backdrop-blur-lg z-50" />
        <Separator orientation="horizontal" />
        <main className="h-[calc(100%-52px)] lg:h-[calc(100%-58px)] p-4 md:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
