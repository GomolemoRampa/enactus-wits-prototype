# Enactus Wits Support System (AltruTech — Iteration 2)

**Official Venture Incubation & Support Portal for Enactus University of the Witwatersrand**

---

## 🌟 Tech Stack & Architecture

- **Frontend**: React (hosted on **Vercel**) with responsive CSS design tokens, modern modals, and interactive dashboards.
- **Database & Auth**: **Supabase** (PostgreSQL 15+) with Row-Level Security (RLS) policies and Microsoft Entra ID (Azure SSO).
- **Domain Restriction**: Enforced `@students.wits.ac.za` student email domain rule at both the database constraint level (`chk_wits_email_domain`) and frontend validation layer.
- **Thin Backend**: **Render** (Node.js/Express) triggered by Supabase Database Webhooks to dispatch transactional emails via **Resend**.

```mermaid
graph TD
    Client["React Frontend (Vercel)"] -->|Reads / Writes (RLS Enforced)| SupabaseDB[("Supabase PostgreSQL DB (Group11 Schema)")]
    Client -->|Student SSO / Auth| SupabaseAuth["Supabase Auth (Azure Entra ID)"]
    SupabaseDB -->|Database Webhooks on INSERT| RenderBackend["Render Thin Backend (Express)"]
    RenderBackend -->|Send Notification Emails| ResendAPI["Resend API"]
    ResendAPI -->|Deliver Notifications| StudentInbox["Student Inbox (@students.wits.ac.za)"]
```

---

## 📊 Database Schema (Group11 ERD Alignment)

| Entity / Table | Primary Key | Key Fields & Foreign Keys | Description |
|---|---|---|---|
| **`app_user`** | `user_id` (bigint) | `auth_user_id` (FK `auth.users`), `full_name`, `wits_email`, `role_id`, `business_stage_id`, `cell_number`, `account_status`, `join_date` | Student founder & staff profile extending Supabase Auth |
| **`role`** | `role_id` (bigint) | `role_name` (`Member`, `Admin`, `SuperAdmin`, `FacultyAdvisor`), `role_description` | System roles & permissions |
| **`business_stage`** | `business_stage_id` (bigint) | `stage_name` (`Idea`, `Prototype`, `RunningBusiness`), `stage_description` | Incubation progress stages |
| **`announcement`** | `announcement_id` (bigint) | `title`, `body`, `created_by_user_id` (FK `app_user`), `audience_type`, `recipient_count`, `created_at` | Announcements broadcast or targeted via enum |
| **`audience_map`** | `audience_map_id` (bigint) | `announcement_id` (FK `announcement`), `user_id` (FK `app_user`), `email_delivered`, `delivered_at` | Precomputed recipient mapping for stage-targeted announcements |
| **`event`** | `event_id` (bigint) | `title`, `event_date`, `category`, `visibility` (`Public`, `MembersOnly`), `status` (`Upcoming`, `Cancelled`, `Completed`), `created_by_user_id`, `description` | Workshops, meetings & masterclasses |
| **`event_registration`** | `registration_id` (bigint) | `event_id` (FK `event`), `user_id` (FK `app_user`), `registered_at`, `attended` | Member event RSVPs & attendance tracking |
| **`report`** | `report_id` (bigint) | `user_id` (FK `app_user`), `report_type` (`Overall`, `Financial`, `Marketing`), `submission_period`, `content` (jsonb), `status` (`Pending`, `Reviewed`, `Flagged`, `SubmittedLate`), `reviewed_by_user_id`, `admin_comments`, `is_late` | Monthly venture submissions & advisor feedback |
| **`milestone`** | `milestone_id` (bigint) | `user_id` (FK `app_user`), `title`, `milestone_date`, `source` (`MemberLogged`, `SystemGenerated`), `is_flagged_for_showcase` | Member entrepreneurial milestones |
| **`resource`** | `resource_id` (bigint) | `title`, `content_type`, `url`, `business_stage_id`, `category_id`, `uploaded_by_user_id` | Knowledge hub resources & guides |
| **`chat_log`** | `chat_log_id` (bigint) | `user_id`, `query`, `response`, `timestamp`, `is_flagged`, `escalated_to_user_id` | AI chatbot query logs |

---

## 🚀 Implemented Use Cases (Iteration 2 Scope)

### 1. UC1: Registration & Login (Auth)
- Microsoft Entra ID (Azure SSO) + Email & Password authentication.
- Strict `@students.wits.ac.za` email domain enforcement.
- Automated `app_user` provisioning via the `handle_new_auth_user()` database trigger.
- 2-Step founder profile completion (Bio, Venture Name, Stage Selection).

