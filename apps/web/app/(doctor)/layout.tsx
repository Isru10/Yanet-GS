"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, CalendarClock, Users, FileText,
  LogOut, Heart, Menu, X, TrendingUp, ChevronRight, Stethoscope,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { href: "/doctor/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/schedule",     label: "My Schedule", icon: CalendarClock },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/patients",     label: "My Patients", icon: Users },
  { href: "/doctor/history",      label: "Prescription History", icon: FileText },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [open, setOpen]           = useState(false);
  const [paidCount, setPaidCount] = useState<number | null>(null);
  const [doctorName, setDoctorName] = useState("Doctor");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles").select("name").eq("id", user.id).single();
      if (prof) setDoctorName(prof.name);

      // bookings has doctor_id FK — direct match
      const { data: books } = await supabase
        .from("bookings").select("id")
        .eq("doctor_id", user.id).eq("payment_status", "paid");
      setPaidCount(books?.length ?? 0);
    }
    load();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/login");
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-sidebar-primary/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-none">Yanet</p>
            <p className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wide mt-0.5">Doctor Portal</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 mt-4 p-3 bg-sidebar-accent rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-sidebar-primary" />
        </div>
        <div>
          <p className="text-sidebar-foreground/60 text-[10px] uppercase tracking-wide">Paid Bookings</p>
          <p className="text-sidebar-foreground font-bold text-sm">
            {paidCount !== null ? paidCount : "—"}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-sidebar-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground font-semibold text-sm truncate">{doctorName}</p>
            <p className="text-sidebar-foreground/50 text-xs">Doctor</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar shrink-0 overflow-y-auto">{sidebar}</aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform duration-200 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-white">
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-emerald-900 text-sm">Yanet Doctor</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
