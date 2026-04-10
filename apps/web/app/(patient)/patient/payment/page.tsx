"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, Banknote, Smartphone, Building2, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

type PayMethod = "card" | "mobile" | "bank";

// Inner component that uses useSearchParams — must be wrapped in <Suspense>
function PaymentInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  const bookingId  = params.get("bookingId") ?? "";
  const doctorName = params.get("doctor") ?? "Doctor";

  const [method,  setMethod]  = useState<PayMethod>("card");
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) { toast.error("Invalid payment link."); router.push("/patient/book"); }
  }, [bookingId, router]);

  async function handlePay() {
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const { error } = await supabase
        .from("bookings").update({ payment_status: "paid" }).eq("id", bookingId);
      if (error) throw error;
      setSuccess(true);
      toast.success("Payment successful!");
      setTimeout(() => router.push("/patient/dashboard"), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Payment Confirmed!</h1>
        <p className="text-gray-500 text-sm mt-2">
          Your appointment with <strong>{doctorName}</strong> is confirmed.
        </p>
        <p className="mt-6 text-xs text-gray-400">Redirecting to your dashboard…</p>
      </motion.div>
    </div>
  );

  const METHODS = [
    { id: "card"   as PayMethod, label: "Credit / Debit Card", icon: CreditCard,  desc: "Visa, Mastercard" },
    { id: "mobile" as PayMethod, label: "Mobile Money",        icon: Smartphone,  desc: "Telebirr, M-PESA" },
    { id: "bank"   as PayMethod, label: "Bank Transfer",       icon: Building2,   desc: "Direct bank transfer" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-3">Secure Checkout</Badge>
          <h1 className="text-2xl font-extrabold text-gray-900">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-1">Appointment with <strong>{doctorName}</strong></p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Banknote className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="font-bold text-gray-900">1 session</p>
          </div>
          <p className="text-emerald-700 font-bold">ETB —</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">Payment Method</p>
          {METHODS.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => setMethod(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${method === id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${method === id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm font-medium ${method === id ? "text-emerald-800" : "text-gray-800"}`}>{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${method === id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`} />
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs"><strong>Demo Mode:</strong> No real transaction will occur.</p>
        </div>

        <Button onClick={handlePay} disabled={paying} className="w-full h-12 brand-gradient-light text-white font-bold text-base shadow-lg">
          {paying ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processing…</> : <><Lock className="w-4 h-4 mr-2" />Confirm Payment</>}
        </Button>
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Secured · Powered by Yanet Hospital
        </p>
      </motion.div>
    </div>
  );
}

// Next.js requires useSearchParams() to be inside a <Suspense> boundary for static builds
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <PaymentInner />
    </Suspense>
  );
}
