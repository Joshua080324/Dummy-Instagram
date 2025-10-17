# API Documentation - Dummy Instagram

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## User Endpoints

### 1. POST /users/register
Register a new user account.

- **Request Body**
```json
{
  "username": "john_doe",
  "email": "john@mail.com",
  "password": "password123"
}
```

- **Response (201 - Created)**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@mail.com"
}
```

- **Response (400 - Bad Request)**
```json
{
  "message": "Validation error message"
}
```

---

### 2. POST /users/login
Login to get access token.

- **Request Body**
```json
{
  "email": "john@mail.com",
  "password": "password123"
}
```

- **Response (200 - OK)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Response (400 - Bad Request)**
```json
{
  "message": "Email and password are required"
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid email or password"
}
```

---

### 3. POST /users/auth/google
Login or register using Google OAuth.

- **Request Body**
```json
{
  "google_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

- **Response (200 - OK)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid Google token"
}
```

---

## Post Endpoints

### 4. POST /posts
Create a new post with images.

- **Headers**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

- **Request Body (form-data)**
```
content: "Beautiful sunset at the beach!"
isPrivate: false
categoryId: 1
images: [file1.jpg, file2.jpg] (max 5 images)
```

- **Response (201 - Created)**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "content": "Beautiful sunset at the beach!",
    "isPrivate": false,
    "CategoryId": 1,
    "UserId": 1,
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  },
  "images": [
    {
      "imageUrl": "https://res.cloudinary.com/xxx/image1.jpg",
      "PostId": 1
    },
    {
      "imageUrl": "https://res.cloudinary.com/xxx/image2.jpg",
      "PostId": 1
    }
  ]
}
```

- **Response (400 - Bad Request)**
```json
{
  "message": "At least one image is required to create a post."
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid or expired token"
}
```

---

### 5. GET /posts
Get all public posts.

- **Response (200 - OK)**
```json
[
  {
    "id": 1,
    "content": "Beautiful sunset at the beach!",
    "isPrivate": false,
    "CategoryId": 1,
    "UserId": 1,
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z",
    "User": {
      "id": 1,
      "username": "john_doe",
      "email": "john@mail.com"
    },
    "Images": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/xxx/image1.jpg",
        "PostId": 1
      }
    ],
    "Category": {
      "name": "Travel"
    },
    "Likes": [
      {
        "id": 1,
        "UserId": 2,
        "PostId": 1
      }
    ]
  }
]
```

---

### 6. GET /posts/me
Get current user's own posts (both public and private).

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK)**
```json
[
  {
    "id": 1,
    "content": "My private post",
    "isPrivate": true,
    "CategoryId": 2,
    "UserId": 1,
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z",
    "Images": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/xxx/image1.jpg",
        "PostId": 1
      }
    ],
    "Category": {
      "id": 2,
      "name": "Food"
    },
    "Likes": []
  }
]
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid or expired token"
}
```

---

### 7. PUT /posts/:id
Update an existing post.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Request Body**
```json
{
  "content": "Updated content here",
  "isPrivate": false,
  "categoryId": 3
}
```

- **Response (200 - OK)**
```json
{
  "message": "Post updated successfully",
  "post": {
    "id": 1,
    "content": "Updated content here",
    "isPrivate": false,
    "CategoryId": 3,
    "UserId": 1,
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T12:00:00.000Z"
  }
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "You are not authorized to update this post"
}
```

- **Response (404 - Not Found)**
```json
{
  "message": "Post not found"
}
```

---

### 8. DELETE /posts/:id
Delete a post.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK)**
```json
{
  "message": "Post deleted successfully"
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "You are not authorized to delete this post"
}
```

- **Response (404 - Not Found)**
```json
{
  "message": "Post not found"
}
```

---

### 9. POST /posts/:id/like
Toggle like/unlike a post.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK) - When Liked**
```json
{
  "message": "Post liked"
}
```

- **Response (200 - OK) - When Unliked**
```json
{
  "message": "Post unliked"
}
```

- **Response (404 - Not Found)**
```json
{
  "message": "Post not found"
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid or expired token"
}
```

---

## Chat Endpoints

