import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Message from '../models/Message.js';

const router = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

// POST /api/contact — store an enquiry
router.post('/', limiter, async (req, res, next) => {
  try {
    const { name, email, eventType, eventDate, place, message, website } = req.body || {};
    // honeypot: bots fill the hidden "website" field
    if (website) return res.status(201).json({ ok: true });

    const doc = await Message.create({ name, email, eventType, eventDate, place, message });
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors);
      return res.status(400).json({ error: 'Check the highlighted fields', fields });
    }
    next(err);
  }
});

// GET /api/contact — list enquiries (header: x-admin-key)
router.get('/', async (req, res, next) => {
  try {
    if (!process.env.ADMIN_KEY || req.get('x-admin-key') !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

export default router;
