import XLSX from 'xlsx';
import { AppError } from '../middleware/errorHandler.js';

// Flexible parser - accepts any Excel structure
export const parseExcel = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get the first sheet (or specified sheet)
      const sheetName = options.sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get as array of arrays
      
      if (jsonData.length === 0) {
        reject(new AppError('Excel file is empty', 400));
        return;
      }

      // If column mapping is provided, use flexible parsing
      if (options.columnMapping) {
        const result = parseWithColumnMapping(jsonData, options.columnMapping);
        resolve(result);
      } 
      // If row-based analysis is requested
      else if (options.analyzeRows) {
        const result = parseByRows(jsonData, options.analyzeRows);
        resolve(result);
      }
      // Default: return raw data with column detection
      else {
        const result = parseDefault(jsonData);
        resolve(result);
      }
    } catch (error) {
      reject(new AppError(`Excel parsing error: ${error.message}`, 400));
    }
  });
};

// Parse with user-specified column mapping
const parseWithColumnMapping = (data, columnMapping) => {
  const headers = data[0];
  const results = [];
  
  // Find column indices based on user-provided names
  const columnIndices = {};
  for (const [key, columnName] of Object.entries(columnMapping)) {
    const index = headers.findIndex(h => 
      String(h).toLowerCase().trim() === String(columnName).toLowerCase().trim()
    );
    if (index === -1) {
      throw new AppError(`Column "${columnName}" not found in Excel file`, 400);
    }
    columnIndices[key] = index;
  }
  
  // Parse data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const cleanedData = {};
    
    for (const [key, index] of Object.entries(columnIndices)) {
      const value = row[index];
      
      // Handle different data types
      if (key === 'completion' || key.includes('percent') || key.includes('%')) {
        cleanedData[key] = parseFloat(value) || 0;
      } else if (key === 'date' || key.includes('date')) {
        cleanedData[key] = parseExcelDate(value);
      } else {
        cleanedData[key] = value ? String(value).trim() : '';
      }
    }
    
    results.push(cleanedData);
  }
  
  return results;
};

// Parse specific rows for analysis
const parseByRows = (data, rowOptions) => {
  const results = [];
  const headers = data[0];
  
  const { startRow = 1, endRow = data.length - 1, columns } = rowOptions;
  
  for (let i = startRow; i <= Math.min(endRow, data.length - 1); i++) {
    const row = data[i];
    const rowData = {};
    
    if (columns && columns.length > 0) {
      // Only include specified columns
      columns.forEach(colIndex => {
        if (colIndex < row.length) {
          rowData[headers[colIndex] || `Column_${colIndex}`] = row[colIndex];
        }
      });
    } else {
      // Include all columns
      row.forEach((cell, index) => {
        rowData[headers[index] || `Column_${index}`] = cell;
      });
    }
    
    results.push(rowData);
  }
  
  return results;
};

// Default parsing - find best header row automatically
const parseDefault = (data) => {
  if (!data || data.length === 0) return { headers: [], data: [], metadata: {} };

  // Find the row with most non-empty cells - that's likely the header row
  let bestHeaderRowIndex = 0;
  let maxNonEmpty = 0;
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const nonEmpty = (data[i] || []).filter(c => c !== '' && c !== null && c !== undefined).length;
    if (nonEmpty > maxNonEmpty) {
      maxNonEmpty = nonEmpty;
      bestHeaderRowIndex = i;
    }
  }

  const headers = (data[bestHeaderRowIndex] || []).map(h =>
    (h !== null && h !== undefined ? String(h).trim() : '')
  );

  const dataRows = data.slice(bestHeaderRowIndex + 1).filter(
    row => row && row.some(c => c !== '' && c !== null && c !== undefined)
  );

  const results = {
    headers,
    data: [],
    metadata: {
      totalRows: dataRows.length,
      totalColumns: headers.length,
      columnNames: headers,
      headerRowIndex: bestHeaderRowIndex
    }
  };

  for (const row of dataRows) {
    const rowObj = {};
    headers.forEach((header, index) => {
      if (header) rowObj[header] = row[index] ?? '';
    });
    results.data.push(rowObj);
  }

  return results;
};

// Helper function to parse Excel dates
const parseExcelDate = (dateValue) => {
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // If it's an Excel serial number
  if (typeof dateValue === 'number') {
    // Excel dates are stored as days since 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const days = dateValue - 2; // Excel has a bug with leap year 1900
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  }

  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Return invalid date if parsing fails
  return new Date('Invalid Date');
};
