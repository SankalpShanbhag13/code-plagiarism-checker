# CodeAlign – Code Similarity Engine

A MERN-stack web app for comparing two code snippets for similarity and plagiarism, with a hackathon events section, user accounts and a personal dashboard.

## Features
- Side-by-side code comparison with a similarity score (line alignment algorithm)
- User sign up / login (JWT authentication)
- Hackathon events listing
- Personal dashboard and saved submissions

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens, bcryptjs

## Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/SankalpShanbhag13/code-plagiarism-checker.git
cd code-plagiarism-checker
```

### 2. Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (copy `.env.example`):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/code_similarity_db
JWT_SECRET=change_this_to_a_long_random_string
```
Optionally seed sample data (**this clears existing users, events and submissions**):
```bash
npm run seed
```
Start the server:
```bash
npm run dev
```
It runs on http://localhost:5000.

### 3. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000.

## Demo Login (after seeding)
- Email: `organizer@hackathon.com`
- Password: `password123`

## Project Structure
```
backend/    Express API (routes, models, middleware, seeder)
frontend/   React + Vite app
```

## Troubleshooting
- **Database connection error:** MongoDB isn't running. Start the MongoDB service.
- **`npm` blocked in PowerShell:** run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen the terminal.
- The frontend expects the backend at `http://localhost:5000`.
