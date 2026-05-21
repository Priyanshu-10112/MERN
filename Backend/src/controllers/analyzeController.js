import { parseCSV } from '../utils/csvParser.js';
import { parseExcel } from '../utils/excelParser.js';
import { groupByTeam, calculateTeamSummary, generateSummaryText } from '../utils/dataProcessor.js';
import { evaluateTeam } from '../services/aiService.js';
import mongoose from 'mongoose';
import Team from '../models/Team.js';
import ProjectAnalysis from '../models/ProjectAnalysis.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
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

    // Get column mapping from request body (user-defined)
    let columnMapping = null;
    if (req.body.columnMapping) {
      try { columnMapping = JSON.parse(req.body.columnMapping); }
      catch (e) { columnMapping = null; }
    }

    // Step 1: Always parse as raw/default - NO column mapping at parse stage
    let rawData;
    if (fileExtension === '.csv') {
      rawData = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // parseExcel with no options returns {headers, data:[...]} format
      rawData = await parseExcel(filePath);
      fs.unlink(filePath, (err) => { if (err) console.error('Error deleting file:', err); });
    } else {
      throw new AppError('Unsupported file format', 400);
    }

    // Step 2: Normalize to array
    let parsedData = Array.isArray(rawData) ? rawData : (rawData?.data || []);

    console.log(`Parsed ${parsedData.length} rows. Sample row keys:`, parsedData[0] ? Object.keys(parsedData[0]) : 'none');
    if (columnMapping) console.log('Column mapping:', columnMapping);

    // Step 3: Apply column mapping to remap user columns → standard fields
    if (columnMapping && parsedData.length > 0) {
      parsedData = parsedData.map(row => {
        const get = (userCol) => {
          if (!userCol) return '';
          // exact match
          if (row[userCol] !== undefined) return row[userCol];
          // case-insensitive match
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

    // Step 4: Group by team
    const groupedData = groupByTeam(parsedData);

    // Step 5: Process each team with AI
    const results = {};

    for (const teamData of groupedData) {
      const summary = calculateTeamSummary(teamData);
      const summaryText = generateSummaryText(summary);
      const evaluation = await evaluateTeam({ ...summary, summaryText });

      // Optional DB save
      const isMongoConnected = mongoose.connection.readyState === 1;
      let existingAnalysis = null;
      if (isMongoConnected) {
        try {
          let team = await Team.findOne({ name: summary.teamName });
          if (!team) {
            team = await Team.create({ name: summary.teamName, projectTitle: summary.projectTitle });
          } else {
            team.projectTitle = summary.projectTitle;
            await team.save();
          }
          existingAnalysis = await ProjectAnalysis.findOne({
            teamId: team._id,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          });
          if (!existingAnalysis) {
            await ProjectAnalysis.create({
              teamId: team._id,
              teamName: summary.teamName,
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
            });
          }
        } catch (dbError) {
          console.log('DB operation skipped:', dbError.message);
        }
      }

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
        },
        cached: !!existingAnalysis
      };
    }

    const duration = Date.now() - startTime;
    const teamCount = Object.keys(results).length;
    logRequest(req, `Analysis completed in ${duration}ms for ${teamCount} teams`);

    res.status(200).json({
      success: true,
      message: 'Analysis completed successfully',
      data: results,
      metadata: {
        totalTeams: teamCount,
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
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      return res.status(200).json({ success: true, data: [], count: 0, message: 'Database not connected.' });
    }
    const { teamName } = req.query;
    try {
      const query = teamName ? { teamName } : {};
      const analyses = await ProjectAnalysis.find(query)
        .sort({ createdAt: -1 }).limit(10).populate('teamId', 'name projectTitle');
      res.status(200).json({ success: true, data: analyses, count: analyses.length });
    } catch (dbError) {
      res.status(200).json({ success: true, data: [], count: 0, message: 'Database not available.' });
    }
  } catch (error) {
    next(error);
  }
};
