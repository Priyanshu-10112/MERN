import { parseExcel } from '../utils/excelParser.js';
import { parseCSV } from '../utils/csvParser.js';
import { evaluateWithAI } from '../services/aiService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logRequest, logError } from '../middleware/logger.js';
import path from 'path';
import fs from 'fs';

// Flexible analysis - user specifies columns
export const flexibleAnalyze = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { columnMapping, analyzeType, rowRange } = req.body;
    
    logRequest(req, `Flexible analysis for file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData;
    
    // Parse based on file type and options
    if (fileExtension === '.csv') {
      parsedData = await parseCSV(filePath, { columnMapping, rowRange });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const options = {};
      
      if (columnMapping) {
        options.columnMapping = JSON.parse(columnMapping);
      }
      
      if (rowRange) {
        const range = JSON.parse(rowRange);
        options.analyzeRows = {
          startRow: range.startRow || 1,
          endRow: range.endRow,
          columns: range.columns
        };
      }
      
      parsedData = await parseExcel(filePath, options);
      
      // Delete Excel file after parsing
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    } else {
      throw new AppError('Unsupported file format', 400);
    }

    // Analyze based on type
    let results;
    
    if (analyzeType === 'summary') {
      results = await generateSummary(parsedData);
    } else if (analyzeType === 'ai-evaluation') {
      results = await generateAIEvaluation(parsedData);
    } else if (analyzeType === 'column-analysis') {
      results = await analyzeColumns(parsedData);
    } else {
      // Default: return parsed data with basic stats
      results = {
        data: parsedData,
        stats: generateBasicStats(parsedData)
      };
    }

    const duration = Date.now() - startTime;
    logRequest(req, `Flexible analysis completed in ${duration}ms`);

    res.status(200).json({
      success: true,
      message: 'Analysis completed successfully',
      results,
      metadata: {
        processingTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
        recordCount: Array.isArray(parsedData) ? parsedData.length : parsedData.data?.length || 0
      }
    });
  } catch (error) {
    logError(error, 'Flexible Analyze');
    next(error);
  }
};

// Get Excel structure (headers, row count, etc.)
export const getExcelStructure = async (req, res, next) => {
  try {
    logRequest(req, `Getting structure for file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExtension !== '.xlsx' && fileExtension !== '.xls' && fileExtension !== '.csv') {
      throw new AppError('Unsupported file format', 400);
    }

    let structure;
    
    if (fileExtension === '.csv') {
      structure = await getCSVStructure(filePath);
    } else {
      const excelStructure = await getExcelStructureInfo(filePath);
      // For Excel, return first sheet's structure in a flat format for easier frontend handling
      const firstSheet = excelStructure.sheets[0];
      structure = {
        fileType: 'excel',
        headers: firstSheet.headers,
        rowCount: firstSheet.rowCount,
        columnCount: firstSheet.columnCount,
        preview: firstSheet.preview,
        sheets: excelStructure.sheets, // Keep full sheets info for reference
        totalSheets: excelStructure.totalSheets
      };
    }

    // Delete file after getting structure
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(200).json({
      success: true,
      structure
    });
  } catch (error) {
    logError(error, 'Get Excel Structure');
    next(error);
  }
};

// Helper: Get Excel structure info
const getExcelStructureInfo = async (filePath) => {
  const XLSX = (await import('xlsx')).default;
  const workbook = XLSX.readFile(filePath);
  
  const sheets = workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (!jsonData || jsonData.length === 0) {
      return { name: sheetName, headers: [], rowCount: 0, columnCount: 0, preview: [] };
    }

    // Find the best header row - the row with the most non-empty cells
    let bestHeaderRowIndex = 0;
    let maxNonEmpty = 0;
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const nonEmpty = jsonData[i].filter(c => c !== '' && c !== null && c !== undefined).length;
      if (nonEmpty > maxNonEmpty) {
        maxNonEmpty = nonEmpty;
        bestHeaderRowIndex = i;
      }
    }

    const headers = jsonData[bestHeaderRowIndex]
      .map(h => (h !== null && h !== undefined ? String(h).trim() : ''))
      .filter(h => h !== '');

    const dataRows = jsonData.slice(bestHeaderRowIndex + 1).filter(
      row => row.some(c => c !== '' && c !== null && c !== undefined)
    );

    return {
      name: sheetName,
      headers,
      rowCount: dataRows.length,
      columnCount: headers.length,
      preview: [jsonData[bestHeaderRowIndex], ...dataRows.slice(0, 5)]
    };
  });
  
  return {
    fileType: 'excel',
    sheets,
    totalSheets: sheets.length
  };
};

