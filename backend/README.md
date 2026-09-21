# Revly Backend (ES6 / ESM version)

A Node.js + Express + MongoDB API for **Revly**, written using ES6 `import`/`export` syntax instead of CommonJS `require`/`module.exports`.

## 1. What changed from the old version

Two things make ES6 modules work in plain Node.js:

1. **`"type": "module"`** was added to `package.json`. This one line tells Node "treat every `.js` file in this project as an ES module," which is what unlocks `import`/`export`.
2. **Every relative import now includes the `.js` file extension** — e.g. `import User from "../models/User.js"`, not `"../models/User"`. This trips up almost everyone coming from CommonJS: Node's ES module loader (unlike bundlers such as Webpack or Vite) refuses to guess the extension for you, so leaving it off throws `ERR_MODULE_NOT_FOUND`.

Everything else — the folder structure, the routes, the database logic — works exactly the same as before.

## 2. Setup

```bash
cd revly-backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run seed             # optional: adds sample users + products
npm run dev                # starts on http://localhost:5000
```

## 3. Folder structure

```
revly-backend/
├── server.js          # app entry point — wires everything together
├── config/db.js        # MongoDB connection
├── models/              # Mongoose schemas: User, Product, Review
├── controllers/          # business logic for each resource
├── routes/                # URL → controller mapping
├── middleware/             # auth (JWT), error handler, async wrapper
└── data/seed.js            # sample data for local testing
```

## 4. API endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| GET | `/api/auth/me` | ✓ | Current logged-in user |
| GET | `/api/users/:id` | — | Profile (feeds UserCard.jsx) |
| PUT | `/api/users/:id` | ✓ | Edit your own profile |
| POST | `/api/users/:id/follow` | ✓ | Follow a user |
| DELETE | `/api/users/:id/follow` | ✓ | Unfollow a user |
| GET | `/api/users/suggested` | ✓ | Feeds SuggestedUsers.jsx |
| GET | `/api/users/top-reviewers` | — | Feeds TopReviewers.jsx |
| GET | `/api/products` | — | List, filter by `?category=` or `?skinType=` |
| GET | `/api/products/trending` | — | Feeds TrendingProducts.jsx |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | ✓ | Add a product |
| POST | `/api/reviews` | ✓ | Write a review |
| GET | `/api/reviews/product/:productId` | — | All reviews for a product |
| GET | `/api/reviews/user/:userId` | — | All reviews by a user |
| GET | `/api/reviews/top` | — | Feeds TopReview.jsx (most-liked) |
| POST | `/api/reviews/:id/like` | ✓ | Toggle the ♡ helpful vote |
| DELETE | `/api/reviews/:id` | ✓ | Delete your own review |

## 5. Connecting your frontend

Same as before — `AuthContext.jsx`'s `login` should call the API and store the returned token:

```js
const login = async (email, password) => {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  localStorage.setItem("revlyUser", JSON.stringify(data));
  setUser(data);
};
```

Then send the token on protected requests:

```js
fetch("http://localhost:5000/api/users/USER_ID/follow", {
  method: "POST",
  headers: { Authorization: `Bearer ${user.token}` },
});
```
