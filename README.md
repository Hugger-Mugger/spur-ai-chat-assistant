# 🚀 Spur AI Support Chat Assistant

A production-ready, full-stack AI support chat widget built with Node.js, Express, SvelteKit, and Prisma. Features multi-turn LLM context awareness, lazy session management, and chronological message history retrieval.

## 🔗 Live Deployment Links

* **Frontend (Vercel):** https://spur-ai-chat-assistant.vercel.app/
* **Backend (Render):** https://spur-ai-chat-assistant.onrender.com

## 📊 Project Status

| Phase | Status | Completion |
|-------|--------|-----------|
| **Sprint 1** | Foundation & Infrastructure | ✅ Complete |
| **Sprint 2** | LLM Integration & History | ✅ Complete |
| **Final 5%** | Deployment & Optimization | ✅ Complete |

**Current Version:** v1.0.0 (Production Ready)  
**Last Updated:** July 2026  
**Deployment Status:** Ready for production deployment

---

## ✨ Core Features

### Multi-Turn Context Awareness
- Maintains full conversation history across sessions
- LLM context includes previous messages for coherent responses
- Chronologically sorted message persistence
- Session reuse via unique identifiers

### Lazy Session Management
- Conversations created on first user message
- No authentication required (per specification)
- Session persistence via localStorage
- Automatic session reuse with provided ID

### History Retrieval
- Restore full conversation history on page reload
- Retrieve messages chronologically via API
- Pagination support for large conversations
- Type-safe API contracts with Zod validation

### Security & Validation
- Environment variable protection (.env excluded from git)
- Zod schema validation on all inputs
- Centralized error handling middleware
- CORS and rate limiting ready
- Database file protection (.db, .db-journal, .sqlite excluded)

### Developer Experience
- End-to-end TypeScript for type safety
- Service-oriented architecture
- Hot module reloading during development
- Prisma ORM with migrations
- Comprehensive error logging

---

## 🏗️ System Architecture

### Tech Stack

**Backend:**
- Node.js 18+ with Express.js
- TypeScript for type safety
- Prisma ORM with SQLite
- Zod for input validation
- AppError pattern for error handling

**Frontend:**
- SvelteKit framework
- Tailwind CSS for styling
- TypeScript
- Vite build tool
- localStorage for client persistence

**Database:**
- SQLite for development/production
- Prisma migrations
- UUID primary keys
- Chronological timestamp indexing

**Validation & Security:**
- Zod schema validation
- Input sanitization
- Global error handler
- Secure secrets management (.env)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SvelteKit)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ChatWidget Component                                │  │
│  │  - Message input                                      │  │
│  │  - Message bubble display                            │  │
│  │  - Auto-scroll & timestamps                          │  │
│  │  - localStorage persistence                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                    HTTP API Client                           │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Express.js API │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐        ┌──────▼──────┐    ┌──────▼──────┐
   │ ChatCtrl │        │ HistoryCtrl │    │ LLMService  │
   └────┬────┘        └──────┬──────┘    └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ DatabaseService │
                    │ (Prisma ORM)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  SQLite DB      │
                    │  (Conversations │
                    │   & Messages)   │
                    └─────────────────┘
```

---

## 📂 Project Structure

```
/Spur Assignment
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts                    # Environment config
│   │   ├── controllers/
│   │   │   ├── chatController.ts           # POST /chat/message
│   │   │   └── historyController.ts        # GET /chat/history/:sessionId
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts             # Global error middleware
│   │   │   └── validation.ts               # Zod validation middleware
│   │   ├── services/
│   │   │   ├── databaseService.ts          # Database abstraction layer
│   │   │   └── llmService.ts               # LLM API integration (Gemini)
│   │   ├── types/
│   │   │   └── index.ts                    # TypeScript interfaces
│   │   └── index.ts                        # Express app & server setup
│   ├── prisma/
│   │   ├── schema.prisma                   # Database schema
│   │   └── migrations/                     # Migration history
│   ├── dist/                               # Compiled JavaScript (production)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                                # ENVIRONMENT VARS (EXCLUDED FROM GIT)
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── ChatWidget.svelte           # Main chat UI component
│   │   │   ├── MessageBubble.svelte        # Individual message renderer
│   │   │   └── api.ts                      # Backend API client
│   │   ├── App.svelte                      # Root component
│   │   ├── main.ts                         # Entry point
│   │   ├── app.css                         # Global Tailwind styles
│   │   └── assets/                         # Images & SVGs
│   ├── public/
│   │   └── icons.svg                       # Icon sprite sheet
│   ├── dist/                               # Production build output
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── svelte.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                                # ENVIRONMENT VARS (EXCLUDED FROM GIT)
├── .gitignore                              # Root-level Git exclusions
└── README.md                               # This file
```

---

## 🚀 Local Setup Instructions

### Prerequisites

- **Node.js:** v18 or higher (v20+ recommended)
- **npm:** v9+ (included with Node.js)
- **SQLite3:** Pre-installed on macOS/Linux; Windows requires manual installation
- **Git:** For version control

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment Variables

Create `backend/.env`:
```bash
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
GROQ_API_KEY="your-groq-api-key-here"
```

**Note:** Get your Groq API key from the [Groq Cloud Console](https://console.groq.com/keys)

#### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate
```

