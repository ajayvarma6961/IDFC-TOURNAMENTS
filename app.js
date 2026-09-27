/**
 * IDFC ESPORTS - CORE APPLICATION LOGIC
 * Handlers for UI rendering, LocalStorage interactions, Admin CRUD, Modals & Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial App Render
    initApp();
});

// App State
const AppState = {
    currentSection: 'home',
    activeTourneyFilter: 'ALL',
    activeMatchFilter: 'LIVE',
    leaderboardSortKey: 'points',
    leaderboardSearch: '',
    isAdminLoggedIn: false,
    activeAdminTab: 'dash'
};

function initApp() {
    IDFCStorage.init();
    checkAdminAuth();
    startHeroCountdown();
    renderAllPublicViews();
    setupGlobalEventListeners();
    setupHeaderScrollListener();
}

function checkAdminAuth() {
    const auth = IDFCStorage.get(STORAGE_KEYS.ADMIN_SESSION);
    if (auth && auth.isLoggedIn) {
        AppState.isAdminLoggedIn = true;
        updateAdminNavUI(true);
    }
}

function updateAdminNavUI(isLoggedIn) {
    const btn = document.getElementById('adminLoginBtn');
    if (btn) {
        if (isLoggedIn) {
            btn.innerHTML = `<i class="fa-solid fa-user-gear"></i> Admin Dashboard`;
            btn.onclick = () => switchSection('admin');
        } else {
            btn.innerHTML = `<i class="fa-solid fa-user-shield"></i> Admin Login`;
            btn.onclick = () => openAdminModal();
        }
    }
}

function renderAllPublicViews() {
    renderHeroCard();
    renderMVP();
    renderTournaments(AppState.activeTourneyFilter);
    renderLeaderboard(AppState.leaderboardSortKey, AppState.leaderboardSearch);
    renderPlayers();
    renderTeams();
    renderMatches(AppState.activeMatchFilter);
    renderPrizes();
    renderNews();
}

function setupHeaderScrollListener() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// -------------------------------------------------------------
// NAVIGATION & SECTION SWITCHING
// -------------------------------------------------------------
function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.style.display = 'none');

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        AppState.currentSection = sectionId;
    }

    // Special handling for admin section
    if (sectionId === 'admin') {
        if (!AppState.isAdminLoggedIn) {
            openAdminModal();
            return;
        } else {
            renderAdminView();
        }
    }

    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    // Close mobile nav if open
    document.getElementById('navMenu')?.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileNav() {
    const menu = document.getElementById('navMenu');
    menu?.classList.toggle('active');
}

// -------------------------------------------------------------
// 1. HERO COUNTDOWN TIMER
// -------------------------------------------------------------
function startHeroCountdown() {
    // Target 4 hours into future for demo countdown
    let targetTime = new Date().getTime() + (2 * 3600 + 45 * 60 + 18) * 1000;

    function updateCd() {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
            targetTime = new Date().getTime() + 86400 * 1000; // Reset for demo
        }

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const hEl = document.getElementById('cd-hours');
        const mEl = document.getElementById('cd-mins');
        const sEl = document.getElementById('cd-secs');

        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(mins).padStart(2, '0');
        if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    updateCd();
    setInterval(updateCd, 1000);
}

function renderHeroCard() {
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const liveTourney = tournaments.find(t => t.status === 'LIVE') || tournaments[0];
    if (liveTourney) {
        document.getElementById('heroTourneyTitle').textContent = liveTourney.title;
        document.getElementById('heroPrizePool').textContent = Utils.formatCurrency(liveTourney.prizePool);
    }
}

// -------------------------------------------------------------
// 2. PLAYER OF THE TOURNAMENT (MVP SPOTLIGHT)
// -------------------------------------------------------------
function renderMVP() {
    const mvpId = IDFCStorage.get(STORAGE_KEYS.MVP_PLAYER_ID) || 'plr-1';
    const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
    const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);
    
    const mvpPlayer = players.find(p => p.id === mvpId) || players[0];
    const mvpTeam = teams.find(t => t.id === mvpPlayer?.teamId) || { name: mvpPlayer?.teamName || 'Esports Team' };

    const container = document.getElementById('mvpShowcaseCard');
    if (!container || !mvpPlayer) return;

    container.innerHTML = `
        <div class="mvp-badge-banner">
            <i class="fa-solid fa-crown"></i> OFFICIAL MVP
        </div>
        <div class="mvp-avatar-wrap">
            <img src="${mvpPlayer.avatar}" alt="${mvpPlayer.name}" onerror="this.src='${AvatarGenerator.playerAvatar(mvpPlayer.name, '#00E5FF')}'">
        </div>
        <div>
            <div class="mvp-player-name">${mvpPlayer.name}</div>
            <div class="mvp-team-subtitle">
                <i class="fa-solid fa-shield-halved"></i> ${mvpPlayer.teamName} • ${mvpPlayer.role || 'Pro Fragger'}
            </div>
            <div class="mvp-stats-grid">
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--primary);">${mvpPlayer.kills}</div>
                    <div class="mvp-stat-lbl">Total Kills</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${mvpPlayer.damage.toLocaleString()}</div>
                    <div class="mvp-stat-lbl">Damage Dealt</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--cyan-accent);">${mvpPlayer.headshotRate || '53.8'}%</div>
                    <div class="mvp-stat-lbl">Headshot Rate</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${mvpPlayer.booyahs || 15}</div>
                    <div class="mvp-stat-lbl">Booyahs</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--gold);">${mvpPlayer.mvpPoints}</div>
                    <div class="mvp-stat-lbl">MVP Points</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${mvpPlayer.matches}</div>
                    <div class="mvp-stat-lbl">Matches Played</div>
                </div>
            </div>
            <button class="btn-primary" onclick="openPlayerModal('${mvpPlayer.id}')">
                VIEW PLAYER PROFILE <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// -------------------------------------------------------------
// 3. TOURNAMENTS RENDER & FILTERS
// -------------------------------------------------------------
function filterTournaments(status, btn) {
    AppState.activeTourneyFilter = status;
    const parent = btn.parentElement;
    parent.querySelectorAll('.match-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTournaments(status);
}

function renderTournaments(filter = 'ALL') {
    const grid = document.getElementById('tournamentsGrid');
    if (!grid) return;

    let tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);

    if (filter !== 'ALL') {
        tournaments = tournaments.filter(t => t.status === filter);
    }

    if (tournaments.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No ${filter.toLowerCase()} tournaments available at present.</div>`;
        return;
    }

    grid.innerHTML = tournaments.map(t => {
        const percentFilled = Math.min(100, Math.round(((t.teamsCount || 0) / (t.totalSlots || 24)) * 100));

        return `
            <div class="tournament-card">
                <img src="${t.banner}" class="tournament-banner-img" alt="${t.title}" onerror="this.src='${AvatarGenerator.tournamentBanner(t.title)}'">
                <div class="tournament-body">
                    <div class="tournament-header-meta">
                        <span class="badge-status ${t.status.toLowerCase()}">${t.status}</span>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${Utils.formatDate(t.startDate)}</span>
                    </div>
                    <h3 class="tournament-card-title">${t.title}</h3>
                    
                    <div class="tournament-progress-wrap">
                        <div style="display:flex; justify-content:space-between; font-size: 0.85rem; color: var(--text-muted);">
                            <span>Registered Squads</span>
                            <span style="color: #fff; font-weight:700;">${t.teamsCount} / ${t.totalSlots} (${percentFilled}%)</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${percentFilled}%;"></div>
                        </div>
                    </div>

                    <div class="tournament-info-list">
                        <div class="tournament-info-item">
                            <span>Prize Pool:</span>
                            <span style="color: var(--gold); font-weight: 800; font-family: var(--font-heading); font-size: 1.1rem;">${Utils.formatCurrency(t.prizePool)}</span>
                        </div>
                        <div class="tournament-info-item">
                            <span>Entry Fee:</span>
                            <span>${t.entryFee || 'FREE'}</span>
                        </div>
                        <div class="tournament-info-item">
                            <span>Mode:</span>
                            <span>${t.gameMode}</span>
                        </div>
                    </div>
                    <div class="tournament-actions">
                        <button class="btn-card-primary" onclick="openRegistrationModal('${t.id}')" ${!t.registrationOpen ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            ${t.registrationOpen ? 'Register Now' : (t.status === 'COMPLETED' ? 'Completed' : 'Registration Closed')}
                        </button>
                        <button class="btn-card-secondary" onclick="openTournamentDetailModal('${t.id}')">Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 4. LEADERBOARD RENDER & SORT (PODIUM + TABLE)
// -------------------------------------------------------------
function sortLeaderboard(key) {
    AppState.leaderboardSortKey = key;
    renderLeaderboard(key, AppState.leaderboardSearch);
}

function handleLeaderboardSearch(query) {
    AppState.leaderboardSearch = query;
    renderLeaderboard(AppState.leaderboardSortKey, query);
}

function renderLeaderboard(sortKey = 'points', searchQuery = '') {
    const tbody = document.getElementById('leaderboardTableBody');
    const podiumContainer = document.getElementById('leaderboardPodiumContainer');
    if (!tbody) return;

    let teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);

    // Apply Search Filter
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        teams = teams.filter(t => t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q));
    }

    // Apply Sorting
    teams.sort((a, b) => {
        if (sortKey === 'points') return b.points - a.points;
        if (sortKey === 'kills') return b.kills - a.kills;
        if (sortKey === 'booyahs') return b.booyahs - a.booyahs;
        return 0;
    });

    // Render Podium Cards if search is empty and teams >= 3
    if (podiumContainer) {
        if (searchQuery.trim() === '' && teams.length >= 3) {
            const first = teams[0];
            const second = teams[1];
            const third = teams[2];

            podiumContainer.innerHTML = `
                <div class="podium-grid">
                    <!-- 2nd Place -->
                    <div class="podium-card second">
                        <div class="podium-badge">2</div>
                        <img src="${second.logo}" class="podium-logo" alt="${second.name}" onerror="this.src='${AvatarGenerator.teamLogo(second.name)}'">
                        <div class="podium-team-name">${second.name}</div>
                        <div style="font-size:0.85rem; color: var(--text-muted);">Booyahs: ${second.booyahs} | Kills: ${second.kills}</div>
                        <div class="podium-pts">${second.points} PTS</div>
                    </div>

                    <!-- 1st Place -->
                    <div class="podium-card first">
                        <div class="podium-badge">🏆 1</div>
                        <img src="${first.logo}" class="podium-logo" style="width:90px; height:90px;" alt="${first.name}" onerror="this.src='${AvatarGenerator.teamLogo(first.name)}'">
                        <div class="podium-team-name" style="font-size:1.8rem;">${first.name}</div>
                        <div style="font-size:0.9rem; color: var(--secondary); font-weight:700;">CHAMPION LEADER</div>
                        <div style="font-size:0.85rem; color: var(--text-muted); margin-top:4px;">Booyahs: ${first.booyahs} | Kills: ${first.kills}</div>
                        <div class="podium-pts" style="font-size:2.4rem; color: var(--gold);">${first.points} PTS</div>
                    </div>

                    <!-- 3rd Place -->
                    <div class="podium-card third">
                        <div class="podium-badge">3</div>
                        <img src="${third.logo}" class="podium-logo" alt="${third.name}" onerror="this.src='${AvatarGenerator.teamLogo(third.name)}'">
                        <div class="podium-team-name">${third.name}</div>
                        <div style="font-size:0.85rem; color: var(--text-muted);">Booyahs: ${third.booyahs} | Kills: ${third.kills}</div>
                        <div class="podium-pts">${third.points} PTS</div>
                    </div>
                </div>
            `;
        } else {
            podiumContainer.innerHTML = '';
        }
    }

    if (teams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">No teams match search query.</td></tr>`;
        return;
    }

    // Render table rows (starts from rank 1 if searching, else from rank 4 if podium shown)
    const displayTeams = (searchQuery.trim() === '' && teams.length >= 3) ? teams.slice(3) : teams;

    tbody.innerHTML = displayTeams.map((t, idx) => {
        const rank = (searchQuery.trim() === '' && teams.length >= 3) ? idx + 4 : idx + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';

        const placementPts = t.points - t.kills;

        return `
            <tr>
                <td><div class="rank-pill ${rankClass}">${rank}</div></td>
                <td>
                    <div class="team-cell">
                        <img src="${t.logo}" class="team-logo-small" alt="${t.name}" onerror="this.src='${AvatarGenerator.teamLogo(t.name)}'">
                        <div>
                            <div>${t.name} (${t.short})</div>
                            <div style="font-size:0.75rem; color: var(--text-muted); font-weight:normal;">Captain: ${t.captain}</div>
                        </div>
                    </div>
                </td>
                <td>${t.matches}</td>
                <td style="color: var(--secondary); font-weight:700;">${t.booyahs}</td>
                <td>${t.kills}</td>
                <td>${placementPts > 0 ? placementPts : 0}</td>
                <td>${t.kills}</td>
                <td><span class="pts-highlight">${t.points}</span></td>
            </tr>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 5. PLAYER RANKINGS
// -------------------------------------------------------------
function renderPlayers() {
    const tbody = document.getElementById('playersTableBody');
    if (!tbody) return;

    let players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
    players.sort((a, b) => b.mvpPoints - a.mvpPoints);

    tbody.innerHTML = players.map((p, idx) => {
        const rank = idx + 1;
        let rankClass = rank <= 3 ? (rank === 1 ? 'gold' : (rank === 2 ? 'silver' : 'bronze')) : '';

        return `
            <tr>
                <td><div class="rank-pill ${rankClass}">${rank}</div></td>
                <td>
                    <div class="team-cell">
                        <img src="${p.avatar}" class="team-logo-small" style="border-radius:50%;" alt="${p.name}" onerror="this.src='${AvatarGenerator.playerAvatar(p.name)}'">
                        <div>
                            <div style="font-weight:700;">${p.name}</div>
                            <div style="font-size:0.75rem; color: var(--text-muted); font-weight:normal;">${p.role || 'Pro Player'}</div>
                        </div>
                    </div>
                </td>
                <td>${p.teamName}</td>
                <td style="font-weight:800; color: var(--primary);">${p.kills}</td>
                <td>${p.damage.toLocaleString()}</td>
                <td>${p.headshotRate || 50}%</td>
                <td>${p.booyahs || 0}</td>
                <td><span style="font-family: var(--font-display); font-weight:900; font-size:1.1rem; color: var(--gold);">${p.mvpPoints}</span></td>
                <td>
                    <button class="btn-xs btn-edit" onclick="openPlayerModal('${p.id}')"><i class="fa-solid fa-eye"></i> Profile</button>
                </td>
            </tr>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 6. TEAMS SHOWCASE
// -------------------------------------------------------------
function renderTeams() {
    const grid = document.getElementById('teamsGrid');
    if (!grid) return;

    const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);

    grid.innerHTML = teams.map(t => `
        <div class="team-card">
            <img src="${t.logo}" class="team-card-logo" alt="${t.name}" onerror="this.src='${AvatarGenerator.teamLogo(t.name)}'">
            <div class="team-card-name">${t.name}</div>
            <div class="team-card-captain"><i class="fa-solid fa-user-ninja"></i> Captain: ${t.captain}</div>
            <div class="team-card-stats">
                <div class="team-stat-item">
                    <div>${t.matches}</div>
                    <div>Matches</div>
                </div>
                <div class="team-stat-item">
                    <div style="color: var(--secondary);">${t.booyahs}</div>
                    <div>Wins</div>
                </div>
                <div class="team-stat-item">
                    <div style="color: var(--primary);">${t.points}</div>
                    <div>Points</div>
                </div>
            </div>
            <button class="btn-card-secondary" style="width:100%;" onclick="openTeamModal('${t.id}')">
                VIEW TEAM ROSTER <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `).join('');
}

// -------------------------------------------------------------
// 7. MATCHES SECTION
// -------------------------------------------------------------
function filterMatches(status, btn) {
    AppState.activeMatchFilter = status;
    const parent = btn.parentElement;
    parent.querySelectorAll('.match-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMatches(status);
}

function renderMatches(filter = 'LIVE') {
    const grid = document.getElementById('matchesGrid');
    if (!grid) return;

    let matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
    matches = matches.filter(m => m.status === filter);

    if (matches.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No ${filter.toLowerCase()} matches found.</div>`;
        return;
    }

    grid.innerHTML = matches.map(m => `
        <div class="match-card">
            <div class="match-top-meta">
                <span class="match-map-tag"><i class="fa-solid fa-map-location-dot"></i> ${m.map}</span>
                <span class="badge-status ${m.status.toLowerCase()}">${m.status}</span>
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 4px; color: #fff;">${m.matchNo}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 18px;">${m.tournament} • ${m.time}</div>
            
            ${m.status === 'COMPLETED' ? `
                <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0,240,255,0.25); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 12px;">
                    <div style="font-size: 0.8rem; color: var(--cyan-accent); font-weight: 800; text-transform: uppercase;">BOOYAH WINNER</div>
                    <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">🏆 ${m.winner}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Kills: ${m.kills} | Total Points: ${m.totalPts}</div>
                </div>
            ` : `
                <div style="font-size: 0.95rem; margin-bottom: 18px;">
                    <span style="color: var(--text-muted);">Participating Squads:</span>
                    <div style="font-weight: 700; color: #fff; margin-top: 4px;">${m.teams ? m.teams.join(' vs ') : 'Qualified Squads'}</div>
                </div>
            `}
        </div>
    `).join('');
}

// -------------------------------------------------------------
// 8. PRIZES BREAKDOWN
// -------------------------------------------------------------
function renderPrizes() {
    const grid = document.getElementById('prizesGrid');
    if (!grid) return;

    const prizes = IDFCStorage.get(STORAGE_KEYS.PRIZES);

    grid.innerHTML = prizes.map((p, idx) => {
        let cardClass = '';
        if (idx === 0) cardClass = 'gold-card';
        else if (idx === 1) cardClass = 'silver-card';
        else if (idx === 2) cardClass = 'bronze-card';

        return `
            <div class="prize-card ${cardClass}">
                <div class="prize-rank-badge">${p.badge}</div>
                <div class="prize-amount">${Utils.formatCurrency(p.amount)}</div>
                <div class="prize-title">${p.title}</div>
                <div class="prize-perk">${p.perk}</div>
            </div>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 9. EDITORIAL NEWS SECTION (FEATURED ARTICLE + GRID)
// -------------------------------------------------------------
function renderNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    const newsList = IDFCStorage.get(STORAGE_KEYS.NEWS);
    if (newsList.length === 0) return;

    const featured = newsList[0];
    const rest = newsList.slice(1);

    let html = `
        <!-- FEATURED BIG ARTICLE -->
        <div class="news-card" style="grid-column: 1 / -1; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 0; align-items: center; background: linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(16, 21, 32, 0.95)); border-color: rgba(0, 240, 255, 0.3);">
            <img src="${featured.image}" class="news-img" style="height: 100%; min-height: 280px; object-fit: cover;" alt="${featured.title}" onerror="this.src='${AvatarGenerator.newsBanner(featured.title)}'">
            <div class="news-body" style="padding: 36px;">
                <div style="display:inline-block; background: var(--btn-gradient); color:#fff; font-family: var(--font-heading); font-weight:800; font-size:0.75rem; padding: 4px 12px; border-radius:4px; margin-bottom:12px; letter-spacing:1px;">FEATURED STORY</div>
                <div class="news-date"><i class="fa-solid fa-calendar-days"></i> ${Utils.formatDate(featured.date)} • ${featured.category}</div>
                <h2 class="news-title" style="font-size: 2rem; margin-bottom: 14px;">${featured.title}</h2>
                <p class="news-desc" style="font-size: 1.05rem; margin-bottom: 24px;">${featured.summary}</p>
                <button class="btn-primary" onclick="openNewsModal('${featured.id}')">
                    READ FEATURED STORY <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    html += rest.map(n => `
        <div class="news-card">
            <img src="${n.image}" class="news-img" alt="${n.title}" onerror="this.src='${AvatarGenerator.newsBanner(n.title)}'">
            <div class="news-body">
                <div class="news-date"><i class="fa-solid fa-calendar-days"></i> ${Utils.formatDate(n.date)} • ${n.category}</div>
                <h3 class="news-title">${n.title}</h3>
                <p class="news-desc">${n.summary}</p>
                <button class="btn-card-secondary" style="width:100%;" onclick="openNewsModal('${n.id}')">
                    READ ARTICLE <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `).join('');

    grid.innerHTML = html;
}

// -------------------------------------------------------------
// MODALS SYSTEM (OPEN, CLOSE, CONTENT POPULATION)
// -------------------------------------------------------------
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function setupGlobalEventListeners() {
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // Close modal on outside click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
}

// 1. Tournament Registration Modal
function openRegistrationModal(tournamentId) {
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const tourney = tournaments.find(t => t.id === tournamentId) || tournaments[0];

    document.getElementById('regTournamentId').value = tourney.id;
    document.getElementById('regTournamentTitle').value = tourney.title;
    openModal('regModal');
}

function handleRegistrationSubmit(e) {
    e.preventDefault();
    const tourneyId = document.getElementById('regTournamentId').value;
    const tourneyTitle = document.getElementById('regTournamentTitle').value;

    const regData = {
        id: Utils.generateId('reg'),
        tournamentId: tourneyId,
        tournamentTitle: tourneyTitle,
        teamName: document.getElementById('regTeamName').value,
        captainName: document.getElementById('regCaptainName').value,
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value,
        player1: document.getElementById('regPlayer1').value,
        player2: document.getElementById('regPlayer2').value,
        player3: document.getElementById('regPlayer3').value,
        player4: document.getElementById('regPlayer4').value,
        substitute: document.getElementById('regSub').value || 'N/A',
        date: new Date().toLocaleString(),
        status: 'PENDING'
    };

    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    regs.unshift(regData);
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);

    // Increment registered teams count in tournament
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const t = tournaments.find(item => item.id === tourneyId);
    if (t) {
        t.teamsCount = (t.teamsCount || 0) + 1;
        IDFCStorage.set(STORAGE_KEYS.TOURNAMENTS, tournaments);
        renderTournaments(AppState.activeTourneyFilter);
    }

    closeModal('regModal');
    document.getElementById('registrationForm').reset();
    showToast('Registration submitted successfully! Our tournament official will contact you shortly.', 'success');
}

// 2. Detail View Modals (Player, Team, Tournament, News)
function openPlayerModal(playerId) {
    const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-user-ninja"></i> ${player.name} Profile`;
    document.getElementById('detailModalBody').innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <img src="${player.avatar}" style="width: 130px; height: 130px; border-radius: 50%; border: 3px solid var(--primary);" alt="${player.name}">
            <h3 style="font-family: var(--font-display); font-size: 2.2rem; margin-top: 10px; color: #fff;">${player.name}</h3>
            <div style="color: var(--secondary); font-weight: 700;">${player.teamName} • ${player.role || 'Pro Player'}</div>
        </div>
        <div class="mvp-stats-grid">
            <div class="mvp-stat-card"><div class="mvp-stat-val" style="color: var(--primary);">${player.kills}</div><div class="mvp-stat-lbl">Kills</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val">${player.damage.toLocaleString()}</div><div class="mvp-stat-lbl">Damage</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val" style="color: var(--cyan-accent);">${player.headshotRate || 50}%</div><div class="mvp-stat-lbl">Headshot Rate</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val">${player.booyahs || 0}</div><div class="mvp-stat-lbl">Booyahs</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val" style="color: var(--gold);">${player.mvpPoints}</div><div class="mvp-stat-lbl">MVP Points</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val">${player.matches}</div><div class="mvp-stat-lbl">Matches</div></div>
        </div>
    `;
    openModal('detailModal');
}

function openTeamModal(teamId) {
    const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);
    const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const teamPlayers = players.filter(p => p.teamId === team.id || p.teamName === team.name);

    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${team.name}`;
    document.getElementById('detailModalBody').innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <img src="${team.logo}" style="width: 105px; height: 105px;" alt="${team.name}">
            <h3 style="font-family: var(--font-heading); font-size: 2.2rem; margin-top: 8px; color: #fff;">${team.name} (${team.short})</h3>
            <div style="color: var(--secondary); font-weight:700;">Country: ${team.country} ${team.flag || ''} | Captain: ${team.captain}</div>
        </div>
        <h4 style="font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 14px; color: var(--primary); letter-spacing: 1px;">ACTIVE SQUAD ROSTER</h4>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
            ${teamPlayers.length > 0 ? teamPlayers.map(p => `
                <div style="background: rgba(255,255,255,0.04); padding: 12px 18px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${p.avatar}" style="width:34px; height:34px; border-radius:50%;">
                        <strong style="color:#fff;">${p.name}</strong> <span style="font-size:0.85rem; color: var(--text-muted);">(${p.role})</span>
                    </div>
                    <div style="color: var(--gold); font-weight:800; font-family: var(--font-heading);">${p.kills} Kills</div>
                </div>
            `).join('') : '<div style="color: var(--text-muted);">Standard Pro Roster</div>'}
        </div>
    `;
    openModal('detailModal');
}

function openTournamentDetailModal(tId) {
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const t = tournaments.find(item => item.id === tId);
    if (!t) return;

    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-trophy"></i> ${t.title}`;
    document.getElementById('detailModalBody').innerHTML = `
        <img src="${t.banner}" style="width:100%; border-radius: var(--radius-sm); margin-bottom: 18px;">
        <p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 24px; font-size: 1.05rem;">${t.description}</p>
        <div class="mvp-stats-grid">
            <div class="mvp-stat-card"><div class="mvp-stat-val" style="color: var(--gold);">${Utils.formatCurrency(t.prizePool)}</div><div class="mvp-stat-lbl">Prize Pool</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val">${t.teamsCount} / ${t.totalSlots}</div><div class="mvp-stat-lbl">Teams</div></div>
            <div class="mvp-stat-card"><div class="mvp-stat-val" style="font-size:1.1rem; margin-top:4px;">${t.gameMode}</div><div class="mvp-stat-lbl">Game Mode</div></div>
        </div>
    `;
    openModal('detailModal');
}

function openNewsModal(newsId) {
    const newsList = IDFCStorage.get(STORAGE_KEYS.NEWS);
    const n = newsList.find(item => item.id === newsId);
    if (!n) return;

    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-newspaper"></i> ${n.category}`;
    document.getElementById('detailModalBody').innerHTML = `
        <img src="${n.image}" style="width:100%; border-radius: var(--radius-sm); margin-bottom: 18px;">
        <h3 style="font-family: var(--font-heading); font-size: 2rem; margin-bottom: 10px; color: #fff;">${n.title}</h3>
        <div style="font-size: 0.9rem; color: var(--cyan-accent); margin-bottom: 18px; font-weight: 700;">${Utils.formatDate(n.date)}</div>
        <p style="color: var(--text-primary); line-height: 1.8; font-size: 1.1rem;">${n.content}</p>
    `;
    openModal('detailModal');
}

// -------------------------------------------------------------
// GLOBAL SEARCH SYSTEM
// -------------------------------------------------------------
function openSearchModal() {
    openModal('searchModal');
    document.getElementById('globalSearchInput').focus();
}

function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('globalSearchResults');
    if (!query || query.trim().length < 2) {
        resultsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Type at least 2 characters to search...</p>`;
        return;
    }

    const q = query.toLowerCase();

    const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS).filter(t => t.name.toLowerCase().includes(q));
    const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS).filter(p => p.name.toLowerCase().includes(q));
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS).filter(t => t.title.toLowerCase().includes(q));
    const news = IDFCStorage.get(STORAGE_KEYS.NEWS).filter(n => n.title.toLowerCase().includes(q));

    let html = '';

    if (tournaments.length > 0) {
        html += `<h4 style="color: var(--primary); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">TOURNAMENTS (${tournaments.length})</h4>`;
        tournaments.forEach(t => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); openTournamentDetailModal('${t.id}')">🏆 ${t.title} (${t.status})</div>`;
        });
    }

    if (teams.length > 0) {
        html += `<h4 style="color: var(--secondary); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">TEAMS (${teams.length})</h4>`;
        teams.forEach(t => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); openTeamModal('${t.id}')">🛡️ ${t.name} (Captain: ${t.captain})</div>`;
        });
    }

    if (players.length > 0) {
        html += `<h4 style="color: var(--cyan-accent); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">PLAYERS (${players.length})</h4>`;
        players.forEach(p => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); openPlayerModal('${p.id}')">👤 ${p.name} (${p.teamName})</div>`;
        });
    }

    if (news.length > 0) {
        html += `<h4 style="color: var(--gold); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">NEWS ARTICLES (${news.length})</h4>`;
        news.forEach(n => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); openNewsModal('${n.id}')">📰 ${n.title}</div>`;
        });
    }

    if (!html) {
        html = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No matching results found for "${query}".</p>`;
    }

    resultsContainer.innerHTML = html;
}

// -------------------------------------------------------------
// ADMIN SYSTEM & CRUD OPERATIONS
// -------------------------------------------------------------
function openAdminModal() {
    if (AppState.isAdminLoggedIn) {
        switchSection('admin');
    } else {
        openModal('adminLoginModal');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;

    if (user === 'admin' && pass === 'admin123') {
        AppState.isAdminLoggedIn = true;
        IDFCStorage.set(STORAGE_KEYS.ADMIN_SESSION, { isLoggedIn: true, username: 'admin' });
        updateAdminNavUI(true);
        closeModal('adminLoginModal');
        switchSection('admin');
        showToast('Admin Authentication Successful!', 'success');
    } else {
        showToast('Invalid admin credentials. Please use admin / admin123', 'error');
    }
}

function adminLogout() {
    AppState.isAdminLoggedIn = false;
    IDFCStorage.set(STORAGE_KEYS.ADMIN_SESSION, { isLoggedIn: false });
    updateAdminNavUI(false);
    switchSection('home');
    showToast('Logged out of Admin Panel.', 'info');
}

function switchAdminTab(tabKey, btnElement) {
    AppState.activeAdminTab = tabKey;
    if (btnElement) {
        const parent = btnElement.parentElement;
        parent.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
        btnElement.classList.add('active');
    }
    renderAdminView();
}

function renderAdminView() {
    const mainView = document.getElementById('adminMainView');
    if (!mainView) return;

    const tab = AppState.activeAdminTab;

    if (tab === 'dash') {
        const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
        const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);
        const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
        const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
        const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);

        mainView.innerHTML = `
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-trophy"></i></div>
                    <div>
                        <div class="admin-stat-num">${tournaments.length}</div>
                        <div class="admin-stat-lbl">Total Tournaments</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-shield-halved"></i></div>
                    <div>
                        <div class="admin-stat-num">${teams.length}</div>
                        <div class="admin-stat-lbl">Active Teams</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-user-ninja"></i></div>
                    <div>
                        <div class="admin-stat-num">${players.length}</div>
                        <div class="admin-stat-lbl">Registered Players</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-crosshairs"></i></div>
                    <div>
                        <div class="admin-stat-num">${matches.length}</div>
                        <div class="admin-stat-lbl">Total Matches</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color: var(--gold);">${regs.length}</div>
                        <div class="admin-stat-lbl">Submitted Registrations</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
                    <h4 style="font-family: var(--font-heading); color: var(--primary); font-size: 1.2rem; margin-bottom: 12px;"><i class="fa-solid fa-clock-rotate-left"></i> Recent Squad Registrations</h4>
                    ${regs.length > 0 ? regs.slice(0, 4).map(r => `
                        <div style="font-size: 0.85rem; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between;">
                            <span><strong>${r.teamName}</strong> (${r.captainName})</span>
                            <span style="color: var(--text-muted);">${r.date}</span>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No registrations yet.</div>'}
                </div>

                <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
                    <h4 style="font-family: var(--font-heading); color: var(--cyan-accent); font-size: 1.2rem; margin-bottom: 12px;"><i class="fa-solid fa-crosshairs"></i> Match Overview</h4>
                    ${matches.length > 0 ? matches.slice(0, 4).map(m => `
                        <div style="font-size: 0.85rem; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between;">
                            <span><strong>${m.matchNo}</strong> (${m.map})</span>
                            <span class="badge-status ${m.status.toLowerCase()}" style="font-size: 0.7rem; padding: 2px 6px;">${m.status}</span>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No matches found.</div>'}
                </div>
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 18px; color:#fff;">Quick Admin Actions</h3>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button class="btn-primary" onclick="adminCreateEntity('tournaments')"><i class="fa-solid fa-plus"></i> Add Tournament</button>
                <button class="btn-primary" onclick="adminCreateEntity('teams')"><i class="fa-solid fa-plus"></i> Add Team</button>
                <button class="btn-primary" onclick="adminCreateEntity('players')"><i class="fa-solid fa-plus"></i> Add Player</button>
                <button class="btn-primary" onclick="adminCreateEntity('news')"><i class="fa-solid fa-plus"></i> Post News</button>
            </div>
        `;
    } else if (tab === 'tournaments') {
        const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage Tournaments</h3>
                <button class="btn-primary" onclick="adminCreateEntity('tournaments')"><i class="fa-solid fa-plus"></i> Add Tournament</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Title</th><th>Status</th><th>Prize Pool</th><th>Teams</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${tournaments.map(t => `
                            <tr>
                                <td><strong>${t.title}</strong></td>
                                <td><span class="badge-status ${t.status.toLowerCase()}">${t.status}</span></td>
                                <td style="color: var(--gold);">${Utils.formatCurrency(t.prizePool)}</td>
                                <td>${t.teamsCount} / ${t.totalSlots}</td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('tournaments', '${t.id}')">Edit</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('tournaments', '${t.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'teams') {
        const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);
        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage Teams</h3>
                <button class="btn-primary" onclick="adminCreateEntity('teams')"><i class="fa-solid fa-plus"></i> Add Team</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Team Name</th><th>Captain</th><th>Matches</th><th>Booyahs</th><th>Points</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${teams.map(t => `
                            <tr>
                                <td><strong>${t.name} (${t.short})</strong></td>
                                <td>${t.captain}</td>
                                <td>${t.matches}</td>
                                <td style="color: var(--secondary);">${t.booyahs}</td>
                                <td style="color: var(--primary); font-weight:700;">${t.points}</td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('teams', '${t.id}')">Edit</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('teams', '${t.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'players') {
        const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage Players</h3>
                <button class="btn-primary" onclick="adminCreateEntity('players')"><i class="fa-solid fa-plus"></i> Add Player</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Player Name</th><th>Team</th><th>Kills</th><th>Damage</th><th>MVP Pts</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${players.map(p => `
                            <tr>
                                <td><strong>${p.name}</strong></td>
                                <td>${p.teamName}</td>
                                <td>${p.kills}</td>
                                <td>${p.damage}</td>
                                <td style="color: var(--gold); font-weight:700;">${p.mvpPoints}</td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('players', '${p.id}')">Edit</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('players', '${p.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'matches') {
        const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage Matches</h3>
                <button class="btn-primary" onclick="adminCreateEntity('matches')"><i class="fa-solid fa-plus"></i> Add Match</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Match No</th><th>Map</th><th>Status</th><th>Winner</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${matches.map(m => `
                            <tr>
                                <td><strong>${m.matchNo}</strong></td>
                                <td>${m.map}</td>
                                <td><span class="badge-status ${m.status.toLowerCase()}">${m.status}</span></td>
                                <td>${m.winner || 'N/A'}</td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('matches', '${m.id}')">Edit</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('matches', '${m.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'mvp') {
        const players = IDFCStorage.get(STORAGE_KEYS.PLAYERS);
        const currentMvpId = IDFCStorage.get(STORAGE_KEYS.MVP_PLAYER_ID);
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Select Player of the Tournament</h3>
            <div class="form-group">
                <label class="form-label">Choose MVP Player</label>
                <select id="mvpSelectBox" class="form-control" style="max-width: 420px; margin-bottom: 22px;">
                    ${players.map(p => `
                        <option value="${p.id}" ${p.id === currentMvpId ? 'selected' : ''}>${p.name} (${p.teamName} - ${p.kills} Kills / ${p.mvpPoints} MVP Pts)</option>
                    `).join('')}
                </select>
                <button class="btn-primary" onclick="saveAdminMVP()"><i class="fa-solid fa-crown"></i> Set as Player of Tournament</button>
            </div>
        `;
    } else if (tab === 'prizes') {
        const prizes = IDFCStorage.get(STORAGE_KEYS.PRIZES);
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Edit Prize Pool Amounts</h3>
            <div style="display: flex; flex-direction: column; gap: 18px; max-width: 520px;">
                ${prizes.map((p, idx) => `
                    <div class="form-group">
                        <label class="form-label">${p.rank} - ${p.title}</label>
                        <input type="number" id="prize_val_${idx}" class="form-control" value="${p.amount}">
                    </div>
                `).join('')}
                <button class="btn-primary" onclick="saveAdminPrizes()"><i class="fa-solid fa-floppy-disk"></i> Save Prize Pool Changes</button>
            </div>
        `;
    } else if (tab === 'news') {
        const newsList = IDFCStorage.get(STORAGE_KEYS.NEWS);
        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage News & Announcements</h3>
                <button class="btn-primary" onclick="adminCreateEntity('news')"><i class="fa-solid fa-plus"></i> Post News</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Title</th><th>Category</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${newsList.map(n => `
                            <tr>
                                <td><strong>${n.title}</strong></td>
                                <td>${n.category}</td>
                                <td>${n.date}</td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('news', '${n.id}')">Edit</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('news', '${n.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'registrations') {
        const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Submitted Team Registrations</h3>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Team Name</th><th>Captain</th><th>Phone</th><th>Players</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        ${regs.map(r => `
                            <tr>
                                <td><strong>${r.teamName}</strong></td>
                                <td>${r.captainName}</td>
                                <td>${r.phone}</td>
                                <td style="font-size: 0.85rem;">${r.player1}, ${r.player2}</td>
                                <td>${r.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Save MVP Selection
function saveAdminMVP() {
    const selectedId = document.getElementById('mvpSelectBox').value;
    IDFCStorage.set(STORAGE_KEYS.MVP_PLAYER_ID, selectedId);
    renderMVP();
    renderPlayers();
    showToast('Player of the Tournament updated successfully!', 'success');
}

// Save Prize Amounts
function saveAdminPrizes() {
    const prizes = IDFCStorage.get(STORAGE_KEYS.PRIZES);
    prizes.forEach((p, idx) => {
        const input = document.getElementById(`prize_val_${idx}`);
        if (input) p.amount = parseInt(input.value) || 0;
    });
    IDFCStorage.set(STORAGE_KEYS.PRIZES, prizes);
    renderPrizes();
    showToast('Prize Pool amounts updated!', 'success');
}

// Admin Delete Entity
function adminDeleteEntity(entityKey, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    let items = IDFCStorage.get(entityKey);
    items = items.filter(i => i.id !== id);
    IDFCStorage.set(entityKey, items);
    renderAllPublicViews();
    renderAdminView();
    showToast('Item deleted successfully.', 'info');
}

// Admin Create / Edit Modal Form Generator
function adminCreateEntity(entityKey) {
    adminRenderForm(entityKey, null);
}

function adminEditEntity(entityKey, id) {
    const items = IDFCStorage.get(entityKey);
    const item = items.find(i => i.id === id);
    if (item) adminRenderForm(entityKey, item);
}

function adminRenderForm(entityKey, item = null) {
    const isEdit = !!item;
    const modalTitle = document.getElementById('adminCrudModalTitle');
    const modalBody = document.getElementById('adminCrudModalBody');

    modalTitle.textContent = `${isEdit ? 'Edit' : 'Add New'} ${entityKey.slice(0, -1).toUpperCase()}`;

    let fields = '';
    if (entityKey === 'tournaments') {
        fields = `
            <div class="form-group"><label class="form-label">Tournament Title</label><input type="text" id="form_title" class="form-control" value="${item ? item.title : ''}" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Status</label><select id="form_status" class="form-control"><option value="LIVE" ${item && item.status==='LIVE'?'selected':''}>LIVE</option><option value="UPCOMING" ${item && item.status==='UPCOMING'?'selected':''}>UPCOMING</option><option value="COMPLETED" ${item && item.status==='COMPLETED'?'selected':''}>COMPLETED</option></select></div>
                <div class="form-group"><label class="form-label">Prize Pool (₹)</label><input type="number" id="form_prize" class="form-control" value="${item ? item.prizePool : 100000}" required></div>
            </div>
            <div class="form-group"><label class="form-label">Description</label><textarea id="form_desc" class="form-control" rows="3">${item ? item.description : ''}</textarea></div>
        `;
    } else if (entityKey === 'teams') {
        fields = `
            <div class="form-group"><label class="form-label">Team Name</label><input type="text" id="form_name" class="form-control" value="${item ? item.name : ''}" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Captain</label><input type="text" id="form_captain" class="form-control" value="${item ? item.captain : ''}" required></div>
                <div class="form-group"><label class="form-label">Total Points</label><input type="number" id="form_points" class="form-control" value="${item ? item.points : 0}"></div>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Matches</label><input type="number" id="form_matches" class="form-control" value="${item ? item.matches : 0}"></div>
                <div class="form-group"><label class="form-label">Kills</label><input type="number" id="form_kills" class="form-control" value="${item ? item.kills : 0}"></div>
            </div>
        `;
    } else if (entityKey === 'players') {
        fields = `
            <div class="form-group"><label class="form-label">Player Name</label><input type="text" id="form_name" class="form-control" value="${item ? item.name : ''}" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Team Name</label><input type="text" id="form_teamName" class="form-control" value="${item ? item.teamName : ''}"></div>
                <div class="form-group"><label class="form-label">Role</label><input type="text" id="form_role" class="form-control" value="${item ? item.role : 'Pro Player'}"></div>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Kills</label><input type="number" id="form_kills" class="form-control" value="${item ? item.kills : 0}"></div>
                <div class="form-group"><label class="form-label">MVP Points</label><input type="number" id="form_mvpPoints" class="form-control" value="${item ? item.mvpPoints : 0}"></div>
            </div>
        `;
    } else if (entityKey === 'news') {
        fields = `
            <div class="form-group"><label class="form-label">Title</label><input type="text" id="form_title" class="form-control" value="${item ? item.title : ''}" required></div>
            <div class="form-group"><label class="form-label">Category</label><input type="text" id="form_category" class="form-control" value="${item ? item.category : 'ANNOUNCEMENT'}"></div>
            <div class="form-group"><label class="form-label">Summary</label><textarea id="form_summary" class="form-control" rows="2">${item ? item.summary : ''}</textarea></div>
            <div class="form-group"><label class="form-label">Content</label><textarea id="form_content" class="form-control" rows="4">${item ? item.content : ''}</textarea></div>
        `;
    } else if (entityKey === 'matches') {
        fields = `
            <div class="form-group"><label class="form-label">Match Number / Name</label><input type="text" id="form_matchNo" class="form-control" value="${item ? item.matchNo : ''}" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Map</label><input type="text" id="form_map" class="form-control" value="${item ? item.map : 'Bermuda'}"></div>
                <div class="form-group"><label class="form-label">Status</label><select id="form_status" class="form-control"><option value="LIVE" ${item && item.status==='LIVE'?'selected':''}>LIVE</option><option value="UPCOMING" ${item && item.status==='UPCOMING'?'selected':''}>UPCOMING</option><option value="COMPLETED" ${item && item.status==='COMPLETED'?'selected':''}>COMPLETED</option></select></div>
            </div>
            <div class="form-group"><label class="form-label">Winner (If completed)</label><input type="text" id="form_winner" class="form-control" value="${item ? item.winner || '' : ''}"></div>
        `;
    }

    modalBody.innerHTML = `
        <form onsubmit="handleAdminFormSubmit(event, '${entityKey}', '${item ? item.id : ''}')">
            ${fields}
            <button type="submit" class="btn-primary" style="width:100%; margin-top:16px;">Save Changes</button>
        </form>
    `;

    openModal('adminCrudModal');
}

function handleAdminFormSubmit(e, entityKey, existingId) {
    e.preventDefault();
    let items = IDFCStorage.get(entityKey);

    if (entityKey === 'tournaments') {
        const newItem = {
            id: existingId || Utils.generateId('tourney'),
            title: document.getElementById('form_title').value,
            status: document.getElementById('form_status').value,
            prizePool: parseInt(document.getElementById('form_prize').value) || 0,
            teamsCount: 12,
            totalSlots: 24,
            startDate: new Date().toISOString().split('T')[0],
            gameMode: 'Squad Battle Royale',
            banner: AvatarGenerator.tournamentBanner(document.getElementById('form_title').value),
            description: document.getElementById('form_desc').value,
            registrationOpen: true
        };
        if (existingId) {
            items = items.map(i => i.id === existingId ? { ...i, ...newItem } : i);
        } else items.unshift(newItem);
    } else if (entityKey === 'teams') {
        const name = document.getElementById('form_name').value;
        const newItem = {
            id: existingId || Utils.generateId('team'),
            name: name,
            short: name.substring(0, 3).toUpperCase(),
            captain: document.getElementById('form_captain').value,
            points: parseInt(document.getElementById('form_points').value) || 0,
            matches: parseInt(document.getElementById('form_matches').value) || 0,
            kills: parseInt(document.getElementById('form_kills').value) || 0,
            booyahs: 5,
            country: 'India',
            logo: AvatarGenerator.teamLogo(name)
        };
        if (existingId) {
            items = items.map(i => i.id === existingId ? { ...i, ...newItem } : i);
        } else items.unshift(newItem);
    } else if (entityKey === 'players') {
        const name = document.getElementById('form_name').value;
        const newItem = {
            id: existingId || Utils.generateId('plr'),
            name: name,
            teamName: document.getElementById('form_teamName').value,
            role: document.getElementById('form_role').value,
            kills: parseInt(document.getElementById('form_kills').value) || 0,
            damage: (parseInt(document.getElementById('form_kills').value) || 0) * 500,
            mvpPoints: parseInt(document.getElementById('form_mvpPoints').value) || 0,
            matches: 20,
            booyahs: 4,
            headshotRate: 50.0,
            avatar: AvatarGenerator.playerAvatar(name)
        };
        if (existingId) {
            items = items.map(i => i.id === existingId ? { ...i, ...newItem } : i);
        } else items.unshift(newItem);
    } else if (entityKey === 'news') {
        const title = document.getElementById('form_title').value;
        const newItem = {
            id: existingId || Utils.generateId('news'),
            title: title,
            category: document.getElementById('form_category').value,
            date: new Date().toISOString().split('T')[0],
            summary: document.getElementById('form_summary').value,
            content: document.getElementById('form_content').value,
            image: AvatarGenerator.newsBanner(title)
        };
        if (existingId) {
            items = items.map(i => i.id === existingId ? { ...i, ...newItem } : i);
        } else items.unshift(newItem);
    } else if (entityKey === 'matches') {
        const newItem = {
            id: existingId || Utils.generateId('match'),
            matchNo: document.getElementById('form_matchNo').value,
            map: document.getElementById('form_map').value,
            status: document.getElementById('form_status').value,
            winner: document.getElementById('form_winner').value || null,
            tournament: 'IDFC Battle Arena',
            time: '19:00 IST'
        };
        if (existingId) {
            items = items.map(i => i.id === existingId ? { ...i, ...newItem } : i);
        } else items.unshift(newItem);
    }

    IDFCStorage.set(entityKey, items);
    closeModal('adminCrudModal');
    renderAllPublicViews();
    renderAdminView();
    showToast(`${entityKey.slice(0, -1)} saved successfully!`, 'success');
}

// Reset Demo Data Handler
function resetDefaultsAdmin() {
    if (confirm('Are you sure you want to reset all platform data to initial demo state?')) {
        IDFCStorage.resetAll();
        renderAllPublicViews();
        renderAdminView();
        showToast('All demo data restored to factory defaults.', 'info');
    }
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS HELPER
// -------------------------------------------------------------
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    else if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
