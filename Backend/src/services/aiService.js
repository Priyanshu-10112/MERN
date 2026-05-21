import Groq from 'groq-sdk';

let groq = null;

// Lazy initialization - called on first use
const getGroq = () => {
  if (groq) return groq;
  const key = process.env.GROQ_API_KEY;
  if (key && key !== 'your_groq_api_key_here') {
    groq = new Groq({ apiKey: key });
    console.log('Groq AI initialized successfully');
  }
  return groq;
};

// Rule-based evaluation (fallback when no API key)
const evaluateTeamRuleBased = (summary) => {
  const { consistencyScore, averageCompletion, totalUpdates } = summary;

  const score = Math.round(
    (consistencyScore * 0.3) +
    (averageCompletion * 0.5) +
    (Math.min(totalUpdates * 10, 20))
  );

  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  const strengths = [];
  if (consistencyScore >= 80) strengths.push('Excellent consistency in updates');
  else if (consistencyScore >= 60) strengths.push('Good update frequency');
  if (averageCompletion >= 80) strengths.push('High completion rate showing strong progress');
  else if (averageCompletion >= 60) strengths.push('Steady progress towards project goals');
  if (totalUpdates >= 5) strengths.push('Regular documentation and tracking');
  else if (totalUpdates >= 3) strengths.push('Adequate project updates');

  const weaknesses = [];
  if (consistencyScore < 60) weaknesses.push('Inconsistent update pattern needs improvement');
  if (averageCompletion < 60) weaknesses.push('Low completion rate indicates potential delays');
  if (totalUpdates < 3) weaknesses.push('Insufficient project updates and documentation');

  const suggestions = [];
  if (consistencyScore < 70) suggestions.push('Establish a regular update schedule (e.g., weekly)');
  if (averageCompletion < 70) suggestions.push('Break down tasks into smaller milestones');
  if (totalUpdates < 5) suggestions.push('Increase documentation frequency');
  suggestions.push('Continue monitoring progress and adjust strategies as needed');

  if (strengths.length === 0) strengths.push('Team is making progress on the project');
  if (weaknesses.length === 0) weaknesses.push('Continue current approach with minor refinements');

  return { grade, score, strengths, weaknesses, suggestions };
};

export const evaluateTeam = async (summary) => {
  const groq = getGroq();
  if (!groq) {
    console.log('Using rule-based evaluation (no Groq API key)');
    return evaluateTeamRuleBased(summary);
  }

  try {
    const prompt = `You are an academic evaluator assessing a student project team's performance.

Evaluate the following team based on:
1. Consistency of updates (Consistency Score: ${summary.consistencyScore}/100)
2. Completion percentage (Average: ${summary.averageCompletion}%)
3. Update quality and frequency (Total Updates: ${summary.totalUpdates})

Team Summary:
${summary.summaryText}

Provide your evaluation in the following JSON format only (no extra text):
{
  "grade": "A/B/C/D/F",
  "score": 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced academic evaluator. Respond with valid JSON only, no markdown, no extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    // Extract JSON if wrapped in markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      grade: evaluation.grade,
      score: evaluation.score,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      suggestions: evaluation.suggestions || []
    };
  } catch (error) {
    console.error('Groq Evaluation Error:', error.message);
    console.log('Falling back to rule-based evaluation');
    return evaluateTeamRuleBased(summary);
  }
};

export const chatWithAI = async (question, context = null) => {
  const groq = getGroq();
  if (!groq) {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('best') || lowerQuestion.includes('top')) {
      return 'Check the Dashboard page to see top performing teams ranked by score.';
    }
    if (lowerQuestion.includes('worst') || lowerQuestion.includes('improvement')) {
      return 'Teams with grade D/F need improvement. Focus on consistency and completion rate.';
    }
    if (lowerQuestion.includes('average')) {
      return 'Check the Dashboard for average performance metrics across all teams.';
    }
    return 'Upload your data first, then I can help analyze team performance. Add a Groq API key for AI-powered responses.';
  }

  try {
    let userMessage = question;
    if (context) {
      userMessage = `Context:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${question}`;
    }

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping analyze academic project data. Provide clear, concise answers.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq Chat Error:', error.message);
    throw new Error(`AI chat failed: ${error.message}`);
  }
};

// Flexible AI evaluation for any data structure
export const analyzeFlexibleData = async (data, headers, analysisType = 'auto-ai') => {
  const groq = getGroq();
  
  // Prepare data summary
  const sampleRows = data.slice(0, 5);
  const dataText = `
Headers: ${headers.join(', ')}
Total Rows: ${data.length}
Sample Data (first 5 rows):
${JSON.stringify(sampleRows, null, 2)}
  `.trim();

  if (!groq) {
    return {
      analysisType: 'rule-based',
      insights: [
        `Dataset contains ${data.length} rows and ${headers.length} columns`,
        'Add Groq API key for AI-powered insights',
        'Columns: ' + headers.join(', ')
      ],
      summary: `Basic analysis completed. ${data.length} records found with ${headers.length} columns.`,
      statistics: calculateBasicStats(data, headers)
    };
  }

  try {
    const prompt = `Analyze this dataset and provide comprehensive insights.

${dataText}

Provide analysis in this JSON format:
{
  "insights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "summary": "2-3 sentence overall assessment"
}`;

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst. Respond with valid JSON only, no markdown, no extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      analysisType: 'ai-powered',
      ...analysis,
      statistics: calculateBasicStats(data, headers),
      metadata: {
        totalRows: data.length,
        totalColumns: headers.length,
        columns: headers
      }
    };
  } catch (error) {
    console.error('Groq Flexible Analysis Error:', error.message);
    return {
      analysisType: 'rule-based-fallback',
      insights: [
        `Dataset contains ${data.length} rows and ${headers.length} columns`,
        'Columns: ' + headers.join(', '),
        'AI analysis temporarily unavailable'
      ],
      summary: `Basic analysis completed. ${data.length} records analyzed.`,
      statistics: calculateBasicStats(data, headers)
    };
  }
};

// Calculate basic statistics
const calculateBasicStats = (data, headers) => {
  const stats = {};
  
  headers.forEach(header => {
    const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    stats[header] = {
      totalValues: values.length,
      uniqueValues: new Set(values).size,
      emptyValues: data.length - values.length
    };
    
    if (numericValues.length > 0) {
      stats[header].numeric = {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
        sum: numericValues.reduce((a, b) => a + b, 0)
      };
    }
  });
  
  return stats;
};
