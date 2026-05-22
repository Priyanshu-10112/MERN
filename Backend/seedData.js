import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Upload from './src/models/Upload.js';
import Analysis from './src/models/Analysis.js';
import ChatHistory from './src/models/ChatHistory.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Upload.deleteMany({});
    await Analysis.deleteMany({});
    await ChatHistory.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create mock uploads
    const uploads = await Upload.insertMany([
      {
        fileName: 'students_data.xlsx',
        fileSize: 245678,
        fileType: 'xlsx',
        rowCount: 150,
        columnCount: 8,
        columns: ['Student Name', 'Roll No', 'Marks', 'Grade', 'Attendance', 'Project Score', 'Lab Score', 'Total'],
        uploadedAt: new Date('2026-05-20T10:30:00Z')
      },
      {
        fileName: 'sales_report.csv',
        fileSize: 189234,
        fileType: 'csv',
        rowCount: 200,
        columnCount: 6,
        columns: ['Date', 'Product', 'Quantity', 'Price', 'Revenue', 'Region'],
        uploadedAt: new Date('2026-05-21T14:15:00Z')
      },
      {
        fileName: 'employee_performance.xlsx',
        fileSize: 312456,
        fileType: 'xlsx',
        rowCount: 75,
        columnCount: 10,
        columns: ['Employee ID', 'Name', 'Department', 'Rating', 'Projects', 'Hours', 'Efficiency', 'Team Lead', 'Salary', 'Bonus'],
        uploadedAt: new Date('2026-05-22T09:00:00Z')
      }
    ]);

    console.log(`✅ Created ${uploads.length} uploads`);

    // Create mock analyses
    const analyses = await Analysis.insertMany([
      {
        uploadId: uploads[0]._id,
        analysisType: 'team-evaluation',
        results: {
          'Team Alpha': {
            grade: 'A+',
            score: 95,
            strengths: ['Excellent code quality', 'Strong documentation', 'Regular updates'],
            weaknesses: ['Could improve testing coverage'],
            suggestions: ['Add more unit tests', 'Consider CI/CD integration'],
            summary: {
              totalUpdates: 12,
              averageCompletion: 95,
              lastUpdateDate: '2026-05-20',
              consistencyScore: 9.2
            }
          },
          'Team Beta': {
            grade: 'A',
            score: 88,
            strengths: ['Good project structure', 'Active collaboration'],
            weaknesses: ['Inconsistent commit messages', 'Missing some documentation'],
            suggestions: ['Standardize commit format', 'Add API documentation'],
            summary: {
              totalUpdates: 10,
              averageCompletion: 88,
              lastUpdateDate: '2026-05-19',
              consistencyScore: 8.5
            }
          },
          'Team Gamma': {
            grade: 'B+',
            score: 82,
            strengths: ['Creative approach', 'Good UI design'],
            weaknesses: ['Backend needs improvement', 'Slow progress'],
            suggestions: ['Focus on backend optimization', 'Increase update frequency'],
            summary: {
              totalUpdates: 8,
              averageCompletion: 75,
              lastUpdateDate: '2026-05-18',
              consistencyScore: 7.8
            }
          },
          'Team Delta': {
            grade: 'B',
            score: 75,
            strengths: ['Functional features', 'Basic requirements met'],
            weaknesses: ['Limited features', 'Needs more polish'],
            suggestions: ['Add advanced features', 'Improve error handling'],
            summary: {
              totalUpdates: 7,
              averageCompletion: 70,
              lastUpdateDate: '2026-05-17',
              consistencyScore: 7.0
            }
          }
        },
        insights: [
          'Team Alpha leads with exceptional 95% completion rate',
          'All teams showing consistent progress with regular updates',
          'Code quality is strong across top 3 teams',
          'Team Delta needs to accelerate development pace',
          'Overall project health is good with 85% average completion'
        ],
        summary: 'Strong team performance overall. Team Alpha sets the benchmark with excellent execution. All teams are making steady progress with room for improvement in testing and documentation.',
        metadata: {
          processingTime: '2.8s',
          recordCount: 150,
          aiModel: 'llama-3.3-70b-versatile'
        },
        analyzedAt: new Date('2026-05-20T10:32:00Z')
      },
      {
        uploadId: uploads[1]._id,
        analysisType: 'flexible',
        results: {
          totalRevenue: 1250000,
          topProducts: [
            { product: 'Laptop', revenue: 450000, quantity: 150 },
            { product: 'Mobile', revenue: 380000, quantity: 380 },
            { product: 'Tablet', revenue: 220000, quantity: 200 }
          ],
          regionPerformance: {
            'North': 420000,
            'South': 380000,
            'East': 250000,
            'West': 200000
          },
          trends: {
            growthRate: '15.5%',
            bestMonth: 'April 2026',
            seasonality: 'High demand in Q1'
          }
        },
        insights: [
          'Total revenue of ₹12.5L achieved in the period',
          'North region leads with 33.6% of total sales',
          'Laptops are the highest revenue generator',
          'Mobile phones have highest volume (380 units)',
          'Consistent 15.5% month-over-month growth'
        ],
        summary: 'Strong sales performance across all regions with laptops and mobiles driving majority of revenue. North region shows exceptional performance.',
        metadata: {
          processingTime: '3.2s',
          recordCount: 200,
          aiModel: 'llama-3.3-70b-versatile'
        },
        analyzedAt: new Date('2026-05-21T14:18:00Z')
      },
      {
        uploadId: uploads[2]._id,
        analysisType: 'team-evaluation',
        results: {
          averageRating: 4.2,
          departmentStats: {
            'Engineering': { avgRating: 4.5, employees: 30 },
            'Sales': { avgRating: 4.1, employees: 25 },
            'Marketing': { avgRating: 3.9, employees: 20 }
          },
          topPerformers: [
            { name: 'Vikram Patel', rating: 5.0, department: 'Engineering' },
            { name: 'Sneha Reddy', rating: 4.9, department: 'Sales' },
            { name: 'Arjun Mehta', rating: 4.8, department: 'Engineering' }
          ],
          efficiency: {
            high: 45,
            medium: 25,
            low: 5
          }
        },
        insights: [
          'Overall team performance is excellent with 4.2/5 average rating',
          'Engineering department leads with 4.5 average rating',
          '60% employees show high efficiency levels',
          'Strong correlation between projects completed and ratings',
          'Team leads consistently rate higher than average'
        ],
        summary: 'Excellent team performance across all departments. Engineering shows exceptional results. High efficiency maintained by majority of workforce.',
        metadata: {
          processingTime: '2.5s',
          recordCount: 75,
          aiModel: 'llama-3.3-70b-versatile'
        },
        analyzedAt: new Date('2026-05-22T09:05:00Z')
      }
    ]);

    console.log(`✅ Created ${analyses.length} analyses`);

    // Create mock chat histories
    const chatHistories = await ChatHistory.insertMany([
      {
        uploadId: uploads[0]._id,
        messages: [
          {
            role: 'user',
            content: 'Top 5 students kaun hai?',
            timestamp: new Date('2026-05-20T10:35:00Z')
          },
          {
            role: 'assistant',
            content: 'Top 5 students based on total marks:\n1. Rahul Kumar - 98 marks (A+)\n2. Priya Sharma - 95 marks (A+)\n3. Amit Singh - 92 marks (A)\n4. Neha Gupta - 90 marks (A)\n5. Rohan Verma - 88 marks (A)\n\nYe students consistently performed well across all subjects.',
            timestamp: new Date('2026-05-20T10:35:03Z')
          },
          {
            role: 'user',
            content: 'Attendance ka marks pe kya impact hai?',
            timestamp: new Date('2026-05-20T10:36:00Z')
          },
          {
            role: 'assistant',
            content: 'Attendance ka marks pe strong positive correlation hai (0.78):\n\n- 90%+ attendance: Average 82 marks\n- 75-90% attendance: Average 72 marks\n- Below 75%: Average 58 marks\n\nStudents with better attendance consistently score higher. Regular class participation helps in better understanding.',
            timestamp: new Date('2026-05-20T10:36:05Z')
          }
        ],
        context: {
          fileName: 'students_data.xlsx',
          totalRecords: 150
        }
      },
      {
        uploadId: uploads[1]._id,
        messages: [
          {
            role: 'user',
            content: 'Which region has best sales?',
            timestamp: new Date('2026-05-21T14:20:00Z')
          },
          {
            role: 'assistant',
            content: 'North region has the best sales performance:\n\n1. North: ₹4,20,000 (33.6%)\n2. South: ₹3,80,000 (30.4%)\n3. East: ₹2,50,000 (20%)\n4. West: ₹2,00,000 (16%)\n\nNorth region leads by ₹40,000 over South. Focus on replicating North region strategies in other areas.',
            timestamp: new Date('2026-05-21T14:20:04Z')
          }
        ],
        context: {
          fileName: 'sales_report.csv',
          totalRecords: 200
        }
      }
    ]);

    console.log(`✅ Created ${chatHistories.length} chat histories`);

    console.log('\n🎉 Mock data seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- ${uploads.length} uploads`);
    console.log(`- ${analyses.length} analyses`);
    console.log(`- ${chatHistories.length} chat histories`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
