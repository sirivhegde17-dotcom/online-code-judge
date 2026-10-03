# Online Code Judge System

A full-stack, web-based coding platform (similar to LeetCode and HackerRank) built with **React.js**, **Monaco Editor**, **FastAPI**, **PostgreSQL**, **Redis**, **Celery**, and **Docker Sandboxing**.

Users can write code in **Python 3**, **C++17**, or **Java 17**, test it against sample test cases, submit it for asynchronous evaluation, and track their scores on a real-time global leaderboard.

---

## 🌟 Key Features

- **User Authentication**: Registration, Login, JWT Authentication, Bcrypt Password Hashing, and Role-Based Access Control (`USER`, `ADMIN`).
- **Interactive Code Workspace**: Integrated **Monaco Code Editor** with syntax highlighting, automatic layout resizing, line numbers, and starter code templates for Python 3, C++17, and Java 17.
- **Sandboxed Execution Engine**: User-submitted programs are compiled and executed inside transient, isolated Docker containers with strict security constraints (`--network none`, memory limits, CPU limits, process limits, and non-root execution).
- **Asynchronous Queue Processing**: Submissions are pushed to a **Redis + Celery** background worker queue, preventing API request blocking and enabling concurrent submission processing.
- **Public & Hidden Test Case Validation**: Validates output line-by-line while normalizing line endings and trailing whitespace. Hidden test cases are strictly protected from public API responses.
- **Live Leaderboard & Analytics**: Users earn points based on problem difficulty (Easy: +10, Medium: +20, Hard: +30) and track global rank, problems solved, and acceptance rates.
- **Admin Management Panel**: Dedicated control panel for administrators to create, edit, or delete problems, manage test cases, view user accounts, and enable/disable accounts.
- **Automated Database Seeding & Testing**: Includes database seeds for default admin/user accounts and 5 classic LeetCode-style problems (*Two Sum*, *Reverse String*, *Valid Parentheses*, *Binary Search*, *Fibonacci Number*), along with a Pytest suite.

---

## 📐 System Architecture & System Design

```
+------------------+         HTTP REST        +--------------------+
|  React Frontend  | <=====================>  |  FastAPI Backend   |
| (Monaco Editor)  |                          |   (REST API Server)|
+------------------+                          +--------------------+
                                                        |
                                            +-----------+-----------+
                                            |                       |
                                            v                       v
                                  +-------------------+   +------------------+
                                  | PostgreSQL DB     |   | Redis Queue      |
                                  | (Users, Problems, |   | (Task Broker)    |
                                  |  Submissions)     |   +------------------+
                                  +-------------------+             |
                                                                    v
                                                          +------------------+
                                                          | Celery Worker    |
                                                          | (Judge Engine)   |
                                                          +------------------+
                                                                    |
                                                                    v
                                                          +------------------+
                                                          | Isolated Docker  |
                                                          | Sandbox Container|
                                                          +------------------+
```

### Architectural Decisions & Concepts

#### 1. Why Use an Asynchronous Job Queue (Redis + Celery)?
Code compilation and test-case evaluation can take several seconds per submission. Executing code directly inside an HTTP API handler would block web server threads, exhaust connection pools, cause request timeouts, and degrade scalability under load. Using **Redis + Celery** decouples request handling from code evaluation:
- API endpoint `POST /api/submissions` creates a submission record with status `PENDING`, pushes a job ID to Redis, and returns immediately with HTTP 201 Created.
- Background Celery workers consume submission jobs from Redis, evaluate them asynchronously in Docker containers, update the database, and calculate leaderboard metrics.

#### 2. Why Use Docker Container Sandboxing?
Executing untrusted, user-submitted code directly on the host machine presents severe security vulnerabilities (file deletion, process creation, network attacks, resource hogging). Every submission is executed inside an isolated, disposable Docker container built from `execution-engine/Dockerfile`.

#### 3. Security Isolation Parameters
- `--network none` (`network_disabled=True`): Disables all networking, preventing outbound/inbound socket access or data exfiltration.
- `--memory 128m` (`mem_limit="128m"`): Caps memory allocation to prevent Out-Of-Memory host crashes.
- `--cpus 1.0` (`nano_cpus=1000000000`): Limits CPU consumption to 1 core.
- `--pids-limit 64` (`pids_limit=64`): Prevents process multiplication and fork bombs.
- Non-root user (`user="sandboxuser"`): Prevents root privilege escalation inside the container.
- Transient volume binding & container cleanup (`auto_remove=True`): Mounted `/sandbox` working directory is deleted after execution.

