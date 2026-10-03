# University Service Portal — PostgreSQL

A fresh, simple university service-request website using:
- Node.js + Express
- PostgreSQL
- HTML/CSS/JavaScript
- JWT authentication
- No MySQL
- No `psql` command is required for setup

## 1) Requirements
Install:
- Node.js LTS
- PostgreSQL

## 2) Install packages
Open VS Code in this folder and run:

```bash
npm install
```

## 3) Configure PostgreSQL automatically
Run:

```bash
npm run setup
```

The setup program asks for:
- PostgreSQL host (default localhost)
- port (default 5432)
- PostgreSQL username (default postgres)
- PostgreSQL password
- database name (default university_portal)

It creates the database (if your PostgreSQL user has permission), creates all tables, and creates demo accounts.

## 4) Start
```bash
npm start
```

Open:
http://localhost:3000

## Demo accounts
Student:
- Email: student@demo.com
- Password: password123

Staff:
- Email: staff@demo.com
- Password: password123

## If setup says "password authentication failed"
That means the PostgreSQL password entered in setup is not the password for that PostgreSQL user. Nothing is wrong with the website. Re-run:

```bash
npm run setup
```

and enter the correct PostgreSQL password.

## Project structure
- `server/server.js` — Express server
- `server/routes/auth.js` — authentication API
- `server/routes/requests.js` — request API
- `server/routes/users.js` — profile API
- `database/schema.sql` — database schema
- `public/` — website pages and assets
- `setup.js` — first-time PostgreSQL setup
