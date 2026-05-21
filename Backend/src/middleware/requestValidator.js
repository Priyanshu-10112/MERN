import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new AppError(errorMessages, 400);
  }
  next();
};

// Chat validation rules
export const chatValidationRules = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Question must be between 3 and 500 characters'),
  body('includeContext')
    .optional()
    .isBoolean()
    .withMessage('includeContext must be a boolean')
];

// File validation helper
export const validateFile = (req, res, next) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['csv', 'xls', 'xlsx'];

  if (!allowedMimeTypes.includes(req.file.mimetype) && !allowedExtensions.includes(fileExtension)) {
    throw new AppError('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed', 400);
  }

  if (req.file.size > 10 * 1024 * 1024) {
    throw new AppError('File size must be less than 10MB', 400);
  }

  next();
};
