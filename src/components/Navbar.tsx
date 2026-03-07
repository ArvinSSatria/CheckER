"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Instagram", href: "/instagram-engagement-calculator" },
    { name: "TikTok", href: "/tiktok-engagement-calculator" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto rounded-2xl px-1.5 py-1.5 flex items-center gap-1 bg-card/80 backdrop-blur-md border border-border soft-shadow transition-all duration-300">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.includes(link.href.split("/")[1]));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-250",
                isActive 
                  ? "text-primary-foreground bg-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {link.name}
            </Link>
          );
        })}
        <div className="w-px h-3 bg-border mx-2" />
        <ThemeToggle />
      </nav>
    </div>
  );
}
