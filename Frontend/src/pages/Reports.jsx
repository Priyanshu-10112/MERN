import { useState, useEffect } from 'react';
import { FileDown, FileText, Printer, Upload } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAnalysisHistory();
        
        if (response.data && response.data.length > 0) {
          setReportData(response.data);
        } else {
          setReportData([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load report data');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const handleDownload = () => {
    const avg = reportData.length > 0 
      ? (reportData.reduce((a, r) => a + r.score, 0) / reportData.length).toFixed(1)
      : 0;

    const content = `EvaluateAI - Academic Project Evaluation Report\n${'='.repeat(50)}\nGenerated: ${new Date().toLocaleDateString()}\n\n${reportData.map(r => `${r.teamName} | Score: ${r.score} | Grade: ${r.grade} | Completion: ${r.summary?.averageCompletion || 0}%`).join('\n')}\n\nAverage Score: ${avg}\nTotal Teams: ${reportData.length}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EvaluateAI_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (reportData.length === 0) {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
            Reports
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            Generate and download comprehensive evaluation reports.
          </p>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <Upload size={64} style={{ color: 'var(--gray-400)', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
            No Report Data Available
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
            Upload and analyze a CSV file to generate reports
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload Data
          </button>
        </div>
      </>
    );
  }

  const avg = (reportData.reduce((a, r) => a + r.score, 0) / reportData.length).toFixed(1);
  const gradeA = reportData.filter(r => r.grade === 'A').length;
  const gradeB = reportData.filter(r => r.grade === 'B').length;
  const gradeC = reportData.filter(r => r.grade === 'C').length;
  const gradeD = reportData.filter(r => r.grade === 'D').length;
  const gradeF = reportData.filter(r => r.grade === 'F').length;

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
          Reports
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Generate and download comprehensive evaluation reports.
        </p>
      </div>

      {/* Action bar */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>
                Evaluation Summary Report
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                Includes {reportData.length} teams with scores, grades, and AI insights
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {!generated ? (
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Generating…
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Report
                  </>
                )}
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => window.print()}>
                  <Printer size={16} /> Print
                </button>
                <button className="btn btn-primary" onClick={handleDownload}>
                  <FileDown size={16} /> Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {generated && (
        <div className="report-preview" id="report-preview">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: 14, fontWeight: 700,
            }}>
              AI
            </div>
            <div>
              <h2 style={{ fontSize: 20 }}>EvaluateAI — Evaluation Report</h2>
              <p className="subtitle" style={{ margin: 0 }}>Academic Project Evaluation Summary</p>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 24, padding: '16px 0',
            borderBottom: '1px solid var(--gray-200)', marginBottom: 20,
            fontSize: 13, color: 'var(--gray-500)',
          }}>
            <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Teams: {reportData.length}</span>
            <span>Avg Score: {avg}</span>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            marginBottom: 28,
          }}>
            <div style={{
              background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)',
              padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>
                {gradeA}
              </div>
              <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>Grade A Teams</div>
            </div>
            <div style={{
              background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)',
              padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>
                {gradeB}
              </div>
              <div style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 500 }}>Grade B Teams</div>
            </div>
            <div style={{
              background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)',
              padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>
                {gradeC + gradeD + gradeF}
              </div>
              <div style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500 }}>Grade C/D/F Teams</div>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Detailed Results</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Completion</th>
                <th>Updates</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.teamName}</td>
                  <td style={{ fontWeight: 600 }}>{r.score}/100</td>
                  <td>
                    <span className={`grade-badge grade-${r.grade.toLowerCase()}`}>{r.grade}</span>
                  </td>
                  <td>{r.summary?.averageCompletion || 0}%</td>
                  <td>{r.summary?.totalUpdates || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            marginTop: 28, padding: 20,
            background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--gray-800)' }}>
              AI Summary
            </h4>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.8 }}>
              Overall class performance is <strong>{avg >= 80 ? 'excellent' : avg >= 70 ? 'above average' : avg >= 60 ? 'average' : 'below average'}</strong> with a mean score of {avg}/100. 
              {gradeA > 0 && ` ${gradeA} team${gradeA > 1 ? 's' : ''} achieved Grade A, demonstrating excellent project execution.`}
              {(gradeC + gradeD + gradeF) > 0 && ` ${gradeC + gradeD + gradeF} team${(gradeC + gradeD + gradeF) > 1 ? 's' : ''} require attention and support to improve performance.`}
              {' '}Key focus areas include maintaining consistent updates, improving completion rates, and ensuring comprehensive testing coverage.
            </p>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 16,
            borderTop: '1px solid var(--gray-200)',
            fontSize: 11, color: 'var(--gray-400)', textAlign: 'center',
          }}>
            Generated by EvaluateAI • {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </>
  );
}
