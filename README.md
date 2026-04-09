# Car Parts Marketplace — Frontend

## Overview

Modern Angular frontend for a Tunisian car spare parts marketplace. Connects to a Django REST API backend with JWT authentication, role-based access (Client, Supplier, Admin), vehicle hierarchy filtering, cart system, and order management.

**Goal:** A visually impressive, production-ready marketplace — not a basic CRUD admin panel.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Angular 17+ (standalone components) | Latest features, signals, improved DX |
| **Styling** | Tailwind CSS 3.4 | Utility-first, rapid UI development, responsive |
| **Icons** | Lucide Angular | Clean, consistent, lightweight SVG icons |
| **Animations** | Angular Animations + CSS transitions | Micro-interactions, page transitions |
| **HTTP** | Angular HttpClient + Interceptors | JWT injection, error handling, retry logic |
| **State** | Angular Signals + Services | Lightweight, no heavy state library needed |
| **Forms** | Reactive Forms | Complex validation, dynamic forms |
| **Routing** | Angular Router + Lazy Loading | Feature-based code splitting |
| **Notifications** | Custom toast system | Consistent feedback UX |

---

## Design System

### Color Palette — "Midnight Automotive"

A dark-mode-first palette with electric blue accents, inspired by premium automotive brands.

```
Primary (Dark):     #0F172A  (Slate 900 — main backgrounds)
Surface:            #1E293B  (Slate 800 — cards, panels)
Surface Elevated:   #334155  (Slate 700 — hover states, borders)
Text Primary:       #F8FAFC  (Slate 50 — headings, primary text)
Text Secondary:     #94A3B8  (Slate 400 — descriptions, muted)
Accent:             #3B82F6  (Blue 500 — CTAs, links, active states)
Accent Hover:       #2563EB  (Blue 600 — hover)
Success:            #22C55E  (Green 500 — in stock, success)
Warning:            #F59E0B  (Amber 500 — low stock, warnings)
Danger:             #EF4444  (Red 500 — errors, out of stock)
```

### Typography

```
Font Family:        Inter (Google Fonts) — clean, modern, excellent readability
Headings:           font-bold, tracking-tight
Body:               font-normal, leading-relaxed
Mono (prices):      JetBrains Mono — prices and references stand out
```

### Component Styles

- **Cards:** Rounded-xl, subtle border, hover shadow + slight scale
- **Buttons:** Rounded-lg, bold text, smooth color transitions
- **Inputs:** Rounded-lg, ring focus states, floating labels
- **Badges:** Rounded-full, small, uppercase for status tags
- **Skeleton loaders:** Animated pulse placeholders during loading

### Spacing & Layout

- 8px grid system (Tailwind default)
- Max content width: 1280px (7xl)
- Consistent padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Card gaps: gap-4 (mobile), gap-6 (desktop)

---

## Architecture

### Folder Structure

```
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    # JWT token injection
│   │   │   └── error.interceptor.ts   # Global error handling + toast
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Require authentication
│   │   │   ├── client.guard.ts        # Client-only routes
│   │   │   └── supplier.guard.ts      # Supplier-only routes
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Login, register, token management
│   │   │   ├── api.service.ts         # Base HTTP methods
│   │   │   ├── vehicle.service.ts     # Brand/Model/Year/Engine API
│   │   │   ├── parts.service.ts       # Parts CRUD + filtering
│   │   │   ├── cart.service.ts        # Cart operations
│   │   │   ├── order.service.ts       # Order operations
│   │   │   ├── category.service.ts    # Category API
│   │   │   └── toast.service.ts       # Notification system
│   │   └── models/
│   │       ├── user.model.ts          # User, Client, Supplier interfaces
│   │       ├── vehicle.model.ts       # Brand, Model, Year, Engine
│   │       ├── part.model.ts          # Part, PartImage
│   │       ├── cart.model.ts          # Cart, CartItem
│   │       ├── order.model.ts         # Order, OrderItem
│   │       └── category.model.ts      # Category
│   │
│   ├── shared/                        # Reusable dumb components
│   │   ├── components/
│   │   │   ├── navbar/                # Top navigation bar
│   │   │   ├── footer/                # Site footer
│   │   │   ├── vehicle-selector/      # Brand → Model → Year → Engine dropdowns
│   │   │   ├── part-card/             # Part card for grid listings
│   │   │   ├── price-tag/             # Formatted price display
│   │   │   ├── badge/                 # Status badges (NEW, USED, PENDING, etc)
│   │   │   ├── search-bar/            # Debounced search input
│   │   │   ├── loading-spinner/       # Loading indicator
│   │   │   ├── skeleton/              # Skeleton loader components
│   │   │   ├── toast/                 # Toast notification
│   │   │   ├── empty-state/           # Empty data illustrations
│   │   │   ├── confirm-dialog/        # Confirmation modal
│   │   │   └── image-gallery/         # Image carousel/gallery
│   │   ├── pipes/
│   │   │   ├── currency.pipe.ts       # TND currency formatting
│   │   │   └── truncate.pipe.ts       # Text truncation
│   │   └── directives/
│   │       └── click-outside.directive.ts
│   │
│   ├── features/                      # Feature modules (lazy loaded)
│   │   ├── auth/
│   │   │   ├── login/                 # Login page
│   │   │   └── register/             # Register page (Client / Supplier)
│   │   │
│   │   ├── home/                      # Landing / homepage
│   │   │   └── home.component.ts      # Hero, featured parts, vehicle selector
│   │   │
│   │   ├── parts/
│   │   │   ├── parts-list/            # Grid listing with filters sidebar
│   │   │   └── part-detail/           # Full part page with gallery
│   │   │
│   │   ├── cart/
│   │   │   └── cart.component.ts      # Cart page with items + summary
│   │   │
│   │   ├── orders/
│   │   │   ├── checkout/              # Checkout / order confirmation
│   │   │   ├── order-list/            # Order history
│   │   │   └── order-detail/          # Single order details
│   │   │
│   │   └── supplier/
│   │       ├── dashboard/             # Supplier overview
│   │       ├── parts-manage/          # CRUD parts table
│   │       ├── part-form/             # Create/edit part form
│   │       └── orders-received/       # Incoming orders
│   │
│   ├── layouts/
│   │   ├── main-layout/               # Navbar + content + footer (client)
│   │   └── supplier-layout/           # Sidebar + content (supplier dashboard)
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles.css                          # Tailwind imports + global styles
```

