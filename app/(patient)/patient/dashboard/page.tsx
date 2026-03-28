"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, CheckCircle2, FileText, Video, ArrowRight, Loader2, AlertCircle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

// bookings.status values: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
interface Booking {
  id: string;
  status: string;
  payment_status: string;
  meeting_link: string | null;
  appointment_date: string;
  appointment_time: string;
  doctor_id: string;
  doctor_name?: string; // fetched separately
}

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  scheduled:  { label: "Scheduled",  class: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed:  { label: "Completed",  class: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled:  { label: "Cancelled",  class: "bg-red-100 text-red-600 border-red-200" },
  rescheduled:{ label: "Rescheduled",class: "bg-blue-100 text-blue-700 border-blue-200" },
};

/** Patient can join any paid, scheduled booking that has a meeting room */
function canJoin(bk: Booking): boolean {
  return !!(bk.meeting_link && bk.payment_status === "paid" && bk.status === "scheduled");
}

export default function PatientDashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<{ name: string; age: number; phone: string; address: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get patient profile (name, not full_name)
      const { data: prof } = await supabase
        .from("profiles").select("name,age,phone,address").eq("id", user.id).single();

      // 2. Get bookings by patient_email (denormalised in real schema)
      const { data: raw } = await supabase
        .from("bookings")
        .select("id,status,payment_status,meeting_link,appointment_date,appointment_time,doctor_id")
        .eq("patient_email", user.email)
        .order("appointment_date", { ascending: false })
        .limit(6);

      const books = raw ?? [];

      // 3. Batch-fetch doctor names from profiles
      const doctorIds = [...new Set(books.map((b) => b.doctor_id).filter(Boolean))];
      let doctorMap: Record<string, string> = {};
      if (doctorIds.length) {
        const { data: docs } = await supabase
          .from("profiles").select("id,name").in("id", doctorIds);
        doctorMap = Object.fromEntries((docs ?? []).map((d) => [d.id, d.name]));
      }

      setProfile(prof as typeof profile);
      setBookings(books.map((b) => ({ ...b, doctor_name: doctorMap[b.doctor_id] ?? "Doctor" })));
      setLoading(false);
    }
    load();
  }, [supabase]);

  const upcoming = bookings.filter((b) => b.status === "scheduled");
  const paid     = bookings.filter((b) => b.payment_status === "paid");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Good day, {profile?.name?.split(" ")[0] ?? "Patient"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s a summary of your health activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Bookings", value: bookings.length, icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
          { label: "Paid Bookings", value: paid.length, icon: FileText, color: "text-yellow-600 bg-yellow-50" },
          { label: "Prescriptions", value: "View →", icon: FileText, color: "text-purple-600 bg-purple-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-none">{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile */}
      {profile && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Your Profile</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div><span className="font-medium text-gray-800">Name: </span>{profile.name}</div>
            <div><span className="font-medium text-gray-800">Age: </span>{profile.age}</div>
            <div><span className="font-medium text-gray-800">Phone: </span>{profile.phone}</div>
            <div><span className="font-medium text-gray-800">Address: </span>{profile.address}</div>
          </div>
        </div>
      )}

      {/* Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/patient/book">
            <Button size="sm" className="brand-gradient-light text-white text-xs">+ Book New</Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No bookings yet.</p>
            <Link href="/patient/book" className="mt-4 inline-block">
              <Button size="sm" className="brand-gradient-light text-white mt-3">
                Book Your First Appointment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((bk) => {
              const style  = STATUS_STYLES[bk.status] ?? STATUS_STYLES.scheduled;
              const joinable = !!(bk.meeting_link && bk.payment_status === "paid" && bk.status === "scheduled");
              return (
                <div key={bk.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{bk.doctor_name}</p>
                    <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bk.appointment_date} — {bk.appointment_time}
                    </p>
                    {bk.payment_status !== "paid" && (
                      <p className="text-orange-500 text-xs mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Payment pending
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`${style.class} text-xs`}>{style.label}</Badge>
                    {bk.payment_status !== "paid" && (
                      <Link href={`/patient/payment?bookingId=${bk.id}&doctor=${encodeURIComponent(bk.doctor_name ?? "Doctor")}`}>
                        <Button size="sm" variant="outline" className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50">Pay Now</Button>
                      </Link>
                    )}
                    {joinable && (
                      <Link href={`/session/${bk.meeting_link}?bookingId=${bk.id}`}>
                        <Button size="sm" className="brand-gradient-light text-white text-xs">
                          <Video className="w-3.5 h-3.5 mr-1.5" /> Join Call
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
