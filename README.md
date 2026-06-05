# Rise Next Solutions - WhatsApp + Instagram Bot Full Stack

Production-style starter for a permanent Meta WhatsApp Cloud API + Instagram Messaging API bot with a React admin dashboard.

## What is included

- WhatsApp Cloud API webhook verification and message handling
- Instagram Messaging API webhook handling
- Rise Next service menu auto replies
- MongoDB lead storage
- Admin dashboard for enquiries
- Demo seed data
- Render/Vercel-ready environment setup

## Public company content used

The service positioning is based on Rise Next's public website description: Hyderabad-based studio helping businesses build, manage and scale with technology, branding, hiring, operations, marketing and podcasts/creative solutions.

## Folder structure

```txt
risenext-bot-fullstack
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   └── .env.example
└── frontend
    ├── src
    └── .env.example
```

## Backend setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/api/health
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## Add demo leads

After MongoDB is connected:

```bash
cd backend
npm run seed
```

## Required Meta setup

### WhatsApp

Use official Meta WhatsApp Cloud API, not `whatsapp-web.js`.

Required values:

```env
WHATSAPP_TOKEN=permanent_system_user_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
VERIFY_TOKEN=rise_next_verify_token_2026
```

Webhook URL:

```txt
https://your-backend-domain.com/api/webhook
```

Webhook verify token must match `VERIFY_TOKEN` in backend `.env`.

### Instagram

Instagram account must be Professional and connected to a Facebook Page.

Required values:

```env
INSTAGRAM_PAGE_ACCESS_TOKEN=long_lived_page_access_token
INSTAGRAM_PAGE_ID=facebook_page_id_connected_to_instagram
```

## Permanent token note

Do not use temporary token from Meta dashboard for production. Use Business Settings → System Users → Assign Assets → Generate Token.

Required permissions generally include:

```txt
whatsapp_business_messaging
whatsapp_business_management
instagram_manage_messages
pages_manage_metadata
pages_messaging
```

## Render deployment notes

Backend build command:

```bash
npm install
```

Backend start command:

```bash
npm start
```

Root directory:

```txt
backend
```

Add all `.env` values in Render Environment Variables.

## Vercel deployment notes

Frontend root directory:

```txt
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

Add:

```env
VITE_API_URL=https://your-render-backend-url
VITE_ADMIN_API_KEY=same_as_backend_ADMIN_API_KEY
```

## Testing without Meta token

If tokens are not configured, backend will log mock replies instead of failing. This allows dashboard and local flow testing safely.

## Important security

- Never put Meta token in frontend.
- Never upload `.env` to GitHub.
- Use permanent System User token only on backend.
- Use HTTPS public URL for Meta webhook.
- Change `ADMIN_API_KEY` before deployment.
