export const groupByTeam = (data) => {
  const grouped = {};

  data.forEach(entry => {
    const teamName = entry.teamName;
    
    if (!grouped[teamName]) {
      grouped[teamName] = {
        teamName,
        projectTitle: entry.projectTitle,
        updates: []
      };
    }

    grouped[teamName].updates.push({
      update: entry.update,
      completion: entry.completion,
      date: entry.date
    });
  });

  return Object.values(grouped);
};

export const calculateTeamSummary = (teamData) => {
  const { updates } = teamData;

  // Sort updates by date
  const sortedUpdates = updates.sort((a, b) => a.date - b.date);

  // Calculate metrics
  const totalUpdates = updates.length;
  const averageCompletion = updates.reduce((sum, u) => sum + u.completion, 0) / totalUpdates;
  const lastUpdateDate = sortedUpdates[sortedUpdates.length - 1].date;

  // Calculate consistency score based on update frequency
  const consistencyScore = calculateConsistencyScore(sortedUpdates);

  return {
    teamName: teamData.teamName,
    projectTitle: teamData.projectTitle,
    totalUpdates,
    averageCompletion: Math.round(averageCompletion * 100) / 100,
    lastUpdateDate,
    consistencyScore,
    updates: sortedUpdates
  };
};

const calculateConsistencyScore = (sortedUpdates) => {
  if (sortedUpdates.length < 2) return 50; // Default score for single update

  const intervals = [];
  for (let i = 1; i < sortedUpdates.length; i++) {
    const daysDiff = (sortedUpdates[i].date - sortedUpdates[i - 1].date) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  // Calculate standard deviation of intervals
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher consistency
  // Score from 0-100 (inverse relationship with stdDev)
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 2)));

  return Math.round(consistencyScore);
};

export const generateSummaryText = (summary) => {
  return `
Team: ${summary.teamName}
Project: ${summary.projectTitle}
Total Updates: ${summary.totalUpdates}
Average Completion: ${summary.averageCompletion}%
Last Update: ${summary.lastUpdateDate.toLocaleDateString()}
Consistency Score: ${summary.consistencyScore}/100

Recent Updates:
${summary.updates.slice(-3).map(u => 
  `- ${u.date.toLocaleDateString()}: ${u.update} (${u.completion}% complete)`
).join('\n')}
  `.trim();
};
