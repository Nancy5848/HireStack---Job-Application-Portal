# Hirestack — Full-Stack Job Portal (MERN)

A job portal with two roles — **Student** (candidate) and **Recruiter** — built with
MongoDB, Express, React, and Node.

## What's included

**Backend** (`server/`): auth (JWT + bcrypt, register/login/logout/forgot-password),
Jobs CRUD with search/filter/sort/pagination, Applications (resume-based apply, skill-match
%, status timeline, notifications), Student profiles + resume upload/download, Company
profiles + logo upload, Bookmarks (saved jobs), Notifications, Company Reviews, Recruiter
& Student analytics. Security: helmet, CORS, rate limiting, mongo-sanitize.

**Frontend** (`client/`): React 19 + Vite + React Router + Bootstrap 5 + Axios. Pages:
landing page, login/register/forgot-password, job listing with filters, job details with
apply/save, student dashboard (profile, skills, resume, applications, saved jobs), recruiter
dashboard (post/delete jobs, view applicants, update application status, analytics cards).
Dark/light theme toggle built in.

---

## 1. Before you start

You need these installed on your machine:

- **Node.js** version 18 or higher — check with `node -v`
- **npm** (comes with Node)
- **MongoDB** — either:
  - Installed locally ([MongoDB Community Server](https://www.mongodb.com/try/download/community)), or
  - A free cloud database from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (easier if you don't want to install MongoDB locally)

## 2. Unzip and open in VS Code

Unzip the file, then open the resulting `jobportal` folder in VS Code
(`File → Open Folder…`). You'll see two subfolders: `client/` and `server/`.

Open a terminal in VS Code (`` Ctrl+` `` or `` Cmd+` ``) — you'll run commands from here.

## 3. Set up the backend

```bash
cd server
npm install
```

Copy the example environment file:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell) / macOS / Linux
cp .env.example .env
```

Now **open `server/.env` and change these values**:

| Variable | What to change it to |
|---|---|
| `MONGO_URI` | Your MongoDB connection string. Local: `mongodb://127.0.0.1:27017/hirestack`. Atlas: copy the connection string from your Atlas cluster (Database → Connect → Drivers), and replace `<password>` with your actual database user password. |
| `JWT_SECRET` | Any long random string — e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the result here. |
| `CLIENT_URL` | Leave as `http://localhost:5173` unless you change the frontend's port. |

Everything else in `.env.example` can be left as-is for local development.

Start the backend:

```bash
npm run dev
```

You should see:
```
Hirestack server running in development mode on port 5000
MongoDB Connected: <your host>
```

If you see a MongoDB connection error, double-check `MONGO_URI` — that's almost always the cause.

Leave this terminal running. Test it worked by opening `http://localhost:5000/api/health`
in your browser — you should see a JSON success message.

## 3.5 Seed the database with sample data (recommended)

An empty database means an empty-looking app. Open a **new terminal**, `cd server`, and run:

```bash
npm run seed
```

This creates 3 recruiter accounts (each with a company profile), 10 realistic job listings
across engineering/design/data roles, 1 demo student account, and a sample company review.
All seeded accounts use the password `Password123`. The script prints the exact emails it
created — use any of them to log in and see a populated app immediately.

Run `npm run seed -- --fresh` any time to wipe all data and reseed from scratch (useful if
your data gets messy while testing).

## 4. Set up the frontend

Open a **second terminal** in VS Code (keep the backend one running) and run:

```bash
cd client
npm install
```

Copy the example environment file the same way as before:

```bash
cp .env.example .env
```

(This just points the frontend at `http://localhost:5000/api` — no changes needed unless
you changed the backend's `PORT`.)

Start the frontend:

```bash
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`. Open that in your browser.

## 5. Using the app

**Fastest path (if you ran `npm run seed`):** log in with `student@demo.com` /
`Password123` to browse pre-populated jobs, or `recruiter@nimbuscloud.io` / `Password123`
to see a recruiter dashboard with real listings and analytics.

**From scratch:**
1. Go to `http://localhost:5173/register` and create two test accounts — one as
   **Candidate**, one as **Recruiter** (use different emails; you can use the same browser
   in a normal + incognito window to be logged into both at once).
2. As the recruiter: go to the dashboard and click **"+ Post a job"** to create a listing.
3. As the student: go to **Browse Jobs**, open the job you just posted, upload a resume
   under the dashboard's **Resume** tab first (required before applying), then click **Apply now**.
4. Back as the recruiter: open **View applicants** on that job and update the applicant's
   status — the student will see it reflected in their **Applications** tab, and you'll get
   a notification bell alert either way.
5. Click a company name on any job page to view its **company profile**, with open roles
   and student-submitted reviews.

## 6. Common issues

- **"MongoDB Connection Error"** — your `MONGO_URI` in `server/.env` is wrong, or your
  local MongoDB isn't running (`mongod` needs to be started), or (for Atlas) your IP address
  isn't whitelisted under Network Access in the Atlas dashboard.
- **Frontend loads but API calls fail / CORS errors** — make sure the backend is running
  on port 5000 and `CLIENT_URL` in `server/.env` matches the frontend's actual URL.
- **"Please upload a resume before applying"** — this is expected behavior, not a bug —
  upload a resume from the student dashboard's Resume tab first.
- **Port already in use** — change `PORT` in `server/.env`, or stop whatever else is using
  port 5000 / 5173.

## 7. Project structure

```
jobportal/
├── client/                 React frontend (Vite)
│   └── src/
│       ├── components/     Navbar, Footer, JobCard, ProtectedRoute
│       ├── pages/          Landing, Login, Register, JobListing, JobDetails,
│       │                   StudentDashboard, RecruiterDashboard, etc.
│       ├── context/        AuthContext, ThemeContext
│       ├── utils/          api.js (axios instance), constants.js
│       └── styles/         theme.css (design system)
└── server/                 Express backend
    ├── config/             db.js, constants.js
    ├── models/             User, Student, Company, Job, Application,
    │                       Notification, Bookmark, Review
    ├── controllers/        Business logic per resource
    ├── routes/             Route definitions per resource
    ├── middleware/         auth.js (JWT), upload.js (Multer), errorHandler.js
    ├── services/           emailService.js (email-ready, logs to console in dev)
    └── uploads/            Resume/logo files land here at runtime
```

## 8. What you can extend next

The backend already supports more than the current UI surfaces — for example
`PUT /api/students/profile` accepts `education`, `experience`, `projects`, and
`certificates` arrays, but the Student Dashboard's Profile tab currently only has a UI
for skills. Company reviews (`/api/reviews`) and the resume builder / PDF export are also
backend-ready but don't have dedicated frontend pages yet. These are natural next additions
if you want to keep building this out.


