import { parseCSV } from '../utils/csvParser.js';
import { parseExcel } from '../utils/excelParser.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
import path from 'path';
import fs from 'fs';

export const uploadCSV = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, `Uploading file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData;
    
    // Parse based on file type
    if (fileExtension === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      parsedData = await parseExcel(filePath);
      // Delete Excel file after parsing
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    } else {
      throw new AppError('Unsupported file format', 400);
    }

    const duration = Date.now() - startTime;
    logRequest(req, `File parsed successfully in ${duration}ms - ${parsedData.length} records`);

    res.status(200).json({
      success: true,
      message: `File uploaded and parsed successfully`,
      data: parsedData,
      count: parsedData.length,
      processingTime: `${duration}ms`,
      fileType: fileExtension
    });
  } catch (error) {
    logError(error, 'Upload File');
    next(error);
  }
};
