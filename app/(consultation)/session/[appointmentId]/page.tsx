"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  LiveKitRoom, VideoConference, RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  Loader2, MessageSquare, FileText, PenLine, X,
  Send, AlertCircle, LogOut, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

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
  return booking.status === "scheduled";
}

export default function SessionPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const supabase     = createClient();

  const roomName  = params.appointmentId as string;
  const bookingId = searchParams.get("bookingId") ?? "";
  const roleParam = (searchParams.get("role") ?? "patient") as Role;

  const [token,      setToken]      = useState<string | null>(null);
  const [booking,    setBooking]    = useState<Booking | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [panel,      setPanel]      = useState<Panel>(null);
  const [notes,      setNotes]      = useState("");
  const [rx,         setRx]         = useState("");
  const [savingRx,   setSavingRx]   = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [leaving,    setLeaving]    = useState(false);

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated."); setLoading(false); return; }

      const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      const uname = prof?.name ?? user.email ?? "User";

      let bk: Booking | null = null;
      if (bookingId) {
        const { data } = await supabase.from("bookings")
          .select("id,appointment_date,appointment_time,status,doctor_notes,patient_email,doctor_id")
          .eq("id", bookingId).single();
        bk = data as Booking | null;
      }
      if (!bk) {
        const { data } = await supabase.from("bookings")
          .select("id,appointment_date,appointment_time,status,doctor_notes,patient_email,doctor_id")
          .eq("meeting_link", roomName).single();
        bk = data as Booking | null;
      }

      if (!bk) { setError("Booking not found."); setLoading(false); return; }
      if (roleParam === "patient" && !isJoinable(bk, "patient")) {
        setError(`Session not yet open. Appointment: ${bk.appointment_date} at ${bk.appointment_time}`);
        setLoading(false); return;
      }

      setBooking(bk);
      if (bk.doctor_notes) setNotes(bk.doctor_notes);

      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(uname)}`);
      if (!res.ok) { setError("Failed to get video token."); setLoading(false); return; }
      const { token: t } = await res.json();
      setToken(t);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, roomName, roleParam]);

  async function saveNotes() {
    if (!booking) return;
    setSavingNote(true);
    const { error: err } = await supabase.from("bookings").update({ doctor_notes: notes }).eq("id", booking.id);
    if (err) toast.error("Failed to save notes."); else toast.success("Notes saved.");
    setSavingNote(false);
  }

  async function savePrescription() {
    if (!booking || !rx.trim()) { toast.error("Write a prescription first."); return; }
    setSavingRx(true);
    try {
      const { error: err } = await supabase.from("prescriptions").insert({ booking_id: booking.id, doctor_note: rx });
      if (err) throw err;
      await supabase.from("bookings").update({ status: "completed" }).eq("id", booking.id);
      toast.success("Prescription saved & sent to patient!");
      setRx("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally { setSavingRx(false); }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
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
        <Button onClick={() => router.back()} variant="outline" className="border-gray-600 text-gray-300">← Go Back</Button>
      </div>
    </div>
  );

  if (!token) return null;

  // ─── Panel toggle button helper ────────────────────────────────────────────
  function PanelBtn({ id, label, icon: Icon, activeColor }: { id: Panel; label: string; icon: React.ElementType; activeColor: string }) {
    const active = panel === id;
    return (
      <button
        onClick={() => setPanel(active ? null : id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          active ? `${activeColor} text-white shadow` : "bg-black/40 backdrop-blur text-gray-300 hover:text-white"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">

      {/* ── Top bar (mobile-first) ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-950/80 backdrop-blur border-b border-gray-800 z-20 gap-2 shrink-0">
        {/* Left: LIVE badge + time */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">LIVE</span>
          <span className="text-gray-400 text-xs truncate hidden sm:block">
            {booking?.appointment_date} · {booking?.appointment_time}
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PanelBtn id="chat" label="Chat" icon={MessageSquare} activeColor="bg-emerald-600" />
          {roleParam === "doctor" && (
            <>
              <PanelBtn id="notes" label="Notes" icon={PenLine} activeColor="bg-blue-600" />
              <PanelBtn id="prescription" label="Rx" icon={FileText} activeColor="bg-purple-600" />
            </>
          )}
          <button
            onClick={() => setLeaving(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/80 text-white hover:bg-red-600 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* ── Main area: video + optional side panel ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Video room */}
        <div className={`flex-1 min-w-0 flex flex-col ${panel ? "hidden sm:flex" : "flex"}`}>
          <LiveKitRoom token={token} serverUrl={livekitUrl} video audio
            data-lk-theme="default" style={{ height: "100%" }}>
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

        {/* Side panel — on desktop: right column; on mobile: full screen */}
        {panel && (
          <div className="
            w-full sm:w-80 sm:shrink-0
            flex flex-col
            border-t sm:border-t-0 sm:border-l border-gray-800
            bg-gray-900
            overflow-hidden
          ">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
              <h3 className="font-bold text-white text-sm">
                {panel === "chat" ? "Session Chat" : panel === "notes" ? "Private Notes" : "Prescription"}
              </h3>
              <div className="flex items-center gap-2">
                {/* On mobile: show a "back to video" button */}
                <button
                  className="sm:hidden flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                  onClick={() => setPanel(null)}
                >
                  <ChevronUp className="w-4 h-4" /> Video
                </button>
                <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat */}
            {panel === "chat" && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">LiveKit built-in chat is visible in the video controls below.</p>
                  <p className="text-gray-500 text-xs mt-1">Use the chat icon in the video toolbar.</p>
                </div>
              </div>
            )}

            {/* Doctor notes */}
            {panel === "notes" && roleParam === "doctor" && (
              <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
                <p className="text-gray-400 text-xs shrink-0">Private notes — only visible to you. Saved to this booking.</p>
                <textarea
                  className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[120px]"
                  placeholder="Clinical observations, symptoms, follow-ups…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={saveNotes} disabled={savingNote} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notes"}
                </Button>
              </div>
            )}

            {/* Prescription */}
            {panel === "prescription" && roleParam === "doctor" && (
              <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
                <p className="text-gray-400 text-xs shrink-0">Saving marks this consultation as completed and notifies the patient.</p>
                <textarea
                  className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl p-3 text-sm resize-none font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[140px]"
                  placeholder={"Rx:\n\nDrug: \nDose: \nFrequency: \nDuration: \n\nNotes: "}
                  value={rx}
                  onChange={(e) => setRx(e.target.value)}
                />
                <Button
                  onClick={savePrescription}
                  disabled={savingRx || !rx.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                >
                  {savingRx
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Send className="w-3.5 h-3.5 mr-1.5" />Save & Send to Patient</>
                  }
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Leave confirmation modal ─── */}
      {leaving && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm text-center">
            <LogOut className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-1">Leave Session?</h2>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to leave the video call?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setLeaving(false)} className="flex-1 border-gray-600 text-gray-300">Stay</Button>
              <Button
                onClick={() => router.push(roleParam === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Leave
              </Button>
            </div>
        </div>
        </div>
      )}
    </div>
  );
}
