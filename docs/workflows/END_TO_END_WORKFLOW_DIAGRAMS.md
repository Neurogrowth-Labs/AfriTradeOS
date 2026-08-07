# End-to-End Workflow Diagrams

## Purpose

This document provides workflow diagrams for core AfriTrade OS operating journeys. Diagrams use Mermaid syntax so they can be rendered in GitHub, documentation portals, or compatible Markdown viewers.

## 1. Export trade lifecycle

```mermaid
flowchart TD
  A[Exporter completes onboarding] --> B[Create trade or export project]
  B --> C[Enter product, HS code, route, value, Incoterm]
  C --> D[Run compliance and AfCFTA readiness checks]
  D --> E{Documents complete?}
  E -- No --> F[Upload or generate required documents]
  F --> D
  E -- Yes --> G[Find buyer, logistics, and finance partners]
  G --> H[Create contract and milestones]
  H --> I[Arrange finance if needed]
  I --> J[Book shipment]
  J --> K[Submit customs declaration]
  K --> L{Customs cleared?}
  L -- No --> M[Resolve query, hold, or risk alert]
  M --> K
  L -- Yes --> N[Track shipment to delivery]
  N --> O[Settle payment and close trade]
```

## 2. Customs declaration review

```mermaid
flowchart TD
  A[Declaration submitted] --> B[Customs review queue]
  B --> C[Validate trader, TIN, documents, certificates]
  C --> D[Check HS code, declared value, duties, taxes]
  D --> E[Assess AfCFTA eligibility and risk score]
  E --> F{Decision}
  F -- Query --> G[Request clarification or additional documents]
  G --> B
  F -- Escalate --> H[Senior officer or investigation]
  H --> B
  F -- Reject --> I[Record rejection reason]
  F -- Approve --> J[Approve declaration]
  J --> K[Confirm payment/revenue]
  K --> L[Clear shipment]
```

## 3. Trade finance application

```mermaid
flowchart TD
  A[Exporter or importer needs finance] --> B[Open Trade Finance or Bank Applications]
  B --> C[Build application]
  C --> D[Attach trade documents]
  D --> E[Document extraction]
  E --> F[Credit scoring]
  F --> G[KYC and AML due diligence]
  G --> H{Bank decision}
  H -- More info --> I[Request documents or clarification]
  I --> D
  H -- Reject --> J[Record rejection and reason]
  H -- Approve --> K[Set terms, amount, currency, tenor]
  K --> L[Disburse or bind insurance]
  L --> M[Monitor repayment, exposure, and shipment performance]
```

## 4. Logistics shipment execution

```mermaid
flowchart TD
  A[Shipment request or tender] --> B[Logistics provider reviews route and cargo]
  B --> C[Quote or bid]
  C --> D{Accepted?}
  D -- No --> E[Archive opportunity]
  D -- Yes --> F[Assign vehicle and driver]
  F --> G[Generate transport documents]
  G --> H[Pickup cargo]
  H --> I[In transit tracking]
  I --> J{Border or customs issue?}
  J -- Yes --> K[Resolve hold, query, permit, or document issue]
  K --> I
  J -- No --> L[Deliver cargo]
  L --> M[Create invoice]
  M --> N[Close shipment]
```

## 5. Government oversight and policy workflow

```mermaid
flowchart TD
  A[Government command center] --> B[Monitor trade KPIs, alerts, and anomalies]
  B --> C[Analyze trade statistics and flows]
  C --> D[Review border posts and corridor congestion]
  D --> E[Review policy compliance and cases]
  E --> F{Policy action needed?}
  F -- No --> G[Publish report or dashboard insight]
  F -- Yes --> H[Create or update policy/compliance case]
  H --> I[Assign enforcement or policy owner]
  I --> J[Track resolution and penalties if any]
  J --> K[Update trusted trader or registry data]
  K --> G
```

## 6. Marketplace and tender opportunity workflow

```mermaid
flowchart TD
  A[User searches marketplace or tenders] --> B[Apply filters by country, sector, score, or HS code]
  B --> C[Review partner, product, tender, or supplier details]
  C --> D{Action type}
  D -- Connect --> E[Send connection or message]
  D -- Bid --> F[Prepare bid]
  D -- Save --> G[Add to wishlist or watchlist]
  F --> H[Attach proposal and documents]
  H --> I[Submit bid]
  I --> J[Track evaluation status]
```

## 7. User onboarding and role routing

```mermaid
flowchart TD
  A[User signs in] --> B{Profile exists?}
  B -- No --> C[Create profile from auth metadata]
  B -- Yes --> D[Load profile]
  C --> E[Select persona]
  D --> F{Onboarding complete?}
  E --> G[Enter full name, company, country, contact details]
  G --> H[Save onboarding state]
  H --> F
  F -- No --> E
  F -- Yes --> I[Route to persona default workspace]
  I --> J[Apply role-based menu and route protection]
```
