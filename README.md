# Doctorly

Doctorly is a comprehensive platform for medical school aspirants to track their MCAT preparation, application readiness, extracurriculars, and receive personalized recommendations and local opportunities.

## Features
- Secure Google authentication (Firebase Auth)
- Profile setup with GPA, MCAT targets, extracurriculars, and school list
- MCAT practice tracking (raw and scaled scores, progress vs. targets)
- Extracurricular and clinical/research/community service hour tracking
- Personalized recommendations and local opportunity search (VolunteerMatch API, etc.)
- Visual dashboards and analytics

## Tech Stack
- **Frontend:** React, Material-UI, Axios, Firebase Auth
- **Backend:** Node.js, Express, MongoDB (Atlas), Mongoose
- **Authentication:** Firebase (Google Sign-In)
- **Deployment:** Vercel (frontend), Render (backend)

## Project Structure
```
doctorly/
  client/   # React frontend
  server/   # Node.js/Express backend
```

## Getting Started

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Firebase project (Google Auth enabled)
- GitHub account

### Local Development
1. **Clone the repo:**
   ```bash
   git clone https://github.com/adoctorly/doctorly.git
   cd doctorly
   ```
2. **Backend setup:**
   ```bash
   cd server
   npm install
   # Create .env with your MongoDB URI and Firebase config
   npm run dev
   ```
3. **Frontend setup:**
   ```bash
   cd ../client
   npm install
   # Create .env with your API base URL and Firebase config
   npm start
   ```
4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Environment Variables
- **Backend (`server/.env`):**
  - `MONGO_URI=...`
  - `FIREBASE_PROJECT_ID=...`
  - `FIREBASE_CLIENT_ID=...`
- **Frontend (`client/.env`):**
  - `REACT_APP_API_BASE_URL=http://localhost:5000` (or Render URL in production)
  - `REACT_APP_FIREBASE_API_KEY=...`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN=...`
  - ... (other Firebase config)

### Deployment
- **Frontend:** Deploy `/client` to Vercel ([Vercel Deploy](https://vercel.com/new?teamSlug=doctorly-admins-projects))
- **Backend:** Deploy `/server` to Render ([Render Dashboard](https://doctorly-845w.onrender.com))

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT 