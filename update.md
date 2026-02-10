# **AfriTrade OS – Detailed Adjustment Specification**

This document consolidates and formalizes all required adjustments for **AfriTrade OS**, based on the complete chat history and the voice note from **Lusimanadio**. The goal is to provide a clear, implementation-ready specification that can be directly used by engineering teams and AI coding assistants (e.g., Claude Code).

---

## **1. Objective**

The primary objective of this phase is to transition AfriTrade OS from a *feature-complete but role-agnostic platform* into a **role-aware, subscription-ready, production-grade system**. The focus areas are:

* Strict role-based access control (RBAC)
* Role-specific UI and dashboard personalization
* Subscription billing and payment infrastructure
* Cleanup and completion of inactive or partially wired features

---

## **2. Role-Based Access Control (RBAC) & UI Personalization**

### **2.1 Current Issue**

At present, all users—regardless of their selected role—can see and attempt to access all features and dashboards in the platform. Although a role is selected during onboarding (e.g., SMME Exporter, Importer, Customs Authority, etc.), this role does not currently affect:

* Sidebar menu structure
* Dashboard visibility
* Feature entry points
* Navigation access

This creates confusion, reduces perceived intelligence of the platform, and introduces security and UX risks.

### **2.2 Required Behavior**

Each user must only see and access features, dashboards, and workflows explicitly associated with their assigned role.

When a user logs in:

* The sidebar must be dynamically generated based on role
* Only role-relevant dashboards should be visible
* Non-authorized routes must be hidden and protected at both UI and API levels

### **2.3 Supported Roles**

The following roles must be treated as **mutually isolated feature domains**:

* SMME Exporter
* Enterprise Exporter
* Importer
* Customs Authority
* Logistics Provider
* Bank / Insurer
* Government Agency
* Trade Analyst
* Platform Administrator

Each role should have:

* Its own dashboard(s)
* Its own feature set
* Its own sidebar menu configuration

### **2.4 Technical Expectations**

* Frontend: Role-aware routing and conditional rendering
* Backend: Enforced RBAC at API and service level
* Unauthorized access attempts should be blocked and logged

### **2.5 Goal**

Deliver a **personalized, intelligent, and non-confusing user experience**, where users feel the platform is purpose-built for their role.

---

## **3. Profile Section – Billing, Subscription & Payments**

### **3.1 Business Model Context**

AfriTrade OS is designed as a **subscription-based SaaS platform**, where users pay monthly (or periodically) based on access level and usage.

### **3.2 Current State**

**In the ****Profile → Bills & Usage** section:

* Billing UI exists but is incomplete
* Payment method management is not functional
* The “Edit payment method” button is inactive
* No real payment processing is integrated

### **3.3 Required Functionality**

Users must be able to:

* Add a payment method
* Edit or replace an existing payment method
* Pay using:
  * Credit card
  * Business card
* Ideally use:
  * Stripe
  * PayPal

### **3.4 Subscription Handling**

Backend must support:

* Subscription plans (by role and/or feature tier)
* Subscription lifecycle:
  * Active
  * Trial
  * Past due
  * Suspended
  * Cancelled
* Billing history and invoices
* (Optional) Usage-based tracking if applicable

### **3.5 UX Expectations**

* “Edit payment method” button must redirect to a proper setup flow
* Clear feedback on payment status
* Clear messaging for failed or expired payments

---

## **4. Inactive, Missing, or Partially Wired Features**

### **4.1 Current Issue**

Several UI elements currently:

* Exist visually
* Have no click handlers or triggers
* Are not connected to backend logic
* Redirect to empty or incorrect routes

This creates uncertainty and breaks user trust.

### **4.2 Required Actions**

All such elements must be audited and classified into one of the following:

1. **Fully implement**
   * Connect to backend logic
   * Ensure correct routing and data flow
2. **Explicitly mark as “Coming Soon”**
   * Visually indicate non-availability
   * Prevent user interaction
3. **Remove temporarily** (if not part of near-term roadmap)

### **4.3 Definition of Done**

* No clickable UI element without a valid action
* No dead-end navigation paths
* No misleading feature availability

---

## **5. Overall Quality & Readiness Criteria**

Before considering this phase complete:

* Role isolation must be fully enforced
* Billing and payment flows must be functional end-to-end
* All visible UI elements must either work or be clearly labeled
* The platform should feel:
  * Cohesive
  * Purpose-driven
  * Production-ready

---

## **6. Confirmation**

This document is intended to serve as the **single source of truth** for the current adjustment phase of AfriTrade OS.

Any changes, additions, or clarifications should be discussed and reflected here before implementation proceeds.

---

*Prepared for engineering execution and AI-assisted development (Claude Code compatible).*
