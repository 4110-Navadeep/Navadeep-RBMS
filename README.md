# Resource Booking Management System (RBMS)

A modern, professional, enterprise-grade application for managing and booking seminar halls, marriage halls, party halls, computer labs, and conference rooms. The application incorporates role-based authentication, double-booking prevention, automated Nodemailer HTML notifications, and modern React dashboard layouts.

---

## Project Overview

The Resource Booking Management System (RBMS) allows users to check space availability, search resources, and submit booking requests. Administrator reviews and approves or rejects booking requests. The system automatically handles overlap checks to prevent conflicting reservations on identical dates and time-slots, updating status indicators and dispatching emails to keeping the reservation flow transparent.

---

## Features

### User Capabilities
- **Registration & Login**: Secure signup and session management with JWT authentication.
- **Resource Browse Grid**: Responsive search and filter for seminar halls, computer labs, etc.
- **Details & Dynamic Forms**: Booking form with date pickers and overlapping slot validations.
- **My Bookings Logs**: Status tracking panel (`Pending` | `Approved` | `Rejected`) with admin remarks.

### Administrator Capabilities
- **Admin Dashboard**: Core metrics (Total Resources, Bookings, Users, Pending Approvals) and real-time logs.
- **Resource Inventory Manager**: CRUD panel to add, edit, or delete spaces, with toggle states to shut down booking availability.
- **Approval Terminal**: Processing terminal for booking logs with option to provide rejection remarks.

---

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, Axios, React Router, Lucide Icons, Vite
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT, Bcrypt hashing
- **Email System**: Nodemailer SMTP
- **Containerization**: Docker, Docker Compose

---

## Default Admin Credentials

When the system bootstraps for the first time, it automatically inserts the following default administrator account (stored securely using Bcrypt hashing):

- **Email**: `admin@resourcebooking.com`
- **Password**: `Admin@123`
- **Role**: `ADMIN`

---

## Project Structure

```text
d:\Resource Management/
├── backend/
│   ├── config/          # Database connection pooling configuration
│   ├── controllers/     # API request-response handlers (Auth, Resources, Bookings)
│   ├── middleware/      # Auth security filters (JWT verification & Admin role checks)
│   ├── routes/          # Express route declarations
│   ├── services/        # Nodemailer SMTP email service
│   ├── Dockerfile       # Container definition for backend
│   ├── schema.sql       # MySQL schema script for table generation
│   ├── seed.js          # Startup database seeding script
│   └── server.js        # Entry bootstrap runner
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbars, Sidebars, ResourceCards
│   │   ├── context/     # AuthContext session provider
│   │   ├── pages/       # Login, Register, Dashboards, Browse, Details, History
│   │   ├── services/    # Axios instance with request headers interceptors
│   │   ├── App.jsx      # Navigation routing maps and protected views wrapper
│   │   ├── index.css    # Tailwind imports and default typography
│   │   └── main.jsx     # Dom mount point
│   ├── index.html       # Landing wrapper with metadata and fonts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile       # Nginx static server container definition
├── docker-compose.yml   # Multi-service container coordinator
└── .env.example         # System configuration template
```

---

## Environment Variables Configuration

Create a `.env` file in the `backend/` directory or root workspace using the details below:

```env
# Server configuration
PORT=5000
JWT_SECRET=rbms_secret_session_token_key_123

# Database configuration (use DB_HOST=localhost for local run, DB_HOST=mysql for Docker Compose)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Na150107
DB_NAME=resource_booking_db

# Email SMTP configuration (Nodemailer)
EMAIL_USER=donnaveeng@gmail.com
EMAIL_PASS=ytjh lwlj pqbn timj
```

---

## How To Run Locally

### Step 1: Start MySQL Database Server
Ensure your local MySQL service is running, and create the database `resource_booking_db` or let the server generate it automatically:
```sql
CREATE DATABASE IF NOT EXISTS resource_booking_db;
```

### Step 2: Run Backend Server
Navigate to the backend directory, install dependencies, and launch the dev environment:
```bash
cd backend
npm install
npm run dev
```

### Step 3: Run Frontend Client
Open a new terminal, navigate to the frontend directory, install dependencies, and launch Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## How To Run Using Docker

The entire stack (MySQL, Backend Express, and Nginx Frontend) can be launched using a single terminal command:

```bash
docker-compose up --build
```

- Binds MySQL on local port `3306`
- Binds Backend API on local port `5000`
- Binds Frontend Web App on local port `3000`

To tear down the containers and preserve state volumes:
```bash
docker-compose down
```

---

## Git Workflow Commands

Configure Git credentials matching the project guidelines:
```bash
git config --global user.name "Navadeep"
git config --global user.email "192424110.simats@saveetha.com"
```

Initialize, commit code, and push using the branch patterns:
```bash
# Initialize Repo
git init
git status
git add .
git commit -m "Initial Commit"
git branch -M main

# Setup branches
git branch develop
git checkout -b feature/authentication
git checkout -b feature/booking
git checkout -b feature/admin-dashboard
git checkout -b feature/email-notification

# Push changes to Origin
git remote add origin <GITHUB_REPOSITORY_URL>
git push -u origin main
git pull origin main
```

### Commit Message Guidelines:
- `feat: implement authentication`
- `feat: add booking module`
- `feat: add admin dashboard`
- `feat: add email notifications`
- `fix: resolve booking conflict issue`
- `docs: update README`

---

## API Documentation

### Auth Module
- `POST /api/auth/register` : User Signup. Payload: `{ name, email, password }`
- `POST /api/auth/login` : Login user/admin. Payload: `{ email, password }`

### Resources Module
- `GET /api/resources` : Retrieves all resources. Supports queries: `?search=xyz&availability=true`
- `POST /api/resources` : [Admin] Add new space. Payload: `{ name, description, capacity, image_url, availability }`
- `PUT /api/resources/:id` : [Admin] Update space details.
- `DELETE /api/resources/:id` : [Admin] Remove space.

### Bookings Module
- `POST /api/bookings` : [User] Book resource slot. Payload: `{ resource_id, booking_date, booking_start_time, booking_end_time, purpose }`
- `GET /api/bookings/user` : [User] Get current user's booking history log.
- `GET /api/bookings/admin` : [Admin] List all booking applications.
- `PUT /api/bookings/approve/:id` : [Admin] Approve booking status.
- `PUT /api/bookings/reject/:id` : [Admin] Reject booking status. Payload: `{ remarks }`

---

## Deployment Guidelines

### Frontend → Vercel
1. Install Vercel CLI or link GitHub repository to Vercel panel.
2. Select root directory as `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables: `VITE_API_URL` to point to the production backend address.

### Backend → Render
1. Create a Web Service inside the Render panel.
2. Link the repository, specify the base directory as `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure all Environment Variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `EMAIL_USER`, `EMAIL_PASS`, `JWT_SECRET`, etc.). Note that you can provision a Managed PostgreSQL or MySQL DB on Render or external providers (like Aiven or PlanetScale) and update the credentials.

---

## Project Access URLs

- **Local Frontend**: `http://localhost:3000`
- **Local Backend API**: `http://localhost:5000`
- **Local Database Pool**: `localhost:3306`
