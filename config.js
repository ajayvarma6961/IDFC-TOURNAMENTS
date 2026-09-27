/**
 * IDFC ESPORTS - CONFIGURATION & DEMO DATA
 * Centralized data management and default state with LocalStorage persistence.
 * Palette: Futuristic Electric Cyan & Violet Theme
 */

const STORAGE_KEYS = {
    TOURNAMENTS: 'idfc_tournaments',
    TEAMS: 'idfc_teams',
    PLAYERS: 'idfc_players',
    MATCHES: 'idfc_matches',
    LEADERBOARD: 'idfc_leaderboard',
    MVP_PLAYER_ID: 'idfc_mvp_id',
    PRIZES: 'idfc_prizes',
    NEWS: 'idfc_news',
    REGISTRATIONS: 'idfc_registrations',
    SETTINGS: 'idfc_settings',
    ADMIN_SESSION: 'idfc_admin_auth',
    CONTACT_MESSAGES: 'idfc_contact_messages'
};

// Generator for SVG Data URLs for crisp, guaranteed non-broken esports imagery
const AvatarGenerator = {
    teamLogo: (name, color1 = '#00E5FF', color2 = '#7C3AED') => {
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${color1}" />
                    <stop offset="100%" stop-color="${color2}" />
                </linearGradient>
            </defs>
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="#0D1322" stroke="url(#grad_${initials})" stroke-width="4"/>
            <polygon points="50,14 84,30 84,70 50,86 16,70 16,30" fill="rgba(255,255,255,0.03)" />
            <text x="50" y="58" font-family="'Rajdhani', sans-serif" font-weight="700" font-size="28" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">${initials}</text>
        </svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },
    playerAvatar: (name, accent = '#00E5FF') => {
        const initials = name.substring(0, 2).toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#111827" stroke="${accent}" stroke-width="3"/>
            <circle cx="50" cy="38" r="18" fill="#172033" stroke="${accent}" stroke-width="1.5"/>
            <path d="M 22,82 C 22,62 34,54 50,54 C 66,54 78,62 78,82 Z" fill="#172033" stroke="${accent}" stroke-width="1.5"/>
            <text x="50" y="44" font-family="'Rajdhani', sans-serif" font-weight="700" font-size="14" fill="#F8FAFC" text-anchor="middle">${initials}</text>
        </svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },
    tournamentBanner: (title, subtitle = 'IDFC OFFICIAL') => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#070B14" />
                    <stop offset="50%" stop-color="#0D1322" />
                    <stop offset="100%" stop-color="#111827" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00E5FF" />
                    <stop offset="100%" stop-color="#7C3AED" />
                </linearGradient>
            </defs>
            <rect width="600" height="300" fill="url(#bgGrad)" />
            <path d="M-50,300 L250,0 L350,0 L650,300 Z" fill="rgba(0,229,255,0.06)" />
            <circle cx="500" cy="80" r="140" fill="none" stroke="rgba(124,58,237,0.15)" stroke-width="2" />
            <line x1="40" y1="220" x2="560" y2="220" stroke="url(#lineGrad)" stroke-width="3" />
            <text x="50" y="140" font-family="'Rajdhani', sans-serif" font-weight="800" font-size="42" fill="#F8FAFC" letter-spacing="2">${title.toUpperCase()}</text>
            <text x="50" y="180" font-family="'Outfit', sans-serif" font-weight="600" font-size="18" fill="#22D3EE" letter-spacing="4">${subtitle.toUpperCase()}</text>
            <rect x="50" y="70" width="125" height="26" rx="4" fill="url(#lineGrad)" />
            <text x="112" y="87" font-family="'Rajdhani', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">FREE FIRE MAX</text>
        </svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },
    newsBanner: (title) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250">
            <rect width="500" height="250" fill="#111827"/>
            <path d="M0,0 L500,250 L0,250 Z" fill="rgba(0, 229, 255, 0.05)"/>
            <rect x="30" y="30" width="440" height="190" fill="none" stroke="#243047" stroke-width="2" rx="8"/>
            <circle cx="250" cy="110" r="40" fill="#0D1322" stroke="#00E5FF" stroke-width="2"/>
            <polygon points="240,95 268,110 240,125" fill="#00E5FF"/>
            <text x="250" y="185" font-family="'Rajdhani', sans-serif" font-weight="700" font-size="20" fill="#F8FAFC" text-anchor="middle">${title}</text>
        </svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
};

// Datasets (No Demo/Sample Teams, Players, Prizes, News, or Matches)
const DEFAULT_TEAMS = [];
const DEFAULT_PLAYERS = [];
const DEFAULT_PRIZES = [];
const DEFAULT_NEWS = [];

const DEFAULT_TOURNAMENTS = [];

const DEFAULT_MATCHES = [];

const DEFAULT_REGISTRATIONS = [];

const DEFAULT_CONTACT_MESSAGES = [
    {
        id: 'msg-101',
        name: 'Rohan Gupta',
        email: 'rohan.g@gmail.com',
        subject: 'Tournament Schedule Query',
        message: 'Hello IDFC team, when will the fixture schedule for IDFC Pro League qualifiers be published?',
        date: '2026-09-26 16:45',
        status: 'UNREAD'
    }
];

