import express from 'express';
import { upload } from '../middleware/fileValidation.js';
import { uploadCSV } from '../controllers/uploadController.js';
import { validateFile } from '../middleware/requestValidator.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/upload - Upload and parse CSV
router.post('/', uploadLimiter, upload.single('file'), validateFile, uploadCSV);

export default router;
