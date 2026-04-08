"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Calendar, CheckCircle2, TrendingUp, Loader2, Video, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

// Real schema: bookings has doctor_id (FK), patient_name (text), patient_email (text),
// appointment_date (date), appointment_time (text), status, payment_status, meeting_link

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  meeting_link: string | null;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
}

export default function DoctorDashboardPage() {
  const supabase = createClient();
  const [bookings,    setBookings]    = useState<Booking[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [doctorName,  setDoctorName]  = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: bks }] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", user.id).single(),
        supabase.from("bookings")
          .select("id,status,payment_status,meeting_link,appointment_date,appointment_time,patient_name")
          .eq("doctor_id", user.id)
          .order("appointment_date", { ascending: true })
          .limit(8),
      ]);

      setDoctorName(prof?.name ?? "");
      setBookings((bks ?? []) as Booking[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const today     = new Date().toISOString().slice(0, 10);
  const upcoming  = bookings.filter((b) => b.status === "scheduled");
  const todayBks  = bookings.filter((b) => b.appointment_date === today);
  const uniquePts = new Set(bookings.map((b) => b.patient_name)).size;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dr. {doctorName}&apos;s Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here are your upcoming appointments.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Upcoming",      value: upcoming.length,  icon: Calendar,      color: "text-emerald-600 bg-emerald-50" },
          { label: "Today",         value: todayBks.length,  icon: CheckCircle2,  color: "text-blue-600 bg-blue-50" },
          { label: "Unique Patients", value: uniquePts,      icon: Users,         color: "text-purple-600 bg-purple-50" },
          { label: "All Bookings",  value: bookings.length,  icon: TrendingUp,    color: "text-yellow-600 bg-yellow-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-none">{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Upcoming Appointments</h2>
          <Link href="/doctor/appointments">
            <Button variant="ghost" size="sm" className="text-emerald-700 text-xs">
              View All <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((bk) => (
              <div key={bk.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                    {(bk.patient_name ?? "P").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{bk.patient_name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {bk.appointment_date} — {bk.appointment_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={bk.payment_status === "paid"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                    {bk.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                  {bk.meeting_link && bk.payment_status === "paid" && (
                    <Link href={`/session/${bk.meeting_link}?bookingId=${bk.id}&role=doctor`}>
                      <Button size="sm" className="brand-gradient-light text-white text-xs">
                        <Video className="w-3.5 h-3.5 mr-1.5" /> Start Call
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
