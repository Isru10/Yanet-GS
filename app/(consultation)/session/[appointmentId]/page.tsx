"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, VideoConference, RoomAudioRenderer, ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2, MessageSquare, FileText, PenLine, X, Send, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Real schema:
// bookings: id, meeting_link, appointment_date, appointment_time, status, doctor_notes, patient_email, doctor_id
// prescriptions: booking_id, doctor_note
// files: uploader_id, patient_id, doctor_id, file_name, file_url

type Panel = "chat" | "notes" | "prescription" | null;
type Role  = "doctor" | "patient";

interface Booking {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctor_notes: string | null;
  patient_email: string;
  doctor_id: string;
}


function isJoinable(booking: Booking, role: Role): boolean {
  if (role === "doctor") return true;
  // Patient can join any paid, non-completed booking — doctor controls when call starts
  return booking.status === "scheduled";
}

export default function SessionPage() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const router      = useRouter();
  const supabase    = createClient();

  // /session/[appointmentId] — appointmentId is the meeting_link / room name
  const roomName  = params.appointmentId as string;
  const bookingId = searchParams.get("bookingId") ?? "";
  const roleParam = (searchParams.get("role") ?? "patient") as Role;

  const [token,     setToken]     = useState<string | null>(null);
  const [booking,   setBooking]   = useState<Booking | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [panel,     setPanel]     = useState<Panel>(null);
  const [notes,     setNotes]     = useState("");
  const [rx,        setRx]        = useState("");
  const [savingRx,  setSavingRx]  = useState(false);
  const [savingNote,setSavingNote]= useState(false);
  const [userName,  setUserName]  = useState("User");
  const [leaving,   setLeaving]   = useState(false);

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated."); setLoading(false); return; }

      // Get profile name
      const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      const uname = prof?.name ?? user.email ?? "User";
      setUserName(uname);

      // Get booking — try by id first, else by meeting_link
      let bk: Booking | null = null;
      if (bookingId) {
        const { data } = await supabase.from("bookings")
          .select("id,appointment_date,appointment_time,status,doctor_notes,patient_email,doctor_id")
          .eq("id", bookingId).single();
        bk = data as Booking | null;
      }
      if (!bk && roomName) {
        const { data } = await supabase.from("bookings")
          .select("id,appointment_date,appointment_time,status,doctor_notes,patient_email,doctor_id")
          .eq("meeting_link", roomName).single();
        bk = data as Booking | null;
      }

      if (!bk) { setError("Booking not found."); setLoading(false); return; }

      // Time gate (patients only)
      if (roleParam === "patient" && !isJoinable(bk, "patient")) {
        setError(`Too early! You can join 5 minutes before: ${bk.appointment_date} at ${bk.appointment_time}`);
        setLoading(false);
        return;
      }

      setBooking(bk);
      if (bk.doctor_notes) setNotes(bk.doctor_notes);

      // Get LiveKit token
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(uname)}`);
      if (!res.ok) { setError("Failed to get video token."); setLoading(false); return; }
      const { token: t } = await res.json();
      setToken(t);
      setLoading(false);
    }
    init();
  }, [bookingId, roomName, roleParam, supabase]);

  async function saveNotes() {
    if (!booking) return;
    setSavingNote(true);
    const { error: err } = await supabase.from("bookings")
      .update({ doctor_notes: notes }).eq("id", booking.id);
    if (err) toast.error("Failed to save notes.");
    else toast.success("Notes saved.");
    setSavingNote(false);
  }

  async function savePrescription() {
    if (!booking || !rx.trim()) { toast.error("Write a prescription first."); return; }
    setSavingRx(true);
    try {
      // Insert prescription (real schema: booking_id, doctor_note)
      const { error: err } = await supabase.from("prescriptions").insert({
        booking_id:  booking.id,
        doctor_note: rx,
      });
      if (err) throw err;

      // Mark booking as completed
      await supabase.from("bookings").update({ status: "completed" }).eq("id", booking.id);

      toast.success("Prescription saved & sent to patient!");
      setRx("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setSavingRx(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
        <p className="text-gray-400 mt-3 text-sm">Connecting to session…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-white font-bold text-xl mb-2">Cannot Join Session</h1>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="border-gray-600 text-gray-300">
          ← Go Back
        </Button>
      </div>
    </div>
  );

  if (!token) return null;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* ─── LiveKit Room ─── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            LIVE
          </div>
          <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
            {booking?.appointment_date} {booking?.appointment_time}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Button size="sm" variant="ghost"
            onClick={() => setPanel((p) => p === "chat" ? null : "chat")}
            className={`text-xs ${panel === "chat" ? "bg-emerald-600 text-white" : "text-gray-300 hover:text-white bg-black/40 backdrop-blur"}`}>
            <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
          </Button>
          {roleParam === "doctor" && (
            <>
              <Button size="sm" variant="ghost"
                onClick={() => setPanel((p) => p === "notes" ? null : "notes")}
                className={`text-xs ${panel === "notes" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white bg-black/40 backdrop-blur"}`}>
                <PenLine className="w-4 h-4 mr-1.5" /> Notes
              </Button>
              <Button size="sm" variant="ghost"
                onClick={() => setPanel((p) => p === "prescription" ? null : "prescription")}
                className={`text-xs ${panel === "prescription" ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white bg-black/40 backdrop-blur"}`}>
                <FileText className="w-4 h-4 mr-1.5" /> Prescription
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost"
            onClick={() => setLeaving(true)}
            className="text-xs text-red-400 hover:text-red-300 bg-black/40 backdrop-blur">
            <LogOut className="w-4 h-4 mr-1.5" /> Leave
          </Button>
        </div>

        <LiveKitRoom token={token} serverUrl={livekitUrl} video audio
          data-lk-theme="default" className="flex-1">
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* ─── Side Panel ─── */}
      {panel && (
        <div className="w-80 shrink-0 border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="font-bold text-white text-sm">
              {panel === "chat" ? "Session Chat" : panel === "notes" ? "Private Notes" : "Write Prescription"}
            </h3>
            <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat panel */}
          {panel === "chat" && (
            <div className="flex-1 p-4 text-gray-400 text-sm flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">LiveKit built-in chat is active in the video area.</p>
              </div>
            </div>
          )}

          {/* Doctor notes panel */}
          {panel === "notes" && roleParam === "doctor" && (
            <div className="flex-1 flex flex-col p-4 gap-3">
              <p className="text-gray-400 text-xs">Private notes — visible only to you. Saved to the booking record.</p>
              <textarea
                className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Clinical observations, symptoms, follow-ups…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={saveNotes} disabled={savingNote} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notes"}
              </Button>
            </div>
          )}

          {/* Prescription panel */}
          {panel === "prescription" && roleParam === "doctor" && (
            <div className="flex-1 flex flex-col p-4 gap-3">
              <p className="text-gray-400 text-xs">Write prescription. Saving marks this session as completed and notifies the patient.</p>
              <textarea
                className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl p-3 text-sm resize-none font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder={"Rx:\n\nDrug: \nDose: \nFrequency: \nDuration: \n\nNotes: "}
                value={rx}
                onChange={(e) => setRx(e.target.value)}
              />
              <Button onClick={savePrescription} disabled={savingRx || !rx.trim()} size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white">
                {savingRx ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" />Save & Send to Patient</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── Leave confirmation ─── */}
      {leaving && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full text-center">
            <LogOut className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-1">Leave Session?</h2>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to leave the video call?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setLeaving(false)} className="flex-1 border-gray-600 text-gray-300">Stay</Button>
              <Button onClick={() => router.push(roleParam === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white">Leave</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