#### 4. Start Development Server

```bash
npm run dev
```

**Output:** Server running on `http://localhost:3001`

Verify with: `curl http://localhost:3001/health`

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Environment Variables

Create `frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3001
```

#### 3. Start Development Server

```bash
npm run dev
```

**Output:** Frontend running on `http://localhost:5173`

#### 4. Open in Browser

Navigate to: `http://localhost:5173`

---

## 📡 API Documentation

### POST /chat/message

Send a user message and receive an AI response.

**Endpoint:** `POST /api/chat/message`

**Request Body:**
```json
{
  "message": "What is your return policy?",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | string | Yes | 1-4000 characters, trimmed |
| `sessionId` | UUID | No | If omitted, creates new conversation |

**Success Response (200):**
```json
{
  "success": true,
  "reply": "Your return window is 30 days from purchase...",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2026-06-23T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Message must be between 1 and 4000 characters"
}
```

**Behavior:**
- **New Session:** If `sessionId` omitted → creates new conversation
- **Existing Session:** If `sessionId` provided → adds to existing conversation
- **Database:** Both user message and AI response persisted immediately
- **Context:** LLM uses full message history for coherent responses

---

### GET /chat/history/:sessionId

Retrieve full conversation history.

**Endpoint:** `GET /api/chat/history/:sessionId?limit=50&offset=0`

**Query Parameters:**
| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `limit` | number | 50 | Max messages to retrieve (1-100) |
| `offset` | number | 0 | Pagination offset |

**Success Response (200):**
```json
{
  "success": true,
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "messages": [
    {
      "id": "msg-1",
      "sender": "USER",
      "text": "What is your return policy?",
      "timestamp": "2026-06-23T10:25:00.000Z"
    },
    {
      "id": "msg-2",
      "sender": "AI",
      "text": "Your return window is 30 days from purchase...",
      "timestamp": "2026-06-23T10:25:02.000Z"
    }
  ],
  "total": 2,
  "hasMore": false
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

---

### GET /health

Health check endpoint.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-23T10:30:00.000Z",
  "uptime": 3600.5
}
```

---

## 🔐 Security Features

### Implemented

✅ **Environment Variable Protection**
- Sensitive data in `.env` files (excluded from Git)
- No API keys in source code
- Separate `.env` for backend and frontend

✅ **Input Validation**
- Zod schemas on all API inputs
- String length constraints (1-4000 chars)
- UUID format validation
- SQL injection prevention (Prisma parameterized queries)

✅ **Error Handling**
- Centralized error middleware
- No stack traces leaked to client
- Consistent error response format
- Graceful degradation on failures

✅ **Database Security**
- SQLite files excluded from Git
- Database journal files excluded
- Migrations tracked in version control
- No hardcoded credentials

✅ **CORS & Headers**
- CORS configured for frontend origin
- Prevents cross-site request forgery
- Content-type validation

### Recommended for Production

⚠️ **Rate Limiting:** Implement per-IP rate limiting on `/chat/message`
⚠️ **Authentication:** Add user authentication if storing user data
⚠️ **HTTPS:** Use TLS/SSL in production
⚠️ **Secrets Management:** Use environment services (AWS Secrets Manager, etc.)
⚠️ **API Key Rotation:** Rotate Gemini API key regularly
⚠️ **Audit Logging:** Log all chat interactions for compliance
⚠️ **Data Retention:** Implement conversation cleanup policies

---

## 🌐 Production Deployment

### Option 1: Render (Recommended)

**Backend Deployment:**

1. Push code to GitHub
2. Connect repository to Render
3. Configure build command:
   ```bash
   npm install && npm run build && npm run prisma:migrate
   ```
4. Set environment variables in Render dashboard:
   - `DATABASE_URL` → Render PostgreSQL connection
   - `GROQ_API_KEY` → Your Groq API key
   - `NODE_ENV` → production
5. Deploy

**Note:** Get your Groq API key from the [Groq Cloud Console](https://console.groq.com/keys)

**Frontend Deployment:**

1. In Render dashboard, add new Static Site
2. Connect same GitHub repository
3. Configure build command: `npm run build`
4. Output directory: `frontend/dist`
5. Set environment: `VITE_API_BASE_URL=<your-backend-url>`
6. Deploy

### Option 2: Vercel

**Frontend:**

1. Import project to Vercel
2. Set root directory: `frontend`
3. Override build command: `npm run build`
4. Set environment: `VITE_API_BASE_URL=<your-backend-url>`

**Backend:**

1. Create Vercel Function for `/api` routes
2. Or host backend separately on Render/Railway

### Option 3: AWS (EC2 + RDS)

**Prerequisites:**
- EC2 instance (t2.micro or larger)
- RDS PostgreSQL database
- Route 53 for DNS

**Deployment:**
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# Clone repository
git clone <your-repo>
cd backend

# Install & configure
npm install
npm run build

# Set environment variables
export DATABASE_URL="postgresql://..."
export GROQ_API_KEY="..."

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name "spur-chat"
pm2 save
```

