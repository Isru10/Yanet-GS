"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Video,
  Calendar,
  FileText,
  Star,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ArrowRight,
  Shield,
  Clock,
  Users,
  ChevronDown,
  Stethoscope,
  Activity,
  Brain,
  Baby,
  Eye,
  Bone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Data ────────────────────────────────────────────────────────────────────

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Aisha Mehdi",
    specialty: "General Medicine",
    rating: 4.9,
    reviews: 142,
    experience: 12,
    languages: "English, Amharic",
    avatar: "AM",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 2,
    name: "Dr. Solomon Bekele",
    specialty: "Internal Medicine",
    rating: 4.8,
    reviews: 98,
    experience: 9,
    languages: "English, Amharic, Oromo",
    avatar: "SB",
    color: "from-green-600 to-emerald-700",
  },
  {
    id: 3,
    name: "Dr. Fatuma Jibril",
    specialty: "Pediatrics",
    rating: 4.9,
    reviews: 204,
    experience: 15,
    languages: "English, Amharic, Somali",
    avatar: "FJ",
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: 4,
    name: "Dr. Yohannes Tesfaye",
    specialty: "Neurology",
    rating: 4.7,
    reviews: 67,
    experience: 11,
    languages: "English, Amharic",
    avatar: "YT",
    color: "from-emerald-700 to-green-900",
  },
];

const SERVICES = [
  {
    icon: Stethoscope,
    title: "General Consultation",
    desc: "Talk to a certified physician about any health concern from the comfort of your home.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Activity,
    title: "Chronic Disease Management",
    desc: "Ongoing care plans for diabetes, hypertension, and other long-term conditions.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Brain,
    title: "Mental Health",
    desc: "Private, confidential sessions with qualified mental health professionals.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Baby,
    title: "Pediatric Care",
    desc: "Expert child health consultations for newborns through adolescents.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    icon: Eye,
    title: "Specialist Referrals",
    desc: "Your doctor can issue referrals and share records securely.",
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    icon: Bone,
    title: "Follow-Up Care",
    desc: "Quick follow-up appointments with your prescribing physician.",
    color: "text-teal-700",
    bg: "bg-teal-50",
  },
];

const TESTIMONIALS = [
  {
    name: "Mekdes Alemu",
    quote:
      "I booked an appointment in 3 minutes and got my prescription the same day. Yanet saved me a full day of travel to the hospital.",
    role: "Patient, Addis Ababa",
    rating: 5,
    avatar: "MA",
  },
  {
    name: "Dawit Haile",
    quote:
      "The video call quality was great. The doctor was professional and the whole experience felt just like being in the clinic.",
    role: "Patient, Hawassa",
    rating: 5,
    avatar: "DH",
  },
  {
    name: "Senait Girma",
    quote:
      "As a mother of two, Yanet is a lifesaver. Pediatric consultations without having to take the kids out when they're sick.",
    role: "Patient, Dire Dawa",
    rating: 5,
    avatar: "SG",
  },
];

