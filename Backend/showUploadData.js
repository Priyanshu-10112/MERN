import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Upload from './src/models/Upload.js';
import Analysis from './src/models/Analysis.js';

dotenv.config();

const showData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get latest upload
    const latestUpload = await Upload.findOne({ 
      fileName: 'team_project_updates.xlsx' 
    }).sort({ uploadedAt: -1 });

    if (!latestUpload) {
      console.log('❌ No upload found');
      process.exit(1);
    }

    console.log('📁 Latest Upload:');
    console.log(`   File: ${latestUpload.fileName}`);
    console.log(`   Rows: ${latestUpload.rowCount}`);
    console.log(`   Columns: ${latestUpload.columnCount}`);
    console.log(`   Column Names: ${latestUpload.columns.join(', ')}`);
    console.log(`   Uploaded: ${latestUpload.uploadedAt}\n`);

    // Get latest analysis
    const latestAnalysis = await Analysis.findOne({ 
      uploadId: latestUpload._id 
    }).sort({ createdAt: -1 });

    if (latestAnalysis) {
      console.log('📊 Latest Analysis:');
      console.log(`   Type: ${latestAnalysis.analysisType}`);
      console.log(`   Created: ${latestAnalysis.createdAt}`);
      
      if (latestAnalysis.analysisType === 'auto-ai' || latestAnalysis.analysisType === 'flexible') {
        console.log('\n   Results (first 500 chars):');
        console.log('   ' + JSON.stringify(latestAnalysis.results, null, 2).substring(0, 500) + '...');
      } else if (latestAnalysis.analysisType === 'team-evaluation') {
        console.log('\n   Teams:');
        Object.keys(latestAnalysis.results).forEach(team => {
          const data = latestAnalysis.results[team];
          console.log(`   - ${team}: Grade ${data.grade}, Score ${data.score}`);
        });
      }
    }

    console.log('\n💡 Note: The uploaded file data was parsed but not stored in DB.');
    console.log('   To see actual Excel data, you need to re-upload with team-evaluation type.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

showData();
