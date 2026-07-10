# 🛡️ SheShield

### Navigate Safe. Stay Protected.

SheShield is a women-safety focused navigation platform designed to help users make safer travel decisions.

Instead of focusing only on the shortest route, SheShield combines route planning with safety-focused features such as route safety scores, safer route alternatives, community incident reporting, journey monitoring, emergency contacts, Alert Mode, and SOS assistance.

---

## 🚨 Problem Statement

Traditional navigation applications primarily optimize routes based on distance and travel time.

However, the shortest route may not always be the safest route, especially during late hours or in unfamiliar areas.

SheShield aims to provide users with additional safety context while travelling by combining navigation, safety scoring, community reports, journey monitoring, and emergency tools in one platform.

---

## ✨ Key Features

### 🗺️ Safety-Aware Route Planning

- Search for a destination
- View multiple route alternatives
- Compare route distance and estimated travel time
- View safety scores for available routes
- Select a safer alternative instead of only the fastest route

### 🛡️ Route Safety Scoring

Routes can be evaluated using safety-related factors such as:

- Nearby police stations
- Hospitals and emergency facilities
- Public and well-connected areas
- Community incident reports
- Time-based risk context
- Other available safety signals

The system presents safety information in a simple score-based interface to help users compare routes.

### 📍 Active Journey Mode

Once navigation starts, SheShield enters an active journey state that provides:

- Destination information
- Journey distance and estimated duration
- Journey status
- Alert Mode access
- SOS access
- Route monitoring interface
- End Journey functionality

Ending a journey clears the active destination and route state.

### ⚠️ Alert Mode

Alert Mode provides an additional safety state during an active journey.

The interface is designed to remain compact on mobile devices while keeping emergency controls easily accessible.

### 🆘 SOS Assistance

The SOS system provides quick access to emergency actions, including:

- Emergency state activation
- Location sharing status
- Emergency alert status
- Trusted contact notification status
- Direct access to emergency calling
- "I'm Safe Now" action to end the emergency state

### 👥 Emergency Contacts

Users can manage trusted emergency contacts inside the application.

Supported actions include:

- Add contacts
- Edit contacts
- Delete contacts
- Mark a primary contact
- Configure contacts for SOS alerts

### 📢 Community Incident Reporting

Users can report safety incidents in their area.

Community reports can provide additional local context that may contribute to safety awareness and route evaluation.

### 🌙 Responsive Mobile Experience

SheShield is designed for both desktop and mobile screens.

The mobile interface includes:

- Compact map controls
- Responsive route cards
- Mobile-friendly Alert Mode
- Compact SOS interface
- Touch-friendly controls
- Responsive emergency contact management

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Zustand
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt

### Maps and Routing

- Google Maps Platform
- Google Maps JavaScript API
- Google Routes API

---

## 📁 Project Structure

```text
SheShield/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── scripts/
│   │   └── uploads/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── services/
│   │   └── stores/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
