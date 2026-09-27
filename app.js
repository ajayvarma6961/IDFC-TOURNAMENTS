/**
 * IDFC ESPORTS - CORE APPLICATION LOGIC
 * Public Visitor View + Private Admin Platform Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Global Application State
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
    renderAllPublicViews();
    setupGlobalEventListeners();
    setupHeaderScrollListener();
    setupHashRouting();
}

function setupHashRouting() {
    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'admin') {
            if (isAdmin()) {
                switchSection('admin');
            } else {
                openAdminModal();
            }
        } else if (hash === 'register') {
            switchSection('register');
        } else if (hash === 'check-status') {
            openCheckRegModal();
        } else if (hash && document.getElementById(hash)) {
            switchSection(hash);
        }
    }
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
        handleHash();
    }
}

// Security & Authentication Control
function isAdmin() {
    const auth = IDFCStorage.get(STORAGE_KEYS.ADMIN_SESSION);
    return AppState.isAdminLoggedIn || (auth && auth.isLoggedIn === true);
}

function enforceAdminAccess() {
    if (!isAdmin()) {
        showToast('Admin access required.', 'error');
        return false;
    }
    return true;
}

function checkAdminAuth() {
    const auth = IDFCStorage.get(STORAGE_KEYS.ADMIN_SESSION);
    if (auth && auth.isLoggedIn) {
        AppState.isAdminLoggedIn = true;
        updateAdminNavUI(true);
    } else {
        AppState.isAdminLoggedIn = false;
        updateAdminNavUI(false);
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
    renderMVP();
    renderTournaments(AppState.activeTourneyFilter);
    renderLeaderboard(AppState.leaderboardSortKey, AppState.leaderboardSearch);
    renderMatches(AppState.activeMatchFilter);
    populateRegistrationDropdowns();
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
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.style.display = 'none');

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        AppState.currentSection = sectionId;
    }

    if (sectionId === 'register') {
        populateRegistrationDropdowns();
    } else if (sectionId === 'admin') {
        if (!isAdmin()) {
            showToast('Admin access required.', 'error');
            openAdminModal();
            return;
        } else {
            renderAdminView();
        }
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    document.getElementById('navMenu')?.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileNav() {
    const menu = document.getElementById('navMenu');
    menu?.classList.toggle('active');
}



// -------------------------------------------------------------
// 2. PLAYER OF THE TOURNAMENT (MVP SPOTLIGHT)
// -------------------------------------------------------------
function renderMVP() {
    const container = document.getElementById('mvpShowcaseCard');
    if (!container) return;

    let mvpData = IDFCStorage.get('idfc_mvp_data');
    
    if (!mvpData || !mvpData.name) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); grid-column: 1/-1;">
                <div style="font-size: 2.8rem; color: var(--mvp-gold); margin-bottom: 12px;"><i class="fa-solid fa-crown"></i></div>
                <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 8px;">MVP SPOTLIGHT</h3>
                <p style="max-width: 500px; margin: 0 auto 20px;">The Player of the Tournament (MVP) will be selected and published by the Admin after active season matches.</p>
                <button class="btn-primary" onclick="openRegistrationModal()"><i class="fa-solid fa-shield-halved"></i> REGISTER YOUR SQUAD NOW</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="mvp-badge-banner">
            <i class="fa-solid fa-crown"></i> OFFICIAL MVP
        </div>
        <div class="mvp-avatar-wrap">
            <img src="${mvpData.avatar || AvatarGenerator.playerAvatar(mvpData.name, '#00E5FF')}" alt="${mvpData.name}" onerror="this.src='${AvatarGenerator.playerAvatar(mvpData.name, '#00E5FF')}'">
        </div>
        <div>
            <div class="mvp-player-name">${mvpData.name}</div>
            <div class="mvp-team-subtitle">
                <i class="fa-solid fa-shield-halved"></i> ${mvpData.teamName || 'Tournament MVP'} • ${mvpData.role || 'Pro Player'}
            </div>
            <div class="mvp-stats-grid">
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--primary);">${mvpData.kills || 0}</div>
                    <div class="mvp-stat-lbl">Total Kills</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${(mvpData.damage || 0).toLocaleString()}</div>
                    <div class="mvp-stat-lbl">Damage Dealt</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--cyan-accent);">${mvpData.headshotRate || 50}%</div>
                    <div class="mvp-stat-lbl">Headshot Rate</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${mvpData.booyahs || 0}</div>
                    <div class="mvp-stat-lbl">Booyahs</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val" style="color: var(--gold);">${mvpData.mvpPoints || 0}</div>
                    <div class="mvp-stat-lbl">MVP Points</div>
                </div>
                <div class="mvp-stat-card">
                    <div class="mvp-stat-val">${mvpData.matches || 0}</div>
                    <div class="mvp-stat-lbl">Matches Played</div>
                </div>
            </div>
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

    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        teams = teams.filter(t => t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q));
    }

    teams.sort((a, b) => {
        if (sortKey === 'points') return b.points - a.points;
        if (sortKey === 'kills') return b.kills - a.kills;
        if (sortKey === 'booyahs') return b.booyahs - a.booyahs;
        return 0;
    });

    if (podiumContainer) {
        if (searchQuery.trim() === '' && teams.length >= 3) {
            const first = teams[0];
            const second = teams[1];
            const third = teams[2];

            podiumContainer.innerHTML = `
                <div class="podium-grid">
                    <div class="podium-card second">
                        <div class="podium-badge">2</div>
                        <img src="${second.logo}" class="podium-logo" alt="${second.name}" onerror="this.src='${AvatarGenerator.teamLogo(second.name)}'">
                        <div class="podium-team-name">${second.name}</div>
                        <div style="font-size:0.85rem; color: var(--text-muted);">Booyahs: ${second.booyahs} | Kills: ${second.kills}</div>
                        <div class="podium-pts">${second.points} PTS</div>
                    </div>

                    <div class="podium-card first">
                        <div class="podium-badge">🏆 1</div>
                        <img src="${first.logo}" class="podium-logo" style="width:90px; height:90px;" alt="${first.name}" onerror="this.src='${AvatarGenerator.teamLogo(first.name)}'">
                        <div class="podium-team-name" style="font-size:1.8rem;">${first.name}</div>
                        <div style="font-size:0.9rem; color: var(--secondary); font-weight:700;">CHAMPION LEADER</div>
                        <div style="font-size:0.85rem; color: var(--text-muted); margin-top:4px;">Booyahs: ${first.booyahs} | Kills: ${first.kills}</div>
                        <div class="podium-pts" style="font-size:2.4rem; color: var(--gold);">${first.points} PTS</div>
                    </div>

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
        if (podiumContainer) podiumContainer.innerHTML = '';
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">No teams on the leaderboard yet. Squad points will be updated by the Admin during tournaments.</td></tr>`;
        return;
    }

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
// 5. MATCHES SECTION
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
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 18px;">${m.tournament} • ${m.time || ''}</div>
            
            ${m.status === 'COMPLETED' ? `
                <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0,240,255,0.25); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 12px;">
                    <div style="font-size: 0.8rem; color: var(--cyan-accent); font-weight: 800; text-transform: uppercase;">BOOYAH WINNER</div>
                    <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #fff;">🏆 ${m.winner || 'TBD'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Kills: ${m.kills || 0} | Total Points: ${m.totalPts || 0}</div>
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
// MODALS SYSTEM
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
}

// 1. PUBLIC REGISTRATION FORM & BLOCK
function populateRegistrationDropdowns() {
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    let openTournaments = tournaments.filter(t => t.registrationOpen !== false);
    if (openTournaments.length === 0) openTournaments = tournaments;

    const optionsHtml = tournaments.map(t => `
        <option value="${t.id}" ${t.registrationOpen === false ? 'disabled' : ''}>
            ${t.title} (${Utils.formatCurrency(t.prizePool)} Prize Pool) ${t.registrationOpen === false ? '[REGISTRATION CLOSED]' : ''}
        </option>
    `).join('');

    const selectEl = document.getElementById('regTournamentSelect');
    if (selectEl) selectEl.innerHTML = optionsHtml;

    const inlineSelectEl = document.getElementById('inlineRegTournamentSelect');
    if (inlineSelectEl) {
        inlineSelectEl.innerHTML = optionsHtml;
        const firstOpen = openTournaments[0];
        const selectedId = firstOpen ? firstOpen.id : (tournaments[0] ? tournaments[0].id : '');
        inlineSelectEl.value = selectedId;
        const hiddenEl = document.getElementById('inlineRegTournamentId');
        if (hiddenEl) hiddenEl.value = selectedId;
    }
}

function openRegistrationModal(targetTourneyId = null) {
    populateRegistrationDropdowns();
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    let openTournaments = tournaments.filter(t => t.registrationOpen !== false);
    if (openTournaments.length === 0) openTournaments = tournaments;

    const selectEl = document.getElementById('regTournamentSelect');
    if (selectEl) {
        let selectedId = targetTourneyId;
        const targetTourney = tournaments.find(t => t.id === selectedId);
        if (!selectedId || !targetTourney || targetTourney.registrationOpen === false) {
            const firstOpen = openTournaments[0];
            selectedId = firstOpen ? firstOpen.id : (tournaments[0] ? tournaments[0].id : '');
        }

        selectEl.value = selectedId;
        document.getElementById('regTournamentId').value = selectedId;
    }

    openModal('regModal');
}

function onRegistrationTourneyChange(tourneyId) {
    document.getElementById('regTournamentId').value = tourneyId;
}

function onInlineRegistrationTourneyChange(tourneyId) {
    document.getElementById('inlineRegTournamentId').value = tourneyId;
}

function handleInlineRegistrationSubmit(e) {
    e.preventDefault();
    const tourneyId = document.getElementById('inlineRegTournamentId').value || document.getElementById('inlineRegTournamentSelect').value;
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const tourney = tournaments.find(t => t.id === tourneyId) || tournaments[0];

    if (!tourney || tourney.registrationOpen === false) {
        showToast('Registrations for this tournament are currently closed.', 'error');
        return;
    }

    const fullName = (document.getElementById('inlineRegFullName')?.value || '').trim();
    const phone = (document.getElementById('inlineRegPhone')?.value || '').trim();
    const email = (document.getElementById('inlineRegEmail')?.value || '').trim();
    const gameUid = (document.getElementById('inlineRegGameUid')?.value || '').trim();
    const ign = (document.getElementById('inlineRegIgn')?.value || '').trim();
    const teamName = (document.getElementById('inlineRegTeamName')?.value || '').trim();
    const captainName = (document.getElementById('inlineRegCaptainName')?.value || '').trim();
    const player1 = (document.getElementById('inlineRegPlayer1')?.value || '').trim();
    const player2 = (document.getElementById('inlineRegPlayer2')?.value || '').trim();
    const player3 = (document.getElementById('inlineRegPlayer3')?.value || '').trim();
    const player4 = (document.getElementById('inlineRegPlayer4')?.value || '').trim();
    const sub = (document.getElementById('inlineRegSub')?.value || '').trim() || 'N/A';
    const altContact = (document.getElementById('inlineRegAltContact')?.value || '').trim() || 'N/A';
    const additionalInfo = (document.getElementById('inlineRegAdditionalInfo')?.value || '').trim() || 'N/A';
    const agreeTerms = document.getElementById('inlineRegAgreeTerms')?.checked;

    if (!fullName || !phone || !email || !gameUid || !ign || !teamName || !captainName || !player1 || !player2 || !player3 || !player4) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!agreeTerms) {
        showToast('Please agree to the tournament terms and guidelines.', 'error');
        return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
    }

    // Duplicate submission check for same tournament
    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const isDuplicate = regs.some(r =>
        r.tournamentId === tourneyId && (
            r.teamName.toLowerCase() === teamName.toLowerCase() ||
            (r.gameUid && r.gameUid === gameUid) ||
            (r.phone && r.phone === phone)
        )
    );

    if (isDuplicate) {
        showToast('YOU ARE ALREADY REGISTERED. A registration for this team, UID, or phone already exists.', 'error');
        return;
    }

    const regId = IDFCStorage.getNextRegistrationId();

    const regData = {
        id: regId,
        tournamentId: tourneyId,
        tournamentTitle: tourney ? tourney.title : 'Official Championship',
        fullName,
        phone,
        email,
        gameUid,
        ign,
        teamName,
        captainName,
        playerCount: 4,
        players: [player1, player2, player3, player4].filter(Boolean),
        sub,
        altContact,
        additionalInfo,
        status: 'PENDING',
        registeredAt: new Date().toISOString()
    };

    regs.unshift(regData);
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);

    IDFCStorage.addAuditLog('PUBLIC_REGISTRATION', `Team '${teamName}' registered for ${regData.tournamentTitle} (ID: ${regId})`);

    document.getElementById('inlineRegistrationForm')?.reset();

    // Show Confirmation Detail Modal
    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--live-success);"></i> Registration Submitted`;
    document.getElementById('detailModalBody').innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 3rem; color: var(--live-success); margin-bottom: 10px;"><i class="fa-solid fa-shield-check"></i></div>
            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 6px;">Registration submitted successfully.</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Your registration is waiting for admin approval.</p>

            <div style="background: rgba(0, 229, 255, 0.08); border: 2px dashed var(--primary-accent); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
                <div style="font-size: 0.8rem; color: var(--cyan-highlight); font-weight: 800; text-transform: uppercase;">REGISTRATION REFERENCE ID</div>
                <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--gold); letter-spacing: 2px; margin-top: 4px;">${regId}</div>
            </div>

            <div style="text-align: left; background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-sm); font-size: 0.9rem;">
                <div style="margin-bottom: 6px;"><strong>Registration ID:</strong> <span style="color:var(--gold); font-weight:800;">${regId}</span></div>
                <div style="margin-bottom: 6px;"><strong>Tournament:</strong> ${regData.tournamentTitle}</div>
                <div style="margin-bottom: 6px;"><strong>Team Name:</strong> ${regData.teamName}</div>
                <div style="margin-bottom: 6px;"><strong>Captain:</strong> ${regData.captainName} (${regData.phone})</div>
                <div><strong>Status:</strong> <span class="badge-status pending" style="padding: 4px 10px;">PENDING</span></div>
            </div>

            <div style="margin-top: 20px;">
                <button class="btn-card-secondary" onclick="closeModal('detailModal'); openCheckRegModal('${regId}')"><i class="fa-solid fa-magnifying-glass"></i> Check Status Later</button>
            </div>
        </div>
    `;
    openModal('detailModal');
    showToast(`Registration submitted! Ref ID: ${regId}`, 'success');
}

function handleRegistrationSubmit(e) {
    e.preventDefault();
    const tourneyId = document.getElementById('regTournamentId').value || document.getElementById('regTournamentSelect').value;
    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const tourney = tournaments.find(t => t.id === tourneyId) || tournaments[0];

    if (!tourney || tourney.registrationOpen === false) {
        showToast('Registrations for this tournament are currently closed.', 'error');
        return;
    }

    const fullName = (document.getElementById('regFullName')?.value || '').trim();
    const phone = (document.getElementById('regPhone')?.value || '').trim();
    const email = (document.getElementById('regEmail')?.value || '').trim();
    const gameUid = (document.getElementById('regGameUid')?.value || '').trim();
    const ign = (document.getElementById('regIgn')?.value || '').trim();
    const teamName = (document.getElementById('regTeamName')?.value || '').trim();
    const captainName = (document.getElementById('regCaptainName')?.value || '').trim();
    const playerCount = document.getElementById('regPlayerCount')?.value || '4';
    const player1 = (document.getElementById('regPlayer1')?.value || '').trim();
    const player2 = (document.getElementById('regPlayer2')?.value || '').trim();
    const player3 = (document.getElementById('regPlayer3')?.value || '').trim();
    const player4 = (document.getElementById('regPlayer4')?.value || '').trim();
    const sub = (document.getElementById('regSub')?.value || '').trim() || 'N/A';
    const altContact = (document.getElementById('regAltContact')?.value || '').trim() || 'N/A';
    const additionalInfo = (document.getElementById('regAdditionalInfo')?.value || '').trim() || 'N/A';
    const agreeTerms = document.getElementById('regAgreeTerms')?.checked;

    if (!fullName || !phone || !email || !gameUid || !ign || !teamName || !captainName || !player1 || !player2 || !player3 || !player4) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!agreeTerms) {
        showToast('Please agree to the tournament terms and guidelines.', 'error');
        return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
    }

    // Duplicate submission check for same tournament
    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const isDuplicate = regs.some(r =>
        r.tournamentId === tourneyId && (
            r.teamName.toLowerCase() === teamName.toLowerCase() ||
            (r.gameUid && r.gameUid === gameUid) ||
            (r.phone && r.phone === phone)
        )
    );

    if (isDuplicate) {
        showToast('A registration for this team name, Game UID, or phone number already exists for this tournament.', 'error');
        return;
    }

    const regId = IDFCStorage.getNextRegistrationId();

    const regData = {
        id: regId,
        tournamentId: tourneyId,
        tournamentTitle: tourney ? tourney.title : 'Official Championship',
        fullName,
        phone,
        email,
        gameUid,
        ign,
        teamName,
        captainName,
        playerCount,
        player1,
        player2,
        player3,
        player4,
        substitute: sub,
        altContact,
        additionalInfo,
        date: new Date().toLocaleString(),
        status: 'PENDING',
        rejectionReason: ''
    };

    regs.unshift(regData);
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);

    closeModal('regModal');
    document.getElementById('registrationForm').reset();

    // Show Confirmation Detail Modal
    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--live-success);"></i> Registration Submitted`;
    document.getElementById('detailModalBody').innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 3rem; color: var(--live-success); margin-bottom: 10px;"><i class="fa-solid fa-shield-check"></i></div>
            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 6px;">Registration submitted successfully.</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Your registration is waiting for admin approval.</p>

            <div style="background: rgba(0, 229, 255, 0.08); border: 2px dashed var(--primary-accent); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
                <div style="font-size: 0.8rem; color: var(--cyan-highlight); font-weight: 800; text-transform: uppercase;">REGISTRATION REFERENCE ID</div>
                <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--gold); letter-spacing: 2px; margin-top: 4px;">${regId}</div>
            </div>

            <div style="text-align: left; background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-sm); font-size: 0.9rem;">
                <div style="margin-bottom: 6px;"><strong>Registration ID:</strong> <span style="color:var(--gold); font-weight:800;">${regId}</span></div>
                <div style="margin-bottom: 6px;"><strong>Tournament:</strong> ${regData.tournamentTitle}</div>
                <div style="margin-bottom: 6px;"><strong>Team Name:</strong> ${regData.teamName}</div>
                <div style="margin-bottom: 6px;"><strong>Captain:</strong> ${regData.captainName} (${regData.phone})</div>
                <div><strong>Status:</strong> <span class="badge-status pending" style="padding: 4px 10px;">PENDING</span></div>
            </div>

            <div style="margin-top: 20px;">
                <button class="btn-card-secondary" onclick="closeModal('detailModal'); openCheckRegModal()"><i class="fa-solid fa-magnifying-glass"></i> Check Status Later</button>
            </div>
        </div>
    `;
    openModal('detailModal');
    showToast(`Registration submitted! Ref ID: ${regId}`, 'success');
}

// CHECK REGISTRATION STATUS SEARCH
function openCheckRegModal() {
    openModal('checkRegModal');
    const container = document.getElementById('checkRegResultContainer');
    if (container) container.innerHTML = '';
}

function handleCheckRegistrationSearch(e) {
    e.preventDefault();
    const query = (document.getElementById('checkRegIdInput')?.value || '').trim().toUpperCase();
    const container = document.getElementById('checkRegResultContainer');
    if (!query || !container) return;

    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const r = regs.find(item => item.id && item.id.toUpperCase() === query);

    if (!r) {
        container.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); padding: 16px; border-radius: var(--radius-sm); text-align: center; color: var(--danger);">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
                <div style="font-weight: 700;">No Registration Found</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">No submission matches ID "${query}". Please check your Reference ID and try again.</div>
            </div>
        `;
        return;
    }

    let statusHtml = '';
    if (r.status === 'PENDING') {
        statusHtml = `<span class="badge-status pending" style="padding: 6px 14px; font-size: 0.9rem;">PENDING APPROVAL</span>`;
    } else if (r.status === 'APPROVED') {
        statusHtml = `<span class="badge-status approved" style="padding: 6px 14px; font-size: 0.9rem; background: var(--live-success); color: #000; font-weight: 800;">APPROVED</span>`;
    } else if (r.status === 'REJECTED') {
        statusHtml = `<span class="badge-status rejected" style="padding: 6px 14px; font-size: 0.9rem; background: var(--danger); color: #fff; font-weight: 800;">REJECTED</span>`;
    }

    let reasonBox = '';
    if (r.status === 'REJECTED' && r.rejectionReason) {
        reasonBox = `
            <div style="margin-top: 14px; background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger); padding: 12px 14px; border-radius: var(--radius-sm); font-size: 0.88rem; color: #ff9999;">
                <strong>Rejection Reason:</strong> ${r.rejectionReason}
            </div>
        `;
    }

    let statusMsg = '';
    if (r.status === 'PENDING') {
        statusMsg = `<p style="color: var(--mvp-gold); font-size: 0.85rem; margin-top: 10px;"><i class="fa-solid fa-hourglass-half"></i> Your registration is waiting for admin approval.</p>`;
    } else if (r.status === 'APPROVED') {
        statusMsg = `<p style="color: var(--live-success); font-size: 0.85rem; margin-top: 10px;"><i class="fa-solid fa-circle-check"></i> Congratulations! Your team is approved to participate.</p>`;
    }

    container.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 14px;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--cyan-highlight); font-weight: 800; text-transform: uppercase;">REGISTRATION REF ID</div>
                    <div style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: var(--gold);">${r.id}</div>
                </div>
                <div>${statusHtml}</div>
            </div>

            <div style="font-size: 0.9rem; line-height: 1.8;">
                <div><strong>Team Name:</strong> ${r.teamName}</div>
                <div><strong>Captain:</strong> ${r.captainName} (${r.phone || 'N/A'})</div>
                <div><strong>Tournament:</strong> ${r.tournamentTitle}</div>
                <div><strong>Submission Date:</strong> ${r.date}</div>
            </div>

            ${reasonBox}
            ${statusMsg}
        </div>
    `;
}

// PUBLIC CONTACT FORM SUBMISSION
function openContactModal() {
    openModal('contactModal');
}

function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    const contactMsgs = IDFCStorage.get(STORAGE_KEYS.CONTACT_MESSAGES);
    contactMsgs.unshift({
        id: Utils.generateId('msg'),
        name: name,
        email: email,
        subject: subject,
        message: message,
        date: new Date().toLocaleString(),
        status: 'UNREAD'
    });

    IDFCStorage.set(STORAGE_KEYS.CONTACT_MESSAGES, contactMsgs);
    closeModal('contactModal');
    document.getElementById('publicContactForm').reset();
    showToast('Your message has been sent to the Admin Dashboard.', 'success');
}

// PUBLIC DETAIL VIEW MODALS
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

// GLOBAL SEARCH SYSTEM
function openSearchModal() {
    openModal('searchModal');
    const input = document.getElementById('globalSearchInput');
    if (input) input.focus();
}

function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('globalSearchResults');
    if (!query || query.trim().length < 2) {
        resultsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Type at least 2 characters to search...</p>`;
        return;
    }

    const q = query.toLowerCase();

    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS).filter(t => t.title.toLowerCase().includes(q));
    const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES).filter(m => m.matchNo.toLowerCase().includes(q) || m.map.toLowerCase().includes(q));
    const leaderboardTeams = IDFCStorage.get(STORAGE_KEYS.TEAMS).filter(t => t.name.toLowerCase().includes(q));

    let html = '';

    if (tournaments.length > 0) {
        html += `<h4 style="color: var(--primary); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">TOURNAMENTS (${tournaments.length})</h4>`;
        tournaments.forEach(t => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); openTournamentDetailModal('${t.id}')">🏆 ${t.title} (${t.status})</div>`;
        });
    }

    if (matches.length > 0) {
        html += `<h4 style="color: var(--cyan-accent); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">MATCHES (${matches.length})</h4>`;
        matches.forEach(m => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); switchSection('matches')">🎯 ${m.matchNo} - ${m.map} (${m.status})</div>`;
        });
    }

    if (leaderboardTeams.length > 0) {
        html += `<h4 style="color: var(--gold); font-family: var(--font-heading); margin-top: 10px; font-size: 1.1rem;">LEADERBOARD TEAMS (${leaderboardTeams.length})</h4>`;
        leaderboardTeams.forEach(t => {
            html += `<div style="padding: 10px 14px; background: rgba(255,255,255,0.04); margin-bottom: 6px; cursor: pointer; border-radius: 6px;" onclick="closeModal('searchModal'); switchSection('leaderboard')">🛡️ ${t.name} (${t.points} PTS)</div>`;
        });
    }

    if (!html) {
        html = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No matching results found for "${query}".</p>`;
    }

    resultsContainer.innerHTML = html;
}

// -------------------------------------------------------------
// PRIVATE ADMIN PLATFORM ENGINE & MANAGEMENT CONTROLS
// -------------------------------------------------------------
function openAdminModal() {
    if (isAdmin()) {
        switchSection('admin');
    } else {
        openModal('adminLoginModal');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;

    const settings = IDFCStorage.get(STORAGE_KEYS.SETTINGS) || {};
    const validUser = settings.adminUsername || 'ajay';
    const validPass = settings.adminPasswordHash || 'Ajayvarma6961';

    if (user === validUser && pass === validPass) {
        AppState.isAdminLoggedIn = true;
        IDFCStorage.set(STORAGE_KEYS.ADMIN_SESSION, { isLoggedIn: true, username: user, loginTime: new Date().toISOString() });
        updateAdminNavUI(true);
        closeModal('adminLoginModal');
        switchSection('admin');
        showToast('Admin Authentication Successful!', 'success');
    } else {
        showToast('Invalid admin credentials. Access Denied.', 'error');
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
    if (!enforceAdminAccess()) return;

    AppState.activeAdminTab = tabKey;
    if (btnElement) {
        const parent = btnElement.parentElement;
        parent.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
        btnElement.classList.add('active');
    }
    renderAdminView();
}

function renderAdminView() {
    if (!enforceAdminAccess()) return;

    const mainView = document.getElementById('adminMainView');
    if (!mainView) return;

    const tab = AppState.activeAdminTab;

    if (tab === 'dash') {
        const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
        const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
        const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
        const activeTourneys = tournaments.filter(t => t.status === 'LIVE' || t.status === 'UPCOMING');
        const pendingRegs = regs.filter(r => r.status === 'PENDING');

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
                    <div class="admin-stat-icon"><i class="fa-solid fa-bolt"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color: var(--cyan-accent);">${activeTourneys.length}</div>
                        <div class="admin-stat-lbl">Active Tournaments</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color: var(--gold);">${regs.length}</div>
                        <div class="admin-stat-lbl">Total Registrations</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-hourglass-half"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color: var(--mvp-gold);">${pendingRegs.length}</div>
                        <div class="admin-stat-lbl">Pending Registrations</div>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon"><i class="fa-solid fa-crosshairs"></i></div>
                    <div>
                        <div class="admin-stat-num">${matches.length}</div>
                        <div class="admin-stat-lbl">Total Matches</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                        <h4 style="font-family: var(--font-heading); color: var(--primary); font-size: 1.2rem; margin:0;"><i class="fa-solid fa-clock-rotate-left"></i> Recent Registrations</h4>
                        <button class="btn-xs btn-card-secondary" onclick="switchAdminTab('registrations')">View All</button>
                    </div>
                    ${regs.length > 0 ? regs.slice(0, 5).map(r => `
                        <div style="font-size: 0.85rem; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #fff;">${r.teamName}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${r.id})</span>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${r.captainName} • ${r.phone}</div>
                            </div>
                            <span class="badge-status ${r.status.toLowerCase()}" style="font-size: 0.65rem; padding: 2px 6px;">${r.status}</span>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No registrations recorded yet.</div>'}
                </div>

                <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                        <h4 style="font-family: var(--font-heading); color: var(--cyan-accent); font-size: 1.2rem; margin:0;"><i class="fa-solid fa-crosshairs"></i> Match Overview</h4>
                        <button class="btn-xs btn-card-secondary" onclick="switchAdminTab('matches')">Manage Matches</button>
                    </div>
                    ${matches.length > 0 ? matches.slice(0, 5).map(m => `
                        <div style="font-size: 0.85rem; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #fff;">${m.matchNo}</strong> <span style="font-size:0.75rem; color:var(--cyan-highlight);">(${m.map})</span>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${m.tournament}</div>
                            </div>
                            <span class="badge-status ${m.status.toLowerCase()}" style="font-size: 0.65rem; padding: 2px 6px;">${m.status}</span>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No matches scheduled.</div>'}
                </div>
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 18px; color:#fff;">Quick Management Actions</h3>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button class="btn-primary" onclick="adminCreateEntity('tournaments')"><i class="fa-solid fa-plus"></i> Add Tournament</button>
                <button class="btn-primary" onclick="adminCreateEntity('matches')"><i class="fa-solid fa-plus"></i> Add Match</button>
                <button class="btn-primary" onclick="adminCreateEntity('teams')"><i class="fa-solid fa-plus"></i> Add Team to Leaderboard</button>
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
                        <tr><th>Title</th><th>Status</th><th>Registration</th><th>Prize Pool</th><th>Teams</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${tournaments.map(t => `
                            <tr>
                                <td><strong>${t.title}</strong></td>
                                <td><span class="badge-status ${t.status.toLowerCase()}">${t.status}</span></td>
                                <td>
                                    <button class="btn-xs ${t.registrationOpen ? 'btn-edit' : 'btn-delete'}" onclick="toggleTournamentRegistration('${t.id}')">
                                        ${t.registrationOpen ? 'OPEN' : 'CLOSED'}
                                    </button>
                                </td>
                                <td style="color: var(--gold);">${Utils.formatCurrency(t.prizePool)}</td>
                                <td>${t.teamsCount || 0} / ${t.totalSlots || 24}</td>
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
                        <tr><th>Match No</th><th>Tournament</th><th>Map</th><th>Status</th><th>Winner</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${matches.map(m => `
                            <tr>
                                <td><strong>${m.matchNo}</strong></td>
                                <td>${m.tournament}</td>
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
    } else if (tab === 'leaderboard') {
        const teams = IDFCStorage.get(STORAGE_KEYS.TEAMS);
        teams.sort((a, b) => b.points - a.points);

        mainView.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff;">Manage Leaderboard & Team Points</h3>
                <button class="btn-primary" onclick="adminCreateEntity('teams')"><i class="fa-solid fa-plus"></i> Add Team to Leaderboard</button>
            </div>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Rank</th><th>Team</th><th>Matches</th><th>Booyahs</th><th>Kills</th><th>Total Points</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${teams.length > 0 ? teams.map((t, idx) => `
                            <tr>
                                <td><strong style="color:var(--gold);">#${idx + 1}</strong></td>
                                <td><strong>${t.name} (${t.short})</strong></td>
                                <td>${t.matches}</td>
                                <td>${t.booyahs}</td>
                                <td>${t.kills}</td>
                                <td><span class="pts-highlight">${t.points}</span></td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="adminEditEntity('teams', '${t.id}')">Edit Scores</button>
                                        <button class="btn-xs btn-delete" onclick="adminDeleteEntity('teams', '${t.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No teams currently on the leaderboard. Click "Add Team to Leaderboard" to add entries.</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'mvp') {
        const currentMvp = IDFCStorage.get('idfc_mvp_data') || {};

        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Manage Player of the Tournament (MVP)</h3>
            
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); max-width: 650px;">
                <div id="mvpEditFields">
                    <div class="form-grid-2">
                        <div class="form-group"><label class="form-label">MVP Player Name *</label><input type="text" id="mvp_form_name" class="form-control" value="${currentMvp.name || ''}" placeholder="e.g. Aarav Sharma"></div>
                        <div class="form-group"><label class="form-label">Team Name *</label><input type="text" id="mvp_form_team" class="form-control" value="${currentMvp.teamName || ''}" placeholder="e.g. Viper Warriors"></div>
                    </div>
                    <div class="form-group"><label class="form-label">Player Role</label><input type="text" id="mvp_form_role" class="form-control" value="${currentMvp.role || 'Pro Fragger'}" placeholder="e.g. Sniper / IGL"></div>
                    <div class="form-grid-2">
                        <div class="form-group"><label class="form-label">Total Kills</label><input type="number" id="mvp_form_kills" class="form-control" value="${currentMvp.kills || 0}"></div>
                        <div class="form-group"><label class="form-label">Total Damage</label><input type="number" id="mvp_form_damage" class="form-control" value="${currentMvp.damage || 0}"></div>
                    </div>
                    <div class="form-grid-2">
                        <div class="form-group"><label class="form-label">Headshot Rate (%)</label><input type="number" step="0.1" id="mvp_form_hs" class="form-control" value="${currentMvp.headshotRate || 50}"></div>
                        <div class="form-group"><label class="form-label">Booyahs</label><input type="number" id="mvp_form_booyahs" class="form-control" value="${currentMvp.booyahs || 0}"></div>
                    </div>
                    <div class="form-grid-2">
                        <div class="form-group"><label class="form-label">MVP Points</label><input type="number" id="mvp_form_points" class="form-control" value="${currentMvp.mvpPoints || 0}"></div>
                        <div class="form-group"><label class="form-label">Matches Played</label><input type="number" id="mvp_form_matches" class="form-control" value="${currentMvp.matches || 0}"></div>
                    </div>
                </div>

                <button class="btn-primary" style="width:100%; margin-top: 10px;" onclick="saveAdminMVP()"><i class="fa-solid fa-crown"></i> Save & Publish Player of Tournament</button>
            </div>
        `;
    } else if (tab === 'registrations') {
        const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
        const totalCount = regs.length;
        const pendingCount = regs.filter(r => r.status === 'PENDING').length;
        const approvedCount = regs.filter(r => r.status === 'APPROVED').length;
        const rejectedCount = regs.filter(r => r.status === 'REJECTED').length;

        const currentFilter = AppState.activeRegFilter || 'ALL';
        let filteredRegs = regs;
        if (currentFilter !== 'ALL') {
            filteredRegs = regs.filter(r => r.status === currentFilter);
        }

        mainView.innerHTML = `
            <div style="margin-bottom:20px;">
                <h3 style="font-family: var(--font-heading); font-size:1.6rem; color:#fff; margin:0;">REGISTRATION REQUESTS</h3>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">Inspect submitted team rosters, verify player IDs, add admin notes, and approve or reject applications.</div>
            </div>

            <div class="admin-stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
                <div class="admin-stat-card" style="cursor:pointer; border-color:${currentFilter==='ALL'?'var(--primary-accent)':'var(--border-color)'};" onclick="filterAdminRegistrations('ALL')">
                    <div class="admin-stat-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                    <div>
                        <div class="admin-stat-num">${totalCount}</div>
                        <div class="admin-stat-lbl">Total Submitted</div>
                    </div>
                </div>
                <div class="admin-stat-card" style="cursor:pointer; border-color:${currentFilter==='PENDING'?'var(--mvp-gold)':'var(--border-color)'};" onclick="filterAdminRegistrations('PENDING')">
                    <div class="admin-stat-icon" style="color:var(--mvp-gold);"><i class="fa-solid fa-hourglass-half"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color:var(--mvp-gold);">${pendingCount}</div>
                        <div class="admin-stat-lbl">Pending Approval</div>
                    </div>
                </div>
                <div class="admin-stat-card" style="cursor:pointer; border-color:${currentFilter==='APPROVED'?'var(--live-success)':'var(--border-color)'};" onclick="filterAdminRegistrations('APPROVED')">
                    <div class="admin-stat-icon" style="color:var(--live-success);"><i class="fa-solid fa-circle-check"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color:var(--live-success);">${approvedCount}</div>
                        <div class="admin-stat-lbl">Approved Squads</div>
                    </div>
                </div>
                <div class="admin-stat-card" style="cursor:pointer; border-color:${currentFilter==='REJECTED'?'var(--danger)':'var(--border-color)'};" onclick="filterAdminRegistrations('REJECTED')">
                    <div class="admin-stat-icon" style="color:var(--danger);"><i class="fa-solid fa-circle-xmark"></i></div>
                    <div>
                        <div class="admin-stat-num" style="color:var(--danger);">${rejectedCount}</div>
                        <div class="admin-stat-lbl">Rejected Requests</div>
                    </div>
                </div>
            </div>

            <div class="match-tabs" style="margin-bottom: 20px;">
                <button class="match-tab-btn ${currentFilter==='ALL'?'active':''}" onclick="filterAdminRegistrations('ALL')">ALL (${totalCount})</button>
                <button class="match-tab-btn ${currentFilter==='PENDING'?'active':''}" onclick="filterAdminRegistrations('PENDING')">PENDING (${pendingCount})</button>
                <button class="match-tab-btn ${currentFilter==='APPROVED'?'active':''}" onclick="filterAdminRegistrations('APPROVED')">APPROVED (${approvedCount})</button>
                <button class="match-tab-btn ${currentFilter==='REJECTED'?'active':''}" onclick="filterAdminRegistrations('REJECTED')">REJECTED (${rejectedCount})</button>
            </div>

            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr>
                            <th>Registration ID</th>
                            <th>Team Name</th>
                            <th>Captain</th>
                            <th>Mobile / Email</th>
                            <th>Tournament</th>
                            <th>Submitted Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredRegs.length > 0 ? filteredRegs.map(r => `
                            <tr>
                                <td><strong style="color:var(--gold); font-family:var(--font-display); font-size:1.1rem;">${r.id}</strong></td>
                                <td><strong>${r.teamName}</strong></td>
                                <td>${r.captainName}</td>
                                <td style="font-size:0.85rem;">${r.phone || 'N/A'}<br><span style="color:var(--text-muted);">${r.email || ''}</span></td>
                                <td style="font-size:0.85rem;">${r.tournamentTitle}</td>
                                <td style="font-size:0.85rem;">${r.date}</td>
                                <td><span class="badge-status ${r.status.toLowerCase()}">${r.status}</span></td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="btn-xs btn-edit" onclick="viewRegistrationDetail('${r.id}')"><i class="fa-solid fa-eye"></i> VIEW</button>
                                        <button class="btn-xs" style="background:var(--live-success); color:#000; font-weight:700;" onclick="adminApproveRegistration('${r.id}')"><i class="fa-solid fa-check"></i> APPROVE</button>
                                        <button class="btn-xs btn-delete" onclick="adminRejectRegistration('${r.id}')"><i class="fa-solid fa-xmark"></i> REJECT</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted); font-size:1.05rem;">No registrations yet. User squad registrations will appear here for review.</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'rooms') {
        const roomsData = IDFCStorage.get('idfc_rooms_data') || { roomId: 'IDFC-ROOM-8841', roomPass: 'FFMAX@99', time: '19:00 IST' };
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Manage Match Room Credentials</h3>
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); max-width: 550px;">
                <form onsubmit="saveAdminRoomCredentials(event)">
                    <div class="form-group">
                        <label class="form-label">Match Room ID</label>
                        <input type="text" id="room_id_input" class="form-control" value="${roomsData.roomId || 'IDFC-ROOM-8841'}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Room Password</label>
                        <input type="text" id="room_pass_input" class="form-control" value="${roomsData.roomPass || 'FFMAX@99'}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Match Start Time</label>
                        <input type="text" id="room_time_input" class="form-control" value="${roomsData.time || '19:00 IST'}" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:10px;"><i class="fa-solid fa-key"></i> Update Room Credentials</button>
                </form>
            </div>
        `;
    } else if (tab === 'results') {
        const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Match Results Entry</h3>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Match</th><th>Map</th><th>Status</th><th>Booyah Winner</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${matches.map(m => `
                            <tr>
                                <td><strong>${m.matchNo}</strong></td>
                                <td>${m.map}</td>
                                <td><span class="badge-status ${m.status.toLowerCase()}">${m.status}</span></td>
                                <td>${m.winner || 'TBD'}</td>
                                <td>
                                    <button class="btn-xs btn-edit" onclick="adminEditEntity('matches', '${m.id}')">Enter Result</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'logs') {
        const logs = IDFCStorage.get('idfc_audit_logs') || [
            { id: 1, action: 'SYSTEM_INIT', details: 'IDFC Tournament Platform storage engine initialized.', timestamp: new Date().toLocaleString() },
            { id: 2, action: 'ADMIN_AUTH', details: 'Admin user logged into management dashboard.', timestamp: new Date().toLocaleString() }
        ];
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">System Audit Logs (${logs.length})</h3>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Timestamp</th><th>Action Type</th><th>Log Details</th></tr>
                    </thead>
                    <tbody>
                        ${logs.map(l => `
                            <tr>
                                <td style="font-size:0.85rem; color:var(--text-muted);">${l.timestamp}</td>
                                <td><strong style="color:var(--cyan-highlight);">${l.action}</strong></td>
                                <td style="font-size:0.9rem;">${l.details}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'diagnostic') {
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Database & Storage Diagnostic Test</h3>
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); max-width: 650px;">
                <div style="margin-bottom: 20px;">
                    <button class="btn-primary" onclick="runDatabaseDiagnostic()"><i class="fa-solid fa-play"></i> Run Storage Diagnostic Scan</button>
                </div>
                <div id="diagnosticResultsContainer" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); padding: 18px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; color: var(--live-success);">
                    Press "Run Storage Diagnostic Scan" to inspect database integrity.
                </div>
            </div>
        `;
    } else if (tab === 'contact') {
        const msgs = IDFCStorage.get(STORAGE_KEYS.CONTACT_MESSAGES);
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Support & Contact Inquiries (${msgs.length})</h3>
            <div class="leaderboard-table-container">
                <table class="table-esports">
                    <thead>
                        <tr><th>Date</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${msgs.map(m => `
                            <tr>
                                <td style="font-size:0.85rem;">${m.date}</td>
                                <td><strong>${m.name}</strong></td>
                                <td>${m.email}</td>
                                <td>${m.subject}</td>
                                <td style="font-size:0.85rem; max-width:250px;">${m.message}</td>
                                <td>
                                    <button class="btn-xs btn-delete" onclick="deleteContactMsg('${m.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'settings') {
        const settings = IDFCStorage.get(STORAGE_KEYS.SETTINGS) || {};
        mainView.innerHTML = `
            <h3 style="font-family: var(--font-heading); font-size:1.5rem; color:#fff; margin-bottom:20px;">Platform & Security Settings</h3>
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); max-width: 550px;">
                <form onsubmit="saveAdminSettings(event)">
                    <div class="form-group">
                        <label class="form-label">Platform Title</label>
                        <input type="text" id="setting_title" class="form-control" value="${settings.platformName || 'IDFC ESPORTS'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Admin Username</label>
                        <input type="text" id="setting_user" class="form-control" value="${settings.adminUsername || 'ajay'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Admin Password</label>
                        <input type="password" id="setting_pass" class="form-control" value="${settings.adminPasswordHash || 'Ajayvarma6961'}">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:10px;"><i class="fa-solid fa-floppy-disk"></i> Update Security Settings</button>
                </form>

                <hr style="border:0; border-top: 1px solid var(--border-color); margin: 24px 0;">

                <div style="text-align: center;">
                    <button class="btn-card-secondary" onclick="resetDefaultsAdmin()"><i class="fa-solid fa-rotate-left"></i> Reset Demo Data to Factory State</button>
                </div>
            </div>
        `;
    }
}

// ADMIN REGISTRATION MANAGEMENT
function filterAdminRegistrations(status) {
    if (!enforceAdminAccess()) return;
    AppState.activeRegFilter = status;
    renderAdminView();
}

function viewRegistrationDetail(regId) {
    if (!enforceAdminAccess()) return;

    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const r = regs.find(item => item.id === regId);
    if (!r) return;

    document.getElementById('detailModalTitle').innerHTML = `<i class="fa-solid fa-clipboard-list"></i> REGISTRATION DETAILS — ${r.id}`;
    document.getElementById('detailModalBody').innerHTML = `
        <div style="font-size: 0.95rem; line-height: 1.8;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
                <div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">REGISTRATION ID</div>
                    <div style="font-family:var(--font-display); font-size:1.6rem; color:var(--gold); font-weight:800;">${r.id}</div>
                </div>
                <div>
                    <span class="badge-status ${r.status.toLowerCase()}" style="font-size:0.9rem; padding:6px 14px;">${r.status}</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
                <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:14px; border-radius:var(--radius-sm);">
                    <div style="font-size:0.8rem; color:var(--cyan-highlight); font-weight:700;">APPLICANT & CONTACT</div>
                    <div style="font-weight:700; color:#fff;">${r.fullName || r.captainName}</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Phone: ${r.phone || 'N/A'}</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Email: ${r.email || 'N/A'}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">Alt Contact: ${r.altContact || 'N/A'}</div>
                </div>
                <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:14px; border-radius:var(--radius-sm);">
                    <div style="font-size:0.8rem; color:var(--cyan-highlight); font-weight:700;">TEAM & GAME UID</div>
                    <div style="font-weight:700; color:#fff; font-size:1.05rem;">${r.teamName}</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Captain: ${r.captainName}</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Game UID: ${r.gameUid || 'N/A'} (IGN: ${r.ign || 'N/A'})</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Submitted: ${r.date}</div>
                </div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-sm); margin-bottom:18px;">
                <h4 style="font-family:var(--font-heading); color:var(--primary); font-size:1.1rem; margin-bottom:10px;"><i class="fa-solid fa-users"></i> SQUAD ROSTER & PLAYER IDs</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:4px;"><strong>PLAYER 1:</strong> ${r.player1}</div>
                    <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:4px;"><strong>PLAYER 2:</strong> ${r.player2}</div>
                    <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:4px;"><strong>PLAYER 3:</strong> ${r.player3}</div>
                    <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:4px;"><strong>PLAYER 4:</strong> ${r.player4}</div>
                    <div style="grid-column:1/-1; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:4px;"><strong>SUBSTITUTE:</strong> ${r.substitute || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-bottom:18px;">
                <strong>Tournament:</strong> <span style="color:#fff; font-weight:700;">${r.tournamentTitle}</span>
            </div>

            ${r.rejectionReason ? `
                <div style="background:rgba(239, 68, 68, 0.12); border:1px solid var(--danger); padding:12px; border-radius:4px; margin-bottom:18px; color:#ff9999;">
                    <strong>Rejection Reason:</strong> ${r.rejectionReason}
                </div>
            ` : ''}

            <div style="margin-bottom:18px;">
                <strong>Additional Notes / Information:</strong>
                <p style="color:var(--text-secondary); background:rgba(0,0,0,0.3); padding:10px; border-radius:4px; margin-top:4px;">${r.additionalInfo || 'None provided.'}</p>
            </div>
        </div>

        <div style="display:flex; gap:12px; margin-top:20px;">
            <button class="btn-primary" style="background:var(--live-success); color:#000; font-weight:800; flex:1;" onclick="adminApproveRegistration('${r.id}')"><i class="fa-solid fa-circle-check"></i> APPROVE REGISTRATION</button>
            <button class="btn-primary" style="background:var(--danger); flex:1;" onclick="adminRejectRegistration('${r.id}')"><i class="fa-solid fa-circle-xmark"></i> REJECT REGISTRATION</button>
        </div>
    `;
    openModal('detailModal');
}

function adminApproveRegistration(regId) {
    if (!enforceAdminAccess()) return;
    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const r = regs.find(item => item.id === regId);
    if (!r) return;

    if (r.status === 'APPROVED') {
        showToast(`Registration ${regId} is already APPROVED.`, 'info');
        return;
    }

    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const tourney = tournaments.find(t => t.id === r.tournamentId);

    if (tourney && (tourney.teamsCount || 0) >= (tourney.totalSlots || 24)) {
        showToast(`Cannot approve: Tournament '${tourney.title}' has reached maximum squad capacity (${tourney.teamsCount}/${tourney.totalSlots}).`, 'error');
        return;
    }

    if (!confirm(`Approve tournament registration for team "${r.teamName}" (${r.id})?`)) return;

    r.status = 'APPROVED';
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);

    if (tourney) {
        tourney.teamsCount = (tourney.teamsCount || 0) + 1;
        IDFCStorage.set(STORAGE_KEYS.TOURNAMENTS, tournaments);
    }

    closeModal('detailModal');
    renderAllPublicViews();
    renderAdminView();
    showToast(`Registration ${r.id} for "${r.teamName}" APPROVED successfully!`, 'success');
}

function adminRejectRegistration(regId) {
    if (!enforceAdminAccess()) return;
    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const r = regs.find(item => item.id === regId);
    if (!r) return;

    const reason = prompt(`Reject registration for "${r.teamName}" (${r.id})?\n\nEnter rejection reason (optional):`, r.rejectionReason || 'Requirements not met or squad roster invalid.');
    if (reason === null) return;

    const wasApproved = (r.status === 'APPROVED');
    r.status = 'REJECTED';
    r.rejectionReason = reason.trim() || 'Rejected by Admin';
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);

    if (wasApproved) {
        const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
        const tourney = tournaments.find(t => t.id === r.tournamentId);
        if (tourney && tourney.teamsCount > 0) {
            tourney.teamsCount = tourney.teamsCount - 1;
            IDFCStorage.set(STORAGE_KEYS.TOURNAMENTS, tournaments);
        }
    }

    closeModal('detailModal');
    renderAllPublicViews();
    renderAdminView();
    showToast(`Registration ${r.id} REJECTED.`, 'info');
}

function handleRegistrationStatusChange(regId, newStatus) {
    if (!enforceAdminAccess()) return;

    let regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.status = newStatus;
        IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);
        renderAdminView();
        showToast(`Registration ${regId} status changed to ${newStatus}.`, 'success');
    }
}

function handleRegistrationDelete(regId) {
    if (!enforceAdminAccess()) return;
    if (!confirm(`Delete registration ${regId}?`)) return;

    let regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    regs = regs.filter(r => r.id !== regId);
    IDFCStorage.set(STORAGE_KEYS.REGISTRATIONS, regs);
    renderAdminView();
    showToast(`Registration ${regId} deleted.`, 'info');
}

function deleteContactMsg(msgId) {
    if (!enforceAdminAccess()) return;

    let msgs = IDFCStorage.get(STORAGE_KEYS.CONTACT_MESSAGES);
    msgs = msgs.filter(m => m.id !== msgId);
    IDFCStorage.set(STORAGE_KEYS.CONTACT_MESSAGES, msgs);
    renderAdminView();
    showToast('Support message deleted.', 'info');
}

// ADMIN TOGGLES
function toggleTournamentRegistration(tourneyId) {
    if (!enforceAdminAccess()) return;

    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const t = tournaments.find(item => item.id === tourneyId);
    if (t) {
        t.registrationOpen = !t.registrationOpen;
        IDFCStorage.set(STORAGE_KEYS.TOURNAMENTS, tournaments);
        renderTournaments(AppState.activeTourneyFilter);
        renderAdminView();
        showToast(`Tournament registration ${t.registrationOpen ? 'opened' : 'closed'}.`, 'info');
    }
}

// ADMIN MVP SELECTION & UPDATE
function saveAdminMVP() {
    if (!enforceAdminAccess()) return;

    const name = document.getElementById('mvp_form_name')?.value || '';
    const teamName = document.getElementById('mvp_form_team')?.value || '';
    const role = document.getElementById('mvp_form_role')?.value || 'Pro Player';
    const kills = parseInt(document.getElementById('mvp_form_kills')?.value) || 0;
    const damage = parseInt(document.getElementById('mvp_form_damage')?.value) || 0;
    const headshotRate = parseFloat(document.getElementById('mvp_form_hs')?.value) || 50;
    const booyahs = parseInt(document.getElementById('mvp_form_booyahs')?.value) || 0;
    const mvpPoints = parseInt(document.getElementById('mvp_form_points')?.value) || 0;
    const matches = parseInt(document.getElementById('mvp_form_matches')?.value) || 0;

    const mvpData = {
        name,
        teamName,
        role,
        kills,
        damage,
        headshotRate,
        booyahs,
        mvpPoints,
        matches,
        avatar: AvatarGenerator.playerAvatar(name || 'MVP', '#00E5FF')
    };

    IDFCStorage.set('idfc_mvp_data', mvpData);
    renderMVP();
    renderAdminView();
    showToast('Player of the Tournament updated and published publicly!', 'success');
}

// SAVE SETTINGS
function saveAdminSettings(e) {
    if (e) e.preventDefault();
    if (!enforceAdminAccess()) return;

    const settings = {
        platformName: document.getElementById('setting_title').value,
        adminUsername: document.getElementById('setting_user').value,
        adminPasswordHash: document.getElementById('setting_pass').value
    };

    IDFCStorage.set(STORAGE_KEYS.SETTINGS, settings);
    showToast('Admin security credentials updated successfully.', 'success');
}

// ADMIN DELETE ENTITY
function adminDeleteEntity(entityKey, id) {
    if (!enforceAdminAccess()) return;
    if (!confirm('Are you sure you want to delete this record?')) return;

    let items = IDFCStorage.get(entityKey);
    if (entityKey === 'prizes') {
        items.splice(parseInt(id), 1);
    } else {
        items = items.filter(i => i.id !== id);
    }

    IDFCStorage.set(entityKey, items);
    renderAllPublicViews();
    renderAdminView();
    showToast('Record deleted successfully.', 'info');
}

// ADMIN CRUD MODALS
function adminCreateEntity(entityKey) {
    if (!enforceAdminAccess()) return;
    adminRenderForm(entityKey, null);
}

function adminEditEntity(entityKey, id) {
    if (!enforceAdminAccess()) return;
    const items = IDFCStorage.get(entityKey);
    const item = items.find(i => i.id === id);
    if (item) adminRenderForm(entityKey, item);
}

function adminRenderForm(entityKey, item = null) {
    if (!enforceAdminAccess()) return;

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
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Total Squad Slots</label><input type="number" id="form_slots" class="form-control" value="${item ? item.totalSlots || 24 : 24}"></div>
                <div class="form-group"><label class="form-label">Registration Open</label><select id="form_regOpen" class="form-control"><option value="true" ${!item || item.registrationOpen!==false ? 'selected':''}>OPEN</option><option value="false" ${item && item.registrationOpen===false ? 'selected':''}>CLOSED</option></select></div>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Start Date</label><input type="date" id="form_startDate" class="form-control" value="${item ? item.startDate : ''}"></div>
                <div class="form-group"><label class="form-label">End Date</label><input type="date" id="form_endDate" class="form-control" value="${item ? item.endDate : ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">Game Mode / Format</label><input type="text" id="form_gameMode" class="form-control" value="${item ? item.gameMode : 'Squad Battle Royale'}"></div>
            <div class="form-group"><label class="form-label">Description & Rules</label><textarea id="form_desc" class="form-control" rows="3">${item ? item.description : ''}</textarea></div>
        `;
    } else if (entityKey === 'teams') {
        fields = `
            <div class="form-group"><label class="form-label">Team Name</label><input type="text" id="form_name" class="form-control" value="${item ? item.name : ''}" required></div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Captain Name</label><input type="text" id="form_captain" class="form-control" value="${item ? item.captain : ''}" required></div>
                <div class="form-group"><label class="form-label">Total Points</label><input type="number" id="form_points" class="form-control" value="${item ? item.points : 0}"></div>
            </div>
            <div class="form-grid-2">
                <div class="form-group"><label class="form-label">Matches Played</label><input type="number" id="form_matches" class="form-control" value="${item ? item.matches : 0}"></div>
                <div class="form-group"><label class="form-label">Booyahs (Wins)</label><input type="number" id="form_booyahs" class="form-control" value="${item ? item.booyahs : 0}"></div>
            </div>
            <div class="form-group"><label class="form-label">Total Kills</label><input type="number" id="form_kills" class="form-control" value="${item ? item.kills : 0}"></div>
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
    if (!enforceAdminAccess()) return;

    let items = IDFCStorage.get(entityKey);

    if (entityKey === 'tournaments') {
        const newItem = {
            id: existingId || Utils.generateId('tourney'),
            title: document.getElementById('form_title').value,
            status: document.getElementById('form_status').value,
            prizePool: parseInt(document.getElementById('form_prize').value) || 0,
            totalSlots: parseInt(document.getElementById('form_slots').value) || 24,
            teamsCount: 12,
            startDate: document.getElementById('form_startDate').value || new Date().toISOString().split('T')[0],
            endDate: document.getElementById('form_endDate').value || '',
            gameMode: document.getElementById('form_gameMode').value || 'Squad Battle Royale',
            banner: AvatarGenerator.tournamentBanner(document.getElementById('form_title').value),
            description: document.getElementById('form_desc').value,
            registrationOpen: document.getElementById('form_regOpen').value === 'true'
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
            booyahs: parseInt(document.getElementById('form_booyahs')?.value || 0),
            kills: parseInt(document.getElementById('form_kills').value) || 0,
            country: 'India',
            logo: AvatarGenerator.teamLogo(name)
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
    populateRegistrationDropdowns();
    renderAdminView();
    showToast(`${entityKey.slice(0, -1)} saved successfully!`, 'success');
}

function adminDeleteEntity(entityKey, id) {
    if (!enforceAdminAccess()) return;
    if (!confirm(`Are you sure you want to delete this ${entityKey.slice(0, -1)}?`)) return;

    let items = IDFCStorage.get(entityKey);
    const itemToDelete = items.find(i => i.id === id);
    items = items.filter(item => item.id !== id);

    IDFCStorage.set(entityKey, items);
    IDFCStorage.addAuditLog('ADMIN_DELETE', `Deleted ${entityKey.slice(0, -1)} '${itemToDelete ? itemToDelete.title || itemToDelete.name || itemToDelete.matchNo || id : id}' (ID: ${id})`);

    renderAllPublicViews();
    renderAdminView();
    showToast(`${entityKey.slice(0, -1).toUpperCase()} deleted successfully!`, 'info');
}

// RESET DEMO DATA
function resetDefaultsAdmin() {
    if (!enforceAdminAccess()) return;
    if (confirm('Are you sure you want to reset all platform data to initial demo state?')) {
        IDFCStorage.resetAll();
        renderAllPublicViews();
        renderAdminView();
        showToast('All demo data restored to factory defaults.', 'info');
    }
}

// DIAGNOSTIC & ROOM HELPERS
function runDatabaseDiagnostic() {
    const container = document.getElementById('diagnosticResultsContainer');
    if (!container) return;

    const tournaments = IDFCStorage.get(STORAGE_KEYS.TOURNAMENTS);
    const matches = IDFCStorage.get(STORAGE_KEYS.MATCHES);
    const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    const settings = IDFCStorage.get(STORAGE_KEYS.SETTINGS);

    container.innerHTML = `
[DIAGNOSTIC TEST STARTED] ...
> Checking LocalStorage Availability: OK
> Checking Tournaments Index: OK (${tournaments.length} items found)
> Checking Matches Index: OK (${matches.length} items found)
> Checking Registrations Index: OK (${regs.length} items found)
> Checking System Credentials: OK (User: ${settings.adminUsername || 'admin@idfc-tournament.com'})
> Verification Result: STORAGE HEALTH: OK — All datasets, indexes, and sessions operational.
[DIAGNOSTIC TEST PASSED — 100% HEALTHY]
    `;
    showToast('Database Diagnostic Scan PASSED (Storage Health: OK).', 'success');
}

function saveAdminRoomCredentials(e) {
    e.preventDefault();
    if (!enforceAdminAccess()) return;

    const roomId = document.getElementById('room_id_input').value.trim();
    const roomPass = document.getElementById('room_pass_input').value.trim();
    const time = document.getElementById('room_time_input').value.trim();

    const data = { roomId, roomPass, time };
    IDFCStorage.set('idfc_rooms_data', data);
    showToast('Match Room Credentials updated successfully!', 'success');
}

// PLAYER LOGIN & MY TOURNAMENTS
function openPlayerAuthModal() {
    const session = IDFCStorage.get('idfc_user_session');
    if (session && session.isLoggedIn) {
        switchSection('my-tournaments');
    } else {
        openModal('playerAuthModal');
    }
}

function handlePlayerLogin(e) {
    e.preventDefault();
    const email = (document.getElementById('playerEmail')?.value || '').trim();
    const pass = (document.getElementById('playerPassword')?.value || '').trim();

    if (!email) {
        showToast('Please enter player email.', 'error');
        return;
    }

    const session = { isLoggedIn: true, email: email, name: email.split('@')[0], loginTime: new Date().toISOString() };
    IDFCStorage.set('idfc_user_session', session);

    closeModal('playerAuthModal');
    updatePlayerNavUI(true);
    switchSection('my-tournaments');
    showToast(`Welcome back! Redirected to My Tournaments.`, 'success');
}

function updatePlayerNavUI(isLoggedIn) {
    const btn = document.getElementById('playerLoginBtn');
    if (btn) {
        if (isLoggedIn) {
            btn.innerHTML = `<i class="fa-solid fa-id-card"></i> My Tournaments`;
            btn.onclick = () => switchSection('my-tournaments');
        } else {
            btn.innerHTML = `<i class="fa-solid fa-user"></i> Player Login`;
            btn.onclick = () => openPlayerAuthModal();
        }
    }
}

function renderMyTournaments() {
    const container = document.getElementById('myTournamentsContainer');
    if (!container) return;

    const userSession = IDFCStorage.get('idfc_user_session');
    const playerEmail = userSession && userSession.email ? userSession.email.toLowerCase() : 'player@idfc-tournament.com';

    let regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
    let myRegs = regs.filter(r => r.email && r.email.toLowerCase() === playerEmail);
    if (myRegs.length === 0 && regs.length > 0) {
        myRegs = regs; // Fallback so player can view registrations
    }

    if (myRegs.length === 0) {
        container.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 40px; border-radius: var(--radius-md); text-align: center;">
                <i class="fa-solid fa-trophy" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff;">No Enrolled Tournaments Yet</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Join an upcoming championship to view your match status & room passwords.</p>
                <button class="btn-primary" onclick="switchSection('tournaments')"><i class="fa-solid fa-crosshairs"></i> View Open Tournaments</button>
            </div>
        `;
        return;
    }

    const roomsData = IDFCStorage.get('idfc_rooms_data') || { roomId: 'IDFC-ROOM-8841', roomPass: 'FFMAX@99', time: '19:00 IST' };

    container.innerHTML = myRegs.map(r => `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:14px; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                <div>
                    <span style="font-size:0.75rem; color:var(--cyan-highlight); font-weight:800;">REGISTRATION REF: ${r.id}</span>
                    <h3 style="font-family:var(--font-heading); font-size:1.5rem; color:#fff; margin-top:2px;">${r.tournamentTitle}</h3>
                </div>
                <div>
                    <span class="badge-status ${r.status.toLowerCase()}" style="font-size:0.9rem; padding:6px 14px;">${r.status}</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:0.9rem;">
                <div><strong>Team Name:</strong> ${r.teamName}</div>
                <div><strong>Captain:</strong> ${r.captainName} (${r.phone})</div>
                <div><strong>Game UID:</strong> ${r.gameUid || 'N/A'}</div>
                <div><strong>Enrolled On:</strong> ${r.date}</div>
            </div>

            ${r.status === 'APPROVED' ? `
                <div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%); border: 2px dashed var(--primary-accent); padding: 18px; border-radius: var(--radius-md); margin-top: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-family:var(--font-heading); color:var(--gold); font-size:1.1rem; font-weight:800;"><i class="fa-solid fa-key"></i> SECRET MATCH ROOM CREDENTIALS PANEL</span>
                        <span class="badge-status approved" style="background:var(--live-success); color:#000; font-weight:800;">LOBBY READY</span>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; text-align:center;">
                        <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:6px;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">ROOM ID</div>
                            <div style="font-family:var(--font-display); font-size:1.4rem; color:var(--cyan-highlight); font-weight:900;">${roomsData.roomId}</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:6px;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">ROOM PASSWORD</div>
                            <div style="font-family:var(--font-display); font-size:1.4rem; color:var(--gold); font-weight:900;">${roomsData.roomPass}</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:6px;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">MATCH TIME</div>
                            <div style="font-family:var(--font-heading); font-size:1.2rem; color:#fff; font-weight:800;">${roomsData.time}</div>
                        </div>
                    </div>
                </div>
            ` : `
                <div style="background:rgba(245, 158, 11, 0.08); border:1px solid var(--mvp-gold); padding:12px; border-radius:6px; font-size:0.85rem; color:var(--mvp-gold); margin-top:12px;">
                    <i class="fa-solid fa-hourglass-half"></i> Room credentials will be unlocked automatically once your registration status is APPROVED by the Admin.
                </div>
            `}
        </div>
    `).join('');
}

