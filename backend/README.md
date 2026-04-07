# CivicFix Backend API

Express.js backend for the CivicFix citizen complaint management system.

## Architecture

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create a new complaint (auto-generates ID, assigns department) |
| GET | `/api/complaints/:id` | Fetch complaint by ID |
| GET | `/api/complaints` | List all complaints (with optional status/department filters) |
| PUT | `/api/complaints/:id` | Update complaint status (Pending → In Progress → Resolved) |
| POST | `/api/assign` | Assign complaint to department |
| GET | `/api/health` | Health check endpoint |

### Department Routing Logic

| Issue Type | Department |
|------------|------------|
| Pothole, Road | Roads Department |
| Garbage, Waste, Trash | Sanitation |
| Water, Leak, Pipe | Water Department |
| Electric, Streetlight, Power | Electrical Department |
| Other | General Administration |

### Database Schema (PostgreSQL)

```sql
complaints:
- id (SERIAL PRIMARY KEY)
- complaint_id (VARCHAR 20, UNIQUE) - Public-facing ID like CIV-ABC123
- name (VARCHAR 255)
- phone (VARCHAR 20)
- email (VARCHAR 255)
- area (VARCHAR 255)
- city (VARCHAR 255)
- landmark (VARCHAR 255)
- issue_type (VARCHAR 100)
- description (TEXT)
- severity (VARCHAR 20) - low/medium/high
- image_url (VARCHAR 500)
- latitude (DECIMAL)
- longitude (DECIMAL)
- status (VARCHAR 50) - Pending/In Progress/Resolved
- department (VARCHAR 100)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Create a PostgreSQL database and update `.env`:

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicfix
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Initialize Database

```bash
npm run init-db
```

This creates the `complaints` table with proper indexes.

### 4. Start the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server runs on `http://localhost:3000` by default.

### 5. Verify Installation

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "CivicFix API is running",
  "timestamp": "2026-04-02T..."
}
```

## Project Structure

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── initDatabase.js      # Table creation script
│   ├── controllers/
│   │   └── complaintController.js # Request handlers
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validateComplaint.js # Input validation
│   ├── models/
│   │   └── Complaint.js         # Database model
│   ├── routes/
│   │   └── complaints.js        # Route definitions
│   └── utils/
│       ├── departmentRouter.js  # Department assignment logic
│       └── generateId.js        # Complaint ID generator
├── .env                         # Environment variables (not committed)
├── .env.example                 # Example environment file
└── package.json
```

## Error Handling

All errors return JSON with consistent structure:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Development Notes

- CORS is enabled for all origins (development)
- Request body size limit: default Express limit
- No authentication implemented (add JWT/session for production)
- No rate limiting (add for production)
- Complaint IDs are auto-generated (format: CIV-XXXXXX)
- Department assignment is automatic based on issue type
