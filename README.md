<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

# 🏔️ JharExplore — Discover the Soul of Jharkhand

**JharExplore** is a full-stack tourism web application designed to showcase the natural beauty, cultural heritage, and hidden gems of Jharkhand, India. It provides travelers with destination discovery, hotel bookings, AI-powered trip planning, and a community-driven review system — all wrapped in a modern, responsive interface.

---

## ✨ Features

### 🌍 Public
- **Destination Discovery** — Browse 30+ destinations across 9 categories (waterfalls, heritage, forests, wildlife, tribal, religious, adventure, lakes, hills)
- **Hotel Listings** — Search and filter hotels by district, price, star rating, and property type
- **Destination Detail Pages** — Photo galleries, embedded Google Maps, how-to-reach info, nearby places
- **Hotel Detail Pages** — Amenities, room info, external booking links, embedded maps
- **Reviews & Ratings** — Community reviews with star ratings for both destinations and hotels
- **Contact Form** — Rate-limited contact form with email delivery

### 👤 User Dashboard
- **AI Trip Planner** — Groq-powered AI generates personalized multi-day itineraries based on budget, interests, location, and group size
- **Saved Plans** — Auto-save and revisit AI-generated trip plans
- **My Reviews** — View, edit (up to 3x), and delete your own reviews
- **Profile Management** — Update name, phone, avatar, and language preferences

### 🛡️ Admin Panel
- **Dashboard** — Content health scores, quick actions, recent audit activity
- **Places CRUD** — Add, edit, publish/unpublish, and delete destinations
- **Hotels CRUD** — Full hotel management with amenity tracking
- **Review Moderation** — 5-tab queue (Pending / Flagged / Approved / Rejected / All) with rejection reasons
- **User Management** — View all users, suspend/reactivate accounts
- **Content Health** — Identify destinations and hotels with missing data
- **Audit Log** — Immutable record of all administrative actions
- **Announcements** — Create site-wide banners (info, warning, success, danger)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6, Zustand, Framer Motion |
| **Backend** | Node.js, Express 4, TypeScript, Zod validation |
| **Database** | Supabase (PostgreSQL), Row Level Security |
| **Auth** | Supabase Auth (users) + Custom JWT (admins) |
| **AI** | Groq SDK (LLaMA/Mixtral) for trip planning |
| **Other** | Axios, React Query, Sonner (toasts), Lucide Icons, React Helmet |

---

## 📁 Project Structure

```
JharExplore/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase, CORS, env, logger
│   │   ├── controllers/     # auth, admin, places, hotels, feedback, bookings
│   │   ├── middleware/       # authenticate, adminAuth, rateLimiter, validate, errorHandler
│   │   ├── routes/           # RESTful route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Server entry point
│   ├── .env                  # Environment variables (not committed)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # ErrorBoundary, LoadingSpinner, ScrollToTop, AnnouncementBanner
│   │   │   └── layout/       # Navbar, Footer
│   │   ├── pages/
│   │   │   ├── public/       # Home, Destinations, Hotels, About, Contact, Login, Register
│   │   │   ├── user/         # Dashboard, AI Planner, Saved Plans, My Reviews
│   │   │   └── admin/        # Dashboard, Places, Hotels, Reviews, Users, Health, Audit, Announcements
│   │   ├── services/         # Axios API instances
│   │   ├── store/            # Zustand stores (auth, admin)
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Router & layout configuration
│   │   └── index.css         # TailwindCSS + custom design tokens
│   ├── .env                  # Frontend env vars (not committed)
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project ([supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/JharExplore.git
cd JharExplore
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=4000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Auth
ADMIN_JWT_SECRET=your-64-char-secret
ADMIN_JWT_EXPIRES_IN=24h

# Groq AI (for trip planner)
GROQ_API_KEY=your-groq-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Start the dev server:

```bash
npm run dev
# ✅ API running at http://localhost:4000/api/v1
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the dev server:

```bash
npm run dev
# ✅ App running at http://localhost:5173
```

### 4. Seed Admin Account

```bash
curl -X POST http://localhost:4000/api/v1/admin/seed
```

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/places` | List published destinations |
| `GET` | `/places/:slug` | Get destination by slug |
| `GET` | `/hotels` | List published hotels |
| `GET` | `/hotels/:slug` | Get hotel by slug |
| `GET` | `/feedback` | Get approved reviews |
| `POST` | `/contact` | Submit contact message |
| `GET` | `/announcements/active` | Get active announcements |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/logout` | Logout |
| `POST` | `/auth/refresh` | Refresh token |
| `GET` | `/auth/me` | Get current profile |
| `PATCH` | `/auth/profile` | Update profile |

### User (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/feedback` | Submit a review |
| `GET` | `/feedback/my-reviews` | Get own reviews |
| `PUT` | `/feedback/:id` | Edit own review |
| `DELETE` | `/feedback/:id` | Delete own review |
| `POST` | `/plans/generate` | Generate AI trip plan |
| `POST` | `/plans/save` | Save a trip plan |
| `GET` | `/plans` | Get saved plans |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/login` | Admin login |
| `GET` | `/admin/dashboard/stats` | Dashboard statistics |
| `GET/POST/PUT/DELETE` | `/admin/places/*` | Places CRUD |
| `GET/POST/PUT/DELETE` | `/admin/hotels/*` | Hotels CRUD |
| `GET` | `/admin/reviews` | List all reviews |
| `PATCH` | `/admin/reviews/:id/approve` | Approve review |
| `PATCH` | `/admin/reviews/:id/flag` | Flag review |
| `PATCH` | `/admin/reviews/:id/reject` | Reject review |
| `GET` | `/admin/users` | List all users |
| `PATCH` | `/admin/users/:id/suspend` | Suspend user |
| `GET` | `/admin/audit-log` | View audit trail |
| `GET/POST/DELETE` | `/admin/announcements` | Manage announcements |

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `places` | Destinations with categories, coordinates, images, SEO metadata |
| `hotels` | Hotels with pricing, amenities, booking URLs |
| `rooms` | Room types linked to hotels |
| `users` | User profiles (linked to Supabase Auth) |
| `feedback` | Reviews/ratings for places and hotels |
| `bookings` | Hotel booking records |
| `trip_plans` | AI-generated saved trip plans |
| `admins` | Admin accounts with roles |
| `audit_logs` | Immutable admin action history |
| `announcements` | Site-wide banner messages |
| `contact_messages` | Contact form submissions |

---

## 🔐 Security

- **Authentication**: Dual system — Supabase Auth for users, custom JWT for admins
- **Authorization**: Role-based admin access (`admin`, `super_admin`)
- **Rate Limiting**: Per-endpoint limits (auth: 10/15min, AI: 10/hr, contact: 5/hr)
- **Input Validation**: Zod schemas on all mutation endpoints
- **Search Sanitization**: PostgREST filter injection prevention
- **Mass Assignment Protection**: Whitelisted fields on profile updates
- **CORS**: Origin allowlist with credentials support
- **Error Handling**: Stack traces hidden in production
- **Audit Trail**: All admin actions logged immutably

---

## 📜 License

This project is licensed under the ISC License.

---

## 👥 Team

Built with ❤️ for **Jharkhand Tourism** by the JharExplore Dev Team.

---

<p align="center">
  <strong>🌿 Explore Jharkhand. Experience Nature. Embrace Culture. 🌿</strong>
</p>
