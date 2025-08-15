import { Router } from 'express';
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/stripeController';

const router = Router();

// This route is protected; only logged-in users can create a session
router.post('/create-checkout-session', protect, createCheckoutSession);

// The webhook route must NOT be protected and needs raw body parser
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;