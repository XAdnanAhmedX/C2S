# C2S Smart Garments Management System v2.0

A modern, full-stack enterprise Garments Manufacturing Execution System (MES) designed for high-throughput apparel production facilities. Built with a decoupled React frontend, containerized PHP 8.2 backend, and normalized MySQL 8.0 relational database.

---

## 🚀 Key Architecture & Modules (42 Screen States)

The system covers the end-to-end garment factory operational lifecycle across 15 core functional modules:

1. **Dashboard (SCR-01)**: Factory floor KPIs, target vs output tracking, real-time efficiency gauges, active line health, and worker spotlights.
2. **Worker Recognition (SCR-02)**: Performance leaderboards, monthly awards, badge allocations, and peer recognition.
3. **System Settings & User Management (SCR-03)**: Multi-role user provisioning (Admin, Line Manager, Worker, QC Inspector, Compliance Auditor), factory shifts, and system preferences.
4. **Attendance & Shift Management (SCR-04, SCR-05)**: Daily attendance ledger, live check-ins, line staffing availability check, and shift transfers.
5. **Worker Performance & Training (SCR-06, SCR-07)**: Individual operator efficiency matrix, DHU defect rate tracking, and skill training assignments.
6. **Production Line Telemetry (SCR-08, SCR-09)**: Real-time sewing line telemetry, capacity planning, hourly output tracking, and new line initialization.
7. **Waste Tracking & Fabric Optimization (SCR-10 to SCR-13)**: Fabric cutting waste ledgers, cost-impact analytics, CSV/PDF export, and CAD nesting pattern optimization.
8. **Internal Floor Communications (SCR-14)**: Channel-based messaging (Announcements, Quality Alert, Maintenance Dispatch) for floor supervisors and line mechanics.
9. **Quality Control & Pareto Defect Analysis (SCR-15 to SCR-18)**: Inspection stations, AQL defect logging, Pareto root-cause distribution, and batch sign-offs.
10. **Worker Safety & Bangla-First Incident Reporting (SCR-19 to SCR-23)**: Native Bangla (`বাংলা`) safety incident filing, automated English translation, supervisor resolution workflows, and worker incident histories.
11. **Job Sequencing & Floor Dispatch (SCR-24, SCR-25)**: Production priority queues, drag-and-drop sequencing, order dispatch scheduling, and line allocation.
12. **Inventory Catalog & Materials (SCR-26, SCR-27)**: Raw fabric rolls, trims, finished garments, automated reorder thresholds, and batch creation.
13. **Machine Maintenance & Health (SCR-28 to SCR-30)**: IoT fleet telemetry (temperature, vibration, uptime), preventive maintenance schedules, and urgent work orders.
14. **AI-Powered Factory Insights (SCR-31)**: 7-day predictive output simulation, defect spike risk warnings, and algorithmic operator line rebalancing.
15. **Compliance & Audit Reporting (SCR-32 to SCR-42)**: Bangladesh Labor Act 2006 & ILO compliance checklist, daily production ledgers, QC summaries, environmental audits, secure external audit links, and reassessment scheduling.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Font Awesome 6.4.0, CSS3 Variables (`DESIGN_SYSTEM.md`).
- **Backend**: PHP 8.2 with PDO MySQL, Apache with `mod_rewrite`, structured JSON envelopes.
- **Database**: MySQL 8.0 with InnoDB, foreign key constraints, UTF8mb4 encoding, and indexing (`database/schema_v2.sql`).
- **DevOps**: Docker, Docker Compose, Multi-stage builds, Nginx SPA reverse proxy, and GitHub Actions CI/CD workflows.

---

## 📁 Repository Structure

