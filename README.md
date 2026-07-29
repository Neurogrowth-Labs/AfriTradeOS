# AfriTrade OS

A digital trade operating system for secure, compliant cross-border commerce under the African Continental Free Trade Area (AfCFTA).

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Supabase, PostgreSQL

## Quick Start

```bash
npm install
```

Set environment variables in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run development server:
```bash
npm run dev
```

## Core Modules

- **Identity & Compliance** - KYC/KYB, verification, licensing
- **Marketplace** - Digital trade, procurement, tenders
- **Smart Contracts** - Programmable trade agreements
- **Payments** - Multi-currency wallets, escrow, cross-border settlement
- **Customs & Logistics** - Documents, tracking, clearance
- **Trade Finance** - Credit scoring, invoice/PO financing
- **Analytics** - Role-based dashboards, KPIs, reporting
- **AI Risk Engine** - Fraud detection, risk scoring

## Documentation

See [docs/](docs/) for detailed specifications and development tasks.

## License

Proprietary - All rights reserved

## Runtime configuration

AfriTradeOS reads payment and platform credentials from environment variables. Do not commit production secrets.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYPAL_CLIENT_ID=
VITE_WHOP_PAYMENT_API_KEY=
VITE_WHOP_PAYMENT_API_URL=/api/payments/whop
```

The global app shell persists the selected currency and language locally, subscribes to Supabase realtime notifications for the signed-in user, and displays an empty notification state instead of generated placeholder notifications when the backend has no records.