### 10. POST /chats
Create or get existing chat with another user.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Request Body**
```json
{
  "partnerId": 2
}
```

- **Response (201 - Created) - New Chat**
```json
{
  "id": 1,
  "UserId": 1,
  "partnerId": 2,
  "isAIChat": false,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

- **Response (200 - OK) - Existing Chat**
```json
{
  "id": 1,
  "UserId": 1,
  "partnerId": 2,
  "isAIChat": false,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

- **Response (400 - Bad Request)**
```json
{
  "message": "You cannot create a chat with yourself."
}
```

---

### 11. POST /chats/ai
Create or get existing AI chat.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (201 - Created) - New AI Chat**
```json
{
  "id": 2,
  "UserId": 1,
  "partnerId": null,
  "isAIChat": true,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

- **Response (200 - OK) - Existing AI Chat**
```json
{
  "id": 2,
  "UserId": 1,
  "partnerId": null,
  "isAIChat": true,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

---

### 12. GET /chats
Get all chats for current user.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK)**
```json
[
  {
    "id": 1,
    "UserId": 1,
    "partnerId": 2,
    "isAIChat": false,
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T11:00:00.000Z",
    "creator": {
      "id": 1,
      "username": "john_doe",
      "email": "john@mail.com"
    },
    "partner": {
      "id": 2,
      "username": "jane_smith",
      "email": "jane@mail.com"
    }
  },
  {
    "id": 2,
    "UserId": 1,
    "partnerId": null,
    "isAIChat": true,
    "createdAt": "2025-10-17T09:00:00.000Z",
    "updatedAt": "2025-10-17T09:30:00.000Z",
    "creator": {
      "id": 1,
      "username": "john_doe",
      "email": "john@mail.com"
    },
    "partner": null
  }
]
```

---

### 13. GET /chats/:chatId/messages
Get all messages in a specific chat.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK)**
```json
[
  {
    "id": 1,
    "ChatId": 1,
    "senderId": 1,
    "content": "Hello!",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z",
    "sender": {
      "id": 1,
      "username": "john_doe"
    }
  },
  {
    "id": 2,
    "ChatId": 1,
    "senderId": 2,
    "content": "Hi there!",
    "createdAt": "2025-10-17T10:31:00.000Z",
    "updatedAt": "2025-10-17T10:31:00.000Z",
    "sender": {
      "id": 2,
      "username": "jane_smith"
    }
  }
]
```

- **Response (403 - Forbidden)**
```json
{
  "message": "You are not authorized to access this chat"
}
```

- **Response (404 - Not Found)**
```json
{
  "message": "Chat not found"
}
```

---

### 14. POST /chats/:chatId/messages
Send a message to a chat. For AI chats, will automatically get AI response.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Request Body**
```json
{
  "content": "What's the weather like today?"
}
```

- **Response (201 - Created) - Regular Chat**
```json
{
  "id": 3,
  "ChatId": 1,
  "senderId": 1,
  "content": "What's the weather like today?",
  "createdAt": "2025-10-17T10:35:00.000Z",
  "updatedAt": "2025-10-17T10:35:00.000Z"
}
```

- **Response (201 - Created) - AI Chat (Returns AI Response)**
```json
{
  "id": 4,
  "ChatId": 2,
  "senderId": null,
  "content": "I don't have real-time weather data, but I can help you find weather information! You can check weather apps or websites like Weather.com or AccuWeather for current conditions in your area.",
  "createdAt": "2025-10-17T10:35:05.000Z",
  "updatedAt": "2025-10-17T10:35:05.000Z"
}
```

- **Response (403 - Forbidden)**
```json
{
  "message": "You are not authorized to access this chat"
}
```

- **Response (404 - Not Found)**
```json
{
  "message": "Chat not found"
}
```

---

## AI Recommendation Endpoint

### 15. GET /ai/recommendations
Get personalized post recommendations based on user's liked posts using AI.

- **Headers**
```
Authorization: Bearer <access_token>
```

