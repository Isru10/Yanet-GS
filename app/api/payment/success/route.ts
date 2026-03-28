import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();
    const supabase = await createClient();

    // 1. Update Booking to PAID and fetch the details
    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError || !booking) throw updateError;

    // 2. NOW we send the Email Notification with the link
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
        to: booking.patient_email,
        subject: 'Yanet General Hospital - Payment Received & Appointment Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #15803d; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">Payment Successful! ✅</h2>
            </div>
            <div style="padding: 20px;">
              <p>Hi <strong>${booking.patient_name}</strong>,</p>
              <p>We have received your payment of 500 ETB. Your telemedicine appointment is fully confirmed.</p>
              <div style="background-color: #f0fdf4; padding: 16px; border-left: 4px solid #15803d; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;">📅 <strong>Date:</strong> ${booking.appointment_date}</p>
                <p style="margin: 0;">⏰ <strong>Time:</strong> ${booking.appointment_time}</p>
              </div>
              <p>At the time of your appointment, click the button below to join the secure video call:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${booking.meeting_link}" style="background-color: #15803d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Video Consultation</a>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center;">Thank you for trusting Yanet General Hospital.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment Confirmation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}