#### 4. How Hidden Test Cases are Protected
- Hidden test cases (`is_hidden = True`) are stored in the database for evaluation purposes only.
- The public problem detail endpoint `GET /api/problems/{id}` explicitly strips out hidden test cases and returns only public sample test cases (`public_test_cases`).
- Non-admin users cannot access raw test case inputs or expected outputs for hidden test cases.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (v18), Vite, Monaco Editor, React Router 6, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, Python-Jose (JWT), Passlib (Bcrypt) |
| **Database** | PostgreSQL 15, SQLite (Test Environment) |
| **Job Queue** | Redis 7, Celery 5 |
| **Code Execution** | Docker Sandboxes, Python 3, G++ (C++17), OpenJDK 17 (Java 17) |
| **Containerization**| Docker, Docker Compose |

---

## 🗄️ Database Schema Design

```
+--------------------+       +--------------------+       +------------------------+
|      users         |       |     problems       |       |       test_cases       |
+--------------------+       +--------------------+       +------------------------+
| id (PK)            |       | id (PK)            |       | id (PK)                |
| username (UQ)      |       | title              |       | problem_id (FK)        |
| email (UQ)         |       | description        |       | input                  |
| password_hash      |       | difficulty         |       | expected_output        |
| role (USER/ADMIN)  |       | constraints        |       | is_hidden (Boolean)    |
| is_active          |       | input_format       |       | created_at             |
| created_at         |       | output_format      |       +------------------------+
+--------------------+       | sample_input       |
          |                  | sample_output      |
          | 1:N              | tags (JSON)        |
          v                  | time_limit         |
+--------------------+       | memory_limit       |
|    submissions     |       | created_at         |
+--------------------+       +--------------------+
| id (PK)            |                 |
| user_id (FK)       |                 | 1:N
| problem_id (FK) <---+-----------------+
| language           |
| source_code        |       +--------------------+       +------------------------+
| status             |       | submission_results |       |      leaderboard       |
| execution_time     |       +--------------------+       +------------------------+
| memory_used        |       | id (PK)            |       | id (PK)                |
| submitted_at       |       | submission_id (FK) |       | user_id (FK, UQ)       |
+--------------------+       | test_case_id (FK)  |       | problems_solved        |
          |                  | status             |       | total_submissions      |
          | 1:N              | execution_time     |       | accepted_submissions   |
          v                  | memory_used        |       | score                  |
+--------------------+       | stdout / stderr    |       | updated_at             |
| submission_results |       +--------------------+       +------------------------+
+--------------------+
```

---

## 🔌 REST API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user account.
- `POST /api/auth/login` - Authenticate user and issue JWT access token.
- `GET /api/auth/me` - Fetch profile of currently authenticated user.

### Problems
- `GET /api/problems` - Fetch list of problems (supports `search`, `difficulty`, `tag`, `sort_by`, `sort_order`, `skip`, `limit`).
- `GET /api/problems/{id}` - Fetch public problem statement and sample test cases.
- `POST /api/problems` - Create a new coding problem (*ADMIN only*).
- `PUT /api/problems/{id}` - Update a problem statement (*ADMIN only*).
- `DELETE /api/problems/{id}` - Delete a problem and related test cases (*ADMIN only*).
- `POST /api/problems/{id}/test-cases` - Add a public or hidden test case (*ADMIN only*).
- `DELETE /api/problems/{id}/test-cases/{test_case_id}` - Remove a testcase (*ADMIN only*).

### Code Execution & Submissions
- `POST /api/code/run` - Execute code synchronously against sample test cases without persisting a submission.
- `POST /api/submissions` - Create submission record and enqueue background Docker evaluation job.
- `GET /api/submissions` - Retrieve user's submission history (or all system submissions for ADMIN).
- `GET /api/submissions/{id}` - Retrieve detailed submission results and per-testcase output.

### Leaderboard
- `GET /api/leaderboard` - Fetch global rankings sorted by solved count, score, and accuracy.
- `GET /api/leaderboard/me` - Fetch rank and solving metrics for logged-in user.

