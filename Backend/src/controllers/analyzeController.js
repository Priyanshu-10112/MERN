import { parseCSV } from '../utils/csvParser.js';
import { parseExcel } from '../utils/excelParser.js';
import { groupByTeam, calculateTeamSummary, generateSummaryText } from '../utils/dataProcessor.js';
import { evaluateTeam, analyzeFlexibleData } from '../services/aiService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
import Upload from '../models/Upload.js';
import Analysis from '../models/Analysis.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Helper: parse date from various formats
const parseDate = (val) => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    return new Date(excelEpoch.getTime() + (val - 2) * 86400000);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const analyzeData = async (req, res, next) => {
  const startTime = Date.now();

  try {
    logRequest(req, `Starting analysis for file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Get analysis configuration
    let columnMapping = null;
    let analysisType = req.body.analysisType || 'team-evaluation';
    
    if (req.body.columnMapping) {
      try { columnMapping = JSON.parse(req.body.columnMapping); }
      catch (e) { columnMapping = null; }
    }

    // Step 1: Parse file
    let rawData;
    if (fileExtension === '.csv') {
      rawData = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      rawData = await parseExcel(filePath);
      fs.unlink(filePath, (err) => { if (err) console.error('Error deleting file:', err); });
    } else {
      throw new AppError('Unsupported file format', 400);
    }

    let parsedData = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    let headers = rawData?.headers || (parsedData[0] ? Object.keys(parsedData[0]) : []);

    console.log(`Parsed ${parsedData.length} rows. Analysis type: ${analysisType}`);

    let results;
    let uploadRecord = null;

    // Save upload metadata to MongoDB
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
        console.log('Upload DB save skipped:', dbError.message);
      }
    }

    // Step 2: Analyze based on type
    if (analysisType === 'team-evaluation') {
      // Apply column mapping for team evaluation
      if (columnMapping && parsedData.length > 0) {
        parsedData = parsedData.map(row => {
          const get = (userCol) => {
            if (!userCol) return '';
            if (row[userCol] !== undefined) return row[userCol];
            const key = Object.keys(row).find(
              k => k?.toString().toLowerCase().trim() === userCol?.toString().toLowerCase().trim()
            );
            return key ? row[key] : '';
          };

          return {
            teamName:     String(get(columnMapping.teamName)     || '').trim(),
            projectTitle: String(get(columnMapping.projectTitle) || '').trim(),
            update:       String(get(columnMapping.update)       || 'No update').trim(),
            completion:   parseFloat(get(columnMapping.completion)) || 0,
            date:         parseDate(get(columnMapping.date))
          };
        }).filter(row => row.teamName !== '');
      }

      if (!parsedData || parsedData.length === 0) {
        throw new AppError('No valid data found. Please check your column mapping.', 400);
      }

      const groupedData = groupByTeam(parsedData);
      results = {};

      for (const teamData of groupedData) {
        const summary = calculateTeamSummary(teamData);
        const summaryText = generateSummaryText(summary);
        const evaluation = await evaluateTeam({ ...summary, summaryText });

        results[summary.teamName] = {
          grade: evaluation.grade,
          score: evaluation.score,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
          summary: {
            totalUpdates: summary.totalUpdates,
            averageCompletion: summary.averageCompletion,
            lastUpdateDate: summary.lastUpdateDate,
            consistencyScore: summary.consistencyScore
          }
        };
      }
    } else {
      // Flexible AI analysis for any data
      results = await analyzeFlexibleData(parsedData, headers, analysisType);
    }

    // Save analysis to MongoDB
    if (mongoose.connection.readyState === 1 && uploadRecord) {
      try {
        await Analysis.create({
          uploadId: uploadRecord._id,
          analysisType,
          results,
          metadata: {
            processingTime: `${Date.now() - startTime}ms`,
            recordCount: parsedData.length,
            aiModel: 'groq-llama3-8b-8192'
          }
        });
      } catch (dbError) {
        console.log('Analysis DB save skipped:', dbError.message);
      }
    }

    const duration = Date.now() - startTime;
    const teamCount = typeof results === 'object' ? Object.keys(results).length : 1;
    logRequest(req, `Analysis completed in ${duration}ms`);

    res.status(200).json({
      success: true,
      message: 'Analysis completed successfully',
      uploadId: uploadRecord?._id,
      data: results,
      metadata: {
        analysisType,
        totalRecords: parsedData.length,
        processingTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logError(error, 'Analyze Data');
    next(error);
  }
};

export const getAnalysisHistory = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        message: 'Database not connected' 
      });
    }

    const analyses = await Analysis.find()
      .populate('uploadId', 'fileName uploadedAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ 
      success: true, 
      data: analyses,
      count: analyses.length 
    });
  } catch (error) {
    next(error);
  }
};
