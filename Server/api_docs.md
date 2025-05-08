E-Mechanic
Overview
This documentation outlines the endpoints available in the Motor Repair Service API, including user authentication, mechanic listings, orders, payments, and AI assistance features.

Base URL
Authentication
Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```
Endpoints
Public Routes
Get All Mechanics
```
GET /
```
Returns a list of all available mechanics.

Response (200):
```js
{
  "mechanics": [
    {
      "id": 1,
      "name": "John Doe",
      "specialization": "Engine Repair",
      "rating": 4.5,
      "location": "Jakarta Selatan"
    }
  ]
}
```
Get All Posts

```
GET /pubposts
```

Returns all public posts.

Response (200):
```js
{
  "posts": [
    {
      "id": 1,
      "title": "Engine Maintenance Tips",
      "content": "...",
      "mechanicId": 1,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```
Authentication
Register

```
POST /register
```

Creates a new user account.

Request Body:
```js
{
  "email": "user@example.com",
  "password": "securepassword",
  "phoneNumber": "081234567890",
  "address": "Jalan Raya 123, Jakarta"
}
```

Response (201):
```js
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "phoneNumber": "081234567890",
  "address": "Jalan Raya 123, Jakarta"
}
```

Login
```
POST /login
```

Authenticates a user.

Request Body:
```js
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response (200):
```js
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Google Login
```
POST /googleLogin
```

Authenticates a user using Google OAuth.

Request Body:
```js
{
  "googleToken": "google_id_token"
}
```

Response (200):
```js
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Protected Routes
Get Mechanics (Authenticated)
```
GET /home
```

Returns all mechanics for authenticated users.

Authentication: Required

Response (200): Same as public GET /

Get Service Packages
```
GET /packages
```

Returns available service packages.

Authentication: Required

Response (200):
```js
{
  "packages": [
    {
      "id": 1,
      "name": "Basic Service",
      "description": "Oil change and basic inspection",
      "price": 150000
    }
  ]
}
```

Get Posts (Authenticated)
```
GET /postsUser
```
Returns all posts for authenticated users.

Authentication: Required

Response (200): Same as public GET /pubposts

Get Mechanic By ID
```
GET /mechanics/:id
```

Returns details for a specific mechanic.

Authentication: Required

Parameters:

id - Mechanic ID
Response (200):
```js
{
  "id": 1,
  "name": "John Doe",
  "specialization": "Engine Repair",
  "experience": "5 years",
  "rating": 4.5,
  "availability": true,
  "location": "Jakarta Selatan",
  "bio": "Experienced mechanic specializing in engine repairs"
}
```

Order Management
Create Order
```
POST /orders
```

Creates a new repair order.

Authentication: Required

Request Body:
```js
{
  "mechanicId": 1,
  "packageId": 2,
  "description": "My motorcycle won't start",
  "scheduledDate": "2023-12-25T10:00:00Z",
  "location": "Jalan Raya 123, Jakarta"
}
```

Response (201):
```js
{
  "id": 1,
  "userId": 5,
  "mechanicId": 1,
  "packageId": 2,
  "description": "My motorcycle won't start",
  "status": "pending",
  "scheduledDate": "2023-12-25T10:00:00Z",
  "location": "Jalan Raya 123, Jakarta",
  "createdAt": "2023-12-20T10:00:00Z"
}
```

Get All Orders
```
GET /orders
```
Returns all orders for the authenticated user.

Authentication: Required

Response (200):
```js
{
  "orders": [
    {
      "id": 1,
      "userId": 5,
      "mechanicId": 1,
      "packageId": 2,
      "description": "My motorcycle won't start",
      "status": "pending",
      "scheduledDate": "2023-12-25T10:00:00Z"
    }
  ]
}
```

Update Order
```
PUT /orders/:id
```
Updates an existing order.

Authentication: Required

Parameters:

id - Order ID
Request Body:
```js
{
  "description": "Updated description",
  "scheduledDate": "2023-12-26T10:00:00Z"
}
```
Response (200):
```js
{
  "message": "Order updated successfully"
}
```

Delete Order
```
DELETE /orders/:id
```
Deletes an order.

Authentication: Required

Parameters:

id - Order ID
Response (200):
```js
{
  "message": "Order deleted successfully"
}
```

Complete Order
```
POST /orders/complete/:id
```
Marks an order as completed.

Authentication: Required

Parameters:

id - Order ID
Response (200):
```js
{
  "message": "Order completed successfully"
}
```

Payment Processing
Initiate Payment
```
POST /payment/initiate
```
Initiates payment for an order.

Authentication: Required

Request Body:
```js
{
  "orderId": 1,
  "amount": 150000,
  "paymentMethod": "credit_card"
}
```
Response (200):
```js
{
  "token": "midtrans-payment-token",
  "redirect_url": "https://midtrans-payment-page.com/token"
}
```

Payment Notification Webhook
```
POST /payment/notification
```
Webhook for payment provider notifications.

Request Body: Payment provider specific

Response (200):
```js
{
  "status": "OK"
}
```

Get Payment Status
```
GET /orders/:id/payment-status
```
Gets the payment status for an order.

Authentication: Required

Parameters:

id - Order ID
Response (200):
```js
{
  "status": "paid",
  "paymentDetails": {
    "method": "credit_card",
    "amount": 150000,
    "paidAt": "2023-12-25T12:00:00Z"
  }
}
```

Mark Payment as Done
```
POST /orders/donepayment/:id
```
Manually marks a payment as completed.

Authentication: Required

Parameters:

id - Order ID
Response (200):
```js
{
  "message": "Payment marked as done"
}
```

AI Assistant
Get Gemini AI Response (Simple)
```
GET /gemini
```
Gets AI-generated text from a prompt.

Query Parameters:

prompt - Text prompt for the AI
Response (200):
```js
{
  "gemini": "AI-generated response text based on your prompt"
}
```

Get Gemini AI Response (Enhanced)
```
GET /api/gemini
```
Enhanced endpoint with better error handling.

Query Parameters:

prompt - Text prompt for the AI
Response (200):
```js
{
  "success": true,
  "data": "AI-generated response text based on your prompt"
}
```

Error Response (400):
```js
{
  "success": false,
  "message": "Prompt is required"
}
```

Error Handling
The API uses standard HTTP status codes:

200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
500 - Server Error
Error responses follow this format:
```js
{
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

