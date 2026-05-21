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
      
      // Handle both array (from DB) and object (from localStorage) formats
      let dataByTeam = {};
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Convert array to object format (from MongoDB)
          response.data.forEach(analysis => {
            if (!dataByTeam[analysis.teamName]) {
              dataByTeam[analysis.teamName] = {
                grade: analysis.grade,
                score: analysis.score,
                summary: analysis.summary,
              };
            }
          });
        } else if (typeof response.data === 'object') {
          // Already in object format (from localStorage or direct API)
          dataByTeam = response.data;
        }
      }

      if (Object.keys(dataByTeam).length > 0) {
        setAnalysisData(dataByTeam);

        // Calculate stats
        const teams = Object.entries(dataByTeam);
        const totalTeams = teams.length;
        const averageScore = Math.round(
          teams.reduce((sum, [, data]) => sum + data.score, 0) / totalTeams
        );
        const bestTeam = teams.reduce((best, [name, data]) => {
          return data.score > best.score ? { name, ...data } : best;
        }, { name: '', score: 0 });

        const gradeDistribution = teams.reduce((acc, [, data]) => {
          acc[data.grade] = (acc[data.grade] || 0) + 1;
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!analysisData || !stats) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
        <Upload size={64} style={{ color: 'var(--gray-400)', margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
          No Analysis Data Yet
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
          Upload and analyze a CSV file to see team performance data here
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Upload size={16} />
          Upload Data
        </button>
      </div>
    );
  }

  // Prepare chart data from real analysis
  const chartData = Object.entries(analysisData)
    .map(([name, data]) => ({ name, score: data.score }))
    .sort((a, b) => b.score - a.score);

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
                    <span className={`grade-badge grade-${data.grade.toLowerCase()}`}>
                      {data.grade}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{data.score}</td>
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
  );
}
