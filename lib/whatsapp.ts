export interface WhatsAppBookingData {
  customerName: string;
  customerMobile: string;
  bookingDate: string;
  screenName: string;
  timeRange: string;
  partyTypeLabel: string;
  totalAmount: number;
  bookingRef: string;
}

export async function sendWhatsAppNotification(data: WhatsAppBookingData) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'nv_theatre_booking_confirm';

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp env vars not configured');
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${data.customerMobile}`,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: data.customerName },
                { type: 'text', text: data.bookingDate },
                { type: 'text', text: data.screenName },
                { type: 'text', text: data.timeRange },
                { type: 'text', text: data.partyTypeLabel },
                { type: 'text', text: String(data.totalAmount) },
                { type: 'text', text: data.bookingRef },
              ],
            }],
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }
    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error };
  }
}
