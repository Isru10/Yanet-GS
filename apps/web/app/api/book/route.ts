// import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';

// import nodemailer from 'nodemailer';


// export async function POST(req: Request) {
//   try {
//     const { patientName, patientEmail, doctorId, availabilityId, date, time } = await req.json();
//     const supabase = await createClient();

//     const meetingRoomId = `Liyana_${Date.now()}`;
//     // The link points to our new page, passing the patient's name
//     const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/consultation/${meetingRoomId}?name=${encodeURIComponent(patientName)}`;


    
//     // 2. Save booking to database
//     const { data: booking, error: bookingError } = await supabase
//       .from('bookings')
//       .insert([
//         {
//           patient_name: patientName,
//           patient_email: patientEmail,
//           doctor_id: doctorId,
//           availability_id: availabilityId,
//           appointment_date: date,
//           appointment_time: time,
//           status: 'scheduled',
//           meeting_link: meetingLink
//         }
//       ])
//       .select()
//       .single();

//     if (bookingError) throw bookingError;

//     // 3. Mark the doctor's time slot as booked
//     await supabase
//       .from('availabilities')
//       .update({ is_booked: true })
//       .eq('id', availabilityId);

//     // 4. Send Email Notification using Nodemailer
//     if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: patientEmail,
//         subject: 'Liyana Telemedicine - Appointment Confirmed',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #2563eb;">Appointment Confirmed! ✅</h2>
//             <p>Hi <strong>${patientName}</strong>,</p>
//             <p>Your telemedicine appointment is successfully scheduled.</p>
//             <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
//               <p>📅 <strong>Date:</strong> ${date}</p>
//               <p>⏰ <strong>Time:</strong> ${time}</p>
//             </div>
//             <p>At the time of your appointment, click the button below to join the video call with your doctor:</p>
//             <a href="${meetingLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Video Consultation</a>
//             <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Thank you,<br/>Liyana Health Care Team</p>
//           </div>
//         `,
//       };

//       await transporter.sendMail(mailOptions);
//     }

//     return NextResponse.json({ success: true, booking });
//   } catch (error: any) {
//     console.error("Booking Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }





import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { patientName, patientEmail, doctorId, availabilityId, date, time } = await req.json();
    const supabase = await createClient();

    // 1. Generate our internal LiveKit Room ID
    const meetingRoomId = `Yanet_${Date.now()}`;
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/consultation/${meetingRoomId}?name=${encodeURIComponent(patientName)}`;

    // 2. Save booking to database (Default status is unpaid)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          patient_name: patientName,
          patient_email: patientEmail,
          doctor_id: doctorId,
          availability_id: availabilityId,
          appointment_date: date,
          appointment_time: time,
          status: 'scheduled',
          payment_status: 'unpaid',
          meeting_link: meetingLink
        }
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Mark the doctor's time slot as booked
    await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availabilityId);

    // NO EMAIL SENT HERE ANYMORE!

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}