"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sidebar } from "./sidebar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 md:ml-56 w-full">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b border-border/50 bg-background flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-4 text-base font-bold tracking-wider text-white">
            TIMPIA
          </span>
        </div>

        {/* Content with top padding on mobile to account for fixed header */}
        <div className="md:pt-0 pt-14">
          {children}
        </div>
      </main>
    </div>
  )
}
