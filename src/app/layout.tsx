import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Utensils,
  Calendar,
  Refrigerator,
  Heart,
  ShoppingCart,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const navLinks = [
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/plan", label: "Plan", icon: Calendar },
  { href: "/fridge", label: "Fridge", icon: Refrigerator },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/shopping", label: "Shop", icon: ShoppingCart },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "bg-background text-foreground min-h-screen flex flex-col",
        )}
      >
        <div className="flex flex-1 w-full">
          {/* Sidebar for desktop */}
          <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-card p-4 gap-2">
            <h1 className="text-2xl font-bold mb-6">FoodApp</h1>
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                >
                  <Icon className="size-5" />
                  <span className="text-base font-medium">{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
            {children}
          </main>
        </div>
        {/* Footer nav for mobile */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 z-50">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </footer>
      </body>
    </html>
  );
}
