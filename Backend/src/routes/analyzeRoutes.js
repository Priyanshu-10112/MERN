import express from 'express';
import { upload } from '../middleware/fileValidation.js';
import { analyzeData, getAnalysisHistory } from '../controllers/analyzeController.js';
import { validateFile } from '../middleware/requestValidator.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/analyze - Analyze CSV data with AI
router.post('/', aiLimiter, upload.single('file'), validateFile, analyzeData);

// GET /api/analyze/history - Get analysis history
router.get('/history', getAnalysisHistory);

export default router;
