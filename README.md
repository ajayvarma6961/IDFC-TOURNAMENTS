# IDFC ESPORTS - Free Fire MAX Tournament Platform

IDFC Esports is a professional, high-performance, dark-themed competitive esports web application built specifically for Free Fire MAX tournaments, squad leaderboards, player rankings, and live match tracking.

---

## 🚀 Quick Start / How to Run

1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` and select **"Open with Live Server"** (or open `http://localhost:5500` / `http://127.0.0.1:5500` in your web browser).
4. The complete platform will immediately load with full demo data!

> **No Node.js, npm, or backend server installation required!** Everything runs directly in standard web browsers using Vanilla HTML5, CSS3, and JavaScript with `LocalStorage`.

---

## 🏆 Key Features

- **Hero & Countdown Showcase**: Live tournament header card with active tournament stats, status indicator, and real-time JavaScript countdown timer.
- **Player of the Tournament (MVP)**: Featured showcase card highlighting the top overall MVP player with glows, kill counts, damage stats, headshot rates, and Booyah counts.
- **Tournaments Hub**: Filter tournaments by Live, Upcoming, and Completed states with dynamic registration modals and status indicators.
- **Team Leaderboard**: Real-time season squad standings with rank badges (Gold 🥇, Silver 🥈, Bronze 🥉), kill point calculations, search bar, and sorting by Points, Kills, and Booyahs.
- **Player Rankings**: Individual player statistics leaderboard with deep stats breakdown and custom profile modal view.
- **Teams & Roster Modal**: Interactive team cards displaying team logos, flags, captains, win rates, and active squad rosters.
- **Fixtures & Matches**: Tabbed view for Live, Upcoming, and Completed matches complete with maps (Bermuda, Purgatory, Kalahari, Alpine, NexTerra) and match winners.
- **Prize Pool Section**: Metallic reward cards detailing cash prize breakdowns for 1st Place (₹50,000), 2nd Place (₹25,000), 3rd Place (₹15,000), MVP Award, Top Fragger, and Best Squad.
- **Latest News & Announcements**: Esports portal news articles with full article reader modals.
- **Global Search System**: Instant modal search across teams, players, tournaments, and news articles.
- **Complete Admin Panel (CRUD)**:
  - **Credentials**: Username: `admin` | Password: `admin123`
  - Full Add/Edit/Delete capabilities for Tournaments, Teams, Players, Matches, News.
  - Ability to change the **Player of the Tournament** dynamically.
  - Editable prize pool amounts.
  - Registrations viewer.
  - Factory reset button to restore default demo datasets.
- **Offline SVG Generator**: Guaranteed zero broken image links via dynamic SVG data URLs with defensive `onerror` image fallbacks.
- **Toast Notifications**: Animated floating notifications for user feedback.

---

## 📁 Project Structure

```
idfc/
├── index.html        # Main single-page application structure
├── styles.css        # Premium dark esports CSS styling & animations
├── app.js            # Core UI renderers, state management, modal logic & Admin CRUD
├── config.js         # Initial datasets, SVG avatar generator & LocalStorage API
└── README.md         # Comprehensive project documentation
```

---

## 🔐 Demo Admin Access

To access the Admin Panel:
1. Click **"Admin Login"** in the top navigation bar.
2. Enter the demo credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Manage tournaments, update team points, set the MVP player, or view submitted squad registrations.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic tags, accessible structure, responsive viewport.
- **CSS3**: CSS Custom Properties (Variables), Glassmorphism backdrop filters, Flexbox, CSS Grid, Custom animations.
- **Vanilla JavaScript**: Modular architecture, LocalStorage synchronization, event delegation, search algorithms.
- **Google Fonts**: *Rajdhani* (Esports headers) & *Outfit* (Modern UI body text).
- **Font Awesome 6**: Vector icons.

---

© 2026 IDFC Esports. All Rights Reserved.
