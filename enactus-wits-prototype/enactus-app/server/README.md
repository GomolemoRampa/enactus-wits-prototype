# Render Thin Backend Service — Enactus Wits Support System

This service is a lightweight Node.js/Express server hosted on **Render** to handle operations that require secret keys (such as email delivery via the **Resend** API).

---

## Endpoints

1. `GET /health`: Health check endpoint.
2. `POST /api/webhooks/announcement`: Supabase webhook receiver for new announcements. Lookups member recipient emails and sends emails via Resend.
3. `POST /api/webhooks/event`: Supabase webhook receiver for new events.
4. `POST /api/send-email`: Direct email sending API.

---

## Deploying on Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your Git repository.
4. Set the following settings:
   - **Root Directory**: `enactus-app/server` (or `server` depending on repository root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. In **Environment Variables**, add:
   - `RESEND_API_KEY`: Your key from resend.com
   - `SENDER_EMAIL`: `Enactus Wits <notifications@enactuswits.org>` (or `onboarding@resend.dev` in dev mode)
   - `SUPABASE_URL`: `https://<PROJECT_ID>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key from Supabase Dashboard -> Project Settings -> API.
