import { useState, useEffect } from 'react';
import { Clock, FileText, BarChart3, Eye, Trash2, RefreshCw } from 'lucide-react';
import { getUploadHistory, getAnalysisById } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getUploadHistory(20, 1);
      if (response.success) {
        setUploads(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const viewAnalysis = async (uploadId) => {
    try {
      const response = await getAnalysisById(uploadId);
      if (response.success) {
        setSelectedAnalysis(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Upload History</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            View your previous uploads and analyses
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchHistory}>
          <RefreshCw size={16} />
          Refresh
        </button>
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

      {uploads.length === 0 ? (
        <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No uploads yet</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
            Upload your first file to get started
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            Upload File
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {uploads.map((upload) => (
            <div key={upload._id} className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <FileText size={20} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: 16, fontWeight: 600 }}>{upload.fileName}</h4>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--gray-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      {formatDate(upload.uploadedAt)}
                    </div>
                    <div>{formatFileSize(upload.fileSize)}</div>
                    <div>{upload.rowCount} rows</div>
                    <div>{upload.columnCount} columns</div>
                  </div>

                  {upload.columns && upload.columns.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Columns:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {upload.columns.slice(0, 5).map((col, idx) => (
                          <span key={idx} style={{
                            background: 'var(--gray-100)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            color: 'var(--gray-700)'
                          }}>
                            {col}
                          </span>
                        ))}
                        {upload.columns.length > 5 && (
                          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                            +{upload.columns.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-outline"
                    onClick={() => viewAnalysis(upload._id)}
                    style={{ padding: '8px 12px' }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => navigate('/chat', { state: { uploadId: upload._id } })}
                    style={{ padding: '8px 12px' }}
                  >
                    <BarChart3 size={16} />
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }} onClick={() => setSelectedAnalysis(null)}>
          <div 
            className="panel" 
            style={{ 
              maxWidth: 800, 
              width: '100%', 
              maxHeight: '80vh', 
              overflow: 'auto',
              padding: 24 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Analysis Results</h3>
            <pre style={{
              background: 'var(--gray-50)',
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              overflow: 'auto'
            }}>
              {JSON.stringify(selectedAnalysis, null, 2)}
            </pre>
            <button 
              className="btn btn-outline" 
              onClick={() => setSelectedAnalysis(null)}
              style={{ marginTop: 16 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
