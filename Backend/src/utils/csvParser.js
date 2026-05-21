import fs from 'fs';
import csv from 'csv-parser';
import { AppError } from '../middleware/errorHandler.js';

export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const requiredFields = ['Team Name', 'Project Title', 'Update', 'Completion %', 'Date'];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate required fields
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          reject(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
          return;
        }

        // Clean and normalize data
        const cleanedData = {
          teamName: data['Team Name']?.trim(),
          projectTitle: data['Project Title']?.trim(),
          update: data['Update']?.trim(),
          completion: parseFloat(data['Completion %']) || 0,
          date: new Date(data['Date'])
        };

        // Validate data types
        if (isNaN(cleanedData.completion)) {
          reject(new AppError('Invalid completion percentage', 400));
          return;
        }

        if (isNaN(cleanedData.date.getTime())) {
          reject(new AppError('Invalid date format', 400));
          return;
        }

        results.push(cleanedData);
      })
      .on('end', () => {
        // Delete the file after parsing
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        resolve(results);
      })
      .on('error', (error) => {
        reject(new AppError(`CSV parsing error: ${error.message}`, 400));
      });
  });
};
