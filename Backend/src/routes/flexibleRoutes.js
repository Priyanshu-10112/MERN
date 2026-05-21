import express from 'express';
import multer from 'multer';
import { flexibleAnalyze, getExcelStructure } from '../controllers/flexibleAnalyzeController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route   POST /api/flexible/structure
 * @desc    Get Excel/CSV file structure (headers, columns, preview)
 * @access  Public
 */
router.post('/structure', upload.single('file'), getExcelStructure);

/**
 * @route   POST /api/flexible/analyze
 * @desc    Flexible analysis with user-specified columns/rows
 * @access  Public
 * @body    {
 *            file: File,
 *            columnMapping: JSON string (optional) - e.g., {"teamName": "Team Name", "score": "Score"},
 *            analyzeType: string (optional) - "summary" | "ai-evaluation" | "column-analysis",
 *            rowRange: JSON string (optional) - e.g., {"startRow": 1, "endRow": 10, "columns": [0, 2, 4]}
 *          }
 */
router.post('/analyze', upload.single('file'), flexibleAnalyze);

export default router;