### Architecture Patterns

| Pattern | Implementation |
|---------|---------------|
| **Smart/Dumb components** | Feature components = smart (fetch data), Shared = dumb (inputs/outputs) |
| **Service layer** | All API calls go through dedicated services |
| **Interceptors** | Auto-attach JWT token, handle 401 refresh, global error toasts |
| **Route guards** | `authGuard` for login required, `clientGuard` / `supplierGuard` for role |
| **Lazy loading** | Each feature is a lazy-loaded route module |
| **Signals** | Use Angular signals for reactive state (cart count, user session) |
| **Environment config** | API URL from environment files |

---

## API Integration

### Base URL
```
Development:  http://localhost:8000/api/
Production:   TBD
```

### Endpoints Map

| Feature | Endpoints |
|---------|----------|
| **Auth** | `POST /auth/login/`, `POST /auth/register/`, `POST /auth/logout/`, `GET /auth/profile/`, `POST /auth/token/refresh/` |
| **Vehicle** | `GET /brands/`, `GET /models/?brand=ID`, `GET /model-years/?model=ID`, `GET /engines/?model_year=ID` |
| **Categories** | `GET /categories/`, `GET /categories/<id>/`, `POST /categories/` |
| **Parts** | `GET /parts/`, `POST /parts/`, `GET /parts/<id>/`, `PUT /parts/<id>/`, `DELETE /parts/<id>/` |
| **Images** | `GET /parts/<id>/images/`, `POST /parts/<id>/images/`, `DELETE /images/<id>/` |
| **Cart** | `GET /cart/`, `POST /cart/add/`, `PUT /cart/items/<id>/`, `DELETE /cart/items/<id>/` |
| **Orders** | `GET /orders/`, `POST /orders/`, `GET /orders/<id>/` |

### Auth Flow
1. Login → receive `access` + `refresh` tokens
2. Store tokens in `localStorage`
3. Interceptor attaches `Authorization: Bearer <access>` to every request
4. On 401 → attempt refresh with `refresh` token
5. If refresh fails → redirect to login

---

## Key Pages & UX

### 1. Homepage
- **Hero section:** Large background with vehicle selector overlay
- "Find parts for your vehicle" — Brand → Model → Year → Engine cascade
- Featured/recent parts grid below
- Category quick-links

### 2. Parts Listing (`/parts`)
- Left sidebar: filters (category tree, price range, condition, vehicle)
- Main grid: part cards (image, name, price, condition badge, supplier)
- Top bar: search + sort + result count
- Infinite scroll or pagination
- Skeleton loaders while fetching

### 3. Part Detail (`/parts/:id`)
- Image gallery with thumbnails
- Part info: name, reference, price, condition, stock status
- Vehicle compatibility display
- Supplier info card
- "Add to Cart" button with quantity selector
- Related parts section

### 4. Cart (`/cart`)
- Item list with quantity controls (+/- buttons)
- Live price calculations
- Empty state illustration when cart is empty
- "Proceed to Checkout" CTA
- Remove item with confirmation

### 5. Checkout & Orders
- Order summary review
- Confirm & place order
- Order history table with status badges (PENDING, PAID, SHIPPED, DELIVERED)
- Order detail with all items + price snapshots

### 6. Supplier Dashboard (`/supplier`)
- Overview stats (total parts, orders, revenue)
- Parts table with inline actions (edit, delete)
- Create/edit part form with image upload (drag & drop)
- Incoming orders list

### 7. Auth Pages
- Clean centered card layout
- Toggle between Client/Supplier registration
- Inline validation with clear error messages
- Password strength indicator

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, bottom nav, stacked cards |
| Tablet | 640-1024px | 2-col grid, collapsible sidebar |
| Desktop | > 1024px | Full layout, sidebar + 3-4 col grid |

---

## Performance Targets

- **Lazy loading** all feature modules
- **OnPush** change detection where possible
- **trackBy** on all `@for` loops
- **Debounce** search input (300ms)
- **Image lazy loading** with `loading="lazy"`
- **Skeleton screens** instead of blank loading states
- **Caching** vehicle hierarchy data (rarely changes)

---

## Development Workflow

```bash
# Install dependencies
npm install

# Start dev server
ng serve

# Build for production
ng build --configuration=production
```

### Environment Variables
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

---

## Implementation Order

1. **Phase 1 — Foundation**
   - Angular project setup + Tailwind + design system
   - Core services, interceptors, guards
   - Shared components (navbar, footer, toast, skeleton)
   - Auth pages (login, register)

2. **Phase 2 — Marketplace**
   - Homepage with vehicle selector
   - Parts listing with filters
   - Part detail page
   - Category browsing

3. **Phase 3 — Commerce**
   - Cart system
   - Checkout flow
   - Order history + detail

4. **Phase 4 — Supplier**
   - Supplier dashboard
   - Parts management (CRUD)
   - Image upload
   - Order tracking

---

## Backend API Reference

- **Swagger UI:** http://localhost:8000/swagger/
- **ReDoc:** http://localhost:8000/redoc/
- **Admin:** http://localhost:8000/admin/
