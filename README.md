# MentorLagbe (Server)

Express and MongoDB API for the MentorLagbe tuition platform.

- **Live API:** https://mentorlagbe-server-nine.vercel.app
- **Live Site:** https://mentorlagbe-client-rosy.vercel.app
- **Client Repository:** https://github.com/borshon07/Mentorlagbe-server-repo

## Test Accounts

| Role        | Email                  | Password     |
| ----------- | ---------------------- | ------------ |
| Admin       | admin@mentorlagbe.com  | Admin@12345  |
| Tutor (Pro) | tanvir@mentorlagbe.com | Tutor@12345  |
| Student     | student12@gmail.com    | student12@12 |

## Key Features

- BetterAuth with MongoDB adapter and Google login
- JWT from the authenticated session, verified by custom middlewares: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`
- Role and plan cannot be changed through the public auth update endpoint
- Tuition CRUD with server-side search, filter and pagination
- Applications with a unique index to block duplicates, plus reviews and ratings
- Admin API: stats, users, role change, tuition approval, payments
- Stripe Checkout, session verification and webhook
- Free plan limit (2 tuitions) enforced on the server
- Bookmark API, seed scripts for demo data

## Database

The app uses 4 collections: `users`, `tuitions`, `applications`, `payments`. BetterAuth also creates its internal `session`, `account` and `verification` collections.

## Packages

express, cors, dotenv, mongodb, better-auth, jsonwebtoken, stripe, nodemon (dev)

## Environment Variables

See `.env.example`: PORT, CLIENT_URL, MONGODB_URI, DB_NAME, JWT_SECRET, BETTER_AUTH_SECRET, BETTER_AUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

## Scripts

    npm run dev          # start with nodemon
    npm start            # start
    npm run seed:admin   # create the admin user
    npm run seed         # seed demo tutors, students, tuitions, applications, payments
