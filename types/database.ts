// ───────────────────────────────────────────────────────────────
//  Yanet General Hospital — Telemedicine DB Types
// ───────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

export interface Profile {
  id: string; // matches auth.users.id
  full_name: string;
  phone: string;
  address: string;
  age: number;
  role: UserRole;
  fingerprint_data?: string; // base64 upload for MVP
  avatar_url?: string;
  created_at: string;
}

export interface Doctor {
  id: string; // matches profiles.id
  specialty: string;
  qualifications: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  average_rating: number;
  review_count: number;
  languages: string; // comma-separated
  profile?: Profile;
}

export interface TimeSlot {
  id: string;
  doctor_id: string;
  start_time: string; // ISO datetime
  duration_minutes: number;
  is_booked: boolean;
  created_at: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  amount_paid: number;
  meeting_room_id: string; // LiveKit room name
  notes?: string;
  created_at: string;
  // joined from relations
  patient?: Profile;
  doctor?: Doctor;
  slot?: TimeSlot;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  content: string; // rich text / markdown
  attachment_url?: string;
  created_at: string;
  // joined
  doctor?: Profile;
}

export interface PatientFile {
  id: string;
  patient_id: string;
  appointment_id?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  sent_to_doctor: boolean;
  uploaded_at: string;
}

export interface DoctorNote {
  id: string;
  appointment_id: string;
  doctor_id: string;
  content: string;
  attachment_url?: string;
  created_at: string;
}

// ── Dashboard summary shapes ──────────────────────────────────

export interface PatientDashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  totalAmountPaid: number;
  pendingPrescriptions: number;
}

export interface DoctorDashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  totalEarnings: number;
  completedAppointments: number;
}
