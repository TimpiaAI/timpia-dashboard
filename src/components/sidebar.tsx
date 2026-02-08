"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Conversations", href: "/conversations", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: Sparkles },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border/50 bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-border/50">
          <span className="text-base font-bold tracking-wider text-white">
            TIMPIA
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4 space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
          <p className="text-xs text-muted-foreground">
            dashboard.timpia.ai
          </p>
        </div>
      </div>
    </aside>
  )
}
