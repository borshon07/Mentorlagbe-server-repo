# MentorLagbe (Server)

Express and MongoDB API for the MentorLagbe tuition platform.

- **Live API:** <server-live-url>
- **Client Repository:** <client-repo-url>
- **Live Site:** <client-live-url>

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@mentorlagbe.com | Admin@12345 |
| Tutor (Pro) | tanvir@mentorlagbe.com | Tutor@12345 |
| Student | nusrat@mentorlagbe.com | Student@12345 |

## Key Features

- BetterAuth with MongoDB adapter and Google login
- JWT issued from the authenticated session, verified by custom middlewares: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`
- Role and plan cannot be changed through the public auth update endpoint
- Tuition CRUD with server-side search, filter and pagination
- Application API with unique index to block duplicate applications
- Admin API: stats, users, role change, tuition approval, payments
- Stripe Checkout, session verification and webhook support
- Free plan limit (2 tuitions) enforced on the server
- Bookmark API for saved tuitions
- Seed scripts for demo data

## Database

The app uses 4 collections: `users`, `tuitions`, `applications`, `payments`. BetterAuth also creates its internal `session`, `account` and `verification` collections.

## npm Packages

express, cors, dotenv, mongodb, better-auth, jsonwebtoken, stripe, nodemon (dev)

## Environment Variables

See `.env.example`: PORT, CLIENT_URL, MONGODB_URI, DB_NAME, JWT_SECRET, BETTER_AUTH_SECRET, BETTER_AUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

## Scripts

    npm run dev          # start with nodemon
    npm start            # start
    npm run seed:admin   # create the admin user
    npm run seed         # seed tutors, students, tuitions, applications, payments