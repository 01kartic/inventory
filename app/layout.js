import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import AppBreadcrumb from "@/components/app-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Inventory",
  description: "It stores products, stocks and customers information.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full h-screen">
              <AppBreadcrumb className="sticky top-0 h-14 bg-background/25 backdrop-blur-lg z-50" />
              <Separator orientation="horizontal" />
              <main className="h-calc(100%-56px) p-4 md:p-6">
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
