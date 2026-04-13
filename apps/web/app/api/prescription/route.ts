import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { bookingId, note, patientEmail, patientName } = await req.json();
    const supabase = await createClient();

    // 1. Save to database
    const { error: dbError } = await supabase
      .from('prescriptions')
      .insert([
        {
          booking_id: bookingId,
          doctor_note: note,
        }
      ]);

    if (dbError) throw dbError;

    // 2. Mark booking as completed
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);

    // 3. Send Email to Patient
    const prescriptionLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/prescription/${bookingId}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patientEmail,
        subject: 'Liyana Telemedicine - Your Prescription is Ready',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Your Consultation is Complete ✅</h2>
            <p>Hi <strong>${patientName}</strong>,</p>
            <p>Your doctor has written your prescription and medical advice.</p>
            <p>Click the button below to view it securely:</p>
            <a href="${prescriptionLink}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">View Prescription</a>
            <p style="color: #64748b; font-size: 14px;">Thank you for using Liyana Health Care.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Prescription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}