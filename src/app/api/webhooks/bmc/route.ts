import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BMC_WEBHOOK_SECRET = process.env.BMC_WEBHOOK_SECRET || '93be84e5f3103677811c066a5fba247d7a7430f3772445e7f769d1d247b6b0bfaf042910eab3bbfb';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // Verify signature
    const hmac = crypto.createHmac('sha256', BMC_WEBHOOK_SECRET);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.error('BMC Webhook Signature mismatch.', { signature, expectedSignature });
      // In development or if BMC sends a different format, we might want to still process if it's a valid JSON.
      // But for security, we reject.
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('BMC Webhook received:', event);

    // Look for membership.started, membership_started, or subscription.created
    const eventType = event.type || event.event;
    if (eventType && (eventType.includes('membership') || eventType.includes('started') || eventType.includes('subscription'))) {
      const email = event.data?.supporter_email || event.data?.email || event.data?.payer_email;

      if (email) {
        // Upgrade the user to exclusive
        await db.update(users)
          .set({ isExclusive: true })
          .where(eq(users.email, email));
        
        console.log(`Successfully upgraded user ${email} to Exclusive Membership!`);
      } else {
        console.warn('BMC Webhook: No email found in payload', event.data);
      }
    } else {
      console.log('BMC Webhook: Ignored event type', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BMC Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
