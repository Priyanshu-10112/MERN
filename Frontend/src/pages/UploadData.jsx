import { useState, useRef } from 'react';
import { Upload, FileText, X, CloudUpload, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, Settings } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const gradeColor = (grade) => {
  const colors = {
    'A': '#10B981',
    'B': '#3B82F6',
    'C': '#F59E0B',
    'D': '#F97316',
    'F': '#EF4444'
  };
  return colors[grade] || '#6B7280';
};

export default function UploadData() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Configure, 3: Results
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  
  // Configuration
  const [columnMapping, setColumnMapping] = useState({});
  const [analysisType, setAnalysisType] = useState('team-evaluation');
  
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const hasValidExtension = validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
    
    if (f && hasValidExtension) {
      setFile(f);
      setError('');
      getFileStructure(f);
    } else {
      setError('Please upload a CSV or Excel file (.csv, .xls, .xlsx)');
    }
  };

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setError('');
      getFileStructure(f);
    }
  };

  // Step 1: Get file structure
  const getFileStructure = async (fileToUpload) => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await axios.post(`${API_URL}/api/flexible/structure`, formData);
      
      if (response.data.success) {
        const struct = response.data.structure;
        console.log('Structure received:', JSON.stringify(struct, null, 2));
        
        // Filter out empty/undefined headers
        const rawHeaders = struct.headers || struct.sheets?.[0]?.headers || [];
        const cleanHeaders = rawHeaders.filter(h => h !== undefined && h !== null && String(h).trim() !== '');
        
        // If first row has too many empty cells, try second row from preview
        let finalHeaders = cleanHeaders;
        if (cleanHeaders.length < 3 && struct.preview && struct.preview.length > 1) {
          const secondRow = struct.preview[1] || [];
          const secondRowClean = secondRow.filter(h => h !== undefined && h !== null && String(h).trim() !== '');
          if (secondRowClean.length > cleanHeaders.length) {
            finalHeaders = secondRowClean.map(String);
          }
        }

        const finalStruct = { ...struct, headers: finalHeaders };
        setStructure(finalStruct);
        setStep(2);
        autoDetectColumns(finalHeaders);
      }
    } catch (err) {
      console.error('Structure error:', err);
      setError(err.response?.data?.message || 'Failed to read file structure');
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect common column names
  const autoDetectColumns = (headers) => {
    const mapping = {};
    
    headers.forEach(header => {
      const lower = header.toLowerCase();
      
      if (lower.includes('team') && lower.includes('name')) {
        mapping.teamName = header;
      } else if (lower.includes('project') && lower.includes('title')) {
        mapping.projectTitle = header;
      } else if (lower.includes('update') && !lower.includes('date')) {
        mapping.update = header;
      } else if (lower.includes('completion') || lower.includes('%')) {
        mapping.completion = header;
      } else if (lower.includes('date')) {
        mapping.date = header;
      }
    });
    
    setColumnMapping(mapping);
  };

  // Step 2: Analyze with configuration
  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    
    if (Object.keys(columnMapping).length > 0) {
      formData.append('columnMapping', JSON.stringify(columnMapping));
    }
    
    formData.append('analyzeType', analysisType);

    try {
      let response;
      
      if (analysisType === 'team-evaluation') {
        response = await axios.post(`${API_URL}/api/analyze`, formData);
      } else {
        response = await axios.post(`${API_URL}/api/flexible/analyze`, formData);
      }
      
      if (response.data.success) {
        setResults(response.data.data || response.data.results);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStep(1);
    setStructure(null);
    setLoading(false);
    setError('');
    setResults(null);
    setColumnMapping({});
  };

  const handleColumnMappingChange = (key, value) => {
    setColumnMapping(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const availableHeaders = structure?.headers || structure?.sheets?.[0]?.headers || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          Upload & Analyze Data
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Upload any CSV or Excel file, map your columns, and get AI-powered analysis
        </p>
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

      {/* Step 1: Upload File */}
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
              <CloudUpload size={28} />
            </div>
            <h3>Drag & drop your CSV or Excel file here</h3>
            <p>or click to browse files</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
              Supports .csv, .xls, .xlsx files up to 10MB
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
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3, margin: '0 auto' }} />
              <p style={{ marginTop: 12, color: 'var(--gray-500)' }}>Reading file structure...</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Configure Columns */}
      {step === 2 && structure && (
        <div>
          <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: 'var(--success-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--success)',
              }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>File Uploaded Successfully</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>{file.name}</p>
              </div>
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>📋 Detected Columns:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {availableHeaders.map((header, index) => (
                  <span key={index} style={{
                    background: 'white',
                    border: '1px solid var(--gray-200)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 13,
                    color: 'var(--gray-700)'
                  }}>
                    {header}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8, marginBottom: 0 }}>
                Total: {structure.rowCount || structure.sheets?.[0]?.rowCount || 0} rows • {availableHeaders.length} columns
              </p>
            </div>
          </div>

          <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Settings size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Configure Analysis</h3>
            </div>

            {/* Analysis Type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Analysis Type:
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <option value="team-evaluation">Team Project Evaluation (AI Grading)</option>
                <option value="summary">Summary Statistics</option>
                <option value="column-analysis">Column-wise Analysis</option>
              </select>
            </div>

            {/* Column Mapping */}
            {analysisType === 'team-evaluation' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Map Your Columns:</h4>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
                  Tell us which columns contain team data (auto-detected if possible)
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { key: 'teamName', label: 'Team Name' },
                    { key: 'projectTitle', label: 'Project Title' },
                    { key: 'update', label: 'Update/Description' },
                    { key: 'completion', label: 'Completion %' },
                    { key: 'date', label: 'Date' }
                  ].map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: '0 0 150px', fontSize: 13, fontWeight: 500 }}>
                        {label}:
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--gray-400)' }} />
                      <select
                        value={columnMapping[key] || ''}
                        onChange={(e) => handleColumnMappingChange(key, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid var(--gray-200)',
                          borderRadius: 6,
                          fontSize: 13
                        }}
                      >
                        <option value="">Select column...</option>
                        {availableHeaders.map((header, index) => (
                          <option key={index} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading || (analysisType === 'team-evaluation' && Object.keys(columnMapping).length === 0)}
              style={{ opacity: loading ? 0.5 : 1 }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Analyze Data
                </>
              )}
            </button>
            <button className="btn btn-outline" onClick={reset}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Analysis Results</h3>
            <button className="btn btn-outline" onClick={reset}>
              <Upload size={16} />
              Upload New File
            </button>
          </div>

          {/* Team Evaluation Results */}
          {analysisType === 'team-evaluation' && typeof results === 'object' && !Array.isArray(results) && (
            <>
              {/* Stats Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="panel" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 4 }}>Total Teams</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>
                    {Object.keys(results).length}
                  </div>
                </div>
                <div className="panel" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 4 }}>Average Score</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>
                    {Math.round(Object.values(results).reduce((sum, team) => sum + team.score, 0) / Object.keys(results).length)}
                  </div>
                </div>
                <div className="panel" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 4 }}>Best Performer</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {Object.entries(results).reduce((best, [name, data]) => 
                      data.score > best.score ? { name, score: data.score } : best, 
                      { name: '', score: 0 }
                    ).name}
                  </div>
                </div>
              </div>

              {/* Team Cards */}
              <div style={{ display: 'grid', gap: 20 }}>
                {Object.entries(results).map(([teamName, teamData]) => (
                  <div key={teamName} className="panel" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{teamName}</h4>
                        <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                          {teamData.summary?.totalUpdates || 0} updates • {teamData.summary?.averageCompletion || 0}% completion
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ 
                          padding: '8px 16px', 
                          borderRadius: 8, 
                          background: gradeColor(teamData.grade) + '20',
                          color: gradeColor(teamData.grade),
                          fontWeight: 700,
                          fontSize: 18
                        }}>
                          {teamData.grade}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>
                          {teamData.score}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      {/* Strengths */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                          <h5 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Strengths</h5>
                        </div>
                        <ul style={{ fontSize: 13, color: 'var(--gray-600)', paddingLeft: 20, margin: 0 }}>
                          {teamData.strengths?.map((strength, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      {teamData.weaknesses && teamData.weaknesses.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                            <h5 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Weaknesses</h5>
                          </div>
                          <ul style={{ fontSize: 13, color: 'var(--gray-600)', paddingLeft: 20, margin: 0 }}>
                            {teamData.weaknesses.map((weakness, idx) => (
                              <li key={idx} style={{ marginBottom: 4 }}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggestions */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Lightbulb size={18} style={{ color: 'var(--primary)' }} />
                          <h5 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Suggestions</h5>
                        </div>
                        <ul style={{ fontSize: 13, color: 'var(--gray-600)', paddingLeft: 20, margin: 0 }}>
                          {teamData.suggestions?.map((suggestion, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Summary/Column Analysis Results */}
          {(analysisType === 'summary' || analysisType === 'column-analysis') && (
            <div className="panel" style={{ padding: 24 }}>
              <pre style={{ 
                background: 'var(--gray-50)', 
                padding: 16, 
                borderRadius: 8, 
                fontSize: 13, 
                overflow: 'auto',
                maxHeight: 600
              }}>
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
