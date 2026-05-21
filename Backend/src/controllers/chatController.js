import { chatWithAI } from '../services/aiService.js';
import Analysis from '../models/Analysis.js';
import Upload from '../models/Upload.js';
import ChatHistory from '../models/ChatHistory.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
import mongoose from 'mongoose';

export const chat = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { question, uploadId } = req.body;
    
    logRequest(req, `Chat question: "${question.substring(0, 50)}..."`);

    if (!question) {
      throw new AppError('Question is required', 400);
    }

    let context = null;

    // If uploadId provided, fetch that specific analysis
    if (uploadId && mongoose.connection.readyState === 1) {
      try {
        const analysis = await Analysis.findOne({ uploadId })
          .populate('uploadId', 'fileName columns rowCount')
          .sort({ createdAt: -1 });

        if (analysis) {
          context = {
            fileName: analysis.uploadId?.fileName,
            columns: analysis.uploadId?.columns,
            rowCount: analysis.uploadId?.rowCount,
            analysisType: analysis.analysisType,
            results: analysis.results,
            insights: analysis.insights
          };
        }
      } catch (dbError) {
        console.log('Context fetch skipped:', dbError.message);
      }
    }

    const answer = await chatWithAI(question, context);

    // Save chat history
    if (mongoose.connection.readyState === 1 && uploadId) {
      try {
        let chatHistory = await ChatHistory.findOne({ uploadId });
        
        if (!chatHistory) {
          chatHistory = await ChatHistory.create({
            uploadId,
            messages: [],
            context
          });
        }
        
        chatHistory.messages.push(
          { role: 'user', content: question },
          { role: 'assistant', content: answer }
        );
        
        await chatHistory.save();
      } catch (dbError) {
        console.log('Chat history save skipped:', dbError.message);
      }
    }

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
