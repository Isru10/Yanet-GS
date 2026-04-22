# Yanet GS

Yanet GS is a telehealth platform that enables patients and doctors to connect through appointment booking, real time video consultation, and prescription management.

---

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS  
- **Backend:** Next.js API routes  
- **Database & Auth:** Supabase  
- **Video:** LiveKit  
- **Email:** Nodemailer  

---

## Features

- **Authentication**
  - Supabase based login and registration  
  - Role based access (doctor or patient)  

- **Booking System**
  - Patients book available doctor slots  
  - Each booking generates a unique meeting link  
  - Tracks status and payment  

- **Video Consultation**
  - Secure LiveKit rooms per session  
  - Token generated from server  
  - Real time audio and video  

- **Prescriptions**
  - Doctors add notes after consultation  
  - Stored in database and linked to booking  

- **Email Notifications (optional)**
  - Booking confirmation  
  - Payment confirmation  
  - Prescription delivery  

---

## API Endpoints

- `GET /api/livekit/token`  
  Generates a LiveKit token for joining a video room  

- `GET /api/auth/role`  
  Returns the current user role  

- `POST /api/book`  
  Creates a new booking and meeting link  

- `POST /api/payment/success`  
  Marks a booking as paid  

- `POST /api/prescription`  
  Saves prescription and completes consultation  

---

## Flow

1. User registers and logs in  
2. Role determines dashboard (doctor or patient)  
3. Patient books an appointment  
4. System generates meeting link  
5. Payment updates booking status  
6. Both join video session  
7. Doctor submits prescription  


---

## Notes

- Supabase manages authentication and database  
- handles real time communication  
- Next.js API routes handle server side logic  