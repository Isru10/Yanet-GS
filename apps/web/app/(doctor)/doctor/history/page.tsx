"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Calendar, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Real schema: prescriptions.doctor_note (not content), booking_id (not appointment_id)
// No patient_id in prescriptions — join via booking_id → bookings.patient_name

interface Prescription {
  id: string;
  doctor_note: string;
  created_at: string;
  booking: { patient_name: string; appointment_date: string; appointment_time: string } | null;
}

export default function HistoryPage() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get all bookings for this doctor
      const { data: bks } = await supabase
        .from("bookings").select("id,patient_name,appointment_date,appointment_time")
        .eq("doctor_id", user.id);
      if (!bks || bks.length === 0) { setLoading(false); return; }

      const bkMap = Object.fromEntries(bks.map((b) => [b.id, b]));
      const bkIds = bks.map((b) => b.id);

      // 2. Get prescriptions for those bookings
      const { data: rxRows } = await supabase
        .from("prescriptions").select("id,doctor_note,created_at,booking_id")
        .in("booking_id", bkIds).order("created_at", { ascending: false });

      setPrescriptions(
        (rxRows ?? []).map((rx) => ({
          id:          rx.id,
          doctor_note: rx.doctor_note,
          created_at:  rx.created_at,
          booking:     bkMap[rx.booking_id] ?? null,
        }))
      );
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Prescription History</h1>
        <p className="text-gray-500 text-sm mt-1">All prescriptions you have issued across consultations.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-14">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No prescriptions written yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx, i) => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {rx.booking?.patient_name ?? "Patient"}
                    </span>
                    {rx.booking && (
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rx.booking.appointment_date} — {rx.booking.appointment_time}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Issued {new Date(rx.created_at).toLocaleDateString("en-ET", { dateStyle: "long" })}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono border border-gray-100 max-h-40 overflow-y-auto">
                {rx.doctor_note}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
