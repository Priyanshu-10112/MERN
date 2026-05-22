import { useState, useEffect } from 'react';
import { Eye, X, CheckCircle, AlertTriangle, Lightbulb, Upload } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

const gradeColor = (g) => g === 'A' ? 'var(--success)' : g === 'B' ? 'var(--warning)' : 'var(--danger)';

export default function TeamAnalysis() {
  const [teams, setTeams] = useState([]);
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
        
        setTeams(teamList);
      } catch (err) {
        setError(err.message || 'Failed to load team data');
        setTeams([]);
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

  if (teams.length === 0) {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
            Team Analysis
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            Monitor team performance, progress, and AI-generated insights.
          </p>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <Upload size={64} style={{ color: 'var(--gray-400)', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
            No Team Data Available
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
            Upload and analyze a CSV file to see team analysis here
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload Data
          </button>
        </div>
      </>
    );
  }

  const selectedTeam = teams.find((t) => t._id === selected);

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

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          Team Analysis
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Monitor team performance, progress, and AI-generated insights.
        </p>
      </div>

      <div className="panel">
        <table className="team-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Progress</th>
              <th>Grade</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{t.teamName}</td>
                <td>
                  {t.summary?.averageCompletion ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${t.summary.averageCompletion}%`,
                            background: t.summary.averageCompletion >= 80 ? 'var(--success)' : t.summary.averageCompletion >= 60 ? 'var(--warning)' : 'var(--danger)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--gray-500)', minWidth: 36 }}>{t.summary.averageCompletion}%</span>
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <span className={`grade-badge grade-${(t.grade || 'na').toLowerCase()}`}>{t.grade || 'N/A'}</span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{t.score}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setSelected(t._id)}
                  >
                    <Eye size={14} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && selectedTeam && (
        <div className="detail-overlay" onClick={() => setSelected(null)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-panel-header">
              <div>
                <h2>{selectedTeam.teamName}</h2>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  {selectedTeam.summary?.totalUpdates || 0} updates
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Score Overview */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{
                flex: 1, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>Grade</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: gradeColor(selectedTeam.grade) }}>{selectedTeam.grade}</div>
              </div>
              <div style={{
                flex: 1, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>Score</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-900)' }}>
                  {selectedTeam.score}<span style={{ fontSize: 14, color: 'var(--gray-400)' }}>/100</span>
                </div>
              </div>
              <div style={{
                flex: 1, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>Completion</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedTeam.summary?.averageCompletion || 0}%
                </div>
              </div>
            </div>

            {/* Strengths */}
            {selectedTeam.strengths && selectedTeam.strengths.length > 0 && (
              <div className="eval-section strength">
                <h4><CheckCircle size={16} /> Strengths</h4>
                <ul>
                  {selectedTeam.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {selectedTeam.weaknesses && selectedTeam.weaknesses.length > 0 && (
              <div className="eval-section weakness">
                <h4><AlertTriangle size={16} /> Weaknesses</h4>
                <ul>
                  {selectedTeam.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {selectedTeam.suggestions && selectedTeam.suggestions.length > 0 && (
              <div className="eval-section suggestion">
                <h4><Lightbulb size={16} /> Suggestions</h4>
                <ul>
                  {selectedTeam.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}

            {/* Summary Stats */}
            {selectedTeam.summary && (
              <div style={{ marginTop: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Summary Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Total Updates:</span>
                    <strong style={{ marginLeft: 8 }}>{selectedTeam.summary.totalUpdates}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Consistency:</span>
                    <strong style={{ marginLeft: 8 }}>{selectedTeam.summary.consistencyScore}/100</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Last Update:</span>
                    <strong style={{ marginLeft: 8 }}>
                      {new Date(selectedTeam.summary.lastUpdateDate).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
