import { parseCSV } from '../utils/csvParser.js';
import { parseExcel } from '../utils/excelParser.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
import Upload from '../models/Upload.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export const uploadCSV = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, `Uploading file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData;
    let headers = [];
    
    // Parse based on file type
    if (fileExtension === '.csv') {
      parsedData = await parseCSV(filePath);
      if (parsedData.length > 0) {
        headers = Object.keys(parsedData[0]);
      }
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const result = await parseExcel(filePath);
      parsedData = result.data || parsedData;
      headers = result.headers || [];
      
      // Delete Excel file after parsing
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    } else {
      throw new AppError('Unsupported file format', 400);
    }

    // Save to MongoDB if connected
    let uploadRecord = null;
    if (mongoose.connection.readyState === 1) {
      try {
        uploadRecord = await Upload.create({
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: fileExtension.replace('.', ''),
          rowCount: parsedData.length,
          columnCount: headers.length,
          columns: headers
        });
      } catch (dbError) {
        console.log('DB save skipped:', dbError.message);
      }
    }

    const duration = Date.now() - startTime;
    logRequest(req, `File parsed successfully in ${duration}ms - ${parsedData.length} records`);

    res.status(200).json({
      success: true,
      message: `File uploaded and parsed successfully`,
      uploadId: uploadRecord?._id,
      data: parsedData,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: fileExtension,
        rowCount: parsedData.length,
        columnCount: headers.length,
        columns: headers,
        processingTime: `${duration}ms`
      }
    });
  } catch (error) {
    logError(error, 'Upload File');
    next(error);
  }
};
