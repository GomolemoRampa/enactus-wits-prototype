# Supabase Setup Guide — Enactus Wits Support System

This directory contains the database definition for **AltruTech Iteration 2 (Enactus Wits Support System)**.

---

## 1. Running the Database Migrations

In your Supabase Dashboard:
1. Navigate to **SQL Editor** -> **New Query**.
2. Run `schema.sql` to generate all tables, foreign keys, and seed data.
3. Run `rls_policies.sql` to activate Row-Level Security (RLS) policies.
4. Run `triggers.sql` to enable domain restrictions and auto-profile provisioning.

---

## 2. Microsoft Entra ID (Azure) Auth Configuration

1. In the **Supabase Dashboard**, go to **Authentication** -> **Providers** -> **Azure**.
2. Enable Azure and configure:
   - **Client ID**: From your Azure App Registration in Wits tenant.
   - **Client Secret**: From Azure App Registration certificates/secrets.
   - **Azure Tenant URL**: `https://login.microsoftonline.com/<WITS_TENANT_ID>/v2.0`
3. In Azure Portal -> App Registration -> Authentication:
   - Set Redirect URI to: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

---

## 3. Database Webhooks to Render Backend

To enable decoupled email dispatch via Resend when announcements or events are created:
1. In Supabase Dashboard, go to **Database** -> **Webhooks** -> **Create a new hook**.
2. **Announcement Webhook**:
   - Name: `on_announcement_created`
   - Table: `public.announcements`
   - Events: `INSERT`
   - HTTP Request: `POST https://<YOUR_RENDER_SERVICE_URL>/api/webhooks/announcement`
   - Headers: `Content-Type: application/json`
3. **Event Webhook**:
   - Name: `on_event_created`
   - Table: `public.events`
   - Events: `INSERT`
   - HTTP Request: `POST https://<YOUR_RENDER_SERVICE_URL>/api/webhooks/event`
   - Headers: `Content-Type: application/json`