### Admin Management
- `GET /api/admin/stats` - Fetch system overview metrics (*ADMIN only*).
- `GET /api/admin/users` - Fetch list of all registered users (*ADMIN only*).
- `PUT /api/admin/users/{id}/status` - Enable or disable user account (*ADMIN only*).
- `GET /api/admin/submissions` - View system-wide submission log (*ADMIN only*).

---

## 🚀 Setup & Local Development Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop (with Docker daemon running)
- PostgreSQL & Redis (or run via Docker Compose)

### Option A: Running via Docker Compose (Recommended)

1. **Clone & Set Environment Variables**:
   ```bash
   cp .env.example .env
   ```

2. **Build & Launch All Microservices**:
   ```bash
   docker-compose up --build
   ```

3. **Access Services**:
   - **Frontend App**: `http://localhost:5173`
   - **FastAPI Documentation**: `http://localhost:8000/docs`
   - **PostgreSQL Database**: `localhost:5432`
   - **Redis Server**: `localhost:6379`

4. **Default Credentials**:
   - **Admin User**: `admin` / `admin123`
   - **Test User**: `coder` / `user123`

---

### Option B: Local Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Run Database Migrations / Seed Data
python -m app.database.seed

# Start FastAPI Development Server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 3. Celery Worker (Optional for Async Queue)
```bash
cd backend
celery -A app.workers.celery_worker worker --loglevel=info
```

---

## 🧪 Testing Instructions

Run backend Pytest integration and unit tests:
```bash
cd backend
python -m pytest tests/
```

---

## 🖼️ Screenshot Placeholders

| Feature | Screenshot |
|---|---|
| **Problem Workspace & Monaco Editor** | `![Problem Page Placeholder](https://via.placeholder.com/800x450?text=Monaco+Code+Editor+Workspace)` |
| **Global Leaderboard** | `![Leaderboard Placeholder](https://via.placeholder.com/800x450?text=Global+Leaderboard)` |
| **Admin Control Panel** | `![Admin Panel Placeholder](https://via.placeholder.com/800x450?text=Admin+Control+Panel)` |

---

## 🔮 Future Enhancements

- [ ] Support for additional programming languages (Go, Rust, JavaScript/Node.js, C#).
- [ ] Real-time WebSocket updates for submission status polling.
- [ ] Contest / Timed Assessment module with leaderboard snapshots.
- [ ] Discussion forum and editorial solution guides for problems.
- [ ] Performance profiling graphs (Execution Time distribution & Memory distribution vs. other submissions).

---

## 📋 15-Phase Development Log Summary

1. **Phase 1: Project Structure Setup** - Established repository directory structure, Dockerfiles, and `.env.example`.
2. **Phase 2: Database & Models** - Designed SQLAlchemy models for `users`, `problems`, `test_cases`, `submissions`, `submission_results`, and `leaderboard`.
3. **Phase 3: Authentication & Security** - Implemented password hashing (Bcrypt), JWT access tokens, and security dependencies.
4. **Phase 4: Problem Management APIs** - Built REST APIs for public problem browsing and admin problem CRUD.
5. **Phase 5: React Frontend Base** - Constructed Axios API client, Auth Context, navigation bars, sidebars, and page shells.
6. **Phase 6: Monaco Editor Integration** - Integrated `@monaco-editor/react` with VS Code dark theme and language templates.
7. **Phase 7: Execution Engine** - Developed `CodeExecutor` and output validator with newline/whitespace normalization.
8. **Phase 8: Docker Sandboxing** - Enforced network isolation (`--network none`), memory, CPU, process limits, and non-root execution.
9. **Phase 9: Background Worker Queue** - Built Redis + Celery worker task pipeline for async judging.
10. **Phase 10: Submissions Pipeline** - Created submission creation, test case validation, and history endpoints.
11. **Phase 11: Leaderboard Subsystem** - Implemented real-time score tracking, ranking algorithms, and user stats.
12. **Phase 12: Admin Management Portal** - Built admin APIs for user governance, metrics, and global submission auditing.
13. **Phase 13: Automated Testing & Seeding** - Added Pytest unit tests and database seeding script for 5 LeetCode problems.
14. **Phase 14: Docker Compose Orchestration** - Integrated multi-container stack orchestration in `docker-compose.yml`.
15. **Phase 15: Documentation & System Design** - Finalized project documentation, architectural diagrams, and setup guide.