const STATS = [
  { value: "5,000+", label: "Patients Served" },
  { value: "50+", label: "Expert Doctors" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Availability" },
];

// ─── Animated counter helper ─────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function Avatar({ initials, gradient }: { initials: string; gradient: string }) {
  return (
    <div
      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
    >
      {initials}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 brand-gradient border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Yanet</p>
              <p className="text-white/60 text-[10px] leading-none tracking-wide uppercase">
                General Hospital
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {["About", "Services", "Doctors", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/register-doctor">
              <Button size="sm" variant="outline" className="bg-white text-emerald-800 hover:bg-white/90 font-semibold shadow">
                Join as Doctor
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-white text-emerald-800 hover:bg-white/90 font-semibold shadow">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {["About", "Services", "Doctors", "Testimonials"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-white/80 hover:text-white py-1.5 text-sm font-medium"
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-2 flex flex-col gap-2 border-t border-white/10">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register-doctor" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10">
                      🩺 Register as Doctor
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-white text-emerald-800 hover:bg-white/90 font-semibold">
                      Get Started as Patient
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden brand-gradient">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 -left-10 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/20">
              🏥 Yanet General Hospital — Now Online
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              {/* Your Doctor, */}
              Advanced Medical
              <br />
              <span className="text-white/70">
              {/* Anywhere You Are. */}
              Care You Can Trust
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {/* Book an appointment with certified specialists, make a secure
              payment, and join a high-definition video consultation — all without
              leaving home. */}
                              Connect with Yanet Hospital top specialists from your home. Secure video consultations, instant e-prescriptions, and zero waiting room time.

            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-800 hover:bg-white/90 font-bold text-base px-8 shadow-xl">
                  Book an Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register-doctor">
                <Button size="lg" variant="outline" className="bg-white text-emerald-800 hover:bg-white/90 font-bold text-base px-8 shadow-xl">
                  🩺 Register as Doctor
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center gap-5 justify-center lg:justify-start">
              {[
                { icon: Shield, text: "Secure & Private" },
                { icon: Clock, text: "24/7 Availability" },
                { icon: Users, text: "50+ Specialists" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/70">
                  <Icon className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 w-full max-w-sm"
          >
            <div className="glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Next Available</p>
                  <p className="text-white/60 text-xs">Today at 2:30 PM</p>
                </div>
                <Badge className="ml-auto bg-green-400/20 text-green-300 border-green-400/30 text-xs">
                  Live
                </Badge>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-3">
                {DOCTORS.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 glass-dark rounded-xl p-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-bold text-xs`}>
                      {doc.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{doc.name}</p>
                      <p className="text-white/50 text-[10px]">{doc.specialty}</p>
                    </div>
                    <StarRating rating={Math.floor(doc.rating)} />
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button className="w-full bg-white text-emerald-800 hover:bg-white/90 font-semibold">
                  Book Now →
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 bg-emerald-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-emerald-300 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, label: "Patient-Centered", color: "bg-emerald-100 text-emerald-700" },
                { icon: Shield, label: "HIPAA Compliant", color: "bg-green-100 text-green-700" },
                { icon: Video, label: "HD Video Calls", color: "bg-teal-100 text-teal-700" },
                { icon: FileText, label: "Digital Prescriptions", color: "bg-emerald-100 text-emerald-700" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`${color} p-6 rounded-2xl flex flex-col items-center text-center gap-3`}>
                  <Icon className="w-8 h-8" />
                  <p className="font-semibold text-sm">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              About Yanet
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Bringing Expert Healthcare <br />
              <span className="text-emerald-700">Directly to You</span>
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Yanet General Hospital has served communities across Ethiopia for over
              two decades. Our telemedicine platform extends that commitment — giving
              every patient access to world-class specialists without geographic or
              financial barriers.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              From real-time video consultations and digital prescriptions to secure
              file sharing and 24/7 appointment availability, we've reimagined what
              it means to see your doctor.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button className="brand-gradient-light text-white font-semibold px-6">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Comprehensive Care, Online
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              From quick consultations to specialist referrals, our platform covers
              every aspect of your healthcare journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`${service.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <service.icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              See a Doctor in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Calendar,
                title: "Book an Appointment",
                desc: 'Register, choose a doctor, and pick a time slot that works for you. Hit "Pay Now" to confirm.',
              },
              {
                step: "02",
                icon: Video,
                title: "Join the Video Call",
                desc: "At your appointment time, click 'Join Session' and connect instantly with your doctor via HD video.",
              },
              {
                step: "03",
                icon: FileText,
                title: "Get Your Prescription",
                desc: "Your doctor writes and sends your prescription digitally. View it anytime from your dashboard.",
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section id="doctors" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Our Doctors
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Meet Our Specialists
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Board-certified physicians with years of clinical and telemedicine
              experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}
                >
                  {doc.avatar}
                </div>
                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                <p className="text-emerald-600 text-sm font-medium mt-0.5">
                  {doc.specialty}
                </p>
                <div className="flex justify-center mt-2 gap-0.5">
                  <StarRating rating={Math.floor(doc.rating)} />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {doc.rating} · {doc.reviews} reviews
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                  <p>{doc.experience} years experience</p>
                  <p>{doc.languages}</p>
                </div>
                <Link href="/register">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Book Appointment
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Patient Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              What Our Patients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <StarRating rating={t.rating} />
                <p className="mt-4 text-gray-700 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Ready to See a Doctor Today?
            </h2>
            <p className="mt-4 text-white/70 text-lg">
              Join thousands of patients already using Yanet Telemedicine. Register
              for free and book your first appointment in minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-800 hover:bg-white/90 font-bold text-base px-10 shadow-xl">
                  Register as Patient
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register-doctor">
                <Button size="lg" variant="outline" className="bg-white text-emerald-800 hover:bg-white/90 font-bold text-base px-10 shadow-xl">
                  🩺 Join as a Doctor
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 font-semibold text-base px-10">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-emerald-950 text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Yanet</p>
                  <p className="text-white/40 text-[10px]">General Hospital</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Bringing Ethiopia&apos;s best healthcare to wherever you are.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                {["Book Appointment", "Find a Doctor", "My Prescriptions", "Patient Login"].map((l) => (
                  <li key={l}>
                    <a href="/register" className="hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                {["General Medicine", "Pediatrics", "Internal Medicine", "Mental Health"].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  Bole Sub-city, Addis Ababa, Ethiopia
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  +251 911 000 000
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  care@yanet.et
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs">
            <p>
              © {new Date().getFullYear()} Yanet General Hospital. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
