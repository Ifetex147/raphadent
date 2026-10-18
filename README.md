# Raphadent — Dental Clinic Management System

A full-stack web application built for **Raphadent Dental Clinic** in Ebonyi State, Nigeria, to replace paper-based records with a secure, digital workflow. Patients, appointments, dental charts, billing, and staff roles all live in one place — accessible from any device.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.16-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Patient Management** — Registration with auto-generated file numbers (`RPD-YYYY-XXXX`), medical history, allergies, emergency contacts, blood group, and full-text search.
- **Appointments** — Booking with date, time, duration, and type; status flow from *Scheduled → Confirmed → Checked In → In Progress → Completed*, with cancellation support and date/status filters.
- **Interactive Dental Chart** — A 32-tooth visual map using the Universal Numbering System. Click any tooth to record its condition (decayed, filled, crowned, missing, extracted, root canal, implant, bridge, cracked, abscess, wear) and add clinical notes.
- **Billing** — Invoice generation with itemized line items, payment recording, and automatic status transitions (*Unpaid → Partial → Paid*). Balances calculate in real time.
- **Role-Based Access Control** — Three roles with tailored dashboards and permissions:

  | Feature | Admin | Dentist | Receptionist |
  |---|---|---|---|
  | Dashboard | ✅ Full stats | ✅ Patients + Appointments | ✅ Patients + Appointments |
  | Patients | ✅ | ✅ | ✅ |
  | Appointments | ✅ | ✅ | ✅ |
  | Dental Chart | ✅ | ✅ | ❌ |
  | Billing | ✅ | ❌ | ✅ |
  | Staff Management | ✅ | ❌ | ❌ |
  | Revenue Figures | ✅ | ❌ | ❌ |

- **Staff Management** — Admins can create new dentist and receptionist accounts from within the app.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | SQLite via Prisma (designed for easy migration to PostgreSQL) |
| ORM | Prisma 5.16 |
| Auth | JWT sessions in httpOnly cookies (`jose`), passwords hashed with bcrypt |
| Styling | Tailwind CSS with a custom dental-clinic brand palette |
| Icons | Lucide React |
| Currency | Nigerian Naira (₦) |
| Dates | date-fns |

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ifetex147/raphadent.git
cd raphadent

# 2. Install dependencies
npm install

# 3. Create your environment file
#    Copy .env.example to .env and fill in the values