// Helper: Get CSV structure info
const getCSVStructure = async (filePath) => {
  const fs = (await import('fs')).default;
  const csvParser = (await import('csv-parser')).default;
  
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('headers', (headerList) => {
        headers = headerList;
      })
      .on('data', (data) => {
        if (rows.length < 5) {
          rows.push(data);
        }
      })
      .on('end', () => {
        resolve({
          fileType: 'csv',
          headers,
          columnCount: headers.length,
          preview: rows
        });
      })
      .on('error', reject);
  });
};

// Helper: Generate summary
const generateSummary = async (data) => {
  const dataArray = Array.isArray(data) ? data : data.data;
  
  if (!dataArray || dataArray.length === 0) {
    throw new AppError('No data to summarize', 400);
  }

  const summary = {
    totalRecords: dataArray.length,
    columns: Object.keys(dataArray[0]),
    columnStats: {}
  };

  // Calculate stats for each column
  for (const column of summary.columns) {
    const values = dataArray.map(row => row[column]).filter(v => v !== null && v !== undefined);
    const numericValues = values.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));
    
    summary.columnStats[column] = {
      totalValues: values.length,
      uniqueValues: new Set(values).size,
      nullCount: dataArray.length - values.length
    };
    
    if (numericValues.length > 0) {
      summary.columnStats[column].numeric = {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
        sum: numericValues.reduce((a, b) => a + b, 0)
      };
    }
  }

  return summary;
};

// Helper: Generate AI evaluation
const generateAIEvaluation = async (data) => {
  const dataArray = Array.isArray(data) ? data : data.data;
  
  if (!dataArray || dataArray.length === 0) {
    throw new AppError('No data to evaluate', 400);
  }

  // Create a summary text for AI
  const summaryText = `
Data Analysis Request:
- Total Records: ${dataArray.length}
- Columns: ${Object.keys(dataArray[0]).join(', ')}
- Sample Data: ${JSON.stringify(dataArray.slice(0, 3), null, 2)}

Please provide:
1. Key insights from this data
2. Patterns or trends identified
3. Recommendations for improvement
4. Overall assessment
  `.trim();

  const evaluation = await evaluateWithAI(summaryText);
  
  return {
    evaluation,
    dataPreview: dataArray.slice(0, 5)
  };
};

// Helper: Analyze specific columns
const analyzeColumns = async (data) => {
  const dataArray = Array.isArray(data) ? data : data.data;
  
  if (!dataArray || dataArray.length === 0) {
    throw new AppError('No data to analyze', 400);
  }

  const analysis = {};
  const columns = Object.keys(dataArray[0]);

  for (const column of columns) {
    const values = dataArray.map(row => row[column]).filter(v => v !== null && v !== undefined);
    const numericValues = values.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));
    
    analysis[column] = {
      dataType: numericValues.length > values.length * 0.8 ? 'numeric' : 'text',
      sampleValues: values.slice(0, 5),
      uniqueCount: new Set(values).size,
      nullCount: dataArray.length - values.length
    };
    
    if (numericValues.length > 0) {
      analysis[column].statistics = {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        average: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2),
        median: calculateMedian(numericValues)
      };
    }
  }

  return analysis;
};

// Helper: Generate basic stats
const generateBasicStats = (data) => {
  const dataArray = Array.isArray(data) ? data : data.data;
  
  if (!dataArray || dataArray.length === 0) {
    return { totalRecords: 0 };
  }

  return {
    totalRecords: dataArray.length,
    columns: Object.keys(dataArray[0]),
    columnCount: Object.keys(dataArray[0]).length
  };
};

// Helper: Calculate median
const calculateMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
    : sorted[mid].toFixed(2);
};
