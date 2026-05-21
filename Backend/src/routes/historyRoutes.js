import express from 'express';
import { getUploadHistory, getAnalysisById, getChatHistory } from '../controllers/historyController.js';

const router = express.Router();

// GET /api/history/uploads - Get all uploads
router.get('/uploads', getUploadHistory);

// GET /api/history/analysis/:id - Get specific analysis
router.get('/analysis/:id', getAnalysisById);

// GET /api/history/chat/:uploadId - Get chat history for upload
router.get('/chat/:uploadId', getChatHistory);

export default router;
