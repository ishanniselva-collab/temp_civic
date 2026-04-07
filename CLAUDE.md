# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CivicFix is an AI-powered civic tech solution that allows citizens to report local issues (potholes, garbage, water leaks, streetlight failures) and ensures faster resolution through government integration and community participation.

## Tech Stack

- **Frontend**: React 19 + Vite + Vanilla CSS
- **Backend**: Express.js + PostgreSQL
- **UI Components**: Custom components with CSS modules
- **Icons**: Lucide React
- **Maps**: Leaflet via react-leaflet
- **Routing**: react-router-dom

## Common Commands

### Frontend
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend
```bash
cd backend

# Install dependencies
npm install

# Initialize database (creates tables)
npm run init-db

# Start development server (http://localhost:3000)
npm run dev

# Start production server
npm start
```

## Architecture

### Frontend Structure

The app is a single-page React application using React Router for navigation:

- `/` - Home page with Hero, Explainer, LiveMap, Stats, and Features sections
- `/map` - Full-page map view
- `/signup` - User registration page
- `/track` - Track complaint status by ID
- `/admin` - Admin dashboard (list, filter, assign, update status)

**Key Files**:
- `src/App.jsx` - Main app component with routing and modal state management
- `src/main.jsx` - Entry point with React StrictMode
- `src/index.css` - Global styles with CSS variables for theming

### Component Organization

Each component follows the pattern of co-located `.jsx` and `.css` files:

```
src/components/
├── Navbar.jsx/css         - Navigation with report button
├── HeroSection.jsx/css    - Landing hero with CTA
├── ExplainerSection.jsx/css - How-it-works steps
├── LiveMap.jsx            - Interactive Leaflet map
├── StatsSection.jsx/css   - Impact statistics
├── FeaturesSection.jsx/css - Feature grid
├── ReportIssueModal.jsx/css - Issue submission form
├── SignUp.jsx             - User registration
├── TrackComplaint.jsx/css - Track complaint by ID
├── AdminDashboard.jsx/css - Admin dashboard
└── Footer.jsx/css         - Site footer
```

### Backend Structure

```
backend/
├── server.js                    - Entry point
├── src/
│   ├── config/
│   │   ├── database.js          - PostgreSQL connection pool
│   │   └── initDatabase.js        - Table creation script
│   ├── controllers/
│   │   └── complaintController.js - Request handlers
│   ├── middleware/
│   │   ├── errorHandler.js        - Global error handling
│   │   └── validateComplaint.js   - Input validation
│   ├── models/
│   │   └── Complaint.js           - Database model
│   ├── routes/
│   │   └── complaints.js          - Route definitions
│   └── utils/
│       ├── departmentRouter.js    - Department assignment logic
│       └── generateId.js          - Complaint ID generator
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint (auto-generates ID, assigns department) |
| GET | `/api/complaints/:id` | Fetch complaint by ID |
| GET | `/api/complaints` | List all complaints (admin) with status/department filters |
| PUT | `/api/complaints/:id` | Update status (Pending → In Progress → Resolved) |
| POST | `/api/assign` | Assign complaint to department |

### Department Routing Logic

| Issue Type | Department |
|------------|------------|
| Pothole, Road | Roads Department |
| Garbage, Waste | Sanitation |
| Water, Leak | Water Department |
| Electric, Streetlight | Electrical Department |
| Other | General Administration |

### Data Flow

1. **Report Issue**: User fills form → Frontend geocodes address → POST /api/complaints → Auto-assigns department → Returns complaint ID
2. **Track Issue**: User enters complaint ID → GET /api/complaints/:id → Displays status timeline
3. **Admin Dashboard**: GET /api/complaints (with filters) → Admin updates status/department → PUT /api/complaints/:id or POST /api/assign
4. **Live Map**: Reads from localStorage (filled by ReportIssueModal) to display markers

### State Management

- **Local state**: React useState for component-level state
- **Persistence**: Issues stored in PostgreSQL database
- **localStorage**: Only used for LiveMap marker data (for display purposes)
- **No global state library**: Prop drilling used for simple state sharing

### Styling Architecture

Vanilla CSS with CSS variables defined in `index.css`:

```css
--color-primary: #1D4ED8        /* Trust Blue */
--color-secondary: #059669      /* Environment Green */
--color-background: #F8FAFC     /* Off-white */
--color-surface: #FFFFFF        /* Pure white */
```

Components use their own CSS files with BEM-like naming (e.g., `.hero-section`, `.report-modal__header`).

### Database Schema (PostgreSQL)

```sql
complaints:
- id (SERIAL PRIMARY KEY)
- complaint_id (VARCHAR 20, UNIQUE) - Public-facing ID like CIV-ABC123
- name, phone, email
- area, city, landmark
- issue_type, description, severity
- latitude, longitude
- status (Pending/In Progress/Resolved)
- department
- created_at, updated_at
```

### External Dependencies

- **Nominatim API**: Geocoding addresses during issue submission (no API key required)
- **Leaflet CDN**: Marker icons loaded from unpkg.com
- **Google Fonts**: Inter font family

### Environment Variables (Backend)

Create `backend/.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicfix
DB_USER=postgres
DB_PASSWORD=your_password
```

## Development Notes

- No test framework configured
- ESLint uses flat config (eslint.config.js) with recommended React rules
- Vite dev server runs on port 5173 by default
- Backend dev server runs on port 3000 by default
- Build output goes to `/dist/` directory
- Frontend makes API calls to `http://localhost:3000/api`
- CORS is enabled for all origins in development
