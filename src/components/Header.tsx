"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Settings, FileSearch } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Shield },
  { href: "/verify", label: "Verify", icon: FileSearch },
  { href: "/standards", label: "Standards", icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            PatternGuard
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
