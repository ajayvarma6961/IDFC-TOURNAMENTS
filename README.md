# IDFC ESPORTS - Free Fire MAX Tournament Platform

IDFC Esports is a professional, high-performance, dark-themed competitive esports web application built specifically for Free Fire MAX tournaments, squad leaderboards, MVP showcase, live match tracking, and squad registration.

---

## 🚀 Quick Start / How to Run

1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` and select **"Open with Live Server"** (or open `http://localhost:5500` / `http://127.0.0.1:5500` in your web browser).
4. The platform will immediately load.

> **No Node.js, npm, or backend server installation required!** Everything runs directly in standard web browsers using Vanilla HTML5, CSS3, and JavaScript with `LocalStorage`.

---

## 🏆 Key Features

- **Hero & Countdown Showcase**: Live tournament header card with active tournament stats, status indicator, and real-time countdown timer.
- **Player of the Tournament (MVP)**: Featured showcase card highlighting the top overall MVP player with glows, kill counts, damage stats, headshot rates, and Booyah counts. Admin can set and publish MVP details dynamically.
- **Tournaments Hub**: Filter tournaments by Live, Upcoming, and Completed states with dynamic registration modals and status indicators.
- **Squad Registration System**:
  - Full registration form collecting Full Name, Mobile, Email, Free Fire Game UID, IGN, Team Name, Captain Name, Players 1-4, Alt Contact, and terms agreement.
  - Automatic validation, duplicate submission check, and unique Reference ID generation (e.g. `REG-1001`).
  - Submissions enter initial **PENDING** status and await Admin Review.
- **Check Registration Status**:
  - Dedicated search modal where applicants can enter their Registration Reference ID to view live review status (`PENDING`, `APPROVED`, `REJECTED` with rejection reason).
- **Team Leaderboard**: Real-time squad standings with rank badges (Gold 🥇, Silver 🥈, Bronze 🥉), kill point calculations, search bar, and sorting by Points, Kills, and Booyahs.
- **Fixtures & Matches**: Tabbed view for Live, Upcoming, and Completed matches complete with maps (Bermuda, Purgatory, Kalahari, Alpine, NexTerra) and match winners.
- **Global Search System**: Instant modal search across tournaments, matches, and squad leaderboard entries.
- **Complete Admin Panel**:
  - **Credentials**: Username: `ajay` | Password: `Ajayvarma6961`
  - Review squad registrations with complete player details.
  - Approve registrations (automatically checks tournament squad capacity and increments participating squad count).
  - Reject registrations with optional rejection reason feedback.
  - Manage Tournaments (Add, Edit, Delete, Toggle Registration Open/Closed).
  - Manage Matches (Add, Edit, Delete).
  - Manage Leaderboard & Team Points.
  - Set & Publish MVP Player details.
  - View Contact & Support Messages.
- **Offline SVG Generator**: Guaranteed zero broken image links via dynamic SVG data URLs.
- **Toast Notifications**: Animated floating notifications for instant feedback.

---

## 📁 Project Structure

```
idfc/
├── index.html        # Main single-page application structure
├── styles.css        # Premium dark esports CSS styling & animations
├── app.js            # Core UI renderers, state management, modal logic & Admin Management
├── config.js         # Initial datasets, SVG avatar generator & LocalStorage API
└── README.md         # Comprehensive project documentation
```

---

## 🔐 Admin Access

To access the Admin Panel:
1. Click **"Admin Login"** in the top navigation bar (or navigate to `#admin`).
2. Enter credentials:
   - **Username**: `ajay`
   - **Password**: `Ajayvarma6961`
3. Manage tournaments, update team points, set the MVP player, or approve/reject squad registrations.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic tags, accessible structure, responsive viewport.
- **CSS3**: CSS Custom Properties (Variables), Glassmorphism backdrop filters, Flexbox, CSS Grid, Custom animations.
- **Vanilla JavaScript**: Modular architecture, LocalStorage synchronization, event delegation, search algorithms.
- **Google Fonts**: *Rajdhani* (Esports headers) & *Outfit* (Modern UI body text).
- **Font Awesome 6**: Vector icons.

---

© 2026 IDFC Esports. All Rights Reserved.

