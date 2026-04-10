"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Download, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

// Real schema: prescriptions has booking_id, doctor_note (not content)
// No patient_id directly — need to join via bookings
// bookings has patient_email (text) — match by user email

interface Prescription {
  id: string;
  doctor_note: string;
  created_at: string;
  booking: {
    appointment_date: string;
    appointment_time: string;
    doctor_id: string;
  } | null;
  doctor_name?: string;
}

export default function PrescriptionsPage() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Step 1: Get all bookings for this patient (by email)
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id,appointment_date,appointment_time,doctor_id")
        .eq("patient_email", user.email);

      if (!bookings || bookings.length === 0) { setLoading(false); return; }

      const bookingIds = bookings.map((b) => b.id);
      const bookingMap = Object.fromEntries(bookings.map((b) => [b.id, b]));

      // Step 2: Get prescriptions for those bookings
      const { data: rxRows } = await supabase
        .from("prescriptions")
        .select("id,doctor_note,created_at,booking_id")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false });

      if (!rxRows || rxRows.length === 0) { setLoading(false); return; }

      // Step 3: Fetch doctor names
      const doctorIds = [...new Set(bookings.map((b) => b.doctor_id).filter(Boolean))];
      let doctorMap: Record<string, string> = {};
      if (doctorIds.length) {
        const { data: docs } = await supabase.from("profiles").select("id,name").in("id", doctorIds);
        doctorMap = Object.fromEntries((docs ?? []).map((d) => [d.id, d.name]));
      }

      const merged: Prescription[] = rxRows.map((rx) => ({
        id:          rx.id,
        doctor_note: rx.doctor_note,
        created_at:  rx.created_at,
        booking:     bookingMap[rx.booking_id] ?? null,
        doctor_name: bookingMap[rx.booking_id]
          ? doctorMap[bookingMap[rx.booking_id].doctor_id] ?? "Doctor"
          : "Doctor",
      }));

      setPrescriptions(merged);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 text-sm mt-1">Digital prescriptions issued by your doctors after consultations.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-14">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No prescriptions yet.</p>
          <p className="text-gray-400 text-xs mt-1">They appear here after your doctor completes your consultation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx, i) => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{rx.doctor_name}</p>
                    {rx.booking && (
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {rx.booking.appointment_date} — {rx.booking.appointment_time}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs">
                      Issued {new Date(rx.created_at).toLocaleDateString("en-ET", { dateStyle: "long" })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0">Prescription</Badge>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono border border-gray-100">
                {rx.doctor_note}
              </div>
              {/* No attachment_url in real schema — show download only if available */}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
