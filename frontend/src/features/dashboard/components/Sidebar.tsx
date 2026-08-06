"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
  Briefcase
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Admin", href: "/admin", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            D
          </div>
          <span>DevCollab</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-surface-hover text-foreground" 
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {mounted && theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          )}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
