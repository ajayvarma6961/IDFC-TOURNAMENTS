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
    ADMIN_SESSION: 'idfc_admin_auth'
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

// Initial Demo Datasets
const DEFAULT_TEAMS = [
    { id: 'team-1', name: 'Total Gaming Esports', short: 'TG', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Total Gaming', '#00E5FF', '#7C3AED'), matches: 42, wins: 18, booyahs: 18, points: 412, kills: 215, captain: 'FozyAjay' },
    { id: 'team-2', name: 'Team Elite', short: 'TE', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Team Elite', '#22D3EE', '#7C3AED'), matches: 40, wins: 15, booyahs: 15, points: 385, kills: 198, captain: 'Pahadi' },
    { id: 'team-3', name: 'Galaxy Racer', short: 'GXR', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Galaxy Racer', '#7C3AED', '#00E5FF'), matches: 38, wins: 12, booyahs: 12, points: 340, kills: 176, captain: 'Vasiyo' },
    { id: 'team-4', name: 'Nigma Galaxy', short: 'NG', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Nigma Galaxy', '#22C55E', '#00E5FF'), matches: 39, wins: 11, booyahs: 11, points: 318, kills: 162, captain: 'Mafia' },
    { id: 'team-5', name: 'GodLike Esports', short: 'GOD', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('GodLike Esports', '#F59E0B', '#00E5FF'), matches: 36, wins: 10, booyahs: 10, points: 295, kills: 154, captain: 'Iconic' },
    { id: 'team-6', name: 'Chemist Esports', short: 'CE', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Chemist Esports', '#7C3AED', '#22D3EE'), matches: 35, wins: 9, booyahs: 9, points: 280, kills: 140, captain: 'Jonty' },
    { id: 'team-7', name: 'Orangutan Elite', short: 'OGE', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Orangutan Elite', '#00E5FF', '#F59E0B'), matches: 34, wins: 8, booyahs: 8, points: 262, kills: 132, captain: 'Killer' },
    { id: 'team-8', name: 'Desi Gamers Esports', short: 'DG', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Desi Gamers', '#22C55E', '#7C3AED'), matches: 33, wins: 7, booyahs: 7, points: 245, kills: 125, captain: 'Amitbhai' },
    { id: 'team-9', name: 'TSG Army', short: 'TSG', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('TSG Army', '#7C3AED', '#00E5FF'), matches: 32, wins: 6, booyahs: 6, points: 228, kills: 118, captain: 'Ritik' },
    { id: 'team-10', name: 'Team Lava', short: 'LAVA', country: 'India', flag: '🇮🇳', logo: AvatarGenerator.teamLogo('Team Lava', '#22D3EE', '#7C3AED'), matches: 30, wins: 5, booyahs: 5, points: 210, kills: 105, captain: 'Golden' }
];

const DEFAULT_PLAYERS = [
    { id: 'plr-1', name: 'Pahadi', teamId: 'team-2', teamName: 'Team Elite', role: 'Sniper / ICL', kills: 78, damage: 41250, headshots: 42, matches: 40, booyahs: 15, mvpPoints: 1240, headshotRate: 53.8, avatar: AvatarGenerator.playerAvatar('Pahadi', '#00E5FF') },
    { id: 'plr-2', name: 'FozyAjay', teamId: 'team-1', teamName: 'Total Gaming', role: 'Captain / Assaulter', kills: 72, damage: 38900, headshots: 38, matches: 42, booyahs: 18, mvpPoints: 1180, headshotRate: 52.7, avatar: AvatarGenerator.playerAvatar('FozyAjay', '#7C3AED') },
    { id: 'plr-3', name: 'Vasiyo', teamId: 'team-3', teamName: 'Galaxy Racer', role: 'In-Game Leader', kills: 68, damage: 36500, headshots: 33, matches: 38, booyahs: 12, mvpPoints: 1090, headshotRate: 48.5, avatar: AvatarGenerator.playerAvatar('Vasiyo', '#22D3EE') },
    { id: 'plr-4', name: 'Mafia', teamId: 'team-4', teamName: 'Nigma Galaxy', role: 'Fragger', kills: 65, damage: 34100, headshots: 35, matches: 39, booyahs: 11, mvpPoints: 1020, headshotRate: 53.8, avatar: AvatarGenerator.playerAvatar('Mafia', '#22C55E') },
    { id: 'plr-5', name: 'Killer', teamId: 'team-7', teamName: 'Orangutan Elite', role: 'Rusher', kills: 64, damage: 33800, headshots: 40, matches: 34, booyahs: 8, mvpPoints: 990, headshotRate: 62.5, avatar: AvatarGenerator.playerAvatar('Killer', '#7C3AED') },
    { id: 'plr-6', name: 'Iconic', teamId: 'team-5', teamName: 'GodLike Esports', role: 'Sniper', kills: 61, damage: 32000, headshots: 36, matches: 36, booyahs: 10, mvpPoints: 960, headshotRate: 59.0, avatar: AvatarGenerator.playerAvatar('Iconic', '#F59E0B') },
    { id: 'plr-7', name: 'Jonty', teamId: 'team-6', teamName: 'Chemist Esports', role: 'Support', kills: 58, damage: 31200, headshots: 28, matches: 35, booyahs: 9, mvpPoints: 910, headshotRate: 48.2, avatar: AvatarGenerator.playerAvatar('Jonty', '#00E5FF') },
    { id: 'plr-8', name: 'Golden', teamId: 'team-10', teamName: 'Team Lava', role: 'Assaulter', kills: 54, damage: 29800, headshots: 31, matches: 30, booyahs: 5, mvpPoints: 850, headshotRate: 57.4, avatar: AvatarGenerator.playerAvatar('Golden', '#22D3EE') },
    { id: 'plr-9', name: 'Teammate', teamId: 'team-1', teamName: 'Total Gaming', role: 'Flanker', kills: 52, damage: 28400, headshots: 25, matches: 42, booyahs: 18, mvpPoints: 830, headshotRate: 48.0, avatar: AvatarGenerator.playerAvatar('Teammate', '#7C3AED') },
    { id: 'plr-10', name: 'Prince', teamId: 'team-2', teamName: 'Team Elite', role: 'Rusher', kills: 50, damage: 27900, headshots: 29, matches: 40, booyahs: 15, mvpPoints: 810, headshotRate: 58.0, avatar: AvatarGenerator.playerAvatar('Prince', '#00E5FF') },
    { id: 'plr-11', name: 'Amitbhai', teamId: 'team-8', teamName: 'Desi Gamers', role: 'Leader', kills: 48, damage: 26500, headshots: 22, matches: 33, booyahs: 7, mvpPoints: 780, headshotRate: 45.8, avatar: AvatarGenerator.playerAvatar('Amitbhai', '#22C55E') },
    { id: 'plr-12', name: 'Ritik', teamId: 'team-9', teamName: 'TSG Army', role: 'Assaulter', kills: 46, damage: 25200, headshots: 24, matches: 32, booyahs: 6, mvpPoints: 750, headshotRate: 52.1, avatar: AvatarGenerator.playerAvatar('Ritik', '#7C3AED') },
    { id: 'plr-13', name: 'RNS Gamer', teamId: 'team-3', teamName: 'Galaxy Racer', role: 'Sniper', kills: 44, damage: 24800, headshots: 27, matches: 38, booyahs: 12, mvpPoints: 730, headshotRate: 61.3, avatar: AvatarGenerator.playerAvatar('RNS Gamer', '#22D3EE') },
    { id: 'plr-14', name: 'Nikhil', teamId: 'team-4', teamName: 'Nigma Galaxy', role: 'Support', kills: 42, damage: 23600, headshots: 19, matches: 39, booyahs: 11, mvpPoints: 700, headshotRate: 45.2, avatar: AvatarGenerator.playerAvatar('Nikhil', '#22C55E') },
    { id: 'plr-15', name: 'Oldmonk', teamId: 'team-5', teamName: 'GodLike Esports', role: 'Flanker', kills: 40, damage: 22900, headshots: 21, matches: 36, booyahs: 10, mvpPoints: 680, headshotRate: 52.5, avatar: AvatarGenerator.playerAvatar('Oldmonk', '#F59E0B') },
    { id: 'plr-16', name: 'Viper', teamId: 'team-6', teamName: 'Chemist Esports', role: 'Rusher', kills: 38, damage: 21800, headshots: 20, matches: 35, booyahs: 9, mvpPoints: 650, headshotRate: 52.6, avatar: AvatarGenerator.playerAvatar('Viper', '#00E5FF') },
    { id: 'plr-17', name: 'Shadow', teamId: 'team-7', teamName: 'Orangutan Elite', role: 'Support', kills: 36, damage: 20900, headshots: 18, matches: 34, booyahs: 8, mvpPoints: 620, headshotRate: 50.0, avatar: AvatarGenerator.playerAvatar('Shadow', '#7C3AED') },
    { id: 'plr-18', name: 'Aghori', teamId: 'team-8', teamName: 'Desi Gamers', role: 'Sniper', kills: 34, damage: 19800, headshots: 22, matches: 33, booyahs: 7, mvpPoints: 590, headshotRate: 64.7, avatar: AvatarGenerator.playerAvatar('Aghori', '#22C55E') },
    { id: 'plr-19', name: 'Legend', teamId: 'team-9', teamName: 'TSG Army', role: 'Rusher', kills: 32, damage: 18700, headshots: 17, matches: 32, booyahs: 6, mvpPoints: 560, headshotRate: 53.1, avatar: AvatarGenerator.playerAvatar('Legend', '#7C3AED') },
    { id: 'plr-20', name: 'Ignite', teamId: 'team-10', teamName: 'Team Lava', role: 'Support', kills: 30, damage: 17400, headshots: 14, matches: 30, booyahs: 5, mvpPoints: 530, headshotRate: 46.6, avatar: AvatarGenerator.playerAvatar('Ignite', '#22D3EE') }
];

const DEFAULT_TOURNAMENTS = [
    {
        id: 'tourney-1',
        title: 'IDFC Battle Arena Season 4',
        status: 'LIVE',
        prizePool: 100000,
        teamsCount: 18,
        totalSlots: 24,
        startDate: '2026-09-25',
        endDate: '2026-10-02',
        gameMode: 'Squad - Bermuda & Purgatory',
        entryFee: 'FREE (Invite / Qualifiers)',
        banner: AvatarGenerator.tournamentBanner('IDFC Battle Arena S4', 'LIVE NOW • ₹1,00,000 PRIZE POOL'),
        description: 'The flagship Free Fire MAX tournament of IDFC Esports. 24 top professional squads fight across 6 action-packed days for the championship trophy and massive cash prizes.',
        registrationOpen: false
    },
    {
        id: 'tourney-2',
        title: 'IDFC Pro League Championship 2026',
        status: 'UPCOMING',
        prizePool: 250000,
        teamsCount: 12,
        totalSlots: 48,
        startDate: '2026-10-10',
        endDate: '2026-10-25',
        gameMode: 'Squad - Battle Royale (All Maps)',
        entryFee: '₹500 / Squad',
        banner: AvatarGenerator.tournamentBanner('IDFC Pro League 2026', 'REGISTRATION OPEN • ₹2,50,000'),
        description: 'Open to all verified Free Fire teams across the nation. Qualifiers start Oct 10, leading up to the grand finals broadcast live.',
        registrationOpen: true
    },
    {
        id: 'tourney-3',
        title: 'IDFC Clash Squad Championship',
        status: 'UPCOMING',
        prizePool: 50000,
        teamsCount: 8,
        totalSlots: 32,
        startDate: '2026-10-05',
        endDate: '2026-10-07',
        gameMode: '4v4 Clash Squad Knockout',
        entryFee: 'FREE',
        banner: AvatarGenerator.tournamentBanner('Clash Squad Showdown', 'FAST-PACED 4v4 KNOCKOUT'),
        description: 'High stakes 4v4 clash squad format. Fast-paced intense matches where tactical skill and headshot precision win the day.',
        registrationOpen: true
    },
    {
        id: 'tourney-4',
        title: 'IDFC Survival Series Fall 2026',
        status: 'UPCOMING',
        prizePool: 75000,
        teamsCount: 4,
        totalSlots: 24,
        startDate: '2026-11-01',
        endDate: '2026-11-12',
        gameMode: 'Squad - Survival Hardcore Mode',
        entryFee: 'FREE',
        banner: AvatarGenerator.tournamentBanner('Survival Series Fall', 'HARDCORE BATTLE ROYALE'),
        description: 'Focusing on placement points, tactical rotations, and zone control. Survival points are doubled!',
        registrationOpen: true
    },
    {
        id: 'tourney-5',
        title: 'IDFC Summer Masters 2026',
        status: 'COMPLETED',
        prizePool: 150000,
        teamsCount: 24,
        totalSlots: 24,
        startDate: '2026-08-10',
        endDate: '2026-08-18',
        gameMode: 'Squad - Official Esports Preset',
        entryFee: 'Invite Only',
        banner: AvatarGenerator.tournamentBanner('Summer Masters 2026', 'CHAMPION: TOTAL GAMING'),
        description: 'Concluded with Total Gaming taking the crown in a thrilling match 12 clutch victory over Team Elite.',
        registrationOpen: false,
        winnerTeam: 'Total Gaming Esports'
    }
];

const DEFAULT_MATCHES = [
    { id: 'match-1', matchNo: 'Match 12 (Grand Finals)', tournament: 'IDFC Battle Arena Season 4', map: 'Bermuda', date: '2026-09-27', time: '18:00 IST', status: 'LIVE', teams: ['Total Gaming', 'Team Elite', 'Galaxy Racer', 'Nigma Galaxy'], streamUrl: '#', winner: null, kills: null },
    { id: 'match-2', matchNo: 'Match 13', tournament: 'IDFC Battle Arena Season 4', map: 'Purgatory', date: '2026-09-27', time: '19:15 IST', status: 'UPCOMING', teams: ['GodLike Esports', 'Chemist Esports', 'Orangutan Elite', 'TSG Army'], streamUrl: '#' },
    { id: 'match-3', matchNo: 'Match 14', tournament: 'IDFC Battle Arena Season 4', map: 'Kalahari', date: '2026-09-27', time: '20:30 IST', status: 'UPCOMING', teams: ['Desi Gamers', 'Team Lava', 'Total Gaming', 'Team Elite'], streamUrl: '#' },
    { id: 'match-4', matchNo: 'Match 11', tournament: 'IDFC Battle Arena Season 4', map: 'Alpine', date: '2026-09-26', time: '21:00 IST', status: 'COMPLETED', teams: ['Total Gaming', 'Team Elite', 'Galaxy Racer', 'Nigma Galaxy'], winner: 'Team Elite', kills: 14, placementPts: 12, totalPts: 26 },
    { id: 'match-5', matchNo: 'Match 10', tournament: 'IDFC Battle Arena Season 4', map: 'Bermuda', date: '2026-09-26', time: '19:45 IST', status: 'COMPLETED', teams: ['Total Gaming', 'GodLike Esports', 'Chemist Esports'], winner: 'Total Gaming Esports', kills: 16, placementPts: 12, totalPts: 28 },
    { id: 'match-6', matchNo: 'Match 9', tournament: 'IDFC Battle Arena Season 4', map: 'NexTerra', date: '2026-09-26', time: '18:30 IST', status: 'COMPLETED', teams: ['Galaxy Racer', 'Orangutan Elite', 'Desi Gamers'], winner: 'Galaxy Racer', kills: 12, placementPts: 12, totalPts: 24 },
    { id: 'match-7', matchNo: 'Match 8', tournament: 'IDFC Battle Arena Season 4', map: 'Purgatory', date: '2026-09-25', time: '21:00 IST', status: 'COMPLETED', teams: ['Nigma Galaxy', 'TSG Army', 'Team Lava'], winner: 'Nigma Galaxy', kills: 11, placementPts: 12, totalPts: 23 },
    { id: 'match-8', matchNo: 'Match 7', tournament: 'IDFC Battle Arena Season 4', map: 'Kalahari', date: '2026-09-25', time: '19:45 IST', status: 'COMPLETED', teams: ['GodLike Esports', 'Chemist Esports', 'Team Elite'], winner: 'GodLike Esports', kills: 10, placementPts: 12, totalPts: 22 },
    { id: 'match-9', matchNo: 'Qualifier R1', tournament: 'IDFC Pro League 2026', map: 'Bermuda', date: '2026-10-10', time: '16:00 IST', status: 'UPCOMING', teams: ['Open Pool A'] },
    { id: 'match-10', matchNo: 'Qualifier R2', tournament: 'IDFC Pro League 2026', map: 'Purgatory', date: '2026-10-10', time: '17:30 IST', status: 'UPCOMING', teams: ['Open Pool B'] }
];

const DEFAULT_PRIZES = [
    { rank: '1st Place', title: 'Grand Champion', amount: 50000, badge: '🏆 GOLD CHAMPION', perk: 'Trophy + Direct Seed to National Finals' },
    { rank: '2nd Place', title: 'Runner Up', amount: 25000, badge: '🥈 SILVER MEDALIST', perk: 'Custom IDFC Esports Merch Kit' },
    { rank: '3rd Place', title: '2nd Runner Up', amount: 15000, badge: '🥉 BRONZE MEDALIST', perk: 'IDFC Pro League Direct Invite' },
    { rank: 'MVP Player', title: 'Tournament MVP', amount: 5000, badge: '👑 MOST VALUABLE PLAYER', perk: 'Special MVP Gaming Headset + Badge' },
    { rank: 'Top Fragger', title: 'Most Kills Award', amount: 3000, badge: '🎯 TOP GUNNER', perk: 'Free Fire 10,000 Diamonds Pack' },
    { rank: 'Best Squad', title: 'Teamwork Excellence', amount: 2000, badge: '🔥 BOOYAH SQUAD', perk: 'IDFC Gaming Jersey set for squad' }
];

const DEFAULT_NEWS = [
    {
        id: 'news-1',
        title: 'IDFC Battle Arena Season 4 Grand Finals Kicks Off Today!',
        date: '2026-09-27',
        category: 'TOURNAMENT NEWS',
        image: AvatarGenerator.newsBanner('SEASON 4 GRAND FINALS'),
        summary: 'The top 18 Free Fire MAX teams across India lock horns for the ₹1,00,000 prize pool in a thrilling 6-map grand finale.',
        content: `The stage is set and the weapons are loaded! IDFC Battle Arena Season 4 reaches its climax today with 18 power-packed squads clashing across Bermuda, Purgatory, Kalahari, Alpine, and NexTerra. Total Gaming Esports currently leads the leaderboard by a narrow 27-point margin over Team Elite. Tune into the live stream at 18:00 IST!`
    },
    {
        id: 'news-2',
        title: 'Pahadi Crowned MVP Leader in IDFC Mid-Season Rankings',
        date: '2026-09-26',
        category: 'PLAYER SPOTLIGHT',
        image: AvatarGenerator.newsBanner('PAHADI MVP SPOTLIGHT'),
        summary: 'Team Elite sniper Pahadi secures 78 total frags with an astonishing 53.8% headshot precision rate.',
        content: `Pahadi continues to demonstrate world-class sniper mechanics in IDFC Esports competitions. Having accumulated over 41,000 total damage and 78 total kills, he has officially claimed the top spot on the IDFC MVP Leaderboard. We caught up with Pahadi for an exclusive interview on his training routine.`
    },
    {
        id: 'news-3',
        title: 'IDFC Pro League 2026 Registrations Are Now Official Open!',
        date: '2026-09-24',
        category: 'ANNOUNCEMENT',
        image: AvatarGenerator.newsBanner('PRO LEAGUE REGISTRATION'),
        summary: 'Registration for the ₹2,50,000 IDFC Pro League is now open to all verified Free Fire teams nationwide.',
        content: `Calling all Free Fire commanders! Registration for IDFC Pro League 2026 is officially open. Squads can register using our simple registration portal. Slots are capped at 48 teams on a first-come, first-served basis. Secure your spot now to compete against India's best.`
    },
    {
        id: 'news-4',
        title: 'Free Fire MAX OB45 Patch: Esports Weapon Balance Changes',
        date: '2026-09-22',
        category: 'GAME UPDATES',
        image: AvatarGenerator.newsBanner('FREE FIRE PATCH BREAKDOWN'),
        summary: 'An overview of how the latest weapon recoil updates and character skill balances affect competitive strategy in IDFC tournaments.',
        content: `With the arrival of the OB45 update, IDFC Esports refines tournament rules. Marksman rifles receive slight recoil adjustments, while Gloo Wall character abilities undergo a 1.5s cooldown shift. Teams will need to adapt their strategies ahead of the playoffs.`
    },
    {
        id: 'news-5',
        title: 'Galaxy Racer Clutches Unbelievable 1v4 Booyah in Match 9',
        date: '2026-09-20',
        category: 'MATCH RECAP',
        image: AvatarGenerator.newsBanner('UNBELIEVABLE 1v4 CLUTCH'),
        summary: 'Vasiyo pulls off an extraordinary 1v4 victory in the final zone circle against Nigma Galaxy.',
        content: `In what observers are calling the highlight play of Season 4, Vasiyo from Galaxy Racer managed to wipe out a full 4-man roster of Nigma Galaxy inside the shrinking NexTerra electromagnetic zone. Utilizing double M1887 shotgun blasts, he secured the Booyah.`
    }
];

const DEFAULT_REGISTRATIONS = [
    {
        id: 'reg-101',
        tournamentId: 'tourney-2',
        tournamentTitle: 'IDFC Pro League Championship 2026',
        teamName: 'Viper Warriors',
        captainName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        email: 'aarav.viper@gmail.com',
        player1: 'Viper_Aarav (UID: 98124712)',
        player2: 'Viper_Rohan (UID: 98124713)',
        player3: 'Viper_Kabir (UID: 98124714)',
        player4: 'Viper_Dev (UID: 98124715)',
        substitute: 'Viper_Sub (UID: 98124716)',
        date: '2026-09-26 14:30',
        status: 'APPROVED'
    }
];

// LocalStorage Helper API
const IDFCStorage = {
    init: function() {
        if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(DEFAULT_TOURNAMENTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
            localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
            localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(DEFAULT_PLAYERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
            localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PRIZES)) {
            localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(DEFAULT_PRIZES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
            localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(DEFAULT_REGISTRATIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MVP_PLAYER_ID)) {
            localStorage.setItem(STORAGE_KEYS.MVP_PLAYER_ID, 'plr-1'); // Default to Pahadi
        }
    },
    get: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading key', key, e);
            return [];
        }
    },
    set: function(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
            return true;
        } catch (e) {
            console.error('Error saving key', key, e);
            return false;
        }
    },
    resetAll: function() {
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(DEFAULT_TOURNAMENTS));
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(DEFAULT_PLAYERS));
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES));
        localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(DEFAULT_PRIZES));
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(DEFAULT_REGISTRATIONS));
        localStorage.setItem(STORAGE_KEYS.MVP_PLAYER_ID, 'plr-1');
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
