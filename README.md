# 🎓 AI-Powered Academic Project Evaluation System

> Full-stack MERN application for evaluating academic team projects using Groq AI

## 🌟 Overview

Upload team project data (CSV/Excel) and get AI-powered evaluations with grades, scores, strengths, weaknesses, and improvement suggestions.

**Features:**
- 📤 Drag & drop CSV/Excel upload
- 🤖 AI evaluation using Groq (llama3-8b-8192)
- 📊 Visual dashboard with charts
- 💬 AI chat assistant
- 🎯 Flexible column mapping

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Groq API key ([Get free key](https://console.groq.com))

### Setup

**1. Install Dependencies**
```bash
# Backend
cd Backend
npm install

# Frontend  
cd Frontend
npm install
```

**2. Environment Already Configured**
```bash
# Backend/.env already has Groq API key configured
✅ Ready to use!
```

**3. Start Servers**
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**5. Test with Sample Data**
- Upload `Backend/sample-data.csv` from Upload page
- View AI-powered results instantly!

---

## 📁 Project Structure

```
MERN/
├── Backend/                 # Node.js + Express
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Groq AI integration
│   │   ├── utils/          # Parsers & helpers
│   │   ├── middleware/     # Validation, security
│   │   └── models/         # MongoDB schemas
│   ├── sample-data.csv     # Test data
│   ├── sample-data.xlsx    # Test data
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
└── Frontend/                # React + Vite
    ├── src/
    │   ├── components/     # Reusable UI
    │   ├── pages/          # Dashboard, Upload, etc.
    │   ├── services/       # API client
    │   └── assets/         # Images, icons
    └── .env                # Frontend config
```

---

## 🔧 Tech Stack

**Backend:** Node.js, Express, Groq AI (llama3-8b-8192), Multer, csv-parser, xlsx  
**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Axios, React Router  
**Security:** Helmet, CORS, Rate Limiting, Input Validation

**Note:** No database required - results shown immediately after analysis!

---

## 📊 API Endpoints

**Health Check:** `GET /health`  
**Upload & Parse:** `POST /api/upload` (multipart/form-data)  
**AI Analysis:** `POST /api/analyze` (multipart/form-data)  
**Chat with AI:** `POST /api/chat` (JSON body)  
**Analysis History:** `GET /api/analyze/history`  
**Flexible Analysis:** `POST /api/flexible/analyze`

## 📝 License

MIT License

---

Made with ❤️ for educators and students