- **Response (200 - OK)**
```json
{
  "message": "Rekomendasi berhasil dibuat",
  "count": 5,
  "data": [
    {
      "id": 10,
      "content": "Exploring Tokyo's street food scene",
      "isPrivate": false,
      "CategoryId": 1,
      "UserId": 5,
      "createdAt": "2025-10-17T08:00:00.000Z",
      "updatedAt": "2025-10-17T08:00:00.000Z",
      "User": {
        "id": 5,
        "username": "foodie_traveler",
        "email": "foodie@mail.com"
      },
      "Images": [
        {
          "id": 25,
          "imageUrl": "https://res.cloudinary.com/xxx/tokyo-food.jpg",
          "PostId": 10
        }
      ],
      "Category": {
        "id": 1,
        "name": "Travel"
      },
      "Likes": [
        {
          "id": 45,
          "UserId": 3,
          "PostId": 10
        }
      ]
    }
  ]
}
```

- **Response (401 - Unauthorized)**
```json
{
  "message": "Invalid or expired token"
}
```

- **Notes:**
  - Requires at least 3 liked posts to generate AI recommendations
  - AI analyzes liked post categories and content to suggest similar posts
  - Falls back to frequency-based recommendations if AI fails
  - Returns maximum of 5 recommended posts

---

## WebSocket Events (Socket.IO)

The application uses Socket.IO for real-time chat functionality.

### Connection
```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your_jwt_token"
  }
});
```

### Events

#### 1. join_chat
Join a specific chat room.

**Emit:**
```javascript
socket.emit("join_chat", { chatId: 1 });
```

#### 2. send_message
Send a message (handled via HTTP POST endpoint, but emits socket event).

**Listen:**
```javascript
socket.on("receive_message", (message) => {
  console.log("New message:", message);
  // message structure: { id, ChatId, senderId, content, createdAt }
});
```

#### 3. user_typing
Notify when user is typing.

**Emit:**
```javascript
socket.emit("user_typing", { 
  chatId: 1, 
  username: "john_doe" 
});
```

**Listen:**
```javascript
socket.on("typing", (data) => {
  console.log(`${data.username} is typing...`);
  // data structure: { username, chatId }
});
```

#### 4. disconnect
Handle disconnection.

**Listen:**
```javascript
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
```

---

## Error Responses

### Common Error Formats

**400 - Bad Request**
```json
{
  "message": "Validation error or bad request message"
}
```

**401 - Unauthorized**
```json
{
  "message": "Invalid or expired token"
}
```

**403 - Forbidden**
```json
{
  "message": "You are not authorized to access this resource"
}
```

**404 - Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 - Internal Server Error**
```json
{
  "message": "Internal server error"
}
```

---

## Data Models

### User
```javascript
{
  id: INTEGER (Primary Key),
  username: STRING,
  email: STRING (Unique),
  password: STRING (Hashed),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Post
```javascript
{
  id: INTEGER (Primary Key),
  content: TEXT,
  isPrivate: BOOLEAN,
  CategoryId: INTEGER (Foreign Key),
  UserId: INTEGER (Foreign Key),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Image
```javascript
{
  id: INTEGER (Primary Key),
  imageUrl: STRING,
  PostId: INTEGER (Foreign Key),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Like
```javascript
{
  id: INTEGER (Primary Key),
  UserId: INTEGER (Foreign Key),
  PostId: INTEGER (Foreign Key),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Category
```javascript
{
  id: INTEGER (Primary Key),
  name: STRING,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Chat
```javascript
{
  id: INTEGER (Primary Key),
  UserId: INTEGER (Foreign Key),
  partnerId: INTEGER (Foreign Key, nullable),
  isAIChat: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Message
```javascript
{
  id: INTEGER (Primary Key),
  ChatId: INTEGER (Foreign Key),
  senderId: INTEGER (Foreign Key, nullable for AI),
  content: TEXT,
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## Notes

- All endpoints except `/users/register`, `/users/login`, `/users/auth/google`, and `/posts` (GET public posts) require authentication
- Images are stored on Cloudinary
- Maximum 5 images per post
- AI chat uses Google Gemini API
- AI recommendations require at least 3 liked posts
- Socket.IO is used for real-time messaging
- All dates are in ISO 8601 format
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication

---

## Environment Variables Required

```env
PORT=3000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GEMINI_API_KEY=your_gemini_api_key
```
