"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:flex" />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-semibold text-foreground">Yanet Telemedicine</h1>
        </div>
        <Link href="/" className="text-xs text-slate-600 hover:text-slate-900">
          Home
        </Link>
      </div>
    </header>
  );
}
