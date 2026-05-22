import { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, BarChart3, RefreshCw, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
        padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.1)',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{label}</p>
        <p style={{ fontSize: 12, color: '#4F46E5', fontWeight: 500 }}>
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAnalysisHistory();
      
      // Get LATEST analysis (first one, sorted by createdAt desc)
      let dataByTeam = {};
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const latestAnalysis = response.data[0]; // Most recent
        
        if (latestAnalysis.analysisType === 'team-evaluation' && latestAnalysis.results) {
          // Team evaluation format
          Object.entries(latestAnalysis.results).forEach(([teamName, teamData]) => {
            dataByTeam[teamName] = {
              grade: teamData.grade || 'N/A',
              score: teamData.score || 0,
              summary: teamData.summary || {},
            };
          });
        }
      }

      if (Object.keys(dataByTeam).length > 0) {
        setAnalysisData(dataByTeam);

        // Calculate stats
        const teams = Object.entries(dataByTeam);
        const totalTeams = teams.length;
        const averageScore = Math.round(
          teams.reduce((sum, [, data]) => sum + (data.score || 0), 0) / totalTeams
        );
        const bestTeam = teams.reduce((best, [name, data]) => {
          return (data.score || 0) > best.score ? { name, score: data.score || 0, grade: data.grade } : best;
        }, { name: '', score: 0, grade: 'N/A' });

        const gradeDistribution = teams.reduce((acc, [, data]) => {
          const grade = data.grade || 'N/A';
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalTeams,
          averageScore,
          bestTeam,
          gradeDistribution,
        });
      } else {
        setAnalysisData(null);
        setStats(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analysis data');
      setAnalysisData(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data from real analysis (if available)
  const chartData = analysisData ? Object.entries(analysisData)
    .map(([name, data]) => ({ name, score: data.score }))
    .sort((a, b) => b.score - a.score) : [];

  return (
    <>
      {/* ALWAYS SHOW: Welcome Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
        borderRadius: 12,
        padding: 40,
        marginBottom: 24,
        color: 'white'
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          Welcome to Excel Analyzer
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24, maxWidth: 600 }}>
          AI-powered data analysis platform for teams and projects. Upload your Excel/CSV files and get instant insights, team evaluations, and intelligent recommendations.
        </p>
        <button 
          className="btn" 
          onClick={() => navigate('/upload')}
          style={{ 
            background: 'white', 
            color: 'var(--primary)',
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 600
          }}
        >
          <Upload size={18} />
          Upload New File
        </button>
      </div>

      {/* ALWAYS SHOW: Features Grid */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            background: 'var(--primary-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <BarChart3 size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Smart Analysis</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
            AI automatically analyzes your data and provides actionable insights with charts and visualizations
          </p>
        </div>

        <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            background: 'var(--success-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Users size={28} style={{ color: 'var(--success)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Team Evaluation</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
            Evaluate team projects with AI-generated grades, scores, strengths, and improvement suggestions
          </p>
        </div>

        <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            background: 'var(--warning-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <TrendingUp size={28} style={{ color: 'var(--warning)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Context-Aware Chat</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
            Ask questions about your data in natural language and get intelligent AI-powered responses
          </p>
        </div>
      </div>

      {/* CONDITIONAL: Show data stats if available, otherwise show placeholder */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div className="spinner" />
        </div>
      ) : analysisData && stats ? (
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

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="card-icon indigo"><Users size={22} /></div>
              <div className="card-label">Total Teams</div>
              <div className="card-value">{stats.totalTeams}</div>
            </div>
            <div className="stat-card">
              <div className="card-icon green"><TrendingUp size={22} /></div>
              <div className="card-label">Avg. Performance</div>
              <div className="card-value">{stats.averageScore}</div>
            </div>
            <div className="stat-card">
              <div className="card-icon amber"><Award size={22} /></div>
              <div className="card-label">Top Performer</div>
              <div className="card-value" style={{ fontSize: 18 }}>{stats.bestTeam.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                Score: {stats.bestTeam.score}
              </div>
            </div>
            <div className="stat-card">
              <div className="card-icon purple"><BarChart3 size={22} /></div>
              <div className="card-label">Grade Distribution</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {Object.entries(stats.gradeDistribution)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => (
                    <div key={grade} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{grade}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{count}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="panel" style={{ marginBottom: 24 }}>
            <div className="panel-header">
              <h3>Team Performance Comparison</h3>
              <button className="btn-ghost" onClick={fetchData}>
                <RefreshCw size={16} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Team List */}
          <div className="panel">
            <div className="panel-header">
              <h3>Team Overview</h3>
              <span className="panel-action" onClick={() => navigate('/teams')}>View Details</span>
            </div>
            <table className="team-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analysisData)
                  .sort(([, a], [, b]) => b.score - a.score)
                  .map(([name, data]) => (
                    <tr key={name}>
                      <td style={{ fontWeight: 600 }}>{name}</td>
                      <td>
                        <span className={`grade-badge grade-${(data.grade || 'na').toLowerCase()}`}>
                          {data.grade || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{data.score || 0}</td>
                      <td>
                        {data.summary?.averageCompletion ? (
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${data.summary.averageCompletion}%`,
                                background: 'var(--primary)'
                              }} 
                            />
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
          <BarChart3 size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--gray-700)' }}>
            No Team Data Yet
          </h3>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
            Upload a file and select "Team Project Evaluation" to see team performance data here
          </p>
          <button className="btn" onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload Your First File
          </button>
        </div>
      )}
    </>
  );
}
