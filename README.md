# 🎓 AI-Powered Academic Project Evaluation System

> A full-stack application for evaluating academic team projects using AI-powered analysis

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Backend](https://img.shields.io/badge/Backend-Running-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-Running-success)]()
[![Version](https://img.shields.io/badge/Version-3.0-blue)]()
[![New](https://img.shields.io/badge/NEW-Flexible%20Analysis-orange)]()

---

## 🌟 Overview

This system allows educators and administrators to upload team project data (CSV or Excel) and receive AI-powered evaluations including grades, scores, strengths, weaknesses, and improvement suggestions. 

**NEW in v3.0:** Now supports **ANY Excel/CSV file** with flexible column mapping and custom analysis options! Upload student grades, sales data, survey responses, or any tabular data and get AI-powered insights.

---

## ✨ Key Features

- 📤 **File Upload**: Drag & drop CSV or Excel files (.csv, .xls, .xlsx)
- 🎯 **Flexible Analysis**: Upload ANY Excel/CSV with custom column mapping
- 🤖 **AI Evaluation**: Automatic grading (A-F) and scoring (0-100)
- 💬 **Chat Assistant**: Ask questions and get AI-powered insights
- 📊 **Dashboard**: Visual analytics and performance metrics
- 👥 **Team Analysis**: Detailed breakdown of each team's performance
- 📄 **Reports**: Generate and download comprehensive reports
- 🔒 **Secure**: Rate limiting, validation, and security headers
- ⚡ **Fast**: Optimized performance with caching and compression

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- MongoDB (optional, for data persistence)

### 1. Clone & Install
```bash
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
```

### 2. Configure Environment
```bash
# Edit Backend/.env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Start Servers
```bash
# Backend (Terminal 1)
cd Backend
npm run dev

# Frontend (Terminal 2)
cd Frontend
npm run dev
```

### 4. Open Application
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

### 5. Upload Sample Data
- Navigate to http://localhost:5173/upload
- Upload `Backend/sample-data.csv` or `Backend/sample-data.xlsx`
- Click "Upload & Analyze"
- View AI-powered results!

---

## 📁 Project Structure

```
.
├── Backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # OpenAI integration
│   │   ├── utils/             # CSV/Excel parsers
│   │   └── middleware/        # Validation, logging, etc.
│   ├── logs/                  # Access logs
│   ├── uploads/               # Temporary file storage
│   ├── sample-data.csv        # Sample CSV file
│   ├── sample-data.xlsx       # Sample Excel file
│   ├── .env                   # Environment variables
│   └── server.js              # Entry point
│
├── Frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   └── assets/            # Images, icons
│   └── .env                   # Environment variables
│
└── Documentation/
    ├── START-HERE.md          # 👈 Start here!
    ├── QUICK-REFERENCE.md     # Quick commands
    ├── SYSTEM-READY.md        # System status
    ├── SYSTEM-STATUS-COMPLETE.md  # Complete details
    ├── TESTING-GUIDE.md       # Testing instructions
    └── FULL-INTEGRATION-SUMMARY.md  # Integration info
```

---

## 🎯 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Backend** | ✅ Running | http://localhost:5000 |
| **Frontend** | ✅ Running | http://localhost:5173 |
| **File Upload** | ✅ Working | CSV + Excel support |
| **AI Features** | ⚠️ Needs Key | Add OpenAI API key |
| **MongoDB** | ⚠️ Optional | Not required |

---

## 📖 Documentation

### Getting Started
- **[START-HERE.md](START-HERE.md)** - Complete quick start guide
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Commands and tips
- **[SYSTEM-READY.md](SYSTEM-READY.md)** - System status overview

### Technical Details
- **[SYSTEM-STATUS-COMPLETE.md](SYSTEM-STATUS-COMPLETE.md)** - Complete system documentation
- **[FULL-INTEGRATION-SUMMARY.md](FULL-INTEGRATION-SUMMARY.md)** - Integration details
- **[TESTING-GUIDE.md](TESTING-GUIDE.md)** - How to test the system

### Component Documentation
- **[Backend/README.md](Backend/README.md)** - Backend documentation
- **[Frontend/README.md](Frontend/README.md)** - Frontend documentation

---

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (optional)
- **AI**: OpenAI GPT-4o-mini
- **File Upload**: Multer
- **Parsing**: csv-parser, xlsx
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **Logging**: Morgan

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM

---

## 📊 File Format

### Supported Formats
- CSV (.csv)
- Excel 97-2003 (.xls)
- Excel 2007+ (.xlsx)

### Required Columns
1. **Team Name** - Name of the team
2. **Project Title** - Project name
3. **Update** - Description of update
4. **Completion %** - Progress percentage (0-100)
5. **Date** - Update date (any standard format)

### Example
```csv
Team Name,Project Title,Update,Completion %,Date
Team Alpha,AI Chatbot,Initial setup,25,2024-01-15
Team Alpha,AI Chatbot,Backend completed,50,2024-01-22
```

---

## 🎨 Features

### 1. File Upload
- Drag & drop interface
- File validation (type, size)
- Support for CSV and Excel
- Real-time parsing
- Progress indicators

### 2. Flexible Analysis (NEW! 🎉)
- **Upload ANY Excel/CSV file** - No fixed format required
- **Custom Column Mapping** - Specify your own column names
- **Row-Level Control** - Analyze specific rows (e.g., rows 10-50)
- **Multiple Analysis Types**:
  - Summary Statistics (min, max, average, etc.)
  - AI Evaluation (insights, patterns, recommendations)
  - Column Analysis (detailed per-column stats)
  - Raw Data (parsed as-is)
- **Auto Structure Detection** - Preview file structure before analysis
- **Flexible for Any Use Case** - Student grades, sales data, surveys, etc.

**Access:** Navigate to `/flexible-upload` or click "Flexible Analysis" in sidebar

### 3. AI Evaluation
- Automatic grading (A-F)
- Score calculation (0-100)
- Strengths identification
- Weaknesses analysis
- Improvement suggestions
- Context-aware evaluation

### 4. Dashboard
- Total teams counter
- Average performance score
- Best performer highlight
- Grade distribution chart
- Team performance table
- Visual progress bars

### 5. Team Analysis
- Expandable team cards
- Detailed performance metrics
- AI-generated feedback
- Summary statistics
- Color-coded grades

### 6. AI Chat
- Real-time chat interface
- Context-aware responses
- Suggested questions
- Typing indicators
- Auto-scroll

### 7. Reports
- Comprehensive reports
- Download as PDF
- Print functionality
- Share with stakeholders

---

## 🔒 Security

- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting (per endpoint)
- ✅ Input validation
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ Auto-delete uploaded files
- ✅ Environment variables for secrets

---

## ⚡ Performance

- ✅ Gzip compression
- ✅ Response caching (with MongoDB)
- ✅ Efficient file parsing
- ✅ Async operations
- ✅ Optimized re-renders
- ✅ Smooth animations

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

### Manual Testing
See [TESTING-GUIDE.md](TESTING-GUIDE.md) for complete testing instructions.

---

## 📝 API Endpoints

### Health Check
```
GET /health
```

### Upload & Parse
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (CSV or Excel)
```

### Analyze with AI
```
POST /api/analyze
Content-Type: multipart/form-data
Body: file (CSV or Excel)
```

### Chat with AI
```
POST /api/chat
Content-Type: application/json
Body: { "question": "Your question" }
```

### Analysis History
```
GET /api/analyze/history?teamName=optional
```

### Flexible Analysis (NEW! 🎉)

#### Get File Structure
```
POST /api/flexible/structure
Content-Type: multipart/form-data
Body: file (CSV or Excel)

Response:
{
  "success": true,
  "structure": {
    "headers": ["Column1", "Column2", ...],
    "rowCount": 100,
    "columnCount": 5,
    "preview": [...]
  }
}
```

#### Flexible Analyze
```
POST /api/flexible/analyze
Content-Type: multipart/form-data
Body: 
  - file (CSV or Excel)
  - columnMapping (JSON string, optional)
    Example: {"teamName": "Team Name", "score": "Score"}
  - analyzeType (string, optional)
    Options: "summary" | "ai-evaluation" | "column-analysis" | "raw"
  - rowRange (JSON string, optional)
    Example: {"startRow": 1, "endRow": 50, "columns": [0, 2, 4]}

Response:
{
  "success": true,
  "results": { ... },
  "metadata": {
    "processingTime": "234ms",
    "recordCount": 50
  }
}
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd Backend
npm install
npm run dev
```

### Frontend won't start
```bash
cd Frontend
npm install
npm run dev
```

### AI features not working
- Check if OpenAI API key is set in `Backend/.env`
- Verify the key is valid
- Restart the backend server

### File upload fails
- Ensure file is .csv, .xls, or .xlsx
- Check file size is under 10MB
- Verify all required columns are present

---

## 🚀 Deployment

### Backend
- **Heroku**: Easy deployment with MongoDB add-on
- **Railway**: Modern platform with free tier
- **Render**: Free tier available
- **AWS EC2**: Full control

### Frontend
- **Vercel**: Recommended for React apps
- **Netlify**: Easy deployment
- **GitHub Pages**: Free hosting

### Database
- **MongoDB Atlas**: Free tier available (recommended)
- **Local MongoDB**: For development

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- React team for the amazing framework
- Express.js for the robust backend framework
- All open-source contributors

---

## 📞 Support

For issues and questions:
- Check the [documentation files](#-documentation)
- Review the [troubleshooting section](#-troubleshooting)
- Open an issue on GitHub

---

## 🎉 What's New in v3.0

- ✨ **Flexible Analysis**: Upload ANY Excel/CSV file with custom column mapping
- ✨ **Auto Structure Detection**: Preview file structure before analysis
- ✨ **Row-Level Control**: Analyze specific rows (e.g., rows 10-50)
- ✨ **Multiple Analysis Types**: Summary, AI Evaluation, Column Analysis, Raw Data
- ✨ **New UI Page**: Dedicated Flexible Analysis page with intuitive interface
- ✨ **Enhanced API**: New `/api/flexible/*` endpoints for flexible data processing
- ✨ **Better Documentation**: Comprehensive guides for flexible analysis

### Previous Updates (v2.0)
- ✨ **Excel Support**: Upload .xls and .xlsx files
- ✨ **Increased File Limit**: Now supports up to 10MB (was 5MB)
- ✨ **Excel Date Handling**: Automatic conversion of Excel date formats
- ✨ **Improved Validation**: Better error messages for Excel files
- ✨ **Enhanced Documentation**: Complete guides and references

---

## 🎯 Roadmap

- [ ] User authentication
- [ ] Team collaboration features
- [ ] Export to multiple formats
- [ ] Advanced analytics
- [ ] Custom evaluation criteria
- [ ] Email notifications
- [ ] Mobile app

---

## 📊 Stats

- **Lines of Code**: ~7,000+
- **Components**: 16+
- **API Endpoints**: 8
- **Documentation Files**: 10+
- **Supported File Formats**: 3 (CSV, XLS, XLSX)
- **Maximum File Size**: 10MB
- **Analysis Types**: 4 (Summary, AI Evaluation, Column Analysis, Raw Data)

---

## 🌟 Key Highlights

✅ **Production Ready** - Fully tested and documented  
✅ **AI Powered** - OpenAI GPT-4o-mini integration  
✅ **Flexible Analysis** - Upload ANY Excel/CSV file (NEW!)  
✅ **Custom Column Mapping** - Specify your own columns (NEW!)  
✅ **Multiple Analysis Types** - Summary, AI, Column, Raw (NEW!)  
✅ **Excel Support** - CSV + Excel file formats  
✅ **User Friendly** - Intuitive drag & drop interface  
✅ **Secure** - Rate limiting and validation  
✅ **Fast** - Optimized performance  
✅ **Well Documented** - 10+ comprehensive guides  
✅ **Responsive** - Works on all devices  

---

## 🎊 Get Started Now!

1. **Read**: [START-HERE.md](START-HERE.md)
2. **Configure**: Add OpenAI API key to `Backend/.env`
3. **Run**: Start backend and frontend servers
4. **Upload**: Use sample data files
5. **Explore**: Try all features!

**Your AI-powered evaluation system is ready to use! 🚀**

---

**Last Updated**: May 13, 2026  
**Version**: 3.0 (with Flexible Analysis)  
**Status**: ✅ Production Ready

---

Made with ❤️ for educators and students

**NEW:** Now supports flexible analysis for ANY data! 🎉
