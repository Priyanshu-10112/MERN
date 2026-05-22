import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Upload from './src/models/Upload.js';
import Analysis from './src/models/Analysis.js';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const uploads = await Upload.find().sort({ uploadedAt: -1 });
    console.log(`📁 Uploads: ${uploads.length}`);
    uploads.forEach(u => {
      console.log(`  - ${u.fileName} (${u.rowCount} rows, ${u.columnCount} cols) - ${new Date(u.uploadedAt).toLocaleString()}`);
    });

    console.log('');
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    console.log(`📊 Analyses: ${analyses.length}`);
    analyses.forEach(a => {
      console.log(`  - Type: ${a.analysisType}, Upload: ${a.uploadId} - ${new Date(a.createdAt).toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDB();
