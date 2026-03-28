"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Loader2, AlertCircle, Clock, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Real schema: profiles has id, name, email, role, phone, address
// availabilities: id, doctor_id, available_date (date), time_slot (text), is_booked
// bookings: patient_name, patient_email, doctor_id, availability_id, appointment_date, appointment_time, meeting_link, status, payment_status

interface Doctor { id: string; name: string; email: string; phone: string | null; address: string | null; }
interface Slot   { id: string; available_date: string; time_slot: string; }
type Step = "doctor" | "slot" | "confirm";

export default function BookPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [step,           setStep]           = useState<Step>("doctor");
  const [search,         setSearch]         = useState("");
  const [doctors,        setDoctors]        = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots,          setSlots]          = useState<Slot[]>([]);
  const [selectedSlot,   setSelectedSlot]   = useState<Slot | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [booking,        setBooking]        = useState(false);

  // Load doctors from profiles where role = 'doctor'
  useEffect(() => {
    supabase.from("profiles").select("id,name,email,phone,address").eq("role", "doctor")
      .then(({ data }) => { setDoctors((data ?? []) as Doctor[]); setLoadingDoctors(false); });
  }, [supabase]);

  // Load available slots when doctor selected
  useEffect(() => {
    if (!selectedDoctor) return;
    setLoadingSlots(true);
    setSlots([]); setSelectedSlot(null);
    const today = new Date().toISOString().slice(0, 10);
    supabase.from("availabilities")
      .select("id,available_date,time_slot")
      .eq("doctor_id", selectedDoctor.id)
      .eq("is_booked", false)
      .gte("available_date", today)
      .order("available_date").order("time_slot")
      .then(({ data }) => { setSlots((data ?? []) as Slot[]); setLoadingSlots(false); });
  }, [selectedDoctor, supabase]);

  async function confirmBooking() {
    if (!selectedDoctor || !selectedSlot) return;
    setBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get patient profile for name
      const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      const patientName  = prof?.name ?? "Patient";
      const patientEmail = user.email!;
      const roomId = `Yanet_${Date.now()}`;

      // Create booking (real schema columns)
      const { data: bk, error } = await supabase.from("bookings").insert({
        patient_name:     patientName,
        patient_email:    patientEmail,
        doctor_id:        selectedDoctor.id,
        availability_id:  selectedSlot.id,
        appointment_date: selectedSlot.available_date,
        appointment_time: selectedSlot.time_slot,
        status:           "scheduled",
        payment_status:   "unpaid",
        meeting_link:     roomId,
      }).select("id").single();
      if (error) throw error;

      // Mark slot as booked
      await supabase.from("availabilities").update({ is_booked: true }).eq("id", selectedSlot.id);

      toast.success("Appointment booked! Proceeding to payment…");
      router.push(`/patient/payment?bookingId=${bk.id}&doctor=${encodeURIComponent(selectedDoctor.name)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const stepsOrder: Step[] = ["doctor", "slot", "confirm"];
  const stepsPassed = (current: Step, check: Step) =>
    stepsOrder.indexOf(current) > stepsOrder.indexOf(check);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header + step indicator */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Book an Appointment</h1>
        <div className="flex items-center gap-2 mt-3">
          {stepsOrder.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                step === s ? "bg-emerald-600 text-white" : stepsPassed(step, s) ? "bg-emerald-200 text-emerald-700" : "bg-gray-200 text-gray-500"
              }`}>{i + 1}</div>
              <span className={`text-xs font-medium ${step === s ? "text-emerald-700" : "text-gray-400"}`}>
                {s === "doctor" ? "Choose Doctor" : s === "slot" ? "Pick Time" : "Confirm"}
              </span>
              {i < 2 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Choose doctor ─── */}
        {step === "doctor" && (
          <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search doctors by name…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 border-gray-200 focus-visible:ring-emerald-500" />
            </div>
            {loadingDoctors ? (
              <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No doctors found. Make sure a doctor account exists in your Supabase database.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((doc) => (
                  <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep("slot"); }}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {doc.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{doc.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{doc.email}</p>
                        {doc.address && <p className="text-gray-400 text-xs">{doc.address}</p>}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Step 2: Pick slot ─── */}
        {step === "slot" && (
          <motion.div key="slot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("doctor")} className="text-emerald-700 text-sm hover:underline">← Back</button>
              <div className="h-4 w-px bg-gray-200" />
              <p className="text-sm text-gray-600">Available slots for <strong>{selectedDoctor?.name}</strong></p>
            </div>

            {loadingSlots ? (
              <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
            ) : slots.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No available slots for this doctor yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const sel = selectedSlot?.id === slot.id;
                  return (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border text-left transition-all ${sel ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 bg-white hover:border-emerald-300"}`}>
                      <p className="font-semibold text-gray-900 text-sm">{slot.available_date}</p>
                      <p className="text-emerald-700 font-bold text-lg mt-0.5 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {slot.time_slot}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedSlot && (
              <Button onClick={() => setStep("confirm")} className="w-full h-11 brand-gradient-light text-white font-semibold">
                Continue to Confirm <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </motion.div>
        )}

        {/* ─── Step 3: Confirm ─── */}
        {step === "confirm" && selectedDoctor && selectedSlot && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <button onClick={() => setStep("slot")} className="text-emerald-700 text-sm hover:underline">← Back</button>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <CalendarCheck className="w-6 h-6 text-emerald-600" />
                <h2 className="font-bold text-gray-900 text-lg">Booking Summary</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span className="font-semibold">{selectedDoctor.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{selectedSlot.available_date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{selectedSlot.time_slot}</span></div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Payment</span>
                  <span className="text-emerald-700 font-bold">Due after booking</span>
                </div>
              </div>
            </div>
            <Button onClick={confirmBooking} disabled={booking} className="w-full h-12 brand-gradient-light text-white font-bold text-base">
              {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Proceed to Payment →"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
