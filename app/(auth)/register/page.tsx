"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface FormState {
  fullName: string;
  phone: string;
  address: string;
  age: string;
  email: string;
  password: string;
  fingerprint: File | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    address: "",
    age: "",
    email: "",
    password: "",
    fingerprint: null,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  function update(field: keyof FormState, value: string | File | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.age) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) {
      toast.error("Please enter a valid age.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account.");

      const userId = authData.user.id;

      // 2. Handle fingerprint upload (MVP — store as base64 in profile)
      let fingerprintData: string | null = null;
      if (form.fingerprint) {
        const reader = new FileReader();
        fingerprintData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(form.fingerprint!);
        });
      }

      // 3. Insert patient profile — matches actual schema: name, email, role, phone, address, age
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        age: parseInt(form.age),
        role: "patient",
        fingerprint_data: fingerprintData,
      });
      if (profileError) throw profileError;

      toast.success("Account created! Redirecting to your dashboard…");
      router.push("/patient/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
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
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white font-extrabold text-xl">Create Account</h1>
          <p className="text-white/70 text-sm mt-1">
            Join Yanet General Hospital Telemedicine
          </p>
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-white" : "w-4 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <form onSubmit={nextStep} className="p-6 space-y-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Step 1 of 2 — Personal Details
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Abebe Kebede"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="h-11 border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+251 911 000 000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="h-11 border-gray-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-gray-700 font-medium text-sm">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  className="h-11 border-gray-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-gray-700 font-medium text-sm">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                placeholder="Bole, Addis Ababa"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="h-11 border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>

            {/* Fingerprint upload — MVP */}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium text-sm">
                Fingerprint Image{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <label
                htmlFor="fingerprint"
                className="flex items-center gap-3 h-11 px-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 truncate">
                  {form.fingerprint ? form.fingerprint.name : "Upload fingerprint image"}
                </span>
              </label>
              <input
                id="fingerprint"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => update("fingerprint", e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 brand-gradient-light text-white font-semibold text-base"
            >
              Continue →
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already registered?{" "}
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}

        {/* Step 2 — Account Credentials */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Step 2 of 2 — Account Setup
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="h-11 border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-gray-700 font-medium text-sm">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="h-11 border-gray-200 focus-visible:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 border-gray-200"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-[2] h-11 brand-gradient-light text-white font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center mt-4 text-xs text-gray-400">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          ← Back to Yanet Hospital
        </Link>
      </p>
    </motion.div>
  );
}
