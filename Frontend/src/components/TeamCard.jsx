import { useState } from 'react';
import { ChevronDown, ChevronUp, Award, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const TeamCard = ({ teamName, data }) => {
  const [expanded, setExpanded] = useState(false);

  const getGradeColor = (grade) => {
    const colors = {
      A: 'bg-green-100 text-green-800 border-green-300',
      B: 'bg-blue-100 text-blue-800 border-blue-300',
      C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      D: 'bg-orange-100 text-orange-800 border-orange-300',
      F: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
      {/* Header */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{teamName}</h3>
            <div className="flex items-center space-x-4">
              <span
                className={`px-4 py-1 rounded-full text-lg font-bold border-2 ${getGradeColor(
                  data.grade
                )}`}
              >
                Grade: {data.grade}
              </span>
              <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                {data.score}/100
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {expanded ? (
              <ChevronUp className="h-6 w-6 text-gray-600" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Summary Stats */}
        {data.summary && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Updates</p>
              <p className="text-lg font-bold text-gray-900">{data.summary.totalUpdates}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Avg Completion</p>
              <p className="text-lg font-bold text-gray-900">{data.summary.averageCompletion}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Consistency</p>
              <p className="text-lg font-bold text-gray-900">{data.summary.consistencyScore}/100</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Last Update</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(data.summary.lastUpdateDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6 animate-fadeIn">
          {/* Strengths */}
          {data.strengths && data.strengths.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-bold text-gray-900">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {data.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-gray-900">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2">
                {data.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-600 mt-1">!</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {data.suggestions && data.suggestions.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-gray-900">Suggestions</h4>
              </div>
              <ul className="space-y-2">
                {data.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.cached && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Award className="inline h-4 w-4 mr-1" />
                This analysis was retrieved from cache (within 24 hours)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamCard;
