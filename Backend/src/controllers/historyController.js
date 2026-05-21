import Upload from '../models/Upload.js';
import Analysis from '../models/Analysis.js';
import ChatHistory from '../models/ChatHistory.js';
import mongoose from 'mongoose';

export const getUploadHistory = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        message: 'Database not connected' 
      });
    }

    const { limit = 20, page = 1 } = req.query;
    
    const uploads = await Upload.find()
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Upload.countDocuments();

    res.status(200).json({
      success: true,
      data: uploads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Database not connected' 
      });
    }

    const { id } = req.params;
    
    const analysis = await Analysis.findById(id)
      .populate('uploadId', 'fileName uploadedAt columns rowCount');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ 
        success: true, 
        data: { messages: [] }, 
        message: 'Database not connected' 
      });
    }

    const { uploadId } = req.params;
    
    const chatHistory = await ChatHistory.findOne({ uploadId })
      .populate('uploadId', 'fileName uploadedAt');

    res.status(200).json({
      success: true,
      data: chatHistory || { messages: [] }
    });
  } catch (error) {
    next(error);
  }
};
