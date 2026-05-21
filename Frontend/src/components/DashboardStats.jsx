import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react';

const DashboardStats = ({ analysisData }) => {
  if (!analysisData || Object.keys(analysisData).length === 0) {
    return null;
  }

  const teams = Object.entries(analysisData);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Teams */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Teams</p>
            <p className="text-3xl font-bold text-gray-900">{totalTeams}</p>
          </div>
          <Users className="h-12 w-12 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">{averageScore}</p>
          </div>
          <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
        </div>
      </div>

      {/* Best Performing Team */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Top Performer</p>
            <p className="text-lg font-bold text-gray-900 truncate">{bestTeam.name}</p>
            <p className="text-sm text-gray-500">Score: {bestTeam.score}</p>
          </div>
          <Award className="h-12 w-12 text-yellow-500 opacity-80" />
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Grade Distribution</p>
            <div className="flex space-x-2">
              {Object.entries(gradeDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([grade, count]) => (
                  <div key={grade} className="text-center">
                    <p className="text-xs text-gray-500">{grade}</p>
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                  </div>
                ))}
            </div>
          </div>
          <BarChart3 className="h-12 w-12 text-purple-500 opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
