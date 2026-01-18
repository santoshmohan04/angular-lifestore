# Frontend Technical Documentation — angular-lifestore

**Last Updated**: January 18, 2026  
**Angular Version**: 19.x  
**Architecture**: Standalone Components with @ngrx/signals State Management

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Authentication & Security](#authentication--security)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Application Structure](#application-structure)
8. [Routing & Navigation](#routing--navigation)
9. [UI/UX Components](#uiux-components)
10. [Build & Deployment](#build--deployment)
11. [Known Issues & Improvements](#known-issues--improvements)

---

## Project Overview

**angular-lifestore** is a modern e-commerce single-page application built with Angular 19, featuring product browsing, shopping cart management, user authentication, and order processing.

### Key Features
- ✅ User authentication (login/signup/change password)
- ✅ Product catalog with category browsing
- ✅ Shopping cart with add/remove/clear functionality
- ✅ Checkout and order placement
- ✅ Order history tracking
- ✅ Responsive Material Design UI
- ✅ JWT-based authentication with HTTP interceptors
- ✅ Centralized state management using @ngrx/signals
- ✅ Global loading indicators and snackbar notifications

### Recent Major Changes
- **Removed**: Bootstrap, ng-bootstrap, jQuery, FontAwesome (31% bundle size reduction)
- **Added**: Angular Material v19.2.19 for UI components
- **Migrated**: From Firebase to NestJS REST API backend
- **Modernized**: All components to Angular 19 standalone architecture
- **Upgraded**: From NgRx Store to @ngrx/signals for simpler state management
- **Removed**: Auto-logout functionality per user request
- **Fixed**: Double loading overlays, duplicate snackbar messages, image path handling

---

## Technology Stack

### Core Framework
- **Angular**: v19.x (latest)
- **TypeScript**: ES2022 target
- **RxJS**: v7.x for reactive programming

### State Management
- **@ngrx/signals**: v19.x (primary state management)
- **@ngrx/effects**: v19.x (side effects handling) - ⚠️ Legacy, being phased out
- **@ngrx/entity**: v19.x (entity management)
- **@ngrx/router-store**: v19.x (router state)
- **@ngrx/store-devtools**: v19.x (debugging)

### UI Framework
- **Angular Material**: v19.2.19 (primary UI library)
  - Components: MatButton, MatCard, MatFormField, MatInput, MatSnackBar, MatStepper, MatTabs, MatExpansion, MatProgressSpinner, MatIcon, MatList, MatDivider
- **Material Icons**: Icon set
- **Google Fonts**: Lato, Silkscreen

### HTTP & Networking
- **HttpClient**: Angular's HTTP module
- **HTTP Interceptors**: Auth token injection, global loading state

### Development Tools
- **Angular CLI**: v19.x
- **Karma**: Unit testing
- **Jasmine**: Test framework
- **angular-cli-ghpages**: GitHub Pages deployment

---

## Architecture & Design Patterns

### Standalone Components
All components use Angular 19's standalone architecture:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ...],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
```

### Signal-Based State Management
Using @ngrx/signals for reactive state:
```typescript
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withMethods((store, authService = inject(AuthService)) => ({
    login: (credentials) => { ... },
    logout: () => { ... }
  })),
  withComputed((store) => ({
    isLoggedIn: computed(() => !!store.token()),
    userDisplayName: computed(() => ...)
  }))
);
```

### Service Layer Pattern
- **AuthService**: Authentication API calls
- **SharedService**: Products, cart, orders API calls
- **SnackbarService**: Centralized user notifications
- **AlertMessageService**: Legacy alerts (being phased out)

### Interceptor Pattern
- **AuthInterceptor**: Adds `Authorization: Bearer <token>` to requests
- **LoadingInterceptor**: Manages global loading state

### Guard Pattern
- **AuthGuard**: Protects routes requiring authentication

---

## Authentication & Security

### Authentication Flow
```
1. User submits login/signup form
   ↓
2. AuthService calls POST /auth/login or /auth/register
   ↓
3. Backend returns { access_token, user: { id, email, firstName, lastName } }
   ↓
4. AuthStore updates state and stores token in localStorage
   ↓
5. AuthInterceptor adds token to all subsequent requests
   ↓
6. On 401 error: Logout and redirect to /auth
```

### Token Management
- **Storage**: `localStorage.authdata` contains full auth response
- **Format**: JWT token from NestJS backend
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: Handled by backend (typically 1 hour)
- **Auto-logout**: Removed per user request

### Protected Routes
All routes except `/`, `/auth`, `/signup`, `/contact` require authentication via `AuthGuard`.

### AuthService (src/app/services/auth.service.ts)
```typescript
// API Methods
login(credentials: { email, password }): Observable<AuthResponseData>
signup(userData: { email, password, firstName, lastName }): Observable<AuthResponseData>
chngpswd(payload: { password }): Observable<any>
logout(): void

// Response Transformation
// Backend: { access_token, user: { id, email, firstName, lastName } }
// Stored as: { idToken: access_token, email, localId, expiresIn, displayName }
```

---

## State Management

### Store Architecture
Three primary signal stores provided at root:

#### 1. AuthStore (src/app/store/auth.store.ts)
```typescript
State: {
  token: string | null,
  user: { id, email, firstName, lastName } | null,
  isLoading: boolean,
  error: string | null
}

Computed Signals:
- isLoggedIn(): boolean
- userEmail(): string
- userDisplayName(): string
- userId(): string

Methods:
- login(credentials)
- signup(userData)
- changePassword(payload)
- logout()
```

#### 2. CartStore (src/app/store/cart.store.ts)
```typescript
State: {
  items: CartItem[],
  loading: boolean,
  error: string | null
}

Computed Signals:
- itemCount(): number
- totalPrice(): number

Methods:
- loadCart()
- addItem(product, quantity) // Shows success snackbar
- updateQuantity(itemId, quantity)
- removeItem(itemId)
- clearCart()
```

#### 3. LoadingStore (src/app/store/loading.store.ts)
```typescript
State: {
  isLoading: boolean,
  requestCount: number
}

Methods:
- show()
- hide()
- reset()
```

### Migration Notes
- **Legacy NgRx Store**: Still present in `src/app/store/` (app.reducer.ts, common.actions.ts, common.effects.ts, common.reducers.ts, common.selectors.ts)
- **Status**: Legacy code being gradually phased out
- **Current Usage**: Some effects still handle API calls, will be migrated to signal stores

---

## API Integration

### Backend Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com' // Update with actual URL
};
```

### API Endpoints

#### Authentication (Public)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{ email, password, firstName, lastName }` | `{ access_token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ access_token, user }` |
| POST | `/auth/change-password` | `{ password }` | `{ message }` |

#### Products (Public)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/products` | - | `{ cameras: [], smartphones: [], watches: [], shirts: [], products: [] }` |

#### Cart (Protected)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/cart` | - | `[{ id, productId, quantity, userId }]` |
| POST | `/cart` | `{ productId, quantity }` | `{ message, cartItemId }` |
| DELETE | `/cart/:id` | - | `{ message }` |
| DELETE | `/cart` | - | `{ message }` |

#### Orders (Protected)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/orders` | `{ items: [], total }` | `{ message, orderId }` |
| GET | `/orders` | - | `[{ id, items, total, date, status }]` |

### Error Handling
```typescript
// NestJS Error Format
{
  statusCode: 400 | 401 | 404 | 409 | 500,
  message: string | string[],
  error: "Bad Request" | "Unauthorized" | ...
}

// Frontend Handling
- AuthInterceptor catches 401 → logout and redirect
- SnackbarService displays error messages
- Loading overlay hides on error
```

### Request Interceptor Flow
```
HTTP Request
  ↓
AuthInterceptor (adds Bearer token)
  ↓
LoadingInterceptor (shows loading overlay)
  ↓
Backend API
  ↓
LoadingInterceptor (hides loading overlay)
  ↓
Response/Error
```

---

## Application Structure

```
src/app/
├── app.component.ts              # Root component
├── app.config.ts                 # App configuration (standalone bootstrap)
├── app.module.ts                 # Legacy module (being phased out)
├── app-routing.module.ts         # Routes configuration
│
├── components/                   # Feature components
│   ├── header/                   # Navigation bar
│   ├── footer/                   # Footer
│   ├── mainpage/                 # Landing page
│   ├── products/                 # Product listing
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Checkout flow (stepper)
│   ├── login/                    # Login/signup forms
│   ├── settings/                 # User settings (password, orders)
│   ├── contact/                  # Contact form
│   ├── alerts/                   # Legacy alert system
│   └── loading-spinner/          # Legacy spinner (removed)
│
├── services/                     # Business logic
│   ├── auth.service.ts           # Authentication API
│   ├── auth-interceptor.service.ts # Token injection
│   ├── auth.guard.ts             # Route protection
│   ├── shared.services.ts        # Products/Cart/Orders API
│   └── snackbar.service.ts       # Notifications
│
├── store/                        # State management
│   ├── auth.store.ts             # Auth signal store
│   ├── cart.store.ts             # Cart signal store
│   ├── loading.store.ts          # Loading signal store
│   ├── app.reducer.ts            # Legacy reducer
│   ├── common.actions.ts         # Legacy actions
│   ├── common.effects.ts         # Legacy effects
│   ├── common.reducers.ts        # Legacy reducers
│   └── common.selectors.ts       # Legacy selectors
│
├── pipes/                        # Custom pipes
│   └── image-path.pipe.ts        # Image URL transformation
│
├── data/                         # Static data
│   └── product.data.ts           # Product categories
│
├── environments/                 # Environment configs
│   ├── environment.ts            # Development
│   └── environment.prod.ts       # Production
│
└── assets/                       # Static assets
    ├── Images/                   # Product images
    └── img/                      # Category images
```

---

## Routing & Navigation

### Route Configuration (src/app/app-routing.module.ts)
```typescript
const routes: Routes = [
  { path: '', component: MainpageComponent },                    // Public
  { path: 'auth', component: LoginComponent },                   // Public
  { path: 'signup', component: LoginComponent },                 // Public
  { path: 'contact', component: ContactComponent },              // Public
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }                                 // Fallback
];
```

### Navigation Flow
```
Landing (/) → Login (/auth) → Products (/products) → Cart (/cart) → Checkout (/checkout) → Settings (/settings)
                  ↓
              Signup (/signup)
```

---

## UI/UX Components

### Header Component
- **Features**: Logo, navigation links, user display, logout button
- **State**: Subscribes to AuthStore.isLoggedIn() and AuthStore.userDisplayName()
- **Actions**: Logout via AuthStore.logout()

### Products Component
- **Features**: Product grid with category tabs, add to cart
- **State**: Loads products via SharedService.getProductList()
- **Actions**: CartStore.addItem() with snackbar notification
- **Image Handling**: Uses ImagePathPipe to transform backend paths

### Cart Component
- **Features**: Cart item list, quantity controls, remove items, totals
- **State**: CartStore.items(), CartStore.totalPrice()
- **Actions**: removeItem(), clearCart(), navigate to checkout

### Checkout Component
- **Features**: 3-step stepper (Cart Review → Shipping Address → Order Confirmation)
- **Forms**: Reactive Forms with validation
- **State**: CartStore.items(), AuthStore.userEmail()
- **Actions**: SharedService.conformOrder() → success page with order number
- **Image Handling**: Uses ImagePathPipe

### Settings Component
- **Features**: Tabbed interface (Change Password | Orders)
- **Password Tab**: Form to change password, dispatches AuthStore.changePassword()
- **Orders Tab**: Expansion panels showing order history with items
- **State**: AuthStore.user(), SharedService.getUserOrders()
- **Image Handling**: Uses ImagePathPipe
- **Fix Applied**: Removed local AuthStore provider to use root instance

### Snackbar Notifications
```typescript
// Service: SnackbarService
showSuccess(message: string)  // Green background
showError(message: string)    // Red background
showWarning(message: string)  // Orange background
showInfo(message: string)     // Blue background

// Duration: 3 seconds
// Position: Bottom center
```

### Loading States
- **Global Loading**: LoadingStore managed by LoadingInterceptor
- **Component Loading**: Local signals in components (e.g., `isLoading = signal(false)`)
- **UI**: `<mat-spinner>` with "Loading..." text overlay

### Image Path Transformation
```typescript
// ImagePathPipe handles backend image path variations
// Backend may return: "img/18.jpg", "/img/18.jpg", "assets/img/18.jpg"
// Pipe transforms to: "assets/img/18.jpg"

// Usage in templates:
<img [src]="item.image | imagePath" [alt]="item.name" />
```

---

## Build & Deployment

### Development Server
```bash
npm start
# or
ng serve
# Runs on http://localhost:4200
```

### Production Build
```bash
npm run build
# or
ng build --configuration production
# Output: docs/ directory (configured in angular.json)
```

### Build Configuration (angular.json)
- **Output Path**: `docs/` (for GitHub Pages compatibility)
- **Optimization**: Enabled in production
- **Budget Warnings**: 
  - Initial bundle: 500kb warning, 1mb error
  - After Bootstrap removal: ~31% smaller bundle

### Global Styles
```scss
// src/styles.css imports:
- Google Fonts (Lato, Silkscreen)

// angular.json styles array:
- src/styles.css
```

### Global Scripts
- **Removed**: jQuery, Popper.js, Bootstrap JS (legacy dependencies)

### Deployment Options
1. **GitHub Pages**: Use `angular-cli-ghpages` (configured)
2. **Firebase Hosting**: Previously used, now disabled
3. **Any Static Host**: Deploy `docs/` folder

---

## Known Issues & Improvements

### Fixed Issues ✅
- ✅ Double loading overlays (removed custom spinner)
- ✅ Double snackbar messages (centralized to CartStore)
- ✅ Checkout navigation not working (removed local CartStore provider)
- ✅ Images returning 404 (added ImagePathPipe)
- ✅ Settings showing "[Signal: null]" (removed local AuthStore provider)
- ✅ Auto-logout removed per user request
- ✅ Success icon not centered (added flexbox CSS)

### Recommended Improvements 🔧

#### High Priority
1. **Separate Name Fields in Signup**
   - Currently: Email split into firstName/lastName
   - Improvement: Add dedicated firstName and lastName form fields

2. **Token Refresh Logic**
   - Currently: Token expires after 1 hour, user must re-login
   - Improvement: Implement refresh token before expiry

3. **Cart Quantity Update Endpoint**
   - Currently: Must remove and re-add to change quantity
   - Improvement: Add PATCH /cart/:id endpoint for quantity updates

#### Medium Priority
4. **Product Details Page**
   - Currently: No detailed product view
   - Improvement: Add route `/products/:id` with expanded info (description, rating, stock)

5. **Order Status Tracking**
   - Currently: Orders only show date and items
   - Improvement: Add status field (pending, shipped, delivered)

6. **User Profile Management**
   - Currently: Can only change password
   - Improvement: Add profile page to update firstName, lastName, email

7. **Search & Filters**
   - Currently: No search or filter functionality
   - Improvement: Add search bar and price/category filters

#### Low Priority
8. **Pagination**
   - Currently: All products loaded at once
   - Improvement: Implement pagination or infinite scroll

9. **Wishlist Feature**
   - Currently: No wishlist
   - Improvement: Add wishlist/favorites functionality

10. **Reviews & Ratings**
    - Currently: No product reviews
    - Improvement: Add review system with star ratings

### Technical Debt 🔨
1. **Legacy NgRx Code**: Gradually migrate all effects/actions to signal stores
2. **AlertMessageService**: Replace remaining usages with SnackbarService
3. **Environment Configuration**: Update production API URL before deployment
4. **Testing**: Increase test coverage (currently minimal)

---

## Backend Integration Checklist

### For Backend Team

#### Required Endpoints (All Implemented)
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/change-password (protected)
- [x] GET /products
- [x] GET /cart (protected)
- [x] POST /cart (protected)
- [x] DELETE /cart/:id (protected)
- [x] DELETE /cart (protected)
- [x] POST /orders (protected)
- [x] GET /orders (protected)

#### CORS Configuration Required
```typescript
// NestJS main.ts
app.enableCors({
  origin: ['http://localhost:4200', 'https://your-production-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### Data Models Expected

**User**
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  createdAt: Date;
}
```

**Product**
```typescript
{
  id: string;
  name: string;
  image: string;           // Backend path (e.g., "img/18.jpg")
  price: string;
  title: string;
  category: 'cameras' | 'smartphones' | 'watches' | 'shirts' | 'products';
}
```

**CartItem**
```typescript
{
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}
```

**Order**
```typescript
{
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  date: Date;
  status: string;
}
```

**OrderItem**
```typescript
{
  productId: string;
  quantity: number;
  price: string;
  name: string;
  image: string;
}
```

#### Authentication Notes
- JWT token expiry should match frontend expectations (~1 hour)
- Token payload should include `userId`, `email`
- On password change, return success message only (token remains valid)
- On order creation, backend should auto-clear user's cart

---

## Contact Information

### Frontend Repository
- **Location**: `d:\Angular Projects\angular-lifestore`
- **Build Output**: `docs/` directory

### Environment Variables to Update
- `src/environments/environment.prod.ts` → `apiUrl` (production backend URL)

### Backend API Expected
- **Development**: `http://localhost:3000`
- **Production**: TBD (update in environment.prod.ts)

---

## Migration History

### January 17, 2026 - Firebase to NestJS Migration
- Removed all Firebase dependencies
- Integrated NestJS REST APIs
- Updated authentication to JWT Bearer tokens
- Transformed API responses for backward compatibility

### January 18, 2026 - Modernization & Material Design
- Removed Bootstrap, ng-bootstrap, jQuery, FontAwesome
- Integrated Angular Material v19.2.19
- Migrated to standalone components
- Replaced NgRx Store with @ngrx/signals
- Removed auto-logout functionality
- Fixed multiple loading/snackbar issues
- Added ImagePathPipe for asset handling
- Fixed settings component provider issues
- Centered checkout success icon

---

**Document Version**: 2.0  
**Generated**: January 18, 2026  
**For**: Business stakeholders, backend team, future developers
