# API Integration Quick Reference

## Angular Service → NestJS API Mapping

### Authentication APIs

```typescript
// Login
authService.login({ email, password })
→ POST http://localhost:3000/auth/login
  Body: { email: string, password: string }
  Response: { access_token: string, user: { id, email, firstName, lastName } }

// Signup
authService.signup({ email, password, firstName, lastName })
→ POST http://localhost:3000/auth/register
  Body: { email: string, password: string, firstName: string, lastName: string }
  Response: { access_token: string, user: { id, email, firstName, lastName } }

// Change Password
authService.chngpswd({ password })
→ POST http://localhost:3000/auth/change-password
  Headers: Authorization: Bearer <token>
  Body: { password: string }
  Response: { message: string }
```

---

### Product APIs

```typescript
// Get All Products
sharedService.getProductList()
→ GET http://localhost:3000/products
  Response: {
    cameras: Prodinfo[],
    products: Prodinfo[],
    shirts: Prodinfo[],
    smartphones: Prodinfo[],
    watches: Prodinfo[]
  }
```

---

### Cart APIs (All Protected)

```typescript
// Get Cart Items
sharedService.getCartItems()
→ GET http://localhost:3000/cart
  Headers: Authorization: Bearer <token>
  Response: [{ id, productId, quantity, userId }]

// Add to Cart
sharedService.addToCart({ productId, quantity })
→ POST http://localhost:3000/cart
  Headers: Authorization: Bearer <token>
  Body: { productId: string, quantity: number }
  Response: { message: string, cartItemId: string }

// Remove Cart Item
sharedService.removeCartItems(cartid)
→ DELETE http://localhost:3000/cart/:id
  Headers: Authorization: Bearer <token>
  Response: { message: string }

// Clear Cart
sharedService.clearCart()
→ DELETE http://localhost:3000/cart
  Headers: Authorization: Bearer <token>
  Response: { message: string }
```

---

### Order APIs (All Protected)

```typescript
// Create Order
sharedService.conformOrder({ items, total })
→ POST http://localhost:3000/orders
  Headers: Authorization: Bearer <token>
  Body: { items: OrderItem[], total: number }
  Response: { message: string, orderId: string }
  Note: Automatically clears cart after order

// Get User Orders
sharedService.getUserOrders()
→ GET http://localhost:3000/orders
  Headers: Authorization: Bearer <token>
  Response: [{ id, items, total, date, status }]
```

---

## Request/Response Examples

### 1. Login Request
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Get Products Request
```json
GET /products

Response 200:
{
  "cameras": [
    { "id": "1", "name": "Canon EOS", "image": "...", "price": "599", "title": "..." }
  ],
  "smartphones": [
    { "id": "2", "name": "iPhone 15", "image": "...", "price": "999", "title": "..." }
  ],
  "watches": [...],
  "shirts": [...],
  "products": [...]
}
```

### 3. Add to Cart Request
```json
POST /cart
Headers: Authorization: Bearer <token>
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}

Response 201:
{
  "message": "Item added to cart",
  "cartItemId": "507f1f77bcf86cd799439012"
}
```

### 4. Create Order Request
```json
POST /orders
Headers: Authorization: Bearer <token>
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": "599",
      "name": "Canon EOS",
      "image": "..."
    }
  ],
  "total": 1198
}

Response 201:
{
  "message": "Order placed successfully",
  "orderId": "507f1f77bcf86cd799439013"
}
```

---

## Error Handling

### Common Error Responses

```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

// 409 Conflict (Email exists)
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

---

## Authentication Flow

```
1. User logs in/signs up
   ↓
2. Backend returns access_token
   ↓
3. Frontend stores token in localStorage as "authdata"
   ↓
4. AuthInterceptor adds "Authorization: Bearer <token>" to all requests
   ↓
5. Backend validates JWT token
   ↓
6. On 401 error: Logout and redirect to login
```

---

## Testing with Postman/Insomnia

### Setup
1. Base URL: `http://localhost:3000`
2. For protected endpoints, add header:
   ```
   Authorization: Bearer <your_access_token>
   ```

### Test Sequence
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Save access_token
3. **Get Products**: `GET /products`
4. **Add to Cart**: `POST /cart` (with token)
5. **Get Cart**: `GET /cart` (with token)
6. **Create Order**: `POST /orders` (with token)
7. **Get Orders**: `GET /orders` (with token)

---

## Environment Variables

### Angular (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### NestJS (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lifestore
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
```

---

## CORS Configuration (NestJS)

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:4200', 'https://your-production-domain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(3000);
}
bootstrap();
```

---

## Troubleshooting

### Issue: 401 Unauthorized on all requests
**Solution**: Check if token is being sent in Authorization header

### Issue: CORS errors
**Solution**: Enable CORS in NestJS backend for Angular origin

### Issue: Products not loading
**Solution**: Ensure products are seeded in database and GET /products returns correct format

### Issue: Cart/Orders return empty
**Solution**: Check if userId is correctly extracted from JWT token in backend

### Issue: Login/Signup fails
**Solution**: Check request payload format matches NestJS DTOs

---

## Data Models

### User
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

### Product
```typescript
{
  id: string;
  name: string;
  image: string;
  price: string;
  title: string;
  category: 'cameras' | 'smartphones' | 'watches' | 'shirts' | 'products';
}
```

### CartItem
```typescript
{
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}
```

### Order
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

### OrderItem
```typescript
{
  productId: string;
  quantity: number;
  price: string;
  name: string;
  image: string;
}
```
