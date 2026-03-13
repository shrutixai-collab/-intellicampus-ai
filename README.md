# IntelliCampus AI 🎓

> AI-Powered Campus Operations Platform for Indian Schools & Colleges

## The Problem

Indian schools and colleges waste 40+ hours/month on manual operations — chasing fee defaulters, managing complaints on WhatsApp, tracking attendance on paper registers, coordinating substitute teachers, and sending circulars through WhatsApp groups with no read tracking.

## The Solution

IntelliCampus AI is a unified operations platform that brings AI intelligence to every aspect of campus management. One dashboard for principals. One portal for teachers. WhatsApp for parents. Zero extra apps to download.

## Key Features

### For Principals & Admin
- **Dashboard** — Real-time school pulse: fees, complaints, attendance, staff status at a glance
- **Fee Management** — Track payments, send AI-generated WhatsApp reminders (polite → firm → final)
- **Complaint Desk** — Auto-categorize, auto-assign, auto-respond to parent complaints
- **Smart Circulars** — AI drafts circulars, tracks delivery & read rates per parent
- **Attendance Analytics** — Class-wise view, at-risk students flagged automatically
- **Certificate Tracking** — Bonafide, TC, migration — full lifecycle tracking
- **Staff Management** — AI suggests substitute teachers based on availability + syllabus progress
- **Emergency Broadcast** — One-click alert to all parents and staff
- **Transport Tracker** — Bus journey start/end notifications to parents
- **Academic Calendar** — Color-coded events, exams, holidays, deadlines

### For Teachers
- **Teacher Dashboard** — Personal schedule, class overview, quick actions
- **Photo Attendance** — Click photo of paper register → AI extracts present/absent
- **Marks Entry** — Upload marks register photo OR enter manually
- **Syllabus Tracker** — Chapter-wise progress tracking per class
- **Homework Posting** — Post daily homework, parents auto-notified

### For Parents (via WhatsApp)
- Ask in Hinglish: "Attendance kitna hai?" → AI responds with data
- Receive fee reminders, circulars, attendance alerts automatically
- Raise complaints, request certificates — all via WhatsApp
- No app download needed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, SQLite (better-sqlite3) |
| AI | Simulated AI responses (Phase 1), Claude API integration (Phase 2) |
| Design | Mobile-responsive, dark mode, role-based access |

## Screenshots

> *Screenshots section — coming soon*

## Getting Started

```bash
git clone https://github.com/shrutixai-collab/intellicampus-ai.git
cd intellicampus-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

| Role | How to Login |
|------|-------------|
| Principal / Admin | Select "Principal/Admin" → Enter Dashboard |
| Teacher | Select "Teacher" → Choose teacher name → Enter Portal |

## Project Structure

```
src/
  app/
    (dashboard)/          # Principal & admin pages
    (teacher)/            # Teacher portal pages
  components/             # Reusable UI components
  lib/                    # Database, utilities
  data/                   # Seed data (realistic Indian school/college data)
workflows/                # SOPs for each feature (WAT framework)
tools/                    # Automation scripts
```

## Roadmap

- [x] Phase 1: Complete dashboard with simulated data
- [x] Phase 1: Teacher portal with role-based access
- [x] Phase 1: AI-simulated responses for all workflows
- [ ] Phase 2: WhatsApp Business API integration
- [ ] Phase 2: Real AI responses via Claude API
- [ ] Phase 2: Bank-grade security (AES-256, 2FA, DPDPA compliance)
- [ ] Phase 3: Voice note support in Hindi/Marathi/English
- [ ] Phase 3: OCR for attendance register photos
- [ ] Phase 3: Multi-language dashboard (English, Hindi, Marathi)

## Target Market

- 6,200+ schools in Pune
- 400+ colleges in Nashik
- 40,000+ institutions across Maharashtra
- Scalable to 14,000+ AICTE institutions nationwide

## Built By

**Shruti** — AI Automation Developer
Building AI-powered solutions for Indian businesses

## License

MIT
