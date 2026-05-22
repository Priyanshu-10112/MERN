import { useState, useRef } from 'react';
import { Upload, FileText, CloudUpload, CheckCircle, ArrowRight, Loader, BarChart3, MessageSquare, Download } from 'lucide-react';
import { uploadFile, analyzeFile, getFileStructure } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function EnhancedUpload() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Configure, 4: Analyzing, 5: Results
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [uploadData, setUploadData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [analysisType, setAnalysisType] = useState('auto-ai');
  const [columnMapping, setColumnMapping] = useState({});
  const [results, setResults] = useState(null);
  
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && isValidFile(f)) {
      setFile(f);
      setError('');
      handleFileSelected(f);
    } else {
      setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
    }
  };

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setError('');
      handleFileSelected(f);
    }
  };

  const isValidFile = (f) => {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    return validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
  };

  // Step 1 → 2: Upload and get preview
  const handleFileSelected = async (selectedFile) => {
    setLoading(true);
    setError('');

    try {
      const response = await uploadFile(selectedFile);
      
      if (response.success) {
        setUploadData(response);
        setPreviewData(response.data?.slice(0, 10) || []);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → 3: Choose analysis type
  const handleContinueToConfig = () => {
    setStep(3);
  };

  // Step 3 → 4: Start analysis
  const handleStartAnalysis = async () => {
    setLoading(true);
    setError('');
    setStep(4);

    try {
      const options = {
        analysisType,
        columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : null
      };

      const response = await analyzeFile(file, options);
      
      if (response.success) {
        setResults(response);
        setStep(5);
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setUploadData(null);
    setPreviewData(null);
    setResults(null);
    setColumnMapping({});
    setError('');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Progress Steps */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Preview' },
            { num: 3, label: 'Configure' },
            { num: 4, label: 'Analyze' },
            { num: 5, label: 'Results' }
          ].map((s, idx) => (
            <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: step >= s.num ? 'var(--primary)' : 'var(--gray-200)',
                color: step >= s.num ? 'white' : 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 16
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <div style={{ marginLeft: 12, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: step >= s.num ? 'var(--gray-900)' : 'var(--gray-500)' }}>
                  {s.label}
                </div>
              </div>
              {idx < 4 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: step > s.num ? 'var(--primary)' : 'var(--gray-200)',
                  marginLeft: 12
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          color: 'var(--danger)'
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div
            className={`upload-zone ${dragging ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !loading && inputRef.current?.click()}
            style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            <div className="upload-icon">
              <CloudUpload size={32} />
            </div>
            <h3>Drag & drop your file here</h3>
            <p>or click to browse</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
              Supports CSV, Excel (.xlsx, .xls) up to 10MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={handleSelect}
              disabled={loading}
            />
          </div>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Loader className="spinner" size={24} />
              <p style={{ marginTop: 12, color: 'var(--gray-500)' }}>Uploading and parsing...</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview Data */}
      {step === 2 && previewData && (
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>File Uploaded Successfully</h3>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
                {file.name} • {uploadData.metadata?.rowCount} rows • {uploadData.metadata?.columnCount} columns
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Data Preview (first 10 rows):</h4>
            <div style={{ overflowX: 'auto', background: 'var(--gray-50)', borderRadius: 8, padding: 16 }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {uploadData.metadata?.columns?.map((col, idx) => (
                      <th key={idx} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--gray-200)', fontWeight: 600 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {uploadData.metadata?.columns?.map((col, colIdx) => (
                        <td key={colIdx} style={{ padding: '8px 12px', borderBottom: '1px solid var(--gray-200)' }}>
                          {String(row[col] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleContinueToConfig}>
              <ArrowRight size={16} />
              Continue to Analysis
            </button>
            <button className="btn btn-outline" onClick={reset}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure Analysis */}
      {step === 3 && (
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Choose Analysis Type</h3>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {[
              { value: 'auto-ai', label: 'AI Auto Analysis', desc: 'Let AI automatically analyze your data and provide insights' },
              { value: 'team-evaluation', label: 'Team Project Evaluation', desc: 'Evaluate team projects with grades and scores' },
              { value: 'flexible', label: 'Flexible Analysis', desc: 'Custom analysis with column mapping' }
            ].map(option => (
              <div
                key={option.value}
                onClick={() => setAnalysisType(option.value)}
                style={{
                  padding: 16,
                  border: `2px solid ${analysisType === option.value ? 'var(--primary)' : 'var(--gray-200)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: analysisType === option.value ? 'var(--primary-bg)' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${analysisType === option.value ? 'var(--primary)' : 'var(--gray-300)'}`,
                    background: analysisType === option.value ? 'var(--primary)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {analysisType === option.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{option.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{option.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column Mapping for Team Evaluation */}
          {analysisType === 'team-evaluation' && uploadData?.metadata?.columns && (
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 8 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Map Your Columns</h4>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>
                Match your file columns to the required fields:
              </p>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { key: 'teamName', label: 'Team Name', required: true },
                  { key: 'projectTitle', label: 'Project Title', required: true },
                  { key: 'update', label: 'Update/Progress', required: true },
                  { key: 'completion', label: 'Completion %', required: true },
                  { key: 'date', label: 'Date', required: true }
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ width: 150, fontSize: 13, fontWeight: 500 }}>
                      {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <select
                      value={columnMapping[field.key] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 6,
                        fontSize: 13
                      }}
                    >
                      <option value="">-- Select Column --</option>
                      {uploadData.metadata.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleStartAnalysis}>
              <BarChart3 size={16} />
              Start Analysis
            </button>
            <button className="btn btn-outline" onClick={() => setStep(2)}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Analyzing */}
      {step === 4 && (
        <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
          <Loader className="spinner" size={48} style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Analyzing Your Data...</h3>
          <p style={{ color: 'var(--gray-500)' }}>AI is processing your data. This may take a moment.</p>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && results && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Analysis Complete!</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => navigate('/chat', { state: { uploadId: results.uploadId } })}>
                <MessageSquare size={16} />
                Chat About Results
              </button>
              <button className="btn btn-outline" onClick={reset}>
                <Upload size={16} />
                New Analysis
              </button>
            </div>
          </div>

          <div className="panel" style={{ padding: 24 }}>
            <pre style={{
              background: 'var(--gray-50)',
              padding: 20,
              borderRadius: 8,
              fontSize: 13,
              overflow: 'auto',
              maxHeight: 600
            }}>
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