```
c2s/
├── .github/workflows/
│   ├── ci.yml                 # Linting, syntax check, and frontend build tests
│   └── docker-build.yml       # Production Docker container build verification
├── API_SPEC.md                # Formal contract for all 15 REST endpoints & payloads
├── DESIGN_SYSTEM.md           # UI/UX audit, design tokens, and 42-screen dynamic inventory
├── docker-compose.yml         # Multi-container orchestration (MySQL, PHP, Nginx)
├── backend/
│   ├── Dockerfile             # PHP 8.2-Apache container with PDO & CORS
│   ├── config.php             # Database credentials & JSON response helpers
│   ├── auth.php               # Login, session validation, user registration
│   ├── dashboard.php          # Factory KPIs and floor summaries
│   ├── inventory.php          # Raw material and garment catalog
│   ├── workers.php            # Worker performance, training, rewards
│   ├── attendance.php         # Daily attendance ledger & line availability
│   ├── production.php         # Production line telemetry & line creation
│   ├── waste.php              # Waste tracking & CAD pattern optimization
│   ├── quality.php            # QC inspections & Pareto defect analysis
│   ├── safety.php             # Bangla-first worker incident reporting & resolution
│   ├── jobs.php               # Job sequencing queue & priority management
│   ├── machines.php           # Machine fleet telemetry & work orders
│   ├── ai.php                 # Capacity simulation & floor balancing
│   ├── reports.php            # Compliance checklists, export, audit sharing
│   └── chats.php              # Internal floor communication channels
├── database/
│   ├── schema.sql             # Legacy initial schema
│   └── schema_v2.sql          # 14-table 3NF normalized schema with mock seed data
├── frontend/
│   ├── Dockerfile             # Multi-stage Node build + Nginx Alpine runner
│   ├── nginx.conf             # Nginx SPA fallback routing & gzip configuration
│   ├── package.json           # React 19 dependencies & Vite scripts
│   ├── src/
│   │   ├── api.js             # Dual-mode Axios API client with resilient mock fallback
│   │   ├── index.css          # Design system CSS variables & reusable UI classes
│   │   ├── App.jsx            # Master router for all 15 factory screens
│   │   └── components/
│   │       ├── Layout.jsx              # Universal sidebar, search header & shift bar
│   │       ├── LoginPage.jsx           # Role-switching authentication screen
│   │       ├── Dashboard.jsx           # Master executive floor dashboard
│   │       ├── WorkerRecognition.jsx   # Leaderboard & award granting
│   │       ├── WorkerPerformance.jsx   # Operator efficiency & training assignment
│   │       ├── Attendance.jsx          # Attendance ledger & line staffing matrix
│   │       ├── ProductionLine.jsx      # Telemetry gauges & line creation modal
│   │       ├── JobSequencing.jsx       # Job priority queue & scheduler
│   │       ├── Inventory.jsx           # Stock catalog & material creation
│   │       ├── QualityControl.jsx      # Pareto defect breakdown & inspections
│   │       ├── WasteTracking.jsx       # Cutting waste & CAD nesting optimization
│   │       ├── MachineMaintenance.jsx  # Fleet health & maintenance work orders
│   │       ├── WorkerReporting.jsx     # Bangla incident submission & supervisor audit
│   │       ├── AIInsights.jsx          # Predictive capacity simulation & rebalancer
│   │       ├── ReportsCompliance.jsx   # 11 compliance modals & audit ledgers
│   │       ├── Chats.jsx               # Real-time internal factory messaging
│   │       └── Settings.jsx            # Role provisioning & shift config
└── README.md
```

---

## ⚡ Quick Start with Docker (Recommended)

Run the entire stack with a single command:

```bash
docker compose up --build -d
```

This starts:

- **MySQL 8.0**: Port `3306` (Pre-seeded with `schema_v2.sql`)
- **PHP 8.2 Backend**: Port `8080` (CORS-enabled REST API)
- **React Frontend**: Port `3000` (Nginx with client-side SPA routing)

Visit **`http://localhost:3000`** in your browser.

---

## 💻 Local Development Setup

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React development server runs at `http://localhost:5173`.

### 2. Backend Setup

Set environment variables or edit `backend/config.php`:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASS=
export DB_NAME=c2s_garments
```

Run PHP built-in server or deploy to Apache/Nginx:

```bash
cd backend
php -S localhost:8000
```

### 3. Database Migration

Import `database/schema_v2.sql` into your MySQL instance:

```bash
mysql -u root -p c2s_garments < database/schema_v2.sql
```

---

## 🔑 Demo Credentials

| Role             | Username     | Password      | Access Scope                                 |
| ---------------- | ------------ | ------------- | -------------------------------------------- |
| **Admin**        | `admin`      | `password123` | Full access to all 15 modules & settings     |
| **Line Manager** | `manager1`   | `password123` | Production lines, job sequencing, attendance |
| **QC Inspector** | `inspector1` | `password123` | Quality inspections, defect tracking, Pareto |
| **Auditor**      | `auditor1`   | `password123` | Compliance checklists, environmental audits  |
| **Floor Worker** | `worker1`    | `password123` | Safety reporting (বাং), rewards, schedule    |

---

## 📜 Compliance & Safety Standards

- **Bangladesh Labor Act 2006 (BLA)** & **ILO Core Conventions**: Fully tracked via `ReportsCompliance.jsx`.
- **AQL 2.5 / 4.0 Standard**: Built-in acceptance quality limit algorithms in `QualityControl.jsx`.
- **ISO 14001 Waste Mitigation**: Cutting room fabric yield optimization in `WasteTracking.jsx`.
- **Bilingual Floor Inclusion**: Direct worker safety reporting in native Bangla (`বাংলা`) with automatic administrative English translation in `WorkerReporting.jsx`.