### 2. UC2: Announcements Management
- **Admin**: Compose broadcast or stage-targeted announcements (`AllMembers`, `IdeaStage`, `PrototypeStage`, `RunningBusiness`, `ExecutivesOnly`), pin announcements.
- **Member**: Personalized dashboard feed filtering announcements matching their venture development stage via `is_recipient()`.

### 3. UC3: Events & Workshops Management
- **Admin**: Create events with category, venue, date/time, and visibility (`Public` vs `MembersOnly`). Inspect attendee list with student details.
- **Member**: Browse upcoming events, view RSVP status, one-click RSVP / registration and cancellation.

### 4. UC4: Monthly Business Reports
- **Member**: Submit monthly progress reports with revenue (ZAR), venture summary, challenges faced, and next month's action plan stored structured in `content` (JSONB).
- **Admin / Faculty Advisor**: Review queue, evaluation modal, add constructive comments (`admin_comments`), and mark reports as `Reviewed` or `Flagged`.

---

## 📂 Project Structure

```
enactus-app/
├── public/
├── src/
│   ├── components/
│   ├── lib/
│   │   └── supabaseClient.js       # Supabase JS client with config checker
│   ├── services/
│   │   └── api.js                  # Unified API layer aligned to Group11 schema
│   ├── pages/
│   │   ├── Login.js                # UC1 Login + Azure SSO
│   │   ├── Register.js             # UC1 Register + @students.wits.ac.za validator
│   │   ├── ProfileSetup.js         # UC1 Founder profile & stage selection
│   │   ├── MemberDashboard.js      # UC2 Announcements, UC3 Events, UC4 Reports
│   │   └── AdminDashboard.js       # Admin Overview, Members, UC2 Compose, UC3 Events, UC4 Review
│   ├── App.js                      # Root router & authentication state
│   ├── App.css                     # Modern Enactus design system
│   └── index.js
├── supabase/
│   ├── schema.sql                  # Group11 PostgreSQL schema, constraints, indexes & seed
│   ├── rls_policies.sql            # Group11 Row-Level Security policies per role
│   ├── triggers.sql                # Domain validator & auto-provisioning triggers
│   └── README.md                   # Supabase migration guide
├── server/
│   ├── index.js                    # Express webhook receiver & Resend dispatcher
│   ├── package.json
│   ├── .env.example
│   └── README.md                   # Render deployment guide
├── .env.example
└── package.json
```

---

## 🛠️ Getting Started

### 1. Database Setup (Supabase)
1. In your Supabase Dashboard -> **SQL Editor** -> **New Query**:
   - Run `supabase/schema.sql` (creates all enums, tables, indexes, and initial seed data).
   - Run `supabase/rls_policies.sql` (enables Row-Level Security policies per role).
2. Configure **Microsoft Entra ID (Azure)** under Authentication -> Providers if using Wits SSO.

### 2. Thin Backend Setup (Render)
Follow [`server/README.md`](server/README.md):
1. Deploy `server/` to Render.
2. In Environment Variables, set:
   - `RESEND_API_KEY`: Your Resend API key
   - `SENDER_EMAIL`: `Enactus Wits <notifications@enactuswits.org>` (or `onboarding@resend.dev` for testing)
   - `SUPABASE_URL`: `https://<YOUR_PROJECT_ID>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (from Supabase Dashboard -> Settings -> API)
3. In Supabase Dashboard -> **Database** -> **Webhooks**, set webhooks on `announcement` and `event` table inserts pointing to:
   - `POST https://<RENDER_SERVICE_URL>/api/webhooks/announcement`
   - `POST https://<RENDER_SERVICE_URL>/api/webhooks/event`

### 3. Frontend Setup (React)
1. Copy `.env.example` to `.env` and fill in your Supabase project URL and public Anon Key:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Start the development server:
   ```bash
   npm start
   ```
*(Note: If live Supabase credentials are not provided, the application automatically runs in synchronized offline/fallback mode with full local storage persistence for local testing and demonstration).*

---

## 👥 Demo Test Accounts (Offline / Local Mode)

| Role | Email | Password | Business Stage |
|---|---|---|---|
| **Member** | `lerato@students.wits.ac.za` | `password123` | Prototype Stage |
| **Member** | `sipho@students.wits.ac.za` | `password123` | Running Business Stage |
| **Member** | `amara@students.wits.ac.za` | `password123` | Idea Stage |
| **Admin** | `admin@students.wits.ac.za` | `admin123` | Admin Panel |
| **Faculty Advisor** | `p.naidoo@students.wits.ac.za` | `advisor123` | Reports Reviewer |
