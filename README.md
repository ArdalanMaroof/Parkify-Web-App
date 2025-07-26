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
## Screenshots 
### Start Page Light Mode
<img width="517" height="1018" alt="image" src="https://github.com/user-attachments/assets/7ab6191d-fe38-41ef-8c8d-9e9b0dde5ba0" />

### Start Page Dark Mode
<img width="537" height="1008" alt="image" src="https://github.com/user-attachments/assets/753ac488-7481-4148-8da1-eebb31d88a03" />

### Signup Page Light Mode
<img width="517" height="802" alt="image" src="https://github.com/user-attachments/assets/7eaa1010-460b-4636-b6ac-8fcf3d1ba6ff" />

### Signup Page Dark Mode
<img width="532" height="807" alt="image" src="https://github.com/user-attachments/assets/ab5e054e-08f5-421f-bec2-ea1bb1f3359e" />

### Login Page Light Mode
<img width="531" height="718" alt="image" src="https://github.com/user-attachments/assets/c34deae8-2067-443b-aef1-2c768baa98ca" />

### Login Page Dark Mode
<img width="513" height="692" alt="image" src="https://github.com/user-attachments/assets/dad6476d-8776-4662-a8a4-0c791dbd581d" />

### Home Page Light Mode
<img width="523" height="990" alt="image" src="https://github.com/user-attachments/assets/e100ad4b-1d1f-4fe7-8db0-3d1a8db5367f" />   

### Home Page Dark Mode
<img width="507" height="995" alt="image" src="https://github.com/user-attachments/assets/b0cd3575-f951-4f94-9b52-1c3b4858f744" />

### Scoreboard Page Light Mode
<img width="531" height="1007" alt="image" src="https://github.com/user-attachments/assets/5aa5b274-a924-4bd5-8525-44bd14c673d9" />

### Scoreboard Page Dark Mode
<img width="522" height="1017" alt="image" src="https://github.com/user-attachments/assets/41286818-29e5-431e-9c7f-a4b2b20caab0" />

### Parking Spots Page Light Mode
<img width="527" height="1001" alt="image" src="https://github.com/user-attachments/assets/9f84f60e-3901-40f4-be92-0353a9c0e8ad" />

### Parking Spots Page Dark Mode
<img width="430" height="972" alt="image" src="https://github.com/user-attachments/assets/1801baee-1092-404e-935c-47cbe5c67085" />

### Active Session and History Page Light Mode
<img width="420" height="975" alt="image" src="https://github.com/user-attachments/assets/4f4add15-8125-4c6e-9221-4d58da1cc47b" />

### Active Session and History Page Dark Mode
<img width="407" height="973" alt="image" src="https://github.com/user-attachments/assets/43e984c2-4712-4e9c-9853-c867e9901992" />

### Wallet Page Light Mode
<img width="416" height="990" alt="image" src="https://github.com/user-attachments/assets/c792fc9c-a2ae-4a0f-8e77-16e8a79a4227" />

### Wallet Page Dark Mode
<img width="425" height="973" alt="image" src="https://github.com/user-attachments/assets/c875b229-79b7-49af-a543-db8788b34262" />

### Profile Page Light Mode
<img width="415" height="975" alt="image" src="https://github.com/user-attachments/assets/951c18e2-0c64-4855-bbfc-5fe375134751" />

### Profile Page Dark Mode
<img width="427" height="967" alt="image" src="https://github.com/user-attachments/assets/9daf3114-f6b8-438f-b76b-971815d467a6" />

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



