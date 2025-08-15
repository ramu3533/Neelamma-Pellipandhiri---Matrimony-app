import { Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// --- THE DEFINITIVE FIX FOR THE API VERSION ERROR ---

// 1. First, ensure the Stripe secret key is actually present in your .env file.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables.");
}

// 2. Explicitly define the configuration object with Stripe's own type.
const stripeConfig: Stripe.StripeConfig = {
  apiVersion: '2025-07-30.basil',
  typescript: true, // Recommended for TypeScript projects
};

// 3. Initialize Stripe with the validated key and the typed config object.
const stripe = new Stripe(stripeSecretKey, stripeConfig);


// --- THE REST OF THE CONTROLLER REMAINS THE SAME ---

// Create a Stripe Checkout Session for the premium subscription
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Neelamma Pellipandhiri - Premium Membership',
              description: 'Unlock unlimited profile views and interactions.',
            },
            unit_amount: 200 * 100, // 200 INR in paise/cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment_success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/profiles?payment_cancelled=true`,
      metadata: {
        userId: String(userId),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res.status(500).json({ message: 'Failed to create payment session.' });
  }
};

// Handle the Stripe Webhook to confirm payment and update user status
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      try {
        // Update the user in the database to be a premium member and reset their view count
        await pool.query(
          'UPDATE users SET is_premium = TRUE, profile_views_count = 0 WHERE user_id = $1',
          [userId]
        );
        console.log(`User ${userId} has successfully subscribed to premium.`);
      } catch (dbError) {
        console.error("Database update failed after webhook:", dbError);
        // Important for production: You should have a system to retry this or log it for manual intervention
      }
    }
  }

  res.json({ received: true });
};