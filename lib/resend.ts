import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

interface BookingEmailData {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  screenName: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  partyType: string;
  personsCount: number;
  complementaryList: string;
  totalAmount: number;
}

export function generateEmailHTML(data: BookingEmailData): string {
  const partyLabels: Record<string, string> = {
    couple: 'Couple',
    group_small: 'Small Group',
    group_large: 'Large Group',
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#12121A;border:1px solid #1E1E2E;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#12121A,#1a1a2e);padding:40px;text-align:center;border-bottom:1px solid #D4AF37;">
        <div style="font-size:48px;margin-bottom:8px;">🎬</div>
        <h1 style="color:#D4AF37;margin:0;font-size:32px;letter-spacing:2px;">NV THEATRE</h1>
        <p style="color:#A0AEC0;margin:8px 0 0;font-size:14px;letter-spacing:1px;">LUXURY PRIVATE CINEMA EXPERIENCE</p>
      </div>
      <!-- Confirmation Banner -->
      <div style="background:linear-gradient(90deg,#38A169,#2F855A);padding:16px;text-align:center;">
        <p style="color:white;margin:0;font-size:18px;font-weight:bold;">✅ Booking Confirmed!</p>
      </div>
      <!-- Content -->
      <div style="padding:32px;">
        <p style="color:#F7FAFC;font-size:16px;margin-bottom:24px;">Dear <strong style="color:#D4AF37;">${data.customerName}</strong>,</p>
        <p style="color:#A0AEC0;margin-bottom:24px;">Your private theatre session has been confirmed. Here are your booking details:</p>
        
        <!-- Booking Details Card -->
        <div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:12px;padding:24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;width:45%;">🔖 Booking Ref</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#D4AF37;font-weight:bold;font-size:18px;">${data.bookingRef}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">📅 Date</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${data.bookingDate}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">🎬 Screen</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${data.screenName}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">⏰ Time</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${data.startTime} – ${data.endTime}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">⏱ Duration</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${data.totalHours} Hour${data.totalHours > 1 ? 's' : ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">👥 Party</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${partyLabels[data.partyType] || data.partyType} (${data.personsCount} persons)</td></tr>
            ${data.complementaryList ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#A0AEC0;">🎁 Complimentary</td><td style="padding:10px 0;border-bottom:1px solid #1E1E2E;color:#F7FAFC;">${data.complementaryList}</td></tr>` : ''}
            <tr><td style="padding:10px 0;color:#A0AEC0;">💰 Amount Paid</td><td style="padding:10px 0;color:#38A169;font-weight:bold;font-size:20px;">₹${data.totalAmount.toLocaleString('en-IN')}</td></tr>
          </table>
        </div>

        <!-- Instructions -->
        <div style="background:linear-gradient(135deg,#1a1a2e,#12121A);border:1px solid #D4AF3740;border-radius:12px;padding:20px;text-align:center;">
          <p style="color:#D4AF37;margin:0 0 8px;font-size:14px;font-weight:bold;">📋 IMPORTANT INSTRUCTIONS</p>
          <p style="color:#A0AEC0;margin:0;font-size:13px;line-height:1.6;">Please arrive <strong style="color:#F7FAFC;">10 minutes before</strong> your slot.<br>Show this email or your booking reference at the counter.</p>
        </div>
      </div>
      <!-- Footer -->
      <div style="background:#0A0A0F;padding:24px;text-align:center;border-top:1px solid #1E1E2E;">
        <p style="color:#D4AF37;margin:0 0 8px;font-size:16px;">📍 NV Theatre</p>
        <p style="color:#A0AEC0;margin:0;font-size:12px;">This is an automated booking confirmation. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  if (!data.customerEmail) return { success: false, error: 'No email provided' };

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'NV Theatre <bookings@nvtheatre.in>',
      to: data.customerEmail,
      subject: `🎬 NV Theatre Booking Confirmed — #${data.bookingRef}`,
      html: generateEmailHTML(data),
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
