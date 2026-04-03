"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, Eye, EyeOff, Loader2, Phone, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface FormState {
  name: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterDoctorPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({
    name: "", phone: "", address: "", email: "", password: "", confirmPassword: "",
  });
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill all required fields.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Email and password required."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account.");

      // 2. Insert doctor profile — role: "doctor"
      const { error: profileError } = await supabase.from("profiles").insert({
        id:      authData.user.id,
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        address: form.address,
        role:    "doctor",
      });
      if (profileError) throw profileError;

      toast.success("Doctor account created! Redirecting to your dashboard…");
      router.push("/doctor/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="brand-gradient p-6 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white font-extrabold text-xl">Join as a Doctor</h1>
          <p className="text-white/70 text-sm mt-1">Yanet General Hospital Telemedicine</p>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-white" : "w-4 bg-white/30"}`} />
            ))}
          </div>
        </div>

        {/* Step 1 — Professional & Personal Info */}
        {step === 1 && (
          <form onSubmit={nextStep} className="p-6 space-y-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Step 1 of 2 — Your Details</p>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-700 font-medium text-sm">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name" placeholder="Dr. Abebe Kebede"
                  value={form.name} onChange={(e) => update("name", e.target.value)}
                  className="h-11 pl-9 border-gray-200 focus-visible:ring-emerald-500" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone" placeholder="+251 911 000 000"
                  value={form.phone} onChange={(e) => update("phone", e.target.value)}
                  className="h-11 pl-9 border-gray-200 focus-visible:ring-emerald-500" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-gray-700 font-medium text-sm">
                Clinic / Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address" placeholder="Bole, Addis Ababa"
                  value={form.address} onChange={(e) => update("address", e.target.value)}
                  className="h-11 pl-9 border-gray-200 focus-visible:ring-emerald-500" required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 brand-gradient-light text-white font-semibold text-base mt-2">
              Continue →
            </Button>

            <p className="text-center text-sm text-gray-500">
              Are you a patient?{" "}
              <Link href="/register" className="text-emerald-700 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </form>
        )}

        {/* Step 2 — Account Credentials */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Step 2 of 2 — Account Setup</p>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email" type="email" placeholder="doctor@example.com"
                value={form.email} onChange={(e) => update("email", e.target.value)}
                className="h-11 border-gray-200 focus-visible:ring-emerald-500" required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password" type={showPw ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password} onChange={(e) => update("password", e.target.value)}
                  className="h-11 border-gray-200 focus-visible:ring-emerald-500 pr-10" required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-gray-700 font-medium text-sm">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm" type="password" placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                className="h-11 border-gray-200 focus-visible:ring-emerald-500" required
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 h-11 border-gray-200" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-[2] h-11 brand-gradient-light text-white font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Doctor Account"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center mt-4 text-xs text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="hover:text-emerald-700 transition-colors font-medium">Sign In</Link>
        {" · "}
        <Link href="/" className="hover:text-emerald-700 transition-colors">← Back to Yanet Hospital</Link>
      </p>
    </motion.div>
  );
}
