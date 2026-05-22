import Razorpay from 'razorpay';

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      `Razorpay env vars missing. RAZORPAY_KEY_ID=${key_id ? 'SET' : 'MISSING'}, RAZORPAY_KEY_SECRET=${key_secret ? 'SET' : 'MISSING'}. Please set them in Vercel Dashboard > Settings > Environment Variables.`
    );
  }

  return new Razorpay({ key_id, key_secret });
}
