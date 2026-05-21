import { chatWithAI } from '../services/aiService.js';
import ProjectAnalysis from '../models/ProjectAnalysis.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';

export const chat = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { question, includeContext } = req.body;
    
    logRequest(req, `Chat question: "${question.substring(0, 50)}..."`);

    if (!question) {
      throw new AppError('Question is required', 400);
    }

    let context = null;

    // If context is requested, fetch recent analyses
    if (includeContext) {
      const recentAnalyses = await ProjectAnalysis.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-__v');

      context = {
        message: 'Recent team analyses',
        analyses: recentAnalyses.map(a => ({
          teamName: a.teamName,
          grade: a.grade,
          score: a.score,
          summary: a.summary,
          strengths: a.strengths,
          weaknesses: a.weaknesses
        }))
      };
    }

    const answer = await chatWithAI(question, context);

    const duration = Date.now() - startTime;
    logRequest(req, `Chat response generated in ${duration}ms`);

    res.status(200).json({
      success: true,
      question,
      answer,
      contextUsed: !!context,
      processingTime: `${duration}ms`
    });
  } catch (error) {
    logError(error, 'Chat');
    next(error);
  }
};