const DEFAULT_SETTINGS = {
    platformName: 'IDFC ESPORTS',
    supportEmail: 'support@idfcesports.com',
    discordUrl: 'https://discord.gg/idfcesports',
    adminUsername: 'ajay',
    adminPasswordHash: 'Ajayvarma6961'
};

// LocalStorage Helper API
const IDFCStorage = {
    init: function() {
        // Clean out demo data from existing browser localStorage if present
        ['idfc_teams', 'idfc_players', 'idfc_prizes', 'idfc_news'].forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        const cleaned = parsed.filter(item => {
                            const id = String(item.id || '');
                            return !id.startsWith('team-') && !id.startsWith('plr-') && !id.startsWith('news-');
                        });
                        if (key === 'idfc_prizes' || key === 'idfc_news') {
                            localStorage.setItem(key, JSON.stringify([]));
                        } else {
                            localStorage.setItem(key, JSON.stringify(cleaned));
                        }
                    } else {
                        localStorage.setItem(key, JSON.stringify([]));
                    }
                } catch (e) {
                    localStorage.setItem(key, JSON.stringify([]));
                }
            } else {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Clean demo registration IDFC-REG-00125 if present
        const regData = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
        if (regData) {
            try {
                const regs = JSON.parse(regData);
                if (Array.isArray(regs)) {
                    const cleanedRegs = regs.filter(r => r.id !== 'IDFC-REG-00125');
                    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(cleanedRegs));
                }
            } catch (e) {}
        } else {
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
        }

        // Clean demo matches from localStorage if present
        const matchData = localStorage.getItem(STORAGE_KEYS.MATCHES);
        if (matchData) {
            try {
                const matches = JSON.parse(matchData);
                if (Array.isArray(matches)) {
                    const demoIds = ['match-1', 'match-2', 'match-3', 'match-4', 'match-5'];
                    const cleanedMatches = matches.filter(m => !demoIds.includes(m.id));
                    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(cleanedMatches));
                } else {
                    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
                }
            } catch (e) {
                localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
            }
        } else {
            localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
        }

        // Migrate old wrongly-keyed 'tournaments' if present
        const oldTournaments = localStorage.getItem('tournaments');
        if (oldTournaments) {
            try {
                const oldList = JSON.parse(oldTournaments);
                if (Array.isArray(oldList) && oldList.length > 0) {
                    const currentList = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOURNAMENTS) || '[]');
                    const merged = [...oldList, ...currentList];
                    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
                    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(unique));
                }
            } catch (e) {}
            localStorage.removeItem('tournaments');
        }

        let tournamentsStr = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
        if (!tournamentsStr) {
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
        } else {
            try {
                const parsed = JSON.parse(tournamentsStr);
                const cleaned = parsed.filter(t => t.id !== 'tourney-1' && t.id !== 'tourney-2' && t.id !== 'tourney-4');
                localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(cleaned));
            } catch (e) {
                localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
            }
        }
        if (!localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES)) {
            localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(DEFAULT_CONTACT_MESSAGES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
    },
    resolveKey: function(key) {
        if (key === 'tournaments') return STORAGE_KEYS.TOURNAMENTS;
        if (key === 'matches') return STORAGE_KEYS.MATCHES;
        if (key === 'teams') return STORAGE_KEYS.TEAMS;
        if (key === 'registrations') return STORAGE_KEYS.REGISTRATIONS;
        if (key === 'prizes') return STORAGE_KEYS.PRIZES;
        if (key === 'news') return STORAGE_KEYS.NEWS;
        if (key === 'settings') return STORAGE_KEYS.SETTINGS;
        if (key === 'contact_messages') return STORAGE_KEYS.CONTACT_MESSAGES;
        return key;
    },
    get: function(key) {
        try {
            const actualKey = this.resolveKey(key);
            const data = localStorage.getItem(actualKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading key', key, e);
            return [];
        }
    },
    set: function(key, val) {
        try {
            const actualKey = this.resolveKey(key);
            localStorage.setItem(actualKey, JSON.stringify(val));
            return true;
        } catch (e) {
            console.error('Error saving key', key, e);
            return false;
        }
    },
    getNextRegistrationId: function() {
        const regs = IDFCStorage.get(STORAGE_KEYS.REGISTRATIONS);
        let maxNum = 1000;
        regs.forEach(r => {
            if (r.id) {
                const num = parseInt(String(r.id).replace(/[^0-9]/g, ''), 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const next = maxNum + 1;
        return `REG-${next}`;
    },
    resetAll: function() {
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(DEFAULT_TOURNAMENTS));
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES));
        localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(DEFAULT_CONTACT_MESSAGES));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        localStorage.removeItem(STORAGE_KEYS.MVP_PLAYER_ID);
        localStorage.removeItem('idfc_mvp_data');
    }
};

// Auto initialize storage on script load
IDFCStorage.init();

// Global Utils
const Utils = {
    formatCurrency: (num) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    },
    formatDate: (dateStr) => {
        if (!dateStr) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    },
    generateId: (prefix = 'id') => {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    },
    safeImage: (url, fallbackSvg) => {
        return url && url.trim() !== '' ? url : fallbackSvg;
    }
};
