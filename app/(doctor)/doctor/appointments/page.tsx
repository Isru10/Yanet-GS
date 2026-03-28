"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Video, CalendarClock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Real schema: bookings table — doctor_id (FK), patient_name (text), patient_email (text)
// status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
// meeting_link (text), appointment_date (date), appointment_time (text)

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  meeting_link: string | null;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_email: string;
}

export default function AppointmentsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bookings")
        .select("id,status,payment_status,meeting_link,appointment_date,appointment_time,patient_name,patient_email")
        .eq("doctor_id", user.id)
        .order("appointment_date", { ascending: false });
      setBookings((data ?? []) as Booking[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status."); return; }
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    toast.success(`Booking marked as ${status}.`);
  }

  const upcoming = bookings.filter((b) => b.status === "scheduled");
  const past     = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  function BookingCard({ bk, actions }: { bk: Booking; actions: boolean }) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
              {(bk.patient_name ?? "P").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{bk.patient_name}</p>
              <p className="text-gray-400 text-xs">{bk.patient_email}</p>
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {bk.appointment_date} — {bk.appointment_time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Badge className={
              bk.status === "scheduled"   ? "bg-yellow-100 text-yellow-700 border-yellow-200"  :
              bk.status === "completed"   ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              bk.status === "rescheduled" ? "bg-blue-100 text-blue-700 border-blue-200"         :
              "bg-red-100 text-red-600 border-red-200"
            }>
              {bk.status.charAt(0).toUpperCase() + bk.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs text-gray-500">
              {bk.payment_status === "paid" ? "✓ Paid" : "Unpaid"}
            </Badge>

            {actions && bk.meeting_link && bk.payment_status === "paid" && (
              <Link href={`/session/${bk.meeting_link}?bookingId=${bk.id}&role=doctor`}>
                <Button size="sm" className="brand-gradient-light text-white text-xs">
                  <Video className="w-3.5 h-3.5 mr-1.5" /> Start Call
                </Button>
              </Link>
            )}
            {actions && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(bk.id, "completed")}
                className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
              </Button>
            )}
            {actions && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(bk.id, "rescheduled")}
                className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                <CalendarClock className="w-3.5 h-3.5 mr-1" /> Reschedule
              </Button>
            )}
            {actions && (
              <Button size="sm" variant="ghost" onClick={() => updateStatus(bk.id, "cancelled")}
                className="text-xs text-red-500 hover:bg-red-50">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage upcoming and past patient bookings.</p>
      </div>

      <div>
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <CalendarClock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">{upcoming.map((b) => <BookingCard key={b.id} bk={b} actions={true} />)}</div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-400 text-sm uppercase tracking-wide mb-3">Past ({past.length})</h2>
          <div className="space-y-3">{past.map((b) => <BookingCard key={b.id} bk={b} actions={false} />)}</div>
        </div>
      )}
    </div>
  );
}
