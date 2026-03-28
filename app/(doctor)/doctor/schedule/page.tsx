"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Clock, CalendarPlus, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Real schema: availabilities table
// id, doctor_id, available_date (date), time_slot (text), is_booked (boolean)

interface Slot { id: string; available_date: string; time_slot: string; is_booked: boolean; }

export default function SchedulePage() {
  const supabase  = createClient();
  const [slots,     setSlots]     = useState<Slot[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [doctorId,  setDoctorId]  = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ date: "", time_slot: "" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setDoctorId(user.id);
      const { data } = await supabase
        .from("availabilities").select("id,available_date,time_slot,is_booked")
        .eq("doctor_id", user.id).order("available_date").order("time_slot");
      setSlots((data ?? []) as Slot[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function resetForm() { setForm({ date: "", time_slot: "" }); setEditId(null); setShowForm(false); }

  function openEdit(slot: Slot) {
    setForm({ date: slot.available_date, time_slot: slot.time_slot });
    setEditId(slot.id);
    setShowForm(true);
  }

  async function saveSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.time_slot.trim()) { toast.error("Both date and time slot are required."); return; }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("availabilities")
          .update({ available_date: form.date, time_slot: form.time_slot }).eq("id", editId);
        if (error) throw error;
        setSlots((prev) => prev.map((s) => s.id === editId ? { ...s, available_date: form.date, time_slot: form.time_slot } : s));
        toast.success("Slot updated.");
      } else {
        const { data, error } = await supabase.from("availabilities")
          .insert({ doctor_id: doctorId, available_date: form.date, time_slot: form.time_slot, is_booked: false })
          .select().single();
        if (error) throw error;
        setSlots((prev) =>
          [...prev, data as Slot].sort((a, b) => a.available_date.localeCompare(b.available_date) || a.time_slot.localeCompare(b.time_slot))
        );
        toast.success("Slot added.");
      }
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save slot.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(id: string) {
    const { error } = await supabase.from("availabilities").delete().eq("id", id);
    if (error) { toast.error("Failed to delete."); return; }
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast.success("Slot deleted.");
  }

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = slots.filter((s) => s.available_date >= today);
  const past     = slots.filter((s) => s.available_date < today);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage your available appointment slots.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="brand-gradient-light text-white font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Slot
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-emerald-600" />
                {editId ? "Edit Slot" : "New Time Slot"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveSlot} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.date} min={today}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="h-10 border-gray-200 focus-visible:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Time Slot <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1 text-xs">(e.g. &quot;09:00 AM - 09:30 AM&quot;)</span>
                </Label>
                <Input placeholder="09:00 AM - 09:30 AM" value={form.time_slot}
                  onChange={(e) => setForm((p) => ({ ...p, time_slot: e.target.value }))}
                  className="h-10 border-gray-200 focus-visible:ring-emerald-500" required />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={saving} className="brand-gradient-light text-white font-semibold flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Save Changes" : "Create Slot"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="border-gray-200">Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : (
        <>
          <div>
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No upcoming slots. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((slot) => (
                  <div key={slot.id} className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{slot.available_date}</p>
                      <p className="text-gray-500 text-xs">{slot.time_slot}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {slot.is_booked ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Booked
                        </Badge>
                      ) : (
                        <>
                          <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">Available</Badge>
                          <button onClick={() => openEdit(slot)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteSlot(slot.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-400 text-sm uppercase tracking-wide mb-3">Past ({past.length})</h2>
              <div className="space-y-2">
                {past.slice(0, 5).map((slot) => (
                  <div key={slot.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 opacity-60">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-gray-600 text-sm">{slot.available_date} — {slot.time_slot}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
