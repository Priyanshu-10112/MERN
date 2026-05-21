import express from 'express';
import { chat } from '../controllers/chatController.js';
import { chatValidationRules, validate } from '../middleware/requestValidator.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/chat - Chat with AI assistant
router.post('/', aiLimiter, chatValidationRules, validate, chat);

export default router;
