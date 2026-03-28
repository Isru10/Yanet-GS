"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ChevronRight, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

// Real schema: bookings has patient_name, patient_email (text — no FK to profiles)
// Strategy: get bookings, deduplicate by email, then lookup profiles by email for the [id] link

interface PatientEntry {
  name: string;
  email: string;
  profileId: string | null; // from profiles.email lookup
  bookingCount: number;
}

export default function PatientsPage() {
  const supabase = createClient();
  const [patients, setPatients] = useState<PatientEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all bookings for this doctor
      const { data: bks } = await supabase
        .from("bookings").select("patient_name,patient_email")
        .eq("doctor_id", user.id);
      if (!bks) { setLoading(false); return; }

      // Deduplicate by email and count
      const emailMap = new Map<string, PatientEntry>();
      for (const b of bks) {
        if (emailMap.has(b.patient_email)) {
          emailMap.get(b.patient_email)!.bookingCount++;
        } else {
          emailMap.set(b.patient_email, { name: b.patient_name, email: b.patient_email, profileId: null, bookingCount: 1 });
        }
      }

      // Fetch profile IDs for each unique email (to link to patient detail page)
      const emails = Array.from(emailMap.keys());
      if (emails.length) {
        const { data: profs } = await supabase.from("profiles").select("id,email").in("email", emails);
        for (const p of profs ?? []) {
          if (emailMap.has(p.email)) emailMap.get(p.email)!.profileId = p.id;
        }
      }

      setPatients(Array.from(emailMap.values()));
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Patients</h1>
          <p className="text-gray-500 text-sm mt-1">All patients who have booked with you.</p>
        </div>
        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-700" />
        </div>
      </div>

      {!loading && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 border-gray-200 focus-visible:ring-emerald-500" />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No patients found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pt, i) => (
            <motion.div key={pt.email} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              {pt.profileId ? (
                <Link href={`/doctor/patients/${pt.profileId}`}>
                  <PatientCard pt={pt} />
                </Link>
              ) : (
                <PatientCard pt={pt} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ pt }: { pt: { name: string; email: string; bookingCount: number; profileId: string | null } }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
        {pt.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900">{pt.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{pt.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">{pt.bookingCount} bookings</Badge>
        {pt.profileId && <ChevronRight className="w-4 h-4 text-gray-300" />}
      </div>
    </div>
  );
}
