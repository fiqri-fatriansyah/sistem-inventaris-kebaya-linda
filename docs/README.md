# Sistem Inventarisasi Kebaya Linda

## Overview
This system is designed to manage the inventory and rentals of "Kebaya Linda".
It is built using the MEVN stack (MongoDB, Express.js, Vue 3 / Nuxt 4, Node.js) with TypeScript.

## Architecture
- **Backend:** Express.js + TypeScript, using MongoDB. Language used in schema and endpoints: English.
- **Frontend:** Nuxt 4 + Vue 3 + TypeScript. Language used in UI: Indonesian.

## Documentation
- Refer to this directory (`docs/`) for up-to-date documentation on database schemas, API endpoints, and frontend architecture as they are built.

### Database Schemas (MongoDB / Mongoose)
- **Kebaya**: `name` (String), `type` (String), `price` (Number), `totalStock` (Number), `availableStock` (Number).
- **Customer**: `name` (String), `contactInfo` (String).
- **RentalTransaction**: `customerId` (ObjectId, ref: Customer), `kebayaId` (ObjectId, ref: Kebaya), `rentalStartTime` (Date), `rentalEndTime` (Date, optional), `amountToPay` (Number), `status` (String: 'Active' | 'Completed').

### API Endpoints
- **Kebaya**: 
  - `GET /api/kebayas`: List all kebayas.
  - `POST /api/kebayas`: Create a new kebaya.
  - `PUT /api/kebayas/:id`: Update a kebaya.
- **Customer**: 
  - `GET /api/customers`: List all customers.
  - `POST /api/customers`: Register a new customer.
- **Rental**: 
  - `GET /api/rentals/active`: List all active rentals.
  - `POST /api/rentals`: Rent a kebaya (automatically decreases available stock).
  - `POST /api/rentals/:id/return`: Return a kebaya (automatically increases available stock).

### Frontend Architecture (Nuxt 4 / Vue 3)
- **CSS**: Vanilla CSS in `assets/css/main.css` implementing a dark-mode glassmorphism aesthetic.
- **Layouts**: `layouts/default.vue` provides the main Sidebar and routing wrapper.
- **Pages**:
  - `/` (Dasbor)
  - `/inventaris` (Inventaris)
  - `/penyewaan` (Penyewaan)
  - `/pelanggan` (Pelanggan)
- **Composables**: `useApi.ts` serves as the global fetch wrapper to call the Express backend.
