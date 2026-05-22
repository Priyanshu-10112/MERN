# 📊 Excel Analyzer - AI-Powered Data Analysis Platform

> Full-stack MERN application for intelligent data analysis using Groq AI

## 🌟 Overview

Upload CSV/Excel files and get AI-powered insights with team evaluations, interactive visualizations, and context-aware chat assistance.

**Key Features:**
- 📤 **Smart Upload:** Drag & drop CSV/Excel files (up to 10MB)
- 🤖 **AI Analysis:** Powered by Groq (llama-3.3-70b-versatile)
- 📊 **Visual Dashboard:** Interactive charts and performance metrics
- 💬 **Context-Aware Chat:** Ask questions about your uploaded data
- 🎯 **Flexible Analysis:** Auto-AI, Team Evaluation, or Custom analysis
- 📝 **Column Mapping:** Map your data columns for team evaluations
- 💾 **MongoDB Storage:** Persistent data with upload history
- 📈 **Real-time Stats:** Team performance tracking and grade distribution

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API key ([Get free key](https://console.groq.com))

### Setup

**1. Clone Repository**
```bash
git clone https://github.com/Priyanshu-10112/MERN.git
cd MERN
```

**2. Install Dependencies**
```bash
# Backend
cd Backend
npm install

# Frontend  
cd Frontend
npm install
```

**3. Configure Environment**
```bash
# Backend/.env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb://localhost:27017/excel-analyzer
PORT=5000

# Frontend/.env
VITE_API_URL=http://localhost:5000
```

**4. Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
```

**5. Seed Sample Data (Optional)**
```bash
cd Backend
node seedData.js
```

**6. Start Servers**
```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

**7. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

---

## 📁 Project Structure

```
MERN/
├── Backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   │   ├── analyzeController.js      # AI analysis logic
│   │   │   ├── chatController.js         # Chat functionality
│   │   │   ├── uploadController.js       # File upload handling
│   │   │   ├── historyController.js      # Upload/analysis history
│   │   │   └── flexibleAnalyzeController.js
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # External services
│   │   │   └── aiService.js              # Groq AI integration
│   │   ├── utils/          # Helper functions
│   │   │   ├── csvParser.js              # CSV parsing
│   │   │   ├── excelParser.js            # Excel parsing
│   │   │   └── dataProcessor.js          # Data transformation
│   │   ├── middleware/     # Express middleware
│   │   │   ├── errorHandler.js
│   │   │   ├── fileValidation.js
│   │   │   ├── rateLimiter.js
│   │   │   └── requestValidator.js
│   │   └── models/         # MongoDB schemas
│   │       ├── Upload.js                 # Upload metadata
│   │       ├── Analysis.js               # Analysis results
│   │       └── ChatHistory.js            # Chat conversations
│   ├── uploads/            # Temporary file storage
│   ├── logs/               # Application logs
│   ├── seedData.js         # Mock data generator
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
│
└── Frontend/                # React + Vite SPA
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── FileUpload.jsx
    │   │   ├── ChatInterface.jsx
    │   │   ├── DashboardStats.jsx
    │   │   └── TeamCard.jsx
    │   ├── pages/          # Route pages
    │   │   ├── Dashboard.jsx             # Main dashboard
    │   │   ├── EnhancedUpload.jsx        # 5-step upload flow
    │   │   ├── History.jsx               # Upload history
    │   │   ├── AIChat.jsx                # Context-aware chat
    │   │   ├── TeamAnalysis.jsx          # Team performance
    │   │   ├── AIEvaluation.jsx          # AI evaluations
    │   │   └── Reports.jsx               # Export reports
    │   ├── services/       # API client
    │   │   └── api.js                    # Axios configuration
    │   ├── assets/         # Static files
    │   └── App.jsx         # Root component
    ├── public/             # Public assets
    ├── .env                # Frontend config
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- Groq AI (llama-3.3-70b-versatile)
- Multer (file uploads)
- csv-parser & xlsx (data parsing)
- Winston (logging)

**Frontend:**
- React 18 with Vite
- React Router v6
- Recharts (data visualization)
- Axios (HTTP client)
- Lucide React (icons)
- CSS3 with custom styling

**Security & Performance:**
- Helmet.js (security headers)
- CORS configuration
- Rate limiting
- Input validation
- Error handling middleware
- Request logging

**Database:**
- MongoDB (local or Atlas)
- Collections: uploads, analyses, chathistories

---

## 📊 API Endpoints

### Upload & Analysis
- `POST /api/upload` - Upload and parse CSV/Excel file
- `POST /api/analyze` - Analyze uploaded data with AI
- `POST /api/flexible/analyze` - Flexible data analysis

### Chat
- `POST /api/chat` - Context-aware AI chat

### History
- `GET /api/history/uploads` - Get upload history
- `GET /api/history/analysis/:id` - Get specific analysis
- `GET /api/history/chat/:uploadId` - Get chat history for upload

### System
- `GET /health` - Health check endpoint

## 🎯 Usage Flow

1. **Upload File:** Navigate to Upload page, drag & drop CSV/Excel file
2. **Preview Data:** Review parsed data structure and columns
3. **Configure Analysis:** 
   - Select analysis type (Auto-AI, Team Evaluation, Flexible)
   - Map columns for team evaluation (if selected)
4. **Analyze:** AI processes data and generates insights
5. **View Results:** See grades, scores, charts, and recommendations
6. **Chat:** Ask questions about your data in AI Chat page
7. **History:** Access previous uploads and analyses

## 📈 Features in Detail

### Dashboard
- Welcome section with platform overview
- Feature highlights (Smart Analysis, Team Evaluation, Chat)
- Team performance statistics (when data available)
- Interactive charts and grade distribution
- Top performer tracking

### Enhanced Upload
- 5-step upload flow with progress tracking
- File validation (CSV/Excel, max 10MB)
- Real-time data preview
- Column mapping for team evaluations
- Analysis type selection

### AI Chat
- Context-aware conversations about uploaded data
- Auto-loads available uploads
- Upload selector dropdown
- Chat history persistence

### Team Analysis
- Team-wise performance breakdown
- Grades and scores visualization
- Strengths and weaknesses analysis
- Improvement recommendations

## 🔐 Environment Variables

**Backend (.env):**
```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=mongodb://localhost:27017/excel-analyzer
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ using MERN Stack + Groq AI**
