# DevCollab (DevConnect)

DevCollab is an enterprise-grade, full-stack collaborative workspace platform designed for software engineering teams. It combines project management, real-time communication, task tracking, and community features into a single, cohesive ecosystem.

## 🚀 Key Features

*   **Robust Project Management:** Create workspaces, manage visibility (Public/Private), and enforce Role-Based Access Control (Admin, Member, Viewer).
*   **Kanban Task Engine:** Track tasks visually with drag-and-drop support, status filtering, due dates, and assignments.
*   **Real-Time Collaboration:** Persistent chat channels within projects using WebSockets for instant communication.
*   **Community Forums & Feed:** GitHub Discussions-style social feed for broad organizational announcements and Q&A.
*   **Integrated Recruitment:** Built-in jobs board for posting internal/external roles and tracking applicants.
*   **Global Search Engine:** `CMD+K` omni-search palette to instantly locate tasks, projects, posts, or team members anywhere in the workspace.
*   **Media & File Storage:** Fully integrated local file upload system for avatars and task attachments.
*   **Analytics Console:** Global administrative dashboard providing real-time platform metrics.

## 🛠 Tech Stack

**Frontend (Client)**
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router) + React 19
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Framer Motion (for SaaS-grade micro-animations)
*   **State Management**: Zustand (Global Auth) + TanStack React Query (Server State)
*   **Form Handling**: React Hook Form + Zod (Validation)
*   **Networking**: Axios

**Backend (Server)**
*   **Framework**: Node.js + [Express](https://expressjs.com/)
*   **Language**: TypeScript
*   **Database**: MongoDB (via Mongoose ODM)
*   **Architecture**: Clean Architecture (Controllers -> Services -> Repositories/Models)
*   **Security**: Helmet, Express Rate Limit, JWT Authentication, bcryptjs
*   **Testing**: Custom Node.js E2E Fetch Scripts (Vanilla JavaScript)
*   **Logging**: Winston + Morgan

## 📂 Project Structure

```text
DevConnect/
├── backend/                # Node.js + Express API
│   ├── src/                # Backend Source Code (Domain Modules)
│   ├── uploads/            # Local storage for uploaded files/avatars
│   ├── logs/               # Application log files
│   ├── jest.config.js      # Testing configuration
│   └── test-*.js           # E2E and Unit test scripts
├── frontend/               # Next.js Application
│   └── src/                # Frontend Source Code (App Router, Features, Components)
├── docs/                   # Project documentation
├── .gitignore              # Root gitignore rules
└── README.md               # You are here!
```

## 🚀 Getting Started (Local Development)

DevCollab is designed to be easily runnable on your local machine without complex DevOps tooling or containerization.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`

### 1. Clone the repository
```bash
git clone https://github.com/f7aditya/DevCollab.git
cd DevCollab
```

### 2. Backend Setup
Open a terminal and configure the Node.js API:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (you can use `.env.example` as a template):
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/devcollab
JWT_SECRET=super_secret_development_key
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

Seed the database with sample data (optional but recommended):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a **new** terminal tab and configure the Next.js client:
```bash
cd frontend
npm install --legacy-peer-deps
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_TELEMETRY_DISABLED=1
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Explore
Navigate to `http://localhost:3000` in your browser. 
If you ran the seed script, you can log in with:
*   **Email:** `admin@devcollab.com`
*   **Password:** `password123`

## 🧪 Testing
The backend includes custom Javascript End-to-End (E2E) fetch scripts. To run the tests located in the `backend` folder:
```bash
cd backend
node e2e-test.js
# Or test specific routes:
node test-profile.js
```

## 🔐 Security Hardening
*   **API Rate Limiting**: Enforced via `express-rate-limit` to prevent brute-force attacks.
*   **HTTP Headers**: `helmet` is active to protect against XSS, clickjacking, and sniffing.
*   **Payload Sanitization**: Services rigorously strip restricted fields (e.g., `passwordHash`, `status`) before executing `findByIdAndUpdate` database calls.

---
*DevCollab is a portfolio demonstration of enterprise full-stack engineering.*
