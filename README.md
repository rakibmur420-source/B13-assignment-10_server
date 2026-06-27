
# 📚 Fable – Ebook Sharing Platform (Server)

Express.js REST API backend for the Fable ebook sharing platform. Handles authentication, ebook management, payments, and analytics.


## 🔗 Client Repository

https://github.com/rakibmur420-source/B13-assignment-10_client


## ✨ Key Features

- 🔐 JWT authentication (7-day expiry)
- 👥 Role-based access control (Reader / Writer / Admin)
- 📖 Full ebook CRUD with publish/unpublish
- 💳 Stripe checkout session creation and payment verification
- 🔖 Bookmark system
- 📊 Admin analytics (monthly sales, revenue, genre breakdown)
- 🌍 CORS configured for Vercel frontend

## 🛣️ API Routes

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |

### Ebooks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ebooks` | Get all published ebooks |
| GET | `/api/ebooks/featured` | Get featured ebooks |
| GET | `/api/ebooks/top-writers` | Get top writers by sales |
| GET | `/api/ebooks/:id` | Get single ebook |
| POST | `/api/ebooks` | Create ebook (writer) |
| PATCH | `/api/ebooks/:id` | Update ebook (writer) |
| DELETE | `/api/ebooks/:id` | Delete ebook (writer/admin) |
| PATCH | `/api/ebooks/:id/status` | Toggle publish status |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users (admin) |
| PATCH | `/api/users/:id` | Update profile |
| PATCH | `/api/users/:id/ban` | Ban/unban user (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| PATCH | `/api/users/:id/bookmark` | Toggle bookmark |
| GET | `/api/users/:id/bookmarks` | Get bookmarks |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions/create-checkout-session` | Create Stripe session |
| POST | `/api/transactions/verify-payment` | Verify payment |
| GET | `/api/transactions/my-purchases` | Reader's purchases |
| DELETE | `/api/transactions/my-purchases/:ebookId` | Remove purchase |
| GET | `/api/transactions/my-sales` | Writer's sales |
| GET | `/api/transactions/all` | All transactions (admin) |
| GET | `/api/transactions/analytics` | Analytics data (admin) |

## 📦 NPM Packages Used

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT token generation |
| `bcryptjs` | Password hashing |
| `stripe` | Payment processing |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
IMGBB_API_KEY=your_imgbb_api_key
CLIENT_URL=https://b13-assignment-10-client.vercel.app
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```
