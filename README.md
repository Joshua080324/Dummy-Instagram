# 📸 Dummy Instagram - AI-Powered Social Media Platform

![Instagram Clone](https://img.shields.io/badge/Instagram-Clone-E4405F?style=for-the-badge&logo=instagram&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)

> A modern social media platform with AI-powered recommendations and real-time messaging capabilities.

## 🌟 Features

### 🔐 Authentication & Authorization
- **Email/Password Authentication** with JWT tokens
- **Google OAuth 2.0** integration for seamless sign-in
- Protected routes with middleware authentication

### 📝 Post Management
- **Create Posts** with multiple image uploads (via Cloudinary)
- **Public/Private visibility** settings
- **Like/Unlike** posts with real-time updates
- **Delete posts** with cascade deletion of associated data
- **Category-based** organization (Travel, Food, Fashion, Technology, Lifestyle)

### 🤖 AI-Powered Features
- **Smart Recommendations**: AI analyzes your liked posts and recommends similar content using Google Gemini AI
- **AI Chat Assistant**: Interactive AI chatbot to answer questions and provide assistance
- **Intelligent Category Matching**: Machine learning-based content discovery

### 💬 Real-Time Messaging
- **Personal Chat** with Socket.IO real-time communication
- **Chat History** with message persistence
- **User Discovery** to find and connect with new users
- **Start Chat** modal for quick conversations

### 👤 User Profiles
- **Profile Page** with user's post collection
- **User Discovery** modal to browse other users
- **Like tracking** across posts

### 🎨 Modern UI/UX
- **Responsive Design** with React Bootstrap
- **Smooth Animations** and transitions
- **Dark Mode Ready** interface
- **Mobile-Friendly** layout

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn
- Cloudinary account
- Google Cloud Console project (for OAuth)
- Google AI Studio API key (for Gemini)

### 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Joshua080324/Dummy-Instagram.git
cd Dummy-Instagram
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Setup environment variables**

Create `.env` file in root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dummy_instagram

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3000
```

Create `client/.env` file:
```env
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. **Setup Database**
```bash
# Create database
npx sequelize-cli db:create

# Run migrations
npm run migrate

# Seed sample data
npm run seed
```

6. **Run the application**

Backend:
```bash
npm run dev
```

Frontend (in new terminal):
```bash
cd client
npm run dev
```

7. **Access the application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## 🔑 Sample Accounts

Use these pre-seeded accounts for testing:

| Email | Password |
|-------|----------|
| john@example.com | password123 |
| jane@example.com | password123 |
| mike@example.com | password123 |
| sarah@example.com | password123 |
| alex@example.com | password123 |

---

## 📱 Application Flow

### 1️⃣ **User Authentication Flow**

```mermaid
graph TD
    A[Landing Page] -->|New User| B[Register Page]
    A -->|Existing User| C[Login Page]
    B -->|Email/Password| D[Create Account]
    B -->|Google OAuth| E[Google Sign-In]
    C -->|Email/Password| F[Verify Credentials]
    C -->|Google OAuth| E
    D --> G[Generate JWT Token]
    E --> G
    F --> G
    G --> H[Store Token in localStorage]
    H --> I[Redirect to Home]
```

**Steps:**
1. User visits the application
2. Choose between **Register** or **Login**
3. Option to use **Email/Password** or **Google OAuth**
4. System validates credentials and generates JWT token
5. Token stored in browser's localStorage
6. User redirected to Home feed

---

### 2️⃣ **Home Feed & Content Discovery Flow**

```mermaid
graph TD
    A[Home Page] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load Posts]
    D --> E[Show All Posts Tab]
    D --> F[AI Recommended Posts Tab]
    F --> G[Analyze User's Liked Posts]
    G --> H[AI Gemini Processing]
    H --> I[Return Recommended Posts]
    E --> J[Display Posts]
    I --> J
    J --> K[User Interactions]
    K --> L[Like/Unlike Post]
    K --> M[View Profile]
    K --> N[Start Chat]
    K --> O[Delete Own Post]
```

**Steps:**
1. User lands on **Home Page**
2. System checks authentication status
3. Loads all public posts in **"All Posts"** tab
4. **"AI Recommended"** tab analyzes user's like history
5. Google Gemini AI processes liked categories
6. Returns personalized recommendations
7. User can interact: Like, Comment, Chat, Delete

---

### 3️⃣ **Create Post Flow**

```mermaid
graph TD
    A[Click Create Post Button] --> B[Open Create Post Modal]
    B --> C[Fill Post Details]
    C --> D[Select Category]
    C --> E[Upload Images]
    C --> F[Set Privacy]
    E --> G[Upload to Cloudinary]
    G --> H[Get Image URLs]
    F --> I{Privacy Setting?}
    I -->|Public| J[Visible to All]
    I -->|Private| K[Visible to Owner Only]
    H --> L[Submit Post to Server]
    L --> M[Save to Database]
    M --> N[Update Redux Store]
    N --> O[Show in Feed]
    O --> P[Success Notification]
```

**Steps:**
1. Click **"+"** icon in navigation
2. **Create Post Modal** appears
3. Fill in post details:
   - Content/Caption
   - Select category (Travel, Food, Fashion, etc.)
   - Upload up to 5 images
   - Choose visibility (Public/Private)
4. Images uploaded to **Cloudinary CDN**
5. Post data saved to database
6. Redux store updated
7. New post appears in feed instantly

---

### 4️⃣ **AI Recommendation Flow**

```mermaid
graph TD
    A[User Likes Posts] --> B[Track Liked Post Categories]
    B --> C{Minimum 3 Likes?}
    C -->|No| D[Show Recent Public Posts]
    C -->|Yes| E[Analyze Category Distribution]
    E --> F[Prepare Prompt for Gemini]
    F --> G[Google Gemini AI API]
    G --> H[AI Returns Best Category Match]
    H --> I[Query Posts by Category]
    I --> J[Filter User's Own Posts]
    J --> K[Order by Recent]
    K --> L[Return Top 20 Recommendations]
    L --> M[Display in Recommended Tab]
```

**Steps:**
1. System tracks all posts liked by user
2. Counts likes per category (Travel: 5, Food: 3, Fashion: 1)
3. If user has liked at least 3 posts, activate AI
4. Send category statistics to **Google Gemini AI**
5. AI analyzes patterns and returns best matching category
6. Query database for posts in that category
7. Exclude user's own posts
8. Display personalized recommendations

---

### 5️⃣ **Real-Time Messaging Flow**

```mermaid
graph TD
    A[Click Messages Icon] --> B[Messages Page]
    B --> C[Load Chat List]
    C --> D{Has Chats?}
    D -->|No| E[Show Empty State]
    D -->|Yes| F[Display Chat List]
    E --> G[Click Start New Chat]
    F --> H[Select Chat]
    G --> I[User Discovery Modal]
    I --> J[Select User]
    J --> K[Create/Open Chat]
    H --> K
    K --> L[Load Message History]
    L --> M[Socket.IO Connection]
    M --> N[Real-Time Updates]
    N --> O[Send/Receive Messages]
```

**Steps:**
1. Navigate to **Messages** page
2. View list of existing conversations
3. **Start New Chat** via User Discovery modal
4. Select a user to chat with
5. System creates chat room (or opens existing)
6. Load message history from database
7. **Socket.IO** establishes WebSocket connection
8. Messages sent/received in **real-time**
9. Chat history persisted to database

---

### 6️⃣ **AI Chat Assistant Flow**

```mermaid
graph TD
    A[Click AI Chat Icon] --> B[AI Chat Modal Opens]
    B --> C[User Types Message]
    C --> D[Send to Gemini AI]
    D --> E[AI Processing]
    E --> F[Clean & Format Response]
    F --> G[Display AI Response]
    G --> H{Continue Chat?}
    H -->|Yes| C
    H -->|No| I[Close Modal]
```

**Steps:**
1. Click **"AI Chat"** icon (Stars icon)
2. **AI Chat Modal** appears
3. Type your question or message
4. Message sent to **Google Gemini AI** API
5. AI processes and generates response
6. Response cleaned (remove markdown, formatting)
7. Display AI answer in chat interface
8. Continue conversation or close modal

---

### 7️⃣ **Profile & User Interaction Flow**

```mermaid
graph TD
    A[View User Profile] --> B{Own Profile?}
    B -->|Yes| C[Show All Posts + Private]
    B -->|No| D[Show Public Posts Only]
    C --> E[Can Delete Posts]
    D --> F[Can Like Posts]
    D --> G[Can Start Chat]
    F --> H[Update Like Count]
    G --> I[Open Chat with User]
    E --> J[Confirm Delete]
    J --> K[Remove from Database]
    K --> L[Update Redux Store]
    L --> M[Refresh Profile]
```

**Steps:**
1. Click on username or profile picture
2. System checks: Is this your profile?
3. **Own Profile**: See all posts (public + private), can delete
4. **Other Profile**: See public posts only, can like/chat
5. **Delete Post**: Confirmation dialog → Remove from DB → Update UI
6. **Start Chat**: Create new conversation with user
7. All changes update Redux store for instant UI refresh

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│  React.js + Redux Toolkit + React Router + Bootstrap        │
│  ├── Pages (Login, Register, Home, Profile, Messages)       │
│  ├── Components (PostCard, Modals, Navigation)              │
│  ├── Redux Store (Auth, Posts, Likes Slices)                │
│  └── HTTP Client (Axios)                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API + Socket.IO
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                        SERVER SIDE                           │
├─────────────────────────────────────────────────────────────┤
│  Node.js + Express.js + Socket.IO                           │
│  ├── Routes (Users, Posts, Chat, AI)                        │
│  ├── Controllers (Business Logic)                           │
│  ├── Middleware (Authentication, Error Handling)            │
│  └── Helpers (JWT, Cloudinary, AI)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Sequelize ORM
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                         │
│  ├── Users Table                                            │
│  ├── Posts Table                                            │
│  ├── Likes Table (Junction)                                │
│  ├── Categories Table                                       │
│  ├── Images Table                                           │
│  ├── Chats Table                                            │
│  └── Messages Table                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  🤖 Google Gemini AI    → AI Recommendations & Chat         │
│  ☁️  Cloudinary          → Image Storage & CDN              │
│  🔐 Google OAuth         → Authentication                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

The project includes comprehensive test coverage (80%+):

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Test Coverage Includes:**
- Unit tests for controllers
- Integration tests for routes
- Middleware tests
- Helper function tests
- Database model tests

---

## 📚 API Documentation

Comprehensive API documentation available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Key Endpoints:**

### Authentication
- `POST /users/register` - Create new account
- `POST /users/login` - Email/password login
- `POST /users/auth/google` - Google OAuth login

### Posts
- `GET /posts` - Get all posts
- `POST /posts` - Create new post
- `DELETE /posts/:id` - Delete post

### Likes
- `POST /posts/:id/like` - Like/unlike post

### Chat
- `POST /chat` - Create/get chat
- `GET /chat` - Get all user's chats
- `GET /chat/:id` - Get chat details
- `POST /chat/:id/messages` - Send message

### AI Features
- `GET /ai/recommendations` - Get AI-powered recommendations
- `POST /ai/chat` - Chat with AI assistant

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + Google OAuth 2.0
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **AI**: Google Generative AI (Gemini)
- **Testing**: Jest

### Frontend
- **Framework**: React.js 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI Library**: React Bootstrap
- **HTTP Client**: Axios
- **OAuth**: @react-oauth/google
- **Notifications**: SweetAlert2
- **Build Tool**: Vite

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Environment**: dotenv
- **API Testing**: Thunder Client / Postman
- **Code Quality**: ESLint
- **Database Migrations**: Sequelize CLI

---

## 📁 Project Structure

```
Dummy-Instagram/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   ├── helpers/        # Utility functions
│   │   └── assets/         # Static assets
│   ├── public/
│   └── package.json
├── controllers/            # Request handlers
├── models/                # Sequelize models
├── routes/                # API routes
├── helpers/               # Backend utilities
├── middleware/            # Express middleware
├── migrations/            # Database migrations
├── seeders/              # Database seeders
├── __tests__/            # Test files
├── config/               # Configuration files
├── data/                 # Sample data
├── .env                  # Environment variables
├── app.js                # Express app setup
├── package.json
└── README.md
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with middleware
- ✅ Environment variable protection
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ XSS protection
- ✅ CORS configuration

---

## 🚧 Future Enhancements

- [ ] Story/Reels feature
- [ ] Comment system on posts
- [ ] Hashtag support
- [ ] Advanced search and filters
- [ ] User follow/following system
- [ ] Push notifications
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Post editing capability
- [ ] Image filters and editing tools

---

## 👨‍💻 Developer

**Joshua**
- GitHub: [@Joshua080324](https://github.com/Joshua080324)
- Repository: [Dummy-Instagram](https://github.com/Joshua080324/Dummy-Instagram)

---

## 📄 License

This project is for educational purposes as part of Individual Project Phase 2.

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent recommendations
- Cloudinary for image hosting
- React & Redux community
- Node.js & Express.js ecosystem

---

<div align="center">
  <strong>⭐ If you like this project, please give it a star! ⭐</strong>
  <br />
  <sub>Built with ❤️ using React, Node.js, and AI</sub>
</div>
