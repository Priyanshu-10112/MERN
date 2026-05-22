import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, Upload } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AIEvaluation() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAnalysisHistory();
        
        // Get LATEST analysis only
        const teamList = [];
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const latestAnalysis = response.data[0]; // Most recent
          
          if (latestAnalysis.analysisType === 'team-evaluation' && latestAnalysis.results) {
            // Extract teams from latest analysis
            Object.entries(latestAnalysis.results).forEach(([teamName, teamData]) => {
              teamList.push({
                _id: `${latestAnalysis._id}-${teamName}`,
                teamName,
                grade: teamData.grade || 'N/A',
                score: teamData.score || 0,
                strengths: teamData.strengths || [],
                weaknesses: teamData.weaknesses || [],
                suggestions: teamData.suggestions || [],
                summary: teamData.summary || {}
              });
            });
          }
        }
        
        if (teamList.length > 0) {
          setEvaluations(teamList);
          setSelected(teamList[0]._id);
        } else {
          setEvaluations([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load evaluation data');
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
            AI Evaluation Panel
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            AI-generated evaluation results with detailed insights for each team.
          </p>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <Upload size={64} style={{ color: 'var(--gray-400)', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
            No Evaluation Data Available
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
            Upload and analyze a CSV file to see AI evaluations here
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload Data
          </button>
        </div>
      </>
    );
  }

  const selectedEval = evaluations.find((e) => e._id === selected);

  return (
    <>
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

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          AI Evaluation Panel
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          AI-generated evaluation results with detailed insights for each team.
        </p>
      </div>

      <div className="grid-1-2">
        {/* Team selector */}
        <div className="panel">
          <div className="panel-header">
            <h3>Select Team</h3>
          </div>
          {evaluations.map((e) => (
            <div
              key={e._id}
              onClick={() => setSelected(e._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                marginBottom: 4,
                background: selected === e._id ? 'var(--primary-bg)' : 'transparent',
                border: selected === e._id ? '1px solid var(--primary-light)' : '1px solid transparent',
                transition: 'var(--transition)',
              }}
            >
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: selected === e._id ? 'var(--primary)' : 'var(--gray-800)',
                }}>
                  {e.teamName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Score: {e.score}/100</div>
              </div>
              <span className={`grade-badge grade-${(e.grade || 'na').toLowerCase()}`}>{e.grade || 'N/A'}</span>
            </div>
          ))}
        </div>

        {/* Evaluation result */}
        {selectedEval && (
          <div className="panel">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className={`eval-big-grade ${(selectedEval.grade || 'na').toLowerCase()}`}>
                {selectedEval.grade || 'N/A'}
              </div>
              <div className="eval-score">
                {selectedEval.score || 0} <span>/ 100</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 6 }}>
                {selectedEval.teamName} — Overall Evaluation
              </div>
            </div>

            {selectedEval.strengths && selectedEval.strengths.length > 0 && (
              <div className="eval-section strength">
                <h4><CheckCircle size={16} /> Strengths</h4>
                <ul>
                  {selectedEval.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}
                </ul>
              </div>
            )}

            {selectedEval.weaknesses && selectedEval.weaknesses.length > 0 && (
              <div className="eval-section weakness">
                <h4><AlertTriangle size={16} /> Weaknesses</h4>
                <ul>
                  {selectedEval.weaknesses.map((w, i) => <li key={i}>✗ {w}</li>)}
                </ul>
              </div>
            )}

            {selectedEval.suggestions && selectedEval.suggestions.length > 0 && (
              <div className="eval-section suggestion">
                <h4><Lightbulb size={16} /> Suggestions</h4>
                <ul>
                  {selectedEval.suggestions.map((s, i) => <li key={i}>→ {s}</li>)}
                </ul>
              </div>
            )}

            {selectedEval.summary && (
              <div style={{ marginTop: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Performance Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Total Updates:</span>
                    <strong style={{ marginLeft: 8 }}>{selectedEval.summary.totalUpdates}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Avg Completion:</span>
                    <strong style={{ marginLeft: 8 }}>{selectedEval.summary.averageCompletion}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Consistency:</span>
                    <strong style={{ marginLeft: 8 }}>{selectedEval.summary.consistencyScore}/100</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Last Update:</span>
                    <strong style={{ marginLeft: 8 }}>
                      {new Date(selectedEval.summary.lastUpdateDate).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
