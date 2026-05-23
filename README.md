# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## 📋 Project Description
DevPulse is an issue tracking system with **contributor** and **maintainer** role-based permissions. Users can create bug reports or feature requests and update status according to the defined workflow.

## 🛠 Technology Stack
| Technology | Version/Note |
|------------|--------------|
| Node.js | 24.x or higher (LTS) |
| TypeScript | Latest stable version |
| Express.js | Modular router architecture |
| PostgreSQL | Native pg driver |
| Raw SQL | Only pool.query() – No ORM/Query Builders |
| bcrypt | Salt rounds 8-12 |
| jsonwebtoken | JWT generation & verification |

## 👥 User Roles & Permissions

### Contributor (Default Role)
- ✅ Register and login
- ✅ Create new issues (bug/feature request)
- ✅ View all issues
- ✅ Update own issue fields

### Maintainer
- ✅ All contributor permissions
- ✅ Update any issue field
- ✅ Delete any issue
- ✅ Change issue workflow status independently

## 🔐 Authentication & Authorization System

### JWT Flow
1. Client sends credentials
2. Server validates & hashes/compares password
3. Server returns signed JWT
4. Client attaches token to `Authorization: <token>` header
5. Server verifies signature & expiry before processing

### Security Rules
- 🔒 Passwords never exposed in responses or logs
- 🛡️ Protected endpoints reject requests without valid JWT
- 👑 Role verification occurs before privileged operations

## 🗄️ Database Schema

### Table 1: users
| Field | Type | Constraint |
|-------|------|------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | UNIQUE, NOT NULL |
| password | VARCHAR | NOT NULL |
| role | VARCHAR | DEFAULT 'contributor', CHECK (contributor/maintainer) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Table 2: issues
| Field | Type | Constraint |
|-------|------|------------|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NOT NULL, MIN 20 characters |
| type | VARCHAR | CHECK (bug/feature_request) |
| status | VARCHAR | DEFAULT 'open', CHECK (open/in_progress/resolved) |
| reporter_id | INTEGER | REFERENCES users(id) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## 📦 Installation & Setup

### Prerequisites
- Node.js (24.x or higher)
- PostgreSQL (latest stable version)
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/FarukBadsha0186/-DevPulse-Assignment.git

# 2. Navigate to project directory
cd -DevPulse-Assignment

# 3. Install dependencies
npm install

# 4. Create .env file (example below)
cp .env.example .env

# 5. Setup database
createdb devpulse_db
psql -d devpulse_db -f database/schema.sql

# 6. Run the project
npm run dev
