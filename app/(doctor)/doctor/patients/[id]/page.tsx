"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, FileText, ImageIcon, Loader2, ExternalLink, Calendar, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

// Real schema: profiles.name (not full_name)
// files table: patient_id, doctor_id, file_name, file_url, created_at
// bookings: match by patient_email & doctor_id

interface PatientProfile { name: string; phone: string; address: string; age: number; email: string; }
interface PatientFile    { id: string; file_name: string; file_url: string; created_at: string; }
interface Booking        { id: string; status: string; appointment_date: string; appointment_time: string; }

export default function PatientDetailPage() {
  const params    = useParams();
  const patientId = params.id as string;
  const supabase  = createClient();

  const [profile,  setProfile]  = useState<PatientProfile | null>(null);
  const [files,    setFiles]    = useState<PatientFile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get patient profile
      const { data: prof } = await supabase
        .from("profiles").select("name,phone,address,age,email").eq("id", patientId).single();
      setProfile(prof as PatientProfile | null);

      if (!prof) { setLoading(false); return; }

      // Get files shared with THIS doctor (doctor_id = me)
      const { data: f } = await supabase
        .from("files").select("id,file_name,file_url,created_at")
        .eq("patient_id", patientId).eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      // Get bookings: match by patient_email and doctor_id
      const { data: bks } = await supabase
        .from("bookings").select("id,status,appointment_date,appointment_time")
        .eq("patient_email", prof.email).eq("doctor_id", user.id)
        .order("appointment_date", { ascending: false });

      setFiles((f ?? []) as PatientFile[]);
      setBookings((bks ?? []) as Booking[]);
      setLoading(false);
    }
    load();
  }, [patientId, supabase]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>;
  if (!profile) return (
    <div className="text-center py-16 text-gray-400">
      <p>Patient not found.</p>
      <Link href="/doctor/patients" className="text-emerald-700 text-sm hover:underline mt-2 inline-block">← Back</Link>
    </div>
  );

  const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/doctor/patients" className="flex items-center gap-1.5 text-emerald-700 text-sm hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {profile.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{profile.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Age {profile.age}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.address}</span>
          </div>
        </div>
      </div>

      {/* Shared Files */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Shared Files ({files.length})</h2>
        {files.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No files shared by this patient yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, i) => (
              <motion.div key={file.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  {isImage(file.file_name) ? <ImageIcon className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{file.file_name}</p>
                  <p className="text-gray-400 text-xs">{new Date(file.created_at).toLocaleDateString("en-ET", { dateStyle: "medium" })}</p>
                </div>
                <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:underline shrink-0">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Booking History ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((bk) => (
              <div key={bk.id} className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{bk.appointment_date} — {bk.appointment_time}</p>
                </div>
                <Badge className={
                  bk.status === "completed"   ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs" :
                  bk.status === "scheduled"   ? "bg-yellow-100 text-yellow-700 border-yellow-200 text-xs"   :
                  "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                }>{bk.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
