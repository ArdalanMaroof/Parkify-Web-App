# 🚗 Parkify – Smart City Parking Assistant

Parkify is a full-stack web application that helps users locate real-time **available parking spots** in the city, using a combination of **map visualization**, **crowdsourced reporting**, and **reward-based incentives**. Users can confirm parking, contribute data, and earn points – all through a mobile-friendly experience.

---

## 🌐 Live Demo

- **Frontend:** [https://parkify.vercel.app](parkify-web-app-xi.vercel.app)
---

## 🧰 Tech Stack

**Frontend:**
- React.js
- React Leaflet + Google Maps API
- React Toastify
- Tailwind CSS / Custom CSS

**Backend:**
- Node.js + Express.js
- MongoDB Atlas
- Stripe API for payments
- Render deployment

**Other Tools:**
- Vercel (Frontend Hosting)
- GitHub Actions (CI/CD – coming soon)

---

## 🔑 Features

### ✅ Real-Time Parking Spot Info
- Spots are marked on a map as:
  - 🔵 Available
  - 🔴 Full
- Popups show full details (name, address, hours, etc.)
- Persistent popups that stay open during updates or user interaction

### 🚘 Smart Parking Confirmation
- Confirms spot only if the user is physically nearby
- Launches Stripe checkout upon confirmation
- Starts a 1-hour parking timer upon successful payment
- Disables all other parking actions during an active session
- Reopens the confirmed spot popup automatically

### 🧠 Crowdsourced Updates
- **Spot Available:** Report number of open spots (earns reward points)
- **Mark as Full:** Flags the lot as full, disables "I'm parking here"
- Live updates sync across users in real-time

### 🧾 Parking History & Timer
- Status page shows:
  - Your active parking session with countdown
  - Past parking history (from MongoDB)
  - Button to reopen the popup for the current parking spot

### 🛡️ Auth & Reward System
- Login required for all interactions
- Earn points for helpful updates (like reporting availability)
- Leaderboard shows top contributing users

---
## 📁 Project Structure

- `Parkify/`
  - `node_modules/` – Project dependencies
  - `parkify-backend/` – Backend (Node.js + Express)
    - `models/` – Mongoose models
    - `routes/` – Express routes
    - `.env` – Environment variables
    - `db.js` – MongoDB connection
    - `server.js` – Backend entry point
    - `package.json`
    - `package-lock.json`
  - `public/` – Public assets for frontend
  - `src/` – React frontend source
    - `assets/` – Images, icons, etc.
    - `context/` – React context/state management
    - `Pages/` – App screens/pages
    - `App.jsx` – Main App component
    - `App.css` – App-wide styles
    - `index.css` – Global styles
    - `main.jsx` – React entry point
    - `ParkingSpots.css` – Map styles
    - `StartParking.css` – Start page styles
  - `index.html` – Main HTML template
  - `.gitignore` – Git ignored files
  - `.prettierrc` – Prettier formatting config
  - `eslint.config.js` – ESLint configuration
  - `package.json` – Frontend dependencies and scripts
  - `package-lock.json`
  - `README.md` – Project documentation
  - `vercel.json` – Vercel deployment config
  - `vite.config.js` – Vite build tool config


## 🧪 How to Run Locally

### 1. Clone the repository
git clone https://github.com/Pmaan01/Parkify.git

### 2. Start the frontend
cd Parkify
npm install
npm install stripe
npm run dev

### 3. Start the backend
cd parkify-backend
node server.js

### 4. Add environment variables
Create a `.env` file inside the `parkify-backend/` folder with the following content:

#### MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/parkifydev?retryWrites=true&w=majority
MONGO_URI_1=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
DB_NAME=parkifydev

#### JWT or App Secret
SECRET_KEY=your_secret_key

#### Stripe Key (test or live)
STRIPE_SECRET_KEY=sk_test_your_test_key_here

#### Frontend URL for CORS setup
CLIENT_URL=http://localhost:3000

## 🔮 Future Improvements
Admin dashboard for moderating reports

SMS/email reminders before parking expires

Heatmap showing parking availability trends

Native mobile app (React Native or Flutter)

AI-based prediction of free spots based on historical data

## 👥 Team

| Name                  | Role                 | Responsibilities                                                                                           |
|-----------------------|----------------------|------------------------------------------------------------------------------------------------------------|
| **Parveen Kaur Maan**  | Full Stack Developer  | Designed & implemented full Map Feature (frontend + backend), Spot Availability Logic, Stripe Payment Flow, Full UI/UX |
| **Nishkarmanjit Kaur** | Full Stack Developer  | User Authentication System, Rewards System, Leaderboard, Backend APIs for Auth & Scoring                  |
| **Ardalan Maroof**     | Full Stack Developer  | Profile Page, Wallet System, Backend Integration for Profile & Wallet                      |


## 🙌 Acknowledgements

- [Leaflet](https://leafletjs.com/) – Interactive maps
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) – Cloud database hosting
- [Stripe](https://stripe.com/) – Payment processing
- [Google Maps API](https://developers.google.com/maps/documentation) – Maps and location services
- [City of Vancouver Open Data Portal](https://opendata.vancouver.ca/) – Source of public parking spot data



