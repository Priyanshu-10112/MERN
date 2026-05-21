# Academic Project Evaluation System - Backend

AI-powered backend for evaluating academic project teams using OpenAI API.

## Tech Stack

- Node.js + Express.js
- MongoDB (Mongoose)
- OpenAI API
- Multer (file upload)
- csv-parser

## Features

✅ CSV Upload & Parsing  
✅ Team Data Processing & Analysis  
✅ AI-Powered Evaluation (OpenAI)  
✅ Chat Assistant for Insights  
✅ MongoDB Storage with Caching  
✅ Clean MVC Architecture  

## Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/academic-evaluation
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 3. Create Uploads Folder

```bash
mkdir uploads
```

### 4. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 5. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### 1. Upload CSV
**POST** `/api/upload`

Upload and parse CSV file.

**Request:**
- Form-data: `file` (CSV file)

**Response:**
```json
{
  "success": true,
  "message": "CSV uploaded and parsed successfully",
  "data": [...],
  "count": 10
}
```

**CSV Format:**
```csv
Team Name,Project Title,Update,Completion %,Date
Team Alpha,AI Chatbot,Initial setup,25,2024-01-15
Team Alpha,AI Chatbot,Backend complete,60,2024-02-01
```

---

### 2. Analyze Data
**POST** `/api/analyze`

Upload CSV and get AI evaluation for each team.

**Request:**
- Form-data: `file` (CSV file)

**Response:**
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "data": {
    "Team Alpha": {
      "grade": "A",
      "score": 92,
      "strengths": ["Consistent updates", "High completion rate"],
      "weaknesses": ["Could improve documentation"],
      "suggestions": ["Add more detailed progress notes"],
      "summary": {
        "totalUpdates": 8,
        "averageCompletion": 75.5,
        "lastUpdateDate": "2024-03-01",
        "consistencyScore": 85
      },
      "cached": false
    }
  }
}
```

---

### 3. Get Analysis History
**GET** `/api/analyze/history?teamName=Team Alpha`

Retrieve past analyses.

**Query Params:**
- `teamName` (optional): Filter by team

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

### 4. Chat with AI
**POST** `/api/chat`

Ask questions about team performance.

**Request:**
```json
{
  "question": "Which team is performing best?",
  "includeContext": true
}
```

**Response:**
```json
{
  "success": true,
  "question": "Which team is performing best?",
  "answer": "Based on recent analyses, Team Alpha is performing best with a grade of A and score of 92...",
  "contextUsed": true
}
```

---

### 5. Health Check
**GET** `/health`

Check server status.

---

## Folder Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── uploadController.js  # CSV upload logic
│   │   ├── analyzeController.js # Analysis logic
│   │   └── chatController.js    # Chat logic
│   ├── models/
│   │   ├── Team.js              # Team schema
│   │   └── ProjectAnalysis.js   # Analysis schema
│   ├── routes/
│   │   ├── uploadRoutes.js      # Upload routes
│   │   ├── analyzeRoutes.js     # Analyze routes
│   │   └── chatRoutes.js        # Chat routes
│   ├── services/
│   │   └── aiService.js         # OpenAI integration
│   ├── utils/
│   │   ├── csvParser.js         # CSV parsing
│   │   └── dataProcessor.js     # Data processing
│   └── middleware/
│       ├── errorHandler.js      # Error handling
│       └── fileValidation.js    # File upload validation
├── uploads/                      # Uploaded files (auto-deleted)
├── server.js                     # Entry point
├── package.json
├── .env.example
└── README.md
```

## Key Features Explained

### 1. CSV Parsing
- Validates required fields
- Cleans and normalizes data
- Auto-deletes files after parsing

### 2. Data Processing
- Groups data by team
- Calculates metrics:
  - Total updates
  - Average completion %
  - Consistency score (based on update frequency)
  - Last update date

### 3. AI Evaluation
- Uses OpenAI GPT-4o-mini
- Structured JSON output
- Evaluates based on:
  - Consistency
  - Completion percentage
  - Update quality

### 4. Caching
- Stores analyses in MongoDB
- Reuses results within 24 hours
- Reduces API costs

### 5. Error Handling
- Custom error class
- Centralized error middleware
- Proper HTTP status codes

## Security

- Environment variables for sensitive data
- File type validation (CSV only)
- File size limit (5MB)
- Input validation

## Testing

Use tools like Postman or curl:

```bash
# Upload CSV
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sample.csv"

# Analyze
curl -X POST http://localhost:5000/api/analyze \
  -F "file=@sample.csv"

# Chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Which team needs improvement?", "includeContext": true}'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS/GCP/Azure

## Notes

- AI results are cached for 24 hours
- CSV files are auto-deleted after parsing
- Consistency score calculated from update frequency
- All dates should be in valid format (YYYY-MM-DD)

## License

MIT