---

## 📚 Database Schema

### Conversation Table
```sql
CREATE TABLE Conversation (
  id TEXT PRIMARY KEY,                    -- UUID
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,                          -- Optional metadata (user info, etc.)
  UNIQUE(id)
);
```

### Message Table
```sql
CREATE TABLE Message (
  id TEXT PRIMARY KEY,                    -- UUID
  conversationId TEXT NOT NULL,           -- FK to Conversation
  sender TEXT NOT NULL,                   -- 'USER' or 'AI'
  text TEXT NOT NULL,                     -- Message content
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES Conversation(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversationId),
  INDEX idx_timestamp (timestamp)
);
```

**Relationships:**
- One Conversation → Many Messages
- Cascade delete: Deleting conversation removes all messages
- Indexed on conversationId for fast lookups
- Indexed on timestamp for chronological retrieval

---

## 📋 Commands Reference

### Backend Commands

```bash
# Development
npm run dev              # Start dev server with hot reload (port 3001)
npm run build            # Compile TypeScript → dist/
npm run start            # Run production build

# Database
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Create/run migrations
npm run prisma:studio    # Open Prisma Studio GUI (visualize DB)
npm run prisma:reset     # Drop & recreate database (dev only!)

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

### Frontend Commands

```bash
# Development
npm run dev              # Start dev server (port 5173) with HMR
npm run build            # Build optimized production bundle → dist/
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

---

## 🧪 Testing & Validation

### Backend Verification

✅ **Endpoint Testing:**
```bash
# Health check
curl http://localhost:3001/health

# Send message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, what can you help with?"}'

# Retrieve history (use sessionId from above)
curl http://localhost:3001/api/chat/history/<SESSION_ID>
```

✅ **Database Verification:**
```bash
npm run prisma:studio   # Open GUI to inspect data
```

✅ **Type Safety:**
```bash
npm run type-check      # Ensure no TypeScript errors
```

### Frontend Verification

✅ **Browser Console:**
- Open DevTools (F12)
- Check Network tab for successful API calls
- Verify localStorage contains sessionId and messages

✅ **Build Output:**
```bash
npm run build           # Should complete without errors
```

---

## 🎯 Key Design Decisions

### 1. Lazy Session Management
**Decision:** Create conversation on first message, reuse with sessionId  
**Rationale:** Minimal overhead, no auth required, stateless API design

### 2. Chronological Message Ordering
**Decision:** Sort by timestamp, store exact creation time  
**Rationale:** Maintains conversation flow, enables history retrieval, matches real-time perception

### 3. Service Layer Abstraction
**Decision:** `databaseService` as object with methods, not classes  
**Rationale:** Simpler testing, easier to swap implementations, functional approach

### 4. Zod Validation
**Decision:** Validate inputs at controller boundary  
**Rationale:** Type safety, clear error messages, prevents invalid data entering system

### 5. localStorage Persistence
**Decision:** Client-side storage of sessionId and messages  
**Rationale:** Stateless backend, survives page reload, no session management needed

### 6. LLM Context Window
**Decision:** Include full conversation history in LLM request  
**Rationale:** Better responses, maintains context, handles multi-turn naturally

---

## 📦 Sprint Completion Summary

### Sprint 1: Foundation ✅
- Express backend with lazy session management
- SvelteKit frontend scaffolding
- SQLite database with Prisma
- End-to-end TypeScript
- Message persistence and retrieval

### Sprint 2: LLM Integration ✅
- Gemini-1.5-Flash API integration
- Multi-turn context awareness
- Full conversation history on reload
- Service-oriented architecture
- Centralized error handling

### Final 5%: Production Ready ✅
- Comprehensive README
- Security (.gitignore with .env, .db exclusions)
- Git initialization
- Deployment guides (Render, Vercel, AWS)
- Production-grade error handling
- Validation & type safety

---

## 🔄 Next Steps (Future Phases)

### Phase 3: Enhanced Features
- Message search and filtering
- Conversation management UI
- User feedback/ratings on responses
- Analytics and metrics

### Phase 4: Scale & Performance
- Redis caching layer
- Message streaming (SSE/WebSocket)
- Database connection pooling
- CDN for static assets
- Load testing & optimization

### Phase 5: Multi-Channel
- WhatsApp integration
- Instagram Messenger support
- Email notifications
- SMS alerts

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes with tests
3. Commit: `git commit -m "feat: add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check existing documentation
- Review error logs: `backend/dist/logs/`

---

## 🎓 Tech Resources

- [Express.js Docs](https://expressjs.com/)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs/)
- [Groq Cloud Console](https://console.groq.com/keys)

---

**Last Updated:** June 2026  
**Status:** Production Ready ✅  
**Version:** v1.0.0
