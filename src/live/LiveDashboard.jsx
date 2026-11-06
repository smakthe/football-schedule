import React from 'react'

    const e = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const API = '/api/football-hub/scoreboard'
    const API_MONTH = '/api/football-hub/month'
    const IST = 'Asia/Kolkata'
    const DAY_MS = 86_400_000
    const AUTO_REFRESH_MS = 30_000
    const FUTURE_REFRESH_MS = 5 * 60_000

    const EN = {
      'brand.title': 'Football',
      'brand.kicker': 'Live scores · European club season',
      'brand.open': 'Open football scores',
      'brand.close': 'Close football hub',
      'brand.football': 'Football',
      'timezone': 'IST · UTC+5:30',
      'timezone.short': 'IST',
      'top.status': 'Live scores · results · fixtures',
      'top.live': '{count} live',
      'action.today': 'Today',
      'action.refresh': 'Refresh scores',
      'action.prevDay': 'Previous day',
      'action.nextDay': 'Next day',
      'action.retry': 'Try again',
      'action.clear': 'Clear filters',
      'action.about': 'About this data',
      'filter.all': 'All',
      'filter.live': 'Live',
      'filter.results': 'Results',
      'filter.upcoming': 'Upcoming',
      'view.label': 'Calendar view',
      'view.day': 'Day',
      'view.month': 'Month',
      'month.prev': 'Previous month',
      'month.next': 'Next month',
      'month.today': 'Go to the current month',
      'month.fixtures': '{count} fixtures',
      'month.fixture': '1 fixture',
      'month.competitions': '{count} competitions',
      'month.competition': '1 competition',
      'month.meta': '{fixtures} · {competitions}',
      'month.hint': 'Pick a date to open its matchday',
      'month.matchdayNote': 'Matchdays use venue-local dates · Kick-off times are IST in day view',
      'month.loading': 'Loading the month overview',
      'month.derby': 'Derby',
      'month.legend': 'League colours',
      'month.empty': 'No fixtures this month',
      'leagues.all': 'All leagues',
      'date.match.oneLeague': '1 match across 1 league',
      'date.match.manyLeagues': '1 match across {leagues} leagues',
      'date.matches.oneLeague': '{count} matches across 1 league',
      'date.matches.manyLeagues': '{count} matches across {leagues} leagues',
      'date.allTimes': 'All times IST',
      'date.today': 'Today',
      'date.tomorrow': 'Tomorrow',
      'date.yesterday': 'Yesterday',
      'date.empty': 'No matches',
      'status.live': 'LIVE',
      'status.upcoming': 'Upcoming',
      'status.ft': 'FT',
      'status.local': 'Local',
      'status.kickoff': 'Kick-off',
      'status.liveNow': 'Live now',
      'status.finished': 'Full time',
      'status.noLive': 'No live matches',
      'status.postponed': 'Postponed',
      'league.matchCount': '{count} matches',
      'league.matchCountOne': '1 match',
      'league.liveCount': '{count} live',
      'empty.title': 'No matches on this matchday',
      'empty.body': 'There are no fixtures in this view. Try another day or clear the filters.',
      'empty.filtered': 'Nothing matches the current filters. Try another league, day or status.',
      'error.title': 'The feed went quiet',
      'error.body': 'The football scores could not be loaded. Check the connection and try again.',
      'error.detail': 'Details: {detail}',
      'warning.partial': 'Some competitions could not refresh: {leagues}. The rest of the matchday is below.',
      'warning.refresh': 'A live refresh failed just now. The last successful scores are shown below.',
      'loading.title': 'Loading the matchday',
      'loading.body': 'Fetching scores, statuses and kick-off times.',
      'updated': 'Updated {time} IST',
      'updated.never': 'Waiting for the first update',
      'autoRefresh': 'Auto-refresh · 30s live · 5m future',
      'skeleton.league': 'Loading league fixtures',
      'about.body':
        "Scores, match status and kick-off instants come from the ESPN football feed. Kick-off times are converted from UTC to IST (UTC+5:30); the venue-local time uses the venue country's IANA time zone, including daylight saving. Late kick-offs whose IST date is the next day are labelled with that date. Postponed, cancelled, suspended and abandoned matches are labelled instead of showing a score. No result is predicted.",
      'about.refresh':
        'While this panel is open, recent matchdays and the current month refresh every 30 seconds. Future matchdays and future months refresh every 5 minutes, and opening a date or month always asks the feed for the latest released schedule. Each update replaces the previous snapshot; if the feed cannot be reached, the last successful snapshot is kept and marked as stale.',
      'about.month':
        'The month view groups fixtures by venue-local matchday. Dots show the leagues playing that day; when a league is selected, each dot counts one of its matches. A star marks a curated derby pairing.',
      'about.source': 'Source',
      'about.crests': 'Club and competition crests are loaded from ESPN.',
      'footer.credit': 'Football data and crests: ESPN · Times converted to IST (UTC+5:30)',
      'filter.none': 'Nothing here yet',
      'fixture.versus': '{home} versus {away}',
      'fixture.score': '{home} {homeScore}, {away} {awayScore}',
      'fixture.upcoming': 'Kick-off {time} IST',
      'fixture.live': 'Live, {clock}',
      'fixture.finished': 'Full time',
      'fixture.special': '{status}',
      'fixture.local': 'Local time {time} in {city}',
      'fixture.venue': 'at {venue}',
    }

    const FALLBACK_LEAGUES = [
      { key: 'premier-league', name: 'Premier League', chip: 'Premier League', shortName: 'PL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', accent: '#7c3aed', accent2: '#3b0764', ink: '#ffffff' },
      { key: 'la-liga', name: 'La Liga', chip: 'La Liga', shortName: 'LL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', accent: '#f04438', accent2: '#7a1010', ink: '#ffffff' },
      { key: 'bundesliga', name: 'Bundesliga', chip: 'Bundesliga', shortName: 'BL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png', accent: '#d70a1e', accent2: '#5e0710', ink: '#ffffff' },
      { key: 'ligue-1', name: 'Ligue 1', chip: 'Ligue 1', shortName: 'L1', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png', accent: '#3155d4', accent2: '#0b1d54', ink: '#ffffff' },
      { key: 'serie-a', name: 'Serie A', chip: 'Serie A', shortName: 'SA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png', accent: '#0784c7', accent2: '#053a6b', ink: '#ffffff' },
      { key: 'champions-league', name: 'Champions League', chip: 'Champions League', shortName: 'UCL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png', accent: '#3559d6', accent2: '#b9964e', ink: '#ffffff' },
    ]

    const ALL_THEME = { key: 'all', accent: '#e2ba62', accent2: '#8b5f1c', ink: '#211503' }
    const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const LIVE_THEME_KEYS = ['--bg', '--surface', '--surface-2', '--border', '--border-hover', '--text', '--text-dim', '--text-faint', '--glow']
    const LIVE_LEAGUE_PALETTES = {
      'premier-league': {
        '--bg': '#0E0A1E', '--surface': '#17123A', '--surface-2': '#201848',
        '--border': 'rgba(180,160,255,0.1)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#A89DC8', '--text-faint': '#6B5F8E',
        '--glow': 'color-mix(in srgb, #6C3FE0 28%, transparent)',
      },
      'la-liga': {
        '--bg': '#1C0C08', '--surface': '#2E1610', '--surface-2': '#3D1E16',
        '--border': 'rgba(255,150,120,0.1)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#CBA090', '--text-faint': '#8E6558',
        '--glow': 'color-mix(in srgb, #FF6A45 28%, transparent)',
      },
      bundesliga: {
        '--bg': '#1C0A0E', '--surface': '#2E1218', '--surface-2': '#3D1A22',
        '--border': 'rgba(255,120,140,0.1)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#CB9AA2', '--text-faint': '#8E5860',
        '--glow': 'color-mix(in srgb, #FF3B4E 28%, transparent)',
      },
      'ligue-1': {
        '--bg': '#080D1E', '--surface': '#0F1838', '--surface-2': '#152248',
        '--border': 'rgba(120,160,255,0.1)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#97ABCB', '--text-faint': '#5A6E8E',
        '--glow': 'color-mix(in srgb, #3B6FE0 28%, transparent)',
      },
      'serie-a': {
        '--bg': '#061426', '--surface': '#0A2036', '--surface-2': '#0D2A48',
        '--border': 'rgba(120,190,255,0.12)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#9AB0C4', '--text-faint': '#5F7890',
        '--glow': 'color-mix(in srgb, #0784C7 28%, transparent)',
      },
      'champions-league': {
        '--bg': '#02072D', '--surface': '#040F59', '--surface-2': '#071B85',
        '--border': 'rgba(179,181,189,0.15)', '--border-hover': 'rgba(255,255,255,0.22)',
        '--text': '#F3F5F0', '--text-dim': '#B3B5BD', '--text-faint': '#696E7E',
        '--glow': 'color-mix(in srgb, #B3B5BD 28%, transparent)',
      },
    }

    const CSS = `
      .dsff-root, .dsff-root * { box-sizing: border-box; }
      .dsff-root { color: var(--dsw-alias-label-primary); font-family: inherit; }

      .dsff-launcher {
        position: fixed; right: 22px; bottom: 22px; z-index: 80;
        display: inline-flex; align-items: center; gap: 9px;
        padding: 9px 15px 9px 10px; border-radius: 999px;
        border: 1px solid rgba(255,255,255,.34);
        background: linear-gradient(135deg, #f6d887 0%, #e2b657 55%, #c89535 100%);
        color: #211503; font: inherit; font-size: 12.5px; font-weight: 750;
        letter-spacing: .015em; cursor: pointer; pointer-events: auto;
        box-shadow: 0 14px 40px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.22);
        transition: transform .18s ease, box-shadow .18s ease;
      }
      .dsff-launcher:hover { transform: translateY(-2px); box-shadow: 0 18px 46px rgba(0,0,0,.34), 0 3px 10px rgba(0,0,0,.24); }
      .dsff-launcher:active { transform: translateY(0); }
      .dsff-launcher:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 3px; }
      .dsff-launcher-mark {
        width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
        background: #211503; color: #f6d887; flex: none;
      }
      .dsff-launcher-meta { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; line-height: 1; }
      .dsff-launcher-meta small { font-size: 8px; font-weight: 700; letter-spacing: .14em; opacity: .62; }

      .dsff-layer { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; pointer-events: none; }
      .dsff-scrim {
        position: absolute; inset: 0; pointer-events: auto; border: 0; padding: 0;
        background: rgba(5, 8, 17, .62); backdrop-filter: blur(7px);
        animation: dsff-fade .2s ease both;
      }
      .dsff-panel {
        position: relative; pointer-events: auto;
        width: min(1120px, calc(100vw - 44px));
        height: min(900px, calc(100vh - 44px));
        max-height: calc(100vh - 44px);
        border-radius: 26px; overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l1);
        background:
          radial-gradient(900px 390px at 8% -8%, color-mix(in srgb, var(--dsff-accent) 23%, transparent), transparent 62%),
          radial-gradient(720px 380px at 100% 0%, color-mix(in srgb, var(--dsff-accent-2) 17%, transparent), transparent 58%),
          var(--dsw-alias-bg-base);
        box-shadow: 0 40px 120px rgba(0,0,0,.48), 0 2px 0 rgba(255,255,255,.04) inset;
        display: flex; flex-direction: column;
        animation: dsff-rise .28s cubic-bezier(.2,.75,.25,1) both;
      }
      .dsff-panel::after {
        content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
        background-image: linear-gradient(rgba(255,255,255,.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
        background-size: 64px 64px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.7), transparent 52%);
      }
      .dsff-shell { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; max-height: 100%; overflow: hidden; }
      .dsff-topbar {
        display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
        padding: 22px 24px 0; flex: none;
      }
      .dsff-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .dsff-brand-mark {
        width: 42px; height: 42px; flex: none; border-radius: 13px; display: grid; place-items: center;
        color: #201504; background: linear-gradient(145deg, #f7dc8e, #dfb252);
        box-shadow: 0 7px 20px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.55);
        transform: rotate(-3deg);
      }
      .dsff-brand-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .dsff-brand-title { margin: 0; font-size: 19px; line-height: 1.05; letter-spacing: -.035em; font-weight: 780; }
      .dsff-brand-title em { font-style: normal; color: var(--dsff-accent); margin-left: 3px; }
      .dsff-eyebrow {
        font-size: 9px; line-height: 1.1; font-weight: 760; letter-spacing: .17em;
        text-transform: uppercase; color: var(--dsw-alias-label-secondary);
      }
      .dsff-top-actions { display: flex; align-items: center; gap: 8px; flex: none; padding-top: 1px; }
      .dsff-tz {
        display: inline-flex; align-items: baseline; gap: 5px; padding: 7px 10px; border-radius: 10px;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 74%, transparent);
        border: 1px solid var(--dsw-alias-border-l1);
        color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 780; letter-spacing: .12em;
        white-space: nowrap;
      }
      .dsff-tz b { color: var(--dsw-alias-label-primary); font-size: 10px; letter-spacing: .08em; }
      .dsff-icon-btn {
        width: 34px; height: 34px; display: grid; place-items: center; flex: none;
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);
        color: var(--dsw-alias-label-secondary); cursor: pointer;
        transition: color .16s ease, border-color .16s ease, background .16s ease;
      }
      .dsff-icon-btn:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
      .dsff-icon-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .dsff-icon-btn:disabled { opacity: .45; cursor: default; }
      .dsff-icon-btn.is-spinning svg { animation: dsff-spin .8s linear infinite; }

      .dsff-league-nav {
        display: flex; align-items: center; gap: 7px; overflow-x: auto; flex: none;
        padding: 17px 24px 15px; border-bottom: 1px solid var(--dsw-alias-border-l1);
        scrollbar-width: none;
      }
      .dsff-league-nav::-webkit-scrollbar { display: none; }
      .dsff-chip {
        min-height: 30px; flex: none; display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 9px 5px 6px; border-radius: 999px; cursor: pointer;
        border: 1px solid var(--dsw-alias-border-l1);
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 76%, transparent);
        color: var(--dsw-alias-label-secondary);
        font: inherit; font-size: 9.5px; font-weight: 760; letter-spacing: .075em; text-transform: uppercase;
        transition: color .15s ease, border-color .15s ease, background .15s ease, transform .15s ease;
        white-space: nowrap;
      }
      .dsff-chip:hover { color: var(--dsw-alias-label-primary); border-color: color-mix(in srgb, var(--chip-accent) 55%, var(--dsw-alias-border-l1)); transform: translateY(-1px); }
      .dsff-chip.is-active {
        color: var(--chip-ink);
        background: linear-gradient(140deg, var(--chip-accent), color-mix(in srgb, var(--chip-accent) 62%, #000 18%));
        border-color: color-mix(in srgb, var(--chip-accent) 70%, #fff 8%);
        box-shadow: 0 5px 16px color-mix(in srgb, var(--chip-accent) 28%, transparent);
      }
      .dsff-chip:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-chip-count {
        min-width: 15px; height: 15px; padding: 0 4px; border-radius: 999px;
        display: grid; place-items: center; font-size: 8.5px; font-weight: 800; letter-spacing: .02em;
        background: rgba(127,127,127,.17); color: currentColor;
      }
      .dsff-chip.is-active .dsff-chip-count { background: rgba(255,255,255,.2); }
      .dsff-chip-logo {
        width: 19px; height: 19px; flex: none; border-radius: 50%; display: grid; place-items: center;
        background: rgba(255,255,255,.94); overflow: hidden; color: #18202d;
      }
      .dsff-chip-logo img { width: 15px; height: 15px; object-fit: contain; display: block; }
      .dsff-chip-logo .dsff-league-mark { width: 19px; height: 19px; border: 0; box-shadow: none; background: transparent; }
      .dsff-chip-logo .dsff-league-mark img { width: 15px; height: 15px; }
      .dsff-chip-all { width: 19px; height: 19px; flex: none; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.17); }

      .dsff-content {
        flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
        padding: 0 24px 22px; scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--dsw-alias-label-secondary) 30%, transparent) transparent;
      }
      .dsff-content::-webkit-scrollbar { width: 8px; }
      .dsff-content::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--dsw-alias-label-secondary) 30%, transparent); border-radius: 99px; }
      .dsff-progress { position: absolute; z-index: 3; top: 0; left: 0; right: 0; height: 2px; overflow: hidden; background: transparent; }
      .dsff-progress::after { content: ''; display: block; width: 36%; height: 100%; background: var(--dsff-accent); animation: dsff-progress 1.1s ease-in-out infinite; }

      .dsff-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 0 2px; flex-wrap: wrap; }
      .dsff-filters { display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent); }
      .dsff-filter {
        display: inline-flex; align-items: center; gap: 6px; min-height: 27px; padding: 4px 10px;
        border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary);
        font: inherit; font-size: 10px; font-weight: 760; letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
        transition: background .15s ease, color .15s ease;
      }
      .dsff-filter:hover { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); }
      .dsff-filter.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
      .dsff-filter:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 1px; }
      .dsff-filter-count { font-size: 8.5px; opacity: .58; font-weight: 800; }
      .dsff-filter-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--dsw-alias-state-error-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent); }
      .dsff-live-summary { display: inline-flex; align-items: center; gap: 7px; color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 650; }
      .dsff-live-summary b { color: var(--dsw-alias-label-primary); font-weight: 800; }
      .dsff-view-switch {
        display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent);
      }
      .dsff-view-btn {
        display: inline-flex; align-items: center; gap: 6px; min-height: 27px; padding: 4px 10px;
        border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary);
        font: inherit; font-size: 9.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; cursor: pointer;
        transition: background .15s ease, color .15s ease, box-shadow .15s ease;
      }
      .dsff-view-btn:hover { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); }
      .dsff-view-btn.is-active {
        color: var(--dsw-alias-label-primary);
        background: color-mix(in srgb, var(--dsff-accent) 15%, var(--dsw-alias-bg-layer-2));
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsff-accent) 30%, var(--dsw-alias-border-l1));
      }
      .dsff-view-btn:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 1px; }
      .dsff-month-hint { color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 760; letter-spacing: .1em; text-transform: uppercase; }

      .dsff-month-head {
        width: min(760px, 100%); margin: 0 auto; display: grid; grid-template-columns: 36px 1fr auto;
        align-items: center; gap: 12px; padding: 18px 0 13px; text-align: center;
      }
      .dsff-month-arrow {
        width: 35px; height: 35px; display: grid; place-items: center; border-radius: 50%;
        border: 1px solid var(--dsw-alias-border-l1); background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent); color: var(--dsw-alias-label-secondary); cursor: pointer;
      }
      .dsff-month-arrow:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
      .dsff-month-arrow:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-month-title { min-width: 0; }
      .dsff-month-title h2 { margin: 0; font-size: 24px; line-height: 1.08; letter-spacing: -.04em; font-weight: 790; }
      .dsff-month-title h2 span { color: var(--dsw-alias-label-secondary); font-size: 14px; font-weight: 500; letter-spacing: .02em; margin-left: 3px; }
      .dsff-month-title p { display: flex; align-items: center; justify-content: center; gap: 7px; margin: 5px 0 0; color: var(--dsw-alias-label-secondary); font-size: 9.5px; font-weight: 600; }
      .dsff-month-title p b { color: var(--dsw-alias-label-primary); font-weight: 760; }
      .dsff-month-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }

      .dsff-month-weekdays {
        width: min(760px, 100%); margin: 0 auto; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;
        padding: 0 0 7px; color: var(--dsw-alias-label-secondary);
      }
      .dsff-month-weekdays span { text-align: center; font-size: 8.5px; font-weight: 780; letter-spacing: .14em; opacity: .72; }
      .dsff-month { width: min(760px, 100%); margin: 0 auto; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
      .dsff-month-cell {
        position: relative; min-width: 0; min-height: 84px; padding: 10px 11px 9px; display: flex; flex-direction: column; align-items: flex-start;
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; cursor: pointer; font: inherit; text-align: left;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 56%, transparent); color: var(--dsw-alias-label-primary);
        transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease, box-shadow .15s ease;
      }
      .dsff-month-cell:hover { border-color: var(--dsw-alias-border-l2); background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 80%, transparent); transform: translateY(-1px); }
      .dsff-month-cell:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-month-cell.is-outside { opacity: .36; }
      .dsff-month.is-league-filtered .dsff-month-cell.has-fixtures {
        background: color-mix(in srgb, var(--cell-accent) 12%, var(--dsw-alias-bg-layer-1));
        border-color: color-mix(in srgb, var(--cell-accent) 28%, var(--dsw-alias-border-l1));
      }
      .dsff-month-cell.is-today { border-color: color-mix(in srgb, var(--dsff-accent) 55%, var(--dsw-alias-border-l1)); }
      .dsff-month-cell.is-today .dsff-month-day { color: var(--dsff-accent); }
      .dsff-month .dsff-month-cell.is-selected {
        background: linear-gradient(145deg, #f7d982 0%, #e8bd55 100%);
        border-color: #f0d178; color: #211503; box-shadow: 0 10px 26px rgba(180, 132, 30, .26), inset 0 1px 0 rgba(255,255,255,.55);
      }
      .dsff-month-cell.is-selected.is-outside { opacity: 1; }
      .dsff-month-cell.is-selected .dsff-month-day { color: #211503; }
      .dsff-month-day { font-size: 13px; line-height: 1; font-weight: 720; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
      .dsff-month-star { position: absolute; top: 7px; right: 9px; font-size: 11px; line-height: 1; color: #e6b444; text-shadow: 0 1px 3px rgba(0,0,0,.18); }
      .dsff-month-cell.is-selected .dsff-month-star { color: #6b4b0c; text-shadow: none; }
      .dsff-month-dots { display: flex; align-items: center; gap: 3px; min-height: 4px; margin-top: auto; }
      .dsff-month-dots i { width: 4px; height: 4px; border-radius: 50%; display: block; }
      .dsff-month-cell.is-selected .dsff-month-dots i { box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
      .dsff-month-legend {
        width: min(760px, 100%); margin: 0 auto; display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
        padding: 14px 2px 0; color: var(--dsw-alias-label-secondary);
      }
      .dsff-legend-label { font-size: 8px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; opacity: .65; }
      .dsff-legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 8.5px; font-weight: 730; letter-spacing: .07em; text-transform: uppercase; }
      .dsff-legend-dot { width: 5px; height: 5px; border-radius: 50%; display: block; }
      .dsff-legend-derby { margin-left: auto; }
      .dsff-legend-derby b { color: #e6b444; font-size: 12px; line-height: 1; }
      .dsff-month-note { width: min(760px, 100%); margin: 8px auto 0; color: var(--dsw-alias-label-secondary); font-size: 8.5px; line-height: 1.4; opacity: .72; }
      .dsff-month-empty { width: min(760px, 100%); margin: 18px auto 0; padding: 16px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 10px; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 10px; }
      .dsff-month-skeleton { width: min(760px, 100%); margin: 0 auto; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
      .dsff-month-skeleton-cell {
        min-height: 84px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1);
        background: linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-label-secondary) 6%, transparent), color-mix(in srgb, var(--dsw-alias-label-secondary) 13%, transparent), color-mix(in srgb, var(--dsw-alias-label-secondary) 6%, transparent));
        background-size: 200% 100%; animation: dsff-shimmer 1.5s ease-in-out infinite;
      }

      .dsff-dateblock { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 20px 0 15px; flex-wrap: wrap; }
      .dsff-date-copy { min-width: 0; }
      .dsff-date-kicker { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .dsff-date-kicker .dsff-eyebrow { color: var(--dsff-accent); }
      .dsff-today-flag { padding: 3px 7px; border-radius: 5px; font-size: 8px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--dsff-accent-ink); background: var(--dsff-accent); }
      .dsff-date-title { margin: 0; font-size: clamp(26px, 3.2vw, 38px); line-height: 1.02; letter-spacing: -.045em; font-weight: 790; }
      .dsff-date-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: 8px 0 0; color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 560; }
      .dsff-date-meta b { color: var(--dsw-alias-label-primary); font-weight: 720; }
      .dsff-meta-sep { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: .45; }
      .dsff-date-actions { display: flex; align-items: center; gap: 8px; padding-top: 20px; }
      .dsff-today-btn {
        display: inline-flex; align-items: center; gap: 7px; min-height: 33px; padding: 6px 12px;
        border: 1px solid color-mix(in srgb, var(--dsff-accent) 60%, var(--dsw-alias-border-l1));
        border-radius: 9px; cursor: pointer;
        color: var(--dsff-accent-ink); background: var(--dsff-accent); font: inherit; font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase;
        box-shadow: 0 5px 18px color-mix(in srgb, var(--dsff-accent) 20%, transparent);
      }
      .dsff-today-btn:hover { filter: brightness(1.06); }
      .dsff-today-btn:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }

      .dsff-date-rail { display: flex; align-items: stretch; justify-content: center; gap: 8px; padding-bottom: 20px; }
      .dsff-rail-arrow {
        width: 31px; min-height: 54px; flex: none; display: grid; place-items: center;
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; cursor: pointer;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent);
        color: var(--dsw-alias-label-secondary);
      }
      .dsff-rail-arrow:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
      .dsff-rail-arrow:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-days { display: grid; grid-template-columns: repeat(9, minmax(44px, 1fr)); gap: 6px; flex: 0 1 560px; min-width: 0; }
      .dsff-day {
        position: relative; min-width: 0; min-height: 54px; padding: 7px 4px 6px;
        border: 1px solid transparent; border-radius: 11px; cursor: pointer; font: inherit;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 54%, transparent);
        color: var(--dsw-alias-label-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
        transition: background .16s ease, color .16s ease, border-color .16s ease, transform .16s ease;
      }
      .dsff-day:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); transform: translateY(-1px); }
      .dsff-day:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-day-week { font-size: 8px; line-height: 1; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; opacity: .72; }
      .dsff-day-num { font-size: 17px; line-height: 1.05; font-weight: 780; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
      .dsff-day.is-today .dsff-day-num { color: var(--dsff-accent); }
      .dsff-day.is-selected {
        color: var(--dsff-accent-ink); background: linear-gradient(150deg, color-mix(in srgb, var(--dsff-accent) 86%, #fff 12%), var(--dsff-accent));
        border-color: color-mix(in srgb, var(--dsff-accent) 55%, #fff 20%);
        box-shadow: 0 7px 20px color-mix(in srgb, var(--dsff-accent) 27%, transparent), inset 0 1px 0 rgba(255,255,255,.45);
      }
      .dsff-day.is-selected .dsff-day-week { opacity: .65; }
      .dsff-day.is-selected .dsff-day-num { color: inherit; }
      .dsff-day-today-dot { position: absolute; left: 50%; bottom: 5px; width: 3px; height: 3px; margin-left: -1.5px; border-radius: 50%; background: var(--dsff-accent); }
      .dsff-day.is-selected .dsff-day-today-dot { background: currentColor; opacity: .55; }

      .dsff-banner {
        display: flex; align-items: flex-start; gap: 9px; margin: 0 0 14px; padding: 10px 12px; border-radius: 10px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 30%, var(--dsw-alias-border-l1));
        background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 9%, var(--dsw-alias-bg-layer-1));
        color: var(--dsw-alias-label-primary); font-size: 11px; line-height: 1.45;
      }
      .dsff-banner svg { flex: none; margin-top: 1px; color: var(--dsw-alias-state-warn-primary); }

      .dsff-sections { display: flex; flex-direction: column; gap: 13px; }
      .dsff-league-card {
        position: relative; overflow: hidden; border-radius: 16px;
        border: 1px solid color-mix(in srgb, var(--dsff-accent) 24%, var(--dsw-alias-border-l1));
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--dsff-accent) 8%, transparent), transparent 44%),
          color-mix(in srgb, var(--dsff-accent) 3.5%, var(--dsw-alias-bg-layer-1));
        box-shadow: 0 8px 28px rgba(0,0,0,.08);
      }
      .dsff-league-card::before {
        content: ''; position: absolute; left: 0; right: 0; top: 0; height: 2px;
        background: linear-gradient(90deg, var(--dsff-accent), var(--dsff-accent-2) 58%, transparent 100%);
      }
      .dsff-card-head { display: flex; align-items: center; gap: 11px; padding: 12px 15px; min-height: 62px; }
      .dsff-league-mark {
        width: 32px; height: 32px; flex: none; display: grid; place-items: center; border-radius: 50%;
        background: #fff; border: 1px solid rgba(0,0,0,.08); overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,.14);
      }
      .dsff-league-mark img { width: 24px; height: 24px; object-fit: contain; display: block; }
      .dsff-league-mark.is-large { width: 38px; height: 38px; }
      .dsff-league-mark.is-large img { width: 28px; height: 28px; }
      .dsff-league-name { margin: 0; font-size: 13px; line-height: 1.15; font-weight: 780; letter-spacing: -.012em; }
      .dsff-league-meta { margin: 3px 0 0; color: var(--dsw-alias-label-secondary); font-size: 9.5px; font-weight: 570; letter-spacing: .025em; }
      .dsff-league-live {
        margin-left: auto; display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 8px; border-radius: 999px; font-size: 8.5px; font-weight: 820; letter-spacing: .09em; text-transform: uppercase;
        color: #fff; background: var(--dsw-alias-state-error-primary);
      }
      .dsff-league-live i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: dsff-pulse 1.7s ease-out infinite; }
      .dsff-card-body { border-top: 1px solid color-mix(in srgb, var(--dsff-accent) 17%, var(--dsw-alias-border-l1)); }

      .dsff-match {
        display: grid; grid-template-columns: minmax(0, 1fr) 128px minmax(0, 1fr); align-items: center;
        gap: 10px; min-height: 71px; padding: 10px 15px; position: relative;
        border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 72%, transparent);
        transition: background .16s ease;
      }
      .dsff-match:first-child { border-top: 0; }
      .dsff-match:hover { background: color-mix(in srgb, var(--dsff-accent) 5%, transparent); }
      .dsff-match.is-live { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 5%, transparent); box-shadow: inset 2px 0 0 var(--dsw-alias-state-error-primary); }
      .dsff-team { min-width: 0; display: flex; align-items: center; gap: 10px; }
      .dsff-team--home { justify-content: flex-end; text-align: right; }
      .dsff-team--away { justify-content: flex-start; text-align: left; }
      .dsff-team-name { min-width: 0; font-size: 13px; line-height: 1.16; font-weight: 670; letter-spacing: -.012em; overflow-wrap: anywhere; }
      .dsff-match.is-finished .dsff-team-name { color: var(--dsw-alias-label-secondary); }
      .dsff-match.is-finished .dsff-team.is-winner .dsff-team-name { color: var(--dsw-alias-label-primary); font-weight: 800; }
      .dsff-crest {
        width: 29px; height: 29px; flex: none; object-fit: contain; display: block;
        border-radius: 50%; padding: 3px; background: rgba(255,255,255,.97);
        box-shadow: 0 2px 7px rgba(0,0,0,.16), inset 0 0 0 1px rgba(0,0,0,.06);
      }
      .dsff-crest-fallback {
        width: 29px; height: 29px; flex: none; display: grid; place-items: center; border-radius: 50%;
        background: color-mix(in srgb, var(--team-color, var(--dsw-alias-bg-layer-2)) 22%, #fff);
        border: 1px solid rgba(0,0,0,.08); color: #111827; font-size: 7px; font-weight: 850; letter-spacing: .02em;
      }
      .dsff-center { min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; }
      .dsff-kickoff { display: inline-flex; align-items: baseline; gap: 4px; font-size: 16px; line-height: 1; font-weight: 790; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
      .dsff-kickoff small { font-size: 7.5px; line-height: 1; font-weight: 850; letter-spacing: .09em; color: var(--dsw-alias-label-secondary); }
      .dsff-kick-date { font-size: 8.5px; line-height: 1.15; font-weight: 720; letter-spacing: .055em; color: var(--dsff-accent); text-transform: uppercase; }
      .dsff-local { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 8.5px; line-height: 1.15; font-weight: 550; color: var(--dsw-alias-label-secondary); opacity: .82; }
      .dsff-score { display: inline-flex; align-items: baseline; gap: 5px; font-size: 22px; line-height: .95; font-weight: 820; letter-spacing: -.055em; font-variant-numeric: tabular-nums; }
      .dsff-score em { font-style: normal; font-size: 14px; font-weight: 470; opacity: .38; letter-spacing: 0; }
      .dsff-score.is-live { color: var(--dsw-alias-state-error-primary); }
      .dsff-final { display: inline-flex; align-items: center; gap: 5px; font-size: 8px; line-height: 1; font-weight: 830; letter-spacing: .12em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .dsff-pens { font-size: 8px; line-height: 1.1; font-weight: 700; letter-spacing: .04em; color: var(--dsw-alias-label-secondary); }
      .dsff-final::before { content: ''; width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: .5; }
      .dsff-live-line { display: inline-flex; align-items: center; gap: 5px; font-size: 8px; line-height: 1; font-weight: 850; letter-spacing: .11em; text-transform: uppercase; color: var(--dsw-alias-state-error-primary); }
      .dsff-live-line i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: dsff-pulse 1.5s ease-out infinite; }
      .dsff-ist-time { font-size: 8.5px; line-height: 1.1; font-weight: 760; letter-spacing: .03em; color: var(--dsw-alias-label-primary); opacity: .86; font-variant-numeric: tabular-nums; }
      .dsff-ist-time small { font-size: 7px; font-weight: 780; letter-spacing: .07em; color: var(--dsw-alias-label-secondary); }
      .dsff-special { font-size: 9px; line-height: 1.1; font-weight: 820; letter-spacing: .09em; text-transform: uppercase; color: var(--dsw-alias-state-warn-primary); }
      .dsff-special-time { font-size: 9px; font-weight: 650; color: var(--dsw-alias-label-secondary); }

      .dsff-empty, .dsff-error {
        min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 32px 20px; border-radius: 16px;
        border: 1px dashed var(--dsw-alias-border-l2);
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 58%, transparent);
      }
      .dsff-empty-icon, .dsff-error-icon {
        width: 58px; height: 58px; border-radius: 18px; display: grid; place-items: center; margin-bottom: 15px;
        color: var(--dsff-accent); background: color-mix(in srgb, var(--dsff-accent) 13%, transparent);
        border: 1px solid color-mix(in srgb, var(--dsff-accent) 24%, var(--dsw-alias-border-l1));
      }
      .dsff-empty h3, .dsff-error h3 { margin: 0; font-size: 17px; letter-spacing: -.02em; font-weight: 760; }
      .dsff-empty p, .dsff-error p { max-width: 460px; margin: 7px 0 0; font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
      .dsff-empty-actions, .dsff-error-actions { display: flex; align-items: center; gap: 8px; margin-top: 17px; flex-wrap: wrap; justify-content: center; }
      .dsff-primary-btn, .dsff-ghost-btn {
        min-height: 32px; padding: 6px 12px; border-radius: 8px; font: inherit; font-size: 10px; font-weight: 780; letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
      }
      .dsff-primary-btn { border: 1px solid color-mix(in srgb, var(--dsff-accent) 60%, var(--dsw-alias-border-l1)); background: var(--dsff-accent); color: var(--dsff-accent-ink); }
      .dsff-ghost-btn { border: 1px solid var(--dsw-alias-border-l1); background: transparent; color: var(--dsw-alias-label-secondary); }
      .dsff-primary-btn:hover, .dsff-ghost-btn:hover { filter: brightness(1.06); color: var(--dsw-alias-label-primary); }
      .dsff-primary-btn:focus-visible, .dsff-ghost-btn:focus-visible { outline: 2px solid var(--dsff-accent); outline-offset: 2px; }
      .dsff-error-detail { margin-top: 9px; max-width: 620px; font-size: 9.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); opacity: .7; overflow-wrap: anywhere; }

      .dsff-skeleton-wrap { display: flex; flex-direction: column; gap: 12px; }
      .dsff-skeleton-card { border-radius: 16px; border: 1px solid var(--dsw-alias-border-l1); overflow: hidden; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 58%, transparent); }
      .dsff-skeleton-head { display: flex; align-items: center; gap: 10px; padding: 13px 15px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .dsff-skeleton-dot, .dsff-skeleton-line, .dsff-skeleton-score { background: linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-label-secondary) 9%, transparent), color-mix(in srgb, var(--dsw-alias-label-secondary) 17%, transparent), color-mix(in srgb, var(--dsw-alias-label-secondary) 9%, transparent)); background-size: 200% 100%; animation: dsff-shimmer 1.5s ease-in-out infinite; border-radius: 6px; }
      .dsff-skeleton-dot { width: 30px; height: 30px; border-radius: 50%; flex: none; }
      .dsff-skeleton-line { width: 130px; height: 8px; }
      .dsff-skeleton-line.is-short { width: 78px; height: 7px; margin-top: 5px; }
      .dsff-skeleton-row { display: grid; grid-template-columns: 1fr 96px 1fr; align-items: center; gap: 12px; padding: 14px 15px; border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 65%, transparent); }
      .dsff-skeleton-row:first-of-type { border-top: 0; }
      .dsff-skeleton-team { height: 9px; border-radius: 4px; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 11%, transparent); }
      .dsff-skeleton-team.is-right { justify-self: end; width: 62%; }
      .dsff-skeleton-team.is-left { justify-self: start; width: 58%; }
      .dsff-skeleton-score { width: 55px; height: 18px; justify-self: center; }
      .dsff-loading-copy { display: flex; align-items: center; gap: 9px; padding: 8px 2px 12px; color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 600; }
      .dsff-loading-copy i { width: 7px; height: 7px; border-radius: 50%; background: var(--dsff-accent); animation: dsff-pulse 1.5s ease-out infinite; }

      .dsff-about { margin-top: 18px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 4px; }
      .dsff-about summary { display: flex; align-items: center; gap: 8px; padding: 10px 0; cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 9px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; list-style: none; }
      .dsff-about summary::-webkit-details-marker { display: none; }
      .dsff-about summary:hover { color: var(--dsw-alias-label-primary); }
      .dsff-about summary svg { transition: transform .18s ease; }
      .dsff-about[open] summary svg { transform: rotate(180deg); }
      .dsff-about-body { padding: 2px 0 14px; max-width: 820px; }
      .dsff-about-body p { margin: 0 0 8px; font-size: 10.5px; line-height: 1.58; color: var(--dsw-alias-label-secondary); }
      .dsff-about-body a { color: var(--dsff-accent); text-decoration: none; font-weight: 700; }
      .dsff-about-body a:hover { text-decoration: underline; }
      .dsff-credit { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 2px 0 0; padding: 11px 0 0; border-top: 1px solid var(--dsw-alias-border-l1); font-size: 9px; line-height: 1.3; color: var(--dsw-alias-label-secondary); opacity: .8; }
      .dsff-credit span { display: inline-flex; align-items: center; gap: 5px; }

      .dsff-spin { animation: dsff-spin .8s linear infinite; }
      @keyframes dsff-spin { to { transform: rotate(360deg); } }
      @keyframes dsff-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dsff-rise { from { opacity: 0; transform: translateY(14px) scale(.988); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes dsff-pulse { 0% { box-shadow: 0 0 0 0 currentColor; opacity: 1; } 70% { box-shadow: 0 0 0 5px transparent; opacity: .72; } 100% { box-shadow: 0 0 0 0 transparent; opacity: 1; } }
      @keyframes dsff-progress { 0% { transform: translateX(-110%); } 100% { transform: translateX(320%); } }
      @keyframes dsff-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      @media (max-width: 820px) {
        .dsff-panel { width: calc(100vw - 24px); height: calc(100vh - 24px); max-height: calc(100vh - 24px); border-radius: 20px; }
        .dsff-topbar { padding: 17px 16px 0; }
        .dsff-league-nav { padding: 13px 16px 12px; }
        .dsff-content { padding: 0 16px 18px; }
        .dsff-match { grid-template-columns: minmax(0, 1fr) 102px minmax(0, 1fr); gap: 6px; padding: 10px 11px; min-height: 68px; }
        .dsff-team { gap: 7px; }
        .dsff-team-name { font-size: 11.5px; }
        .dsff-crest { width: 25px; height: 25px; padding: 2px; }
        .dsff-crest-fallback { width: 25px; height: 25px; font-size: 6px; }
        .dsff-score { font-size: 19px; }
        .dsff-kickoff { font-size: 14px; }
        .dsff-days { flex: 1 1 auto; grid-template-columns: repeat(9, 42px); overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .dsff-days::-webkit-scrollbar { display: none; }
        .dsff-day { min-height: 51px; }
        .dsff-month-head { padding: 14px 0 10px; gap: 8px; grid-template-columns: 31px 1fr auto; }
        .dsff-month-title h2 { font-size: 21px; }
        .dsff-month-title p { font-size: 8.5px; }
        .dsff-month-arrow { width: 31px; height: 31px; }
        .dsff-month-weekdays { gap: 4px; }
        .dsff-month { gap: 4px; }
        .dsff-month-skeleton { gap: 4px; }
        .dsff-month-cell { min-height: 68px; padding: 8px 8px 7px; border-radius: 8px; }
        .dsff-month-day { font-size: 12px; }
        .dsff-month-star { top: 5px; right: 7px; font-size: 9px; }
        .dsff-month-legend { gap: 8px; padding-top: 10px; }
        .dsff-legend-label { display: none; }
        .dsff-legend-derby { margin-left: 0; }
      }
      @media (max-width: 560px) {
        .dsff-layer { place-items: stretch; }
        .dsff-panel { width: 100vw; max-height: 100vh; height: 100vh; border-radius: 0; border-left: 0; border-right: 0; }
        .dsff-launcher { right: 14px; bottom: 14px; }
        .dsff-tz span { display: none; }
        .dsff-tz { padding: 7px 8px; }
        .dsff-brand-mark { width: 36px; height: 36px; border-radius: 11px; }
        .dsff-brand-title { font-size: 17px; }
        .dsff-date-title { font-size: 27px; }
        .dsff-date-actions { padding-top: 0; }
        .dsff-dateblock { padding: 17px 0 12px; }
        .dsff-toolbar { padding-top: 12px; }
        .dsff-filter { padding: 4px 8px; font-size: 9px; }
        .dsff-filter-count { display: none; }
        .dsff-card-head { padding: 11px 12px; }
        .dsff-league-name { font-size: 12px; }
        .dsff-match { grid-template-columns: minmax(0, 1fr) 88px minmax(0, 1fr); padding: 9px 9px; }
        .dsff-team { flex-direction: column; gap: 4px; }
        .dsff-team--home { flex-direction: column; }
        .dsff-team-name { font-size: 10.5px; line-height: 1.13; text-align: center; max-width: 100%; }
        .dsff-team--home .dsff-team-name, .dsff-team--away .dsff-team-name { text-align: center; }
        .dsff-team--home .dsff-crest, .dsff-team--away .dsff-crest { order: -1; }
        .dsff-score { font-size: 18px; }
        .dsff-local { font-size: 7.5px; }
        .dsff-kick-date { font-size: 7.5px; }
        .dsff-empty, .dsff-error { min-height: 260px; }
        .dsff-view-btn { min-height: 25px; padding: 4px 7px; font-size: 8.5px; }
        .dsff-view-btn svg { display: none; }
        .dsff-month-hint { display: none; }
        .dsff-toolbar { gap: 8px; }
        .dsff-month-head { padding: 12px 0 8px; gap: 6px; grid-template-columns: 29px 1fr auto; }
        .dsff-month-title h2 { font-size: 19px; }
        .dsff-month-title h2 span { font-size: 12px; }
        .dsff-month-title p { font-size: 8px; }
        .dsff-month-arrow { width: 29px; height: 29px; }
        .dsff-month-actions { gap: 5px; }
        .dsff-month-actions .dsff-icon-btn { width: 29px; height: 29px; border-radius: 8px; }
        .dsff-month-weekdays { gap: 3px; padding-bottom: 5px; }
        .dsff-month-weekdays span { font-size: 7.5px; }
        .dsff-month { gap: 3px; }
        .dsff-month-cell { min-height: 48px; padding: 5px 5px 4px; border-radius: 6px; }
        .dsff-month-day { font-size: 10.5px; }
        .dsff-month-star { top: 3px; right: 4px; font-size: 8px; }
        .dsff-month-dots { gap: 2px; }
        .dsff-month-dots i { width: 3px; height: 3px; }
        .dsff-month-legend { gap: 6px; padding-top: 9px; }
        .dsff-legend-item { font-size: 7.5px; gap: 3px; }
        .dsff-month-note { font-size: 7.5px; }
        .dsff-month-skeleton { gap: 3px; }
        .dsff-month-skeleton-cell { min-height: 48px; border-radius: 6px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .dsff-panel, .dsff-scrim, .dsff-live-line i, .dsff-league-live i, .dsff-loading-copy i, .dsff-progress::after, .dsff-skeleton-dot, .dsff-skeleton-line, .dsff-skeleton-score, .dsff-month-skeleton-cell { animation: none !important; }
        .dsff-launcher, .dsff-chip, .dsff-day, .dsff-match, .dsff-month-cell { transition: none !important; }
      }


      /* Standalone /live page: the same dashboard without the DSH overlay chrome. */
      .dsff-root {
        --dsw-alias-bg-base: var(--bg, #fdfdf8);
        --dsw-alias-bg-layer-1: var(--surface, #f9f6e8);
        --dsw-alias-bg-layer-2: var(--surface-2, #f0e8ce);
        --dsw-alias-bg-overlay: var(--surface, #f9f6e8);
        --dsw-alias-border-l1: var(--border, rgba(0,0,0,.08));
        --dsw-alias-border-l2: var(--border-hover, rgba(0,0,0,.16));
        --dsw-alias-label-primary: var(--text, #1e1b15);
        --dsw-alias-label-secondary: var(--text-dim, #716853);
        --dsw-alias-state-error-primary: #e11d48;
        --dsw-alias-state-warn-primary: #d97706;
        --dsw-alias-state-success-primary: #059669;
        --dsw-alias-brand-primary: var(--accent, #d97706);
      }
      #live-root { position: relative; z-index: 1; min-height: 100dvh; }
      .live-page { min-height: 100dvh; }
      .live-page .dsff-layer {
        position: static; inset: auto; display: block; min-height: 100dvh; pointer-events: auto;
      }
      .live-page .dsff-panel {
        width: 100%; height: auto; max-height: none; min-height: 100dvh;
        border: 0; border-radius: 0; box-shadow: none; animation: none;
      }
      .live-page .dsff-shell { max-height: none; overflow: visible; }
      .live-page .dsff-content {
        overflow: visible; width: 100%; max-width: 1168px; margin: 0 auto; padding-bottom: 56px;
      }
      .live-page .dsff-topbar, .live-page .dsff-league-nav { width: 100%; max-width: 1120px; margin: 0 auto; }
      .live-page .dsff-topbar { padding-top: 24px; }
      .live-page .dsff-league-nav { padding-left: 0; padding-right: 0; }
      .live-page .dsff-icon-btn { text-decoration: none; }
      .live-page .dsff-about { margin-top: 26px; }
      .live-page .dsff-credit { padding-bottom: 8px; }
      @media (max-width: 820px) {
        .live-page .dsff-panel { height: auto; max-height: none; }
        .live-page .dsff-topbar { padding-top: 18px; }
        .live-page .dsff-league-nav { padding-left: 0; padding-right: 0; }
      }
      @media (max-width: 560px) {
        .live-page .dsff-panel { height: auto; max-height: none; }
        .live-page .dsff-topbar { padding-top: 14px; }
        .live-page .dsff-content { padding-bottom: 40px; }
      }
    `


    function BallIcon({ size = 18 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('circle', { cx: 12, cy: 12, r: 9 }),
        e('path', { d: 'm12 7.2 3.4 2.5-1.3 4.1h-4.2L8.6 9.7 12 7.2Z' }),
        e('path', { d: 'm12 3.1-.1 4.1M4.4 9.9l4.2-.2M6.3 18.7l3.9-3.9M17.7 18.5l-3.6-3.7M19.7 9.7l-4.3.1' }),
      )
    }

    function CalendarIcon({ size = 14 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('rect', { x: 3.5, y: 5, width: 17, height: 15.5, rx: 2.5 }),
        e('path', { d: 'M7.5 3v4M16.5 3v4M3.5 9.2h17' }),
      )
    }

    function GridIcon({ size = 13 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('rect', { x: 3.5, y: 4, width: 7, height: 7, rx: 1.4 }),
        e('rect', { x: 13.5, y: 4, width: 7, height: 7, rx: 1.4 }),
        e('rect', { x: 3.5, y: 13.5, width: 7, height: 7, rx: 1.4 }),
        e('rect', { x: 13.5, y: 13.5, width: 7, height: 7, rx: 1.4 }),
      )
    }

    function RefreshIcon({ size = 15 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('path', { d: 'M20 11a8 8 0 0 0-13.7-5.6L4 7.7' }),
        e('path', { d: 'M4 3.7v4h4' }),
        e('path', { d: 'M4 13a8 8 0 0 0 13.7 5.6L20 16.3' }),
        e('path', { d: 'M20 20.3v-4h-4' }),
      )
    }

    function ChevronLeft({ size = 15 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, e('path', { d: 'm14.5 5-7 7 7 7' }))
    }

    function ChevronRight({ size = 15 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, e('path', { d: 'm9.5 5 7 7-7 7' }))
    }

    function ChevronDown({ size = 13 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, e('path', { d: 'm5 9 7 7 7-7' }))
    }

    function PitchIcon({ size = 28 }) {
      return e('svg', { viewBox: '0 0 32 32', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round', 'aria-hidden': true },
        e('rect', { x: 3, y: 6, width: 26, height: 20, rx: 2.2 }),
        e('path', { d: 'M16 6v20M3 12h4v8H3M29 12h-4v8h4' }),
        e('circle', { cx: 16, cy: 16, r: 3.4 }),
      )
    }

    function WarningIcon({ size = 15 }) {
      return e('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('path', { d: 'M12 4.2 21 20H3L12 4.2Z' }),
        e('path', { d: 'M12 9v4.6M12 17h.01' }),
      )
    }

    function WifiOffIcon({ size = 27 }) {
      return e('svg', { viewBox: '0 0 32 32', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.55, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        e('path', { d: 'M5 11.5a17 17 0 0 1 6.1-3.1M20.8 8.6A17 17 0 0 1 27 11.5M8.6 16.2a11.5 11.5 0 0 1 4.2-2M19.2 14.2a11.5 11.5 0 0 1 4.2 2M12.4 20.8a6 6 0 0 1 7.2 0M16 25.2h.01M4 4l24 24' }),
      )
    }

    function translate(key, params) {
      let text = EN[key] ?? key
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, String(value))
        }
      }
      return text
    }

    function pad2(value) {
      return String(value).padStart(2, '0')
    }

    function dateParts(key) {
      const date = new Date(`${key}T12:00:00Z`)
      const base = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const short = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short' })
      const parts = base.formatToParts(date)
      const get = type => parts.find(part => part.type === type)?.value ?? ''
      return {
        weekday: get('weekday'),
        weekdayShort: short.format(date),
        day: Number(get('day')),
        month: get('month'),
        year: get('year'),
      }
    }

    function todayKey() {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit',
      }).formatToParts(new Date())
      const get = type => parts.find(part => part.type === type)?.value ?? ''
      return `${get('year')}-${get('month')}-${get('day')}`
    }

    function addDays(key, delta) {
      const date = new Date(`${key}T12:00:00Z`)
      date.setUTCDate(date.getUTCDate() + delta)
      return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
    }

    function dayDelta(from, to) {
      return Math.round((Date.parse(`${from}T00:00:00Z`) - Date.parse(`${to}T00:00:00Z`)) / DAY_MS)
    }

    function formatUpdated(iso) {
      if (!iso) return null
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return null
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: IST, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).format(date)
    }

    async function requestScoreboard(date, options = {}) {
      const search = new URLSearchParams({ date })
      if (options.force) search.set('refresh', '1')
      const response = await fetch(`${API}?${search.toString()}`, {
        signal: options.signal,
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      let body = null
      try {
        body = await response.json()
      } catch {
        body = null
      }
      if (!response.ok) {
        const detail = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : `Request failed (${response.status})`
        throw new Error(detail)
      }
      if (!body || !Array.isArray(body.matches) || !Array.isArray(body.leagues)) {
        throw new Error('The scoreboard response was incomplete.')
      }
      return body
    }

    async function requestMonth(month, options = {}) {
      const search = new URLSearchParams({ month })
      if (options.force) search.set('refresh', '1')
      const response = await fetch(`${API_MONTH}?${search.toString()}`, {
        signal: options.signal,
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      let body = null
      try {
        body = await response.json()
      } catch {
        body = null
      }
      if (!response.ok) {
        const detail = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : `Request failed (${response.status})`
        throw new Error(detail)
      }
      if (!body || !Array.isArray(body.days) || !Array.isArray(body.leagues)) {
        throw new Error('The month response was incomplete.')
      }
      return body
    }

    function shiftMonthKey(monthKey, delta) {
      const [year, month] = monthKey.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1 + delta, 1, 12))
      return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`
    }

    function monthDistance(monthKey, reference) {
      const [year, month] = monthKey.split('-').map(Number)
      const [referenceYear, referenceMonth] = reference.split('-').map(Number)
      return (year - referenceYear) * 12 + (month - referenceMonth)
    }

    function monthParts(monthKey) {
      const [year, month] = monthKey.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, 1, 12))
      return {
        year: String(year),
        name: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long' }).format(date),
      }
    }

    function monthGrid(monthKey) {
      const [year, month] = monthKey.split('-').map(Number)
      const first = new Date(Date.UTC(year, month - 1, 1, 12))
      const start = new Date(first)
      start.setUTCDate(1 - first.getUTCDay())
      const cells = []
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(start)
        date.setUTCDate(start.getUTCDate() + index)
        const key = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
        const parts = dateParts(key)
        cells.push({
          key,
          day: parts.day,
          inMonth: date.getUTCMonth() === month - 1,
          label: `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`,
        })
      }
      return cells
    }

    function Crest({ team }) {
      const [failed, setFailed] = useState(false)
      const abbr = team?.abbr || String(team?.name ?? '?').slice(0, 3).toUpperCase()
      if (!team?.logo || failed) {
        return e('span', {
          className: 'dsff-crest-fallback',
          style: { '--team-color': team?.color || '#64748b' },
          title: team?.name,
          'aria-hidden': true,
        }, abbr)
      }
      return e('img', {
        className: 'dsff-crest',
        src: team.logo,
        alt: '',
        title: team.name,
        loading: 'lazy',
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onError: () => setFailed(true),
      })
    }

    function LeagueMark({ league, large = false }) {
      const [failed, setFailed] = useState(false)
      if (!league?.logo || failed) {
        return e('span', {
          className: `dsff-league-mark${large ? ' is-large' : ''}`,
          style: { background: league?.accent || '#334155', color: '#fff', fontSize: large ? 9 : 7, fontWeight: 850 },
          title: league?.name,
          'aria-hidden': true,
        }, league?.shortName || '?')
      }
      return e('span', { className: `dsff-league-mark${large ? ' is-large' : ''}` },
        e('img', {
          src: league.logo,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
          referrerPolicy: 'no-referrer',
          onError: () => setFailed(true),
        }),
      )
    }

    function Match({ match, t }) {
      const home = match.home
      const away = match.away
      const bucket = match.status.bucket
      const isLive = bucket === 'live'
      const isFinished = bucket === 'finished'
      const isUpcoming = bucket === 'upcoming'
      const isSpecial = bucket === 'special'
      const hasScore = (isLive || isFinished) && Number.isFinite(home.score) && Number.isFinite(away.score)
      const hasPens = isFinished && Number.isFinite(home.shootoutScore) && Number.isFinite(away.shootoutScore)
      const score = hasScore ? `${home.score} – ${away.score}` : '–'
      const local = match.local
      const localText = local ? `${local.time} local · ${local.city || local.zone.split('/').pop()}` : null
      const statusLabel = isLive
        ? `${t('status.live')}${match.status.clock ? ` ${match.status.clock}` : ''}`
        : isFinished
          ? (match.status.short || t('status.ft'))
          : isSpecial
            ? match.status.special
            : t('status.upcoming')
      const dateNote = match.ist.offsetDays !== 0 ? match.ist.label : null
      const istNote = `${match.ist.time} IST${dateNote ? ` · ${dateNote}` : ''}`
      const ariaScore = hasScore
        ? t('fixture.score', { home: home.name, homeScore: home.score, away: away.name, awayScore: away.score })
        : t('fixture.versus', { home: home.name, away: away.name })
      const when = isLive
        ? t('fixture.live', { clock: match.status.clock || t('status.live') })
        : isFinished
          ? t('fixture.finished')
          : isSpecial
            ? t('fixture.special', { status: match.status.special })
            : t('fixture.upcoming', { time: match.ist.time })
      const localAria = local ? t('fixture.local', { time: local.time, city: local.city || local.zone }) : ''
      const venueAria = match.venue?.name ? t('fixture.venue', { venue: match.venue.name }) : ''
      const label = `${ariaScore}. ${when}. ${t('status.kickoff')} ${istNote}. ${localAria} ${venueAria}`.replace(/\s+/g, ' ').trim()
      const center = []

      if (isUpcoming) {
        center.push(e('span', { className: 'dsff-kickoff' }, match.ist.time, e('small', null, t('timezone.short'))))
        if (dateNote) center.push(e('span', { className: 'dsff-kick-date' }, dateNote))
      } else if (isSpecial) {
        center.push(e('span', { className: 'dsff-special' }, match.status.special))
        center.push(e('span', { className: 'dsff-ist-time' }, match.ist.time, e('small', null, ' IST')))
      } else {
        center.push(e('span', { className: `dsff-score${isLive ? ' is-live' : ''}` }, score))
        center.push(isLive
          ? e('span', { className: 'dsff-live-line' }, e('i', null), statusLabel)
          : e('span', { className: 'dsff-final' }, statusLabel))
        if (hasPens) center.push(e('span', { className: 'dsff-pens' }, `Pens ${home.shootoutScore}–${away.shootoutScore}`))
        center.push(e('span', { className: 'dsff-ist-time' }, match.ist.time, e('small', null, ' IST'), dateNote ? e('small', null, ` · ${dateNote}`) : null))
      }
      if (localText) {
        center.push(e('span', { className: 'dsff-local', title: local?.name || local?.city || '' }, localText))
      }

      return e('article', {
        className: `dsff-match is-${bucket}`,
        'aria-label': label,
      },
        e('div', { className: `dsff-team dsff-team--home${isFinished && home.winner ? ' is-winner' : ''}` },
          e('span', { className: 'dsff-team-name' }, home.name),
          e(Crest, { team: home }),
        ),
        e('div', { className: 'dsff-center' }, ...center),
        e('div', { className: `dsff-team dsff-team--away${isFinished && away.winner ? ' is-winner' : ''}` },
          e(Crest, { team: away }),
          e('span', { className: 'dsff-team-name' }, away.name),
        ),
      )
    }

    function LeagueSection({ league, matches, t }) {
      const liveCount = matches.filter(match => match.status.bucket === 'live').length
      return e('section', {
        className: 'dsff-league-card',
        style: {
          '--dsff-accent': league.accent || ALL_THEME.accent,
          '--dsff-accent-2': league.accent2 || ALL_THEME.accent2,
        },
        'aria-label': league.name,
      },
        e('header', { className: 'dsff-card-head' },
          e(LeagueMark, { league, large: true }),
          e('div', null,
            e('h3', { className: 'dsff-league-name' }, league.name),
            e('p', { className: 'dsff-league-meta' },
              matches.length === 1 ? t('league.matchCountOne') : t('league.matchCount', { count: matches.length }),
              league.round ? ` · ${league.round}` : '',
            ),
          ),
          liveCount > 0 ? e('span', { className: 'dsff-league-live' }, e('i', null), t('league.liveCount', { count: liveCount })) : null,
        ),
        e('div', { className: 'dsff-card-body' },
          matches.map(match => e(Match, { key: match.id, match, t })),
        ),
      )
    }

    function Skeleton() {
      return e('div', { className: 'dsff-skeleton-wrap', 'aria-hidden': true },
        [0, 1].map(index => e('div', { className: 'dsff-skeleton-card', key: index },
          e('div', { className: 'dsff-skeleton-head' },
            e('div', { className: 'dsff-skeleton-dot' }),
            e('div', null,
              e('div', { className: 'dsff-skeleton-line' }),
              e('div', { className: 'dsff-skeleton-line is-short' }),
            ),
          ),
          [0, 1, 2].map(row => e('div', { className: 'dsff-skeleton-row', key: row },
            e('div', { className: 'dsff-skeleton-team is-right' }),
            e('div', { className: 'dsff-skeleton-score' }),
            e('div', { className: 'dsff-skeleton-team is-left' }),
          )),
        )),
      )
    }

    function MonthSkeleton() {
      return e('div', { className: 'dsff-month-skeleton', 'aria-hidden': true },
        Array.from({ length: 42 }, (_, index) => e('div', { className: 'dsff-month-skeleton-cell', key: index })),
      )
    }

    export default function LiveDashboard() {
      const t = translate
      const [open] = useState(true)
      const [selectedDate, setSelectedDate] = useState(todayKey)
      const [viewMode, setViewMode] = useState('day')
      const [monthCursor, setMonthCursor] = useState(() => selectedDate.slice(0, 7))
      const [leagueFilter, setLeagueFilter] = useState('all')
      const [statusFilter, setStatusFilter] = useState('all')
      const [data, setData] = useState(null)
      const [loading, setLoading] = useState(false)
      const [refreshing, setRefreshing] = useState(false)
      const [error, setError] = useState(null)
      const [notice, setNotice] = useState(null)
      const [monthData, setMonthData] = useState(null)
      const [monthLoading, setMonthLoading] = useState(false)
      const [monthRefreshing, setMonthRefreshing] = useState(false)
      const [monthError, setMonthError] = useState(null)
      const [monthNotice, setMonthNotice] = useState(null)
      const dataRef = useRef(null)
      const monthDataRef = useRef(null)
      const abortRef = useRef(null)
      const monthAbortRef = useRef(null)
      const sequenceRef = useRef(0)
      const monthSequenceRef = useRef(0)
      const contentRef = useRef(null)

      useEffect(() => {
        dataRef.current = data
      }, [data])

      useEffect(() => {
        monthDataRef.current = monthData
      }, [monthData])

      useEffect(() => {
        const root = document.documentElement
        const meta = document.querySelector('meta[name="theme-color"]')
        const palette = leagueFilter === 'all' ? null : LIVE_LEAGUE_PALETTES[leagueFilter]
        for (const key of LIVE_THEME_KEYS) {
          if (palette) root.style.setProperty(key, palette[key])
          else root.style.removeProperty(key)
        }
        root.style.colorScheme = palette ? 'dark' : ''
        if (meta) meta.content = palette?.['--bg'] ?? '#FDFDF8'
        return () => {
          for (const key of LIVE_THEME_KEYS) root.style.removeProperty(key)
          root.style.colorScheme = ''
          if (meta) meta.content = '#FDFDF8'
        }
      }, [leagueFilter])

      const load = useCallback(async (date, force = false) => {
        const sequence = ++sequenceRef.current
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller
        const hasCurrent = dataRef.current?.date === date
        if (!hasCurrent) {
          setLoading(true)
          setNotice(null)
        }
        if (force) setRefreshing(true)
        setError(null)
        try {
          const response = await requestScoreboard(date, { force, signal: controller.signal })
          if (sequence !== sequenceRef.current) return
          setData(response)
          setNotice(response.partial ? { kind: 'partial', leagues: response.unavailable ?? [] } : null)
          setError(null)
        } catch (reason) {
          if (controller.signal.aborted || sequence !== sequenceRef.current) return
          if (hasCurrent) {
            setNotice({ kind: 'refresh' })
          } else {
            setError(reason instanceof Error ? reason.message : String(reason))
            setData(null)
            setNotice(null)
          }
        } finally {
          if (sequence === sequenceRef.current) {
            setLoading(false)
            setRefreshing(false)
          }
        }
      }, [])

      const loadMonth = useCallback(async (month, force = false) => {
        const sequence = ++monthSequenceRef.current
        monthAbortRef.current?.abort()
        const controller = new AbortController()
        monthAbortRef.current = controller
        const hasCurrent = monthDataRef.current?.month === month
        if (!hasCurrent) {
          setMonthLoading(true)
          setMonthNotice(null)
        }
        if (force) setMonthRefreshing(true)
        setMonthError(null)
        try {
          const response = await requestMonth(month, { force, signal: controller.signal })
          if (sequence !== monthSequenceRef.current) return
          setMonthData(response)
          setMonthNotice(response.partial ? { kind: 'partial', leagues: response.unavailable ?? [] } : null)
          setMonthError(null)
        } catch (reason) {
          if (controller.signal.aborted || sequence !== monthSequenceRef.current) return
          if (hasCurrent) {
            setMonthNotice({ kind: 'refresh' })
          } else {
            setMonthError(reason instanceof Error ? reason.message : String(reason))
            setMonthData(null)
            setMonthNotice(null)
          }
        } finally {
          if (sequence === monthSequenceRef.current) {
            setMonthLoading(false)
            setMonthRefreshing(false)
          }
        }
      }, [])

      useEffect(() => {
        if (!open || viewMode !== 'day') {
          abortRef.current?.abort()
          return undefined
        }
        void load(selectedDate)
        return () => abortRef.current?.abort()
      }, [open, viewMode, selectedDate, load])

      useEffect(() => {
        if (!open || viewMode !== 'month') {
          monthAbortRef.current?.abort()
          return undefined
        }
        void loadMonth(monthCursor)
        return () => monthAbortRef.current?.abort()
      }, [open, viewMode, monthCursor, loadMonth])

      useEffect(() => {
        if (!open || viewMode !== 'day') return undefined
        const distance = dayDelta(selectedDate, todayKey())
        if (distance < -1) return undefined
        const interval = distance <= 1 ? AUTO_REFRESH_MS : FUTURE_REFRESH_MS
        const timer = window.setInterval(() => { void load(selectedDate, false) }, interval)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') void load(selectedDate, false)
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [open, viewMode, selectedDate, load])

      useEffect(() => {
        if (!open || viewMode !== 'month') return undefined
        const distance = monthDistance(monthCursor, todayKey().slice(0, 7))
        if (distance < 0) return undefined
        const interval = distance === 0 ? AUTO_REFRESH_MS : FUTURE_REFRESH_MS
        const timer = window.setInterval(() => { void loadMonth(monthCursor, false) }, interval)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') void loadMonth(monthCursor, false)
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [open, viewMode, monthCursor, loadMonth])

      const view = data && data.date === selectedDate ? data : null
      const leagues = useMemo(() => {
        const byKey = new Map(FALLBACK_LEAGUES.map(league => [league.key, league]))
        for (const league of [...(view?.leagues ?? []), ...(monthData?.leagues ?? [])]) {
          if (league?.key) byKey.set(league.key, { ...(byKey.get(league.key) ?? {}), ...league })
        }
        return [...byKey.values()]
      }, [view, monthData])

      const activeLeague = leagueFilter === 'all' ? null : leagues.find(league => league.key === leagueFilter)
      const theme = activeLeague ?? ALL_THEME
      const themeStyle = {
        '--dsff-accent': theme.accent || ALL_THEME.accent,
        '--dsff-accent-2': theme.accent2 || ALL_THEME.accent2,
        '--dsff-accent-ink': theme.ink || ALL_THEME.ink,
      }

      const matches = useMemo(() => view?.matches ?? [], [view])
      const scopedMatches = useMemo(() => (
        leagueFilter === 'all' ? matches : matches.filter(match => match.leagueKey === leagueFilter)
      ), [matches, leagueFilter])
      const counts = useMemo(() => ({
        all: scopedMatches.length,
        live: scopedMatches.filter(match => match.status.bucket === 'live').length,
        finished: scopedMatches.filter(match => match.status.bucket === 'finished').length,
        upcoming: scopedMatches.filter(match => match.status.bucket === 'upcoming').length,
      }), [scopedMatches])

      const leagueCounts = useMemo(() => {
        const result = new Map()
        for (const match of matches) result.set(match.leagueKey, (result.get(match.leagueKey) ?? 0) + 1)
        return result
      }, [matches])

      const filteredMatches = useMemo(() => matches.filter(match => (
        (leagueFilter === 'all' || match.leagueKey === leagueFilter)
        && (statusFilter === 'all' || match.status.bucket === statusFilter)
      )), [matches, leagueFilter, statusFilter])

      const sections = useMemo(() => leagues
        .filter(league => leagueFilter === 'all' || league.key === leagueFilter)
        .map(league => ({ league, matches: filteredMatches.filter(match => match.leagueKey === league.key) }))
        .filter(section => section.matches.length > 0), [leagues, leagueFilter, filteredMatches])

      const matchdayLeagues = new Set(matches.map(match => match.leagueKey)).size
      const selected = dateParts(selectedDate)
      const today = todayKey()
      const isToday = selectedDate === today
      const rail = []
      for (let offset = -4; offset <= 4; offset += 1) {
        const key = addDays(selectedDate, offset)
        rail.push({ key, ...dateParts(key) })
      }

      const monthState = monthData && monthData.month === monthCursor ? monthData : null
      const monthInfo = monthParts(monthCursor)
      const monthCells = useMemo(() => monthGrid(monthCursor), [monthCursor])
      const monthDayIndex = useMemo(() => new Map((monthState?.days ?? []).map(day => [day.date, day])), [monthState])
      const monthCurrentDays = useMemo(() => (monthState?.days ?? []).filter(day => day.date.startsWith(monthCursor)), [monthState, monthCursor])
      const monthAllTotal = useMemo(() => monthCurrentDays.reduce((total, day) => total + day.total, 0), [monthCurrentDays])
      const monthLeagueCounts = useMemo(() => {
        const result = new Map()
        for (const day of monthCurrentDays) {
          for (const [key, count] of Object.entries(day.byLeague)) result.set(key, (result.get(key) ?? 0) + count)
        }
        return result
      }, [monthCurrentDays])
      const monthTotal = useMemo(() => monthCurrentDays
        .reduce((total, day) => total + (leagueFilter === 'all' ? day.total : (day.byLeague[leagueFilter] ?? 0)), 0), [monthCurrentDays, leagueFilter])
      const monthLeagueCount = useMemo(() => {
        const keys = new Set()
        for (const day of monthState?.days ?? []) {
          if (!day.date.startsWith(monthCursor)) continue
          if (leagueFilter === 'all') {
            for (const [key, count] of Object.entries(day.byLeague)) if (count > 0) keys.add(key)
          } else if ((day.byLeague[leagueFilter] ?? 0) > 0) {
            keys.add(leagueFilter)
          }
        }
        return keys.size
      }, [monthState, monthCursor, leagueFilter])
      const monthUpdated = formatUpdated(monthState?.generatedAt)
      const monthFixturesText = monthTotal === 1 ? t('month.fixture') : t('month.fixtures', { count: monthTotal })
      const monthCompetitionsText = monthLeagueCount === 1 ? t('month.competition') : t('month.competitions', { count: monthLeagueCount })
      const monthCellData = cell => monthDayIndex.get(cell.key)
      const monthCellDots = day => {
        if (!day) return []
        if (leagueFilter === 'all') {
          return leagues
            .filter(league => (day.byLeague[league.key] ?? 0) > 0)
            .slice(0, 6)
            .map(league => ({ key: league.key, accent: league.accent }))
        }
        const count = Math.min(day.byLeague[leagueFilter] ?? 0, 6)
        const league = activeLeague ?? leagues.find(item => item.key === leagueFilter)
        return league ? Array.from({ length: count }, (_, index) => ({ key: `${league.key}-${index}`, accent: league.accent })) : []
      }
      const monthCellHasRelevant = day => Boolean(day && (leagueFilter === 'all' ? day.total > 0 : (day.byLeague[leagueFilter] ?? 0) > 0))
      const monthCellDerby = day => Boolean(day?.derby && (leagueFilter === 'all' || (day.derbyLeagues ?? []).includes(leagueFilter)))

      const hasFilters = leagueFilter !== 'all' || statusFilter !== 'all'
      const updated = formatUpdated(view?.generatedAt)
      const dateCountText = matches.length === 1
        ? (matchdayLeagues === 1 ? t('date.match.oneLeague') : t('date.match.manyLeagues', { leagues: matchdayLeagues }))
        : (matchdayLeagues === 1 ? t('date.matches.oneLeague', { count: matches.length }) : t('date.matches.manyLeagues', { count: matches.length, leagues: matchdayLeagues }))

      const goToDate = date => {
        if (date === selectedDate) return
        setSelectedDate(date)
        setStatusFilter('all')
        setNotice(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      const showMonth = () => {
        if (viewMode === 'month') return
        setMonthCursor(selectedDate.slice(0, 7))
        setViewMode('month')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      const showDay = () => {
        if (viewMode === 'day') return
        if (!selectedDate.startsWith(monthCursor)) setSelectedDate(`${monthCursor}-01`)
        setViewMode('day')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      const openDay = date => {
        setSelectedDate(date)
        setMonthCursor(date.slice(0, 7))
        setStatusFilter('all')
        setNotice(null)
        setViewMode('day')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      const shiftMonth = delta => {
        setMonthCursor(cursor => shiftMonthKey(cursor, delta))
        setMonthNotice(null)
      }

      const goToCurrentMonth = () => {
        const current = todayKey()
        setSelectedDate(current)
        setMonthCursor(current.slice(0, 7))
        setMonthNotice(null)
      }

      const clearFilters = () => {
        setLeagueFilter('all')
        setStatusFilter('all')
      }

      const statusFilters = [
        { key: 'all', label: t('filter.all'), count: counts.all },
        { key: 'live', label: t('filter.live'), count: counts.live, live: true },
        { key: 'finished', label: t('filter.results'), count: counts.finished },
        { key: 'upcoming', label: t('filter.upcoming'), count: counts.upcoming },
      ]

      return e('div', { className: 'dsff-root', style: themeStyle },
        e('style', { key: 'football-hub-styles' }, CSS),
        e('div', { className: 'dsff-layer' },
              e('section', {
                className: 'dsff-panel',
                role: 'main',
                'aria-labelledby': 'dsff-title',
                'aria-busy': loading || refreshing || monthLoading || monthRefreshing ? 'true' : 'false',
              },
                (loading || refreshing || monthLoading || monthRefreshing) ? e('div', { className: 'dsff-progress', 'aria-hidden': true }) : null,
                e('div', { className: 'dsff-shell' },
                  e('header', { className: 'dsff-topbar' },
                    e('div', { className: 'dsff-brand' },
                      e('span', { className: 'dsff-brand-mark' }, e(BallIcon, { size: 24 })),
                      e('div', { className: 'dsff-brand-copy' },
                        e('h1', { className: 'dsff-brand-title', id: 'dsff-title' }, t('brand.title'), e('em', null, view?.season || monthState?.season || '2026/27')),
                        e('span', { className: 'dsff-eyebrow' }, t('brand.kicker')),
                      ),
                    ),
                    e('div', { className: 'dsff-top-actions' },
                      e('span', { className: 'dsff-tz' }, e('b', null, 'IST'), e('span', null, 'UTC+5:30')),
                      e('a', {
                        href: '/',
                        className: 'dsff-icon-btn',
                        title: 'Back to schedule',
                        'aria-label': 'Back to schedule',
                      }, e(ChevronLeft, { size: 16 })),
                    ),
                  ),
                  e('nav', { className: 'dsff-league-nav', 'aria-label': t('leagues.all') },
                    e('button', {
                      type: 'button',
                      className: `dsff-chip${leagueFilter === 'all' ? ' is-active' : ''}`,
                      style: { '--chip-accent': ALL_THEME.accent, '--chip-ink': ALL_THEME.ink },
                      onClick: () => setLeagueFilter('all'),
                      'aria-pressed': leagueFilter === 'all',
                    },
                      e('span', { className: 'dsff-chip-all' }, e(BallIcon, { size: 13 })),
                      e('span', null, t('filter.all')),
                      e('span', { className: 'dsff-chip-count' }, viewMode === 'month' ? (monthState ? monthAllTotal : 0) : matches.length),
                    ),
                    leagues.map(league => e('button', {
                      key: league.key,
                      type: 'button',
                      className: `dsff-chip${leagueFilter === league.key ? ' is-active' : ''}`,
                      style: { '--chip-accent': league.accent, '--chip-ink': league.ink },
                      onClick: () => setLeagueFilter(league.key),
                      'aria-pressed': leagueFilter === league.key,
                    },
                      e('span', { className: 'dsff-chip-logo' }, e(LeagueMark, { league })),
                      e('span', null, league.chip || league.name),
                      e('span', { className: 'dsff-chip-count' }, viewMode === 'month' ? (monthLeagueCounts.get(league.key) ?? 0) : (leagueCounts.get(league.key) ?? 0)),
                    )),
                  ),
                  e('div', { className: 'dsff-content', ref: contentRef },
                    e('div', { className: 'dsff-toolbar' },
                      e('div', { className: 'dsff-view-switch', role: 'group', 'aria-label': t('view.label') },
                        e('button', {
                          type: 'button',
                          className: `dsff-view-btn${viewMode === 'day' ? ' is-active' : ''}`,
                          onClick: showDay,
                          'aria-pressed': viewMode === 'day',
                        }, e(CalendarIcon, { size: 12 }), t('view.day')),
                        e('button', {
                          type: 'button',
                          className: `dsff-view-btn${viewMode === 'month' ? ' is-active' : ''}`,
                          onClick: showMonth,
                          'aria-pressed': viewMode === 'month',
                        }, e(GridIcon, { size: 12 }), t('view.month')),
                      ),
                      viewMode === 'day'
                        ? e('div', { className: 'dsff-filters' },
                            statusFilters.map(filter => e('button', {
                              key: filter.key,
                              type: 'button',
                              className: `dsff-filter${statusFilter === filter.key ? ' is-active' : ''}`,
                              onClick: () => setStatusFilter(filter.key),
                              'aria-pressed': statusFilter === filter.key,
                            },
                              filter.live ? e('i', { className: 'dsff-filter-dot', 'aria-hidden': true }) : null,
                              filter.label,
                              e('span', { className: 'dsff-filter-count' }, filter.count),
                            )),
                          )
                        : e('span', { className: 'dsff-month-hint' }, t('month.hint')),
                      viewMode === 'day'
                        ? e('span', { className: 'dsff-live-summary' },
                            counts.live > 0
                              ? e('span', null, e('b', null, counts.live), ' live')
                              : e('span', null, t('status.noLive')),
                            e('span', { className: 'dsff-meta-sep' }),
                            e('span', null, updated ? t('updated', { time: updated }) : t('updated.never')),
                          )
                        : e('span', { className: 'dsff-live-summary' },
                            e('b', null, monthState ? monthFixturesText : '—'),
                            e('span', { className: 'dsff-meta-sep' }),
                            e('span', null, monthUpdated ? t('updated', { time: monthUpdated }) : t('updated.never')),
                          ),
                    ),
                    viewMode === 'day'
                      ? e(React.Fragment, null,
                          e('div', { className: 'dsff-dateblock' },
                            e('div', { className: 'dsff-date-copy' },
                              e('div', { className: 'dsff-date-kicker' },
                                e('span', { className: 'dsff-eyebrow' }, selected.weekday),
                                isToday ? e('span', { className: 'dsff-today-flag' }, t('date.today')) : null,
                              ),
                              e('h2', { className: 'dsff-date-title' }, `${selected.day} ${selected.month} ${selected.year}`),
                              e('p', { className: 'dsff-date-meta' },
                                e('b', null, view ? dateCountText : '—'),
                                e('span', { className: 'dsff-meta-sep' }),
                                e('span', null, t('date.allTimes')),
                              ),
                            ),
                            e('div', { className: 'dsff-date-actions' },
                              e('button', { type: 'button', className: 'dsff-today-btn', onClick: () => goToDate(today) }, e(CalendarIcon, { size: 13 }), t('action.today')),
                              e('button', {
                                type: 'button',
                                className: `dsff-icon-btn${refreshing ? ' is-spinning' : ''}`,
                                onClick: () => void load(selectedDate, true),
                                'aria-label': t('action.refresh'),
                                disabled: refreshing,
                              }, e(RefreshIcon, { size: 15 })),
                            ),
                          ),
                          e('div', { className: 'dsff-date-rail' },
                            e('button', { type: 'button', className: 'dsff-rail-arrow', onClick: () => goToDate(addDays(selectedDate, -1)), 'aria-label': t('action.prevDay') }, e(ChevronLeft)),
                            e('div', { className: 'dsff-days' },
                              rail.map(day => e('button', {
                                key: day.key,
                                type: 'button',
                                className: `dsff-day${day.key === selectedDate ? ' is-selected' : ''}${day.key === today ? ' is-today' : ''}`,
                                onClick: () => goToDate(day.key),
                                'aria-pressed': day.key === selectedDate,
                                'aria-label': `${day.weekday} ${day.day} ${day.month} ${day.year}${day.key === today ? `, ${t('date.today')}` : ''}`,
                              },
                                e('span', { className: 'dsff-day-week' }, day.weekdayShort),
                                e('span', { className: 'dsff-day-num' }, day.day),
                                day.key === today ? e('span', { className: 'dsff-day-today-dot', 'aria-hidden': true }) : null,
                              )),
                            ),
                            e('button', { type: 'button', className: 'dsff-rail-arrow', onClick: () => goToDate(addDays(selectedDate, 1)), 'aria-label': t('action.nextDay') }, e(ChevronRight)),
                          ),
                        )
                      : e('div', { className: 'dsff-month-head' },
                          e('button', { type: 'button', className: 'dsff-month-arrow', onClick: () => shiftMonth(-1), 'aria-label': t('month.prev') }, e(ChevronLeft)),
                          e('div', { className: 'dsff-month-title' },
                            e('h2', null, monthInfo.name, ' ', e('span', null, monthInfo.year)),
                            e('p', null,
                              e('b', null, monthState ? monthFixturesText : '—'),
                              e('span', { className: 'dsff-meta-sep' }),
                              e('span', null, monthState ? monthCompetitionsText : '—'),
                            ),
                          ),
                          e('div', { className: 'dsff-month-actions' },
                            e('button', { type: 'button', className: 'dsff-icon-btn', onClick: goToCurrentMonth, 'aria-label': t('month.today') }, e(CalendarIcon, { size: 15 })),
                            e('button', { type: 'button', className: 'dsff-month-arrow', onClick: () => shiftMonth(1), 'aria-label': t('month.next') }, e(ChevronRight)),
                          ),
                        ),
                    viewMode === 'day'
                      ? notice?.kind === 'partial'
                        ? e('div', { className: 'dsff-banner', role: 'status' }, e(WarningIcon), e('span', null, t('warning.partial', { leagues: notice.leagues.join(', ') })))
                        : notice?.kind === 'refresh'
                          ? e('div', { className: 'dsff-banner', role: 'status' }, e(WarningIcon), e('span', null, t('warning.refresh')))
                          : null
                      : monthNotice?.kind === 'partial'
                        ? e('div', { className: 'dsff-banner', role: 'status' }, e(WarningIcon), e('span', null, t('warning.partial', { leagues: monthNotice.leagues.join(', ') })))
                        : monthNotice?.kind === 'refresh'
                          ? e('div', { className: 'dsff-banner', role: 'status' }, e(WarningIcon), e('span', null, t('warning.refresh')))
                          : null,
                    viewMode === 'day'
                      ? loading && !view
                        ? e('div', null, e('div', { className: 'dsff-loading-copy' }, e('i'), t('loading.body')), e(Skeleton))
                        : error && !view
                          ? e('div', { className: 'dsff-error', role: 'alert' },
                              e('span', { className: 'dsff-error-icon' }, e(WifiOffIcon)),
                              e('h3', null, t('error.title')),
                              e('p', null, t('error.body')),
                              e('span', { className: 'dsff-error-detail' }, t('error.detail', { detail: error })),
                              e('div', { className: 'dsff-error-actions' },
                                e('button', { type: 'button', className: 'dsff-primary-btn', onClick: () => void load(selectedDate, true) }, t('action.retry')),
                              ),
                            )
                          : sections.length === 0
                            ? e('div', { className: 'dsff-empty' },
                                e('span', { className: 'dsff-empty-icon' }, e(PitchIcon, { size: 30 })),
                                e('h3', null, hasFilters ? t('filter.none') : t('empty.title')),
                                e('p', null, hasFilters ? t('empty.filtered') : t('empty.body')),
                                e('div', { className: 'dsff-empty-actions' },
                                  hasFilters ? e('button', { type: 'button', className: 'dsff-primary-btn', onClick: clearFilters }, t('action.clear')) : null,
                                  !isToday ? e('button', { type: 'button', className: 'dsff-ghost-btn', onClick: () => goToDate(today) }, t('action.today')) : null,
                                ),
                              )
                            : e('div', { className: 'dsff-sections' },
                                sections.map(section => e(LeagueSection, { key: section.league.key, league: section.league, matches: section.matches, t })),
                              )
                      : monthLoading && !monthState
                        ? e(React.Fragment, null,
                            e('div', { className: 'dsff-month-weekdays', 'aria-hidden': true }, WEEKDAY_LABELS.map((label, index) => e('span', { key: index }, label))),
                            e(MonthSkeleton),
                          )
                        : monthError && !monthState
                          ? e('div', { className: 'dsff-error', role: 'alert' },
                              e('span', { className: 'dsff-error-icon' }, e(WifiOffIcon)),
                              e('h3', null, t('error.title')),
                              e('p', null, t('error.body')),
                              e('span', { className: 'dsff-error-detail' }, t('error.detail', { detail: monthError })),
                              e('div', { className: 'dsff-error-actions' },
                                e('button', { type: 'button', className: 'dsff-primary-btn', onClick: () => void loadMonth(monthCursor, true) }, t('action.retry')),
                              ),
                            )
                          : e(React.Fragment, null,
                              e('div', { className: 'dsff-month-weekdays', 'aria-hidden': true }, WEEKDAY_LABELS.map((label, index) => e('span', { key: index }, label))),
                              e('div', { className: `dsff-month${leagueFilter !== 'all' ? ' is-league-filtered' : ''}` },
                                monthCells.map(cell => {
                                  const day = monthCellData(cell)
                                  const count = leagueFilter === 'all' ? (day?.total ?? 0) : (day?.byLeague?.[leagueFilter] ?? 0)
                                  const isSelected = cell.key === selectedDate
                                  const isCellToday = cell.key === today
                                  const hasRelevant = monthCellHasRelevant(day)
                                  const derby = monthCellDerby(day)
                                  const dots = monthCellDots(day)
                                  const countLabel = count === 0 ? t('date.empty') : (count === 1 ? t('month.fixture') : t('month.fixtures', { count }))
                                  return e('button', {
                                    key: cell.key,
                                    type: 'button',
                                    className: `dsff-month-cell${cell.inMonth ? '' : ' is-outside'}${hasRelevant ? ' has-fixtures' : ''}${isSelected ? ' is-selected' : ''}${isCellToday ? ' is-today' : ''}`,
                                    onClick: () => openDay(cell.key),
                                    'aria-pressed': isSelected,
                                    'aria-label': `${cell.label}, ${countLabel}`,
                                    style: hasRelevant && leagueFilter !== 'all' ? { '--cell-accent': (activeLeague?.accent || ALL_THEME.accent) } : undefined,
                                  },
                                    e('span', { className: 'dsff-month-day' }, cell.day),
                                    derby ? e('span', { className: 'dsff-month-star', 'aria-hidden': true }, '★') : null,
                                    e('span', { className: 'dsff-month-dots' },
                                      dots.map(dot => e('i', { key: dot.key, style: { background: dot.accent } })),
                                    ),
                                  )
                                }),
                              ),
                              e('div', { className: 'dsff-month-legend' },
                                e('span', { className: 'dsff-legend-label' }, t('month.legend')),
                                (leagueFilter === 'all' ? leagues : [activeLeague]).filter(Boolean).map(league => e('span', { key: league.key, className: 'dsff-legend-item' },
                                  e('i', { className: 'dsff-legend-dot', style: { background: league.accent } }),
                                  league.shortName,
                                )),
                                e('span', { className: 'dsff-legend-item dsff-legend-derby' }, e('b', null, '★'), t('month.derby')),
                              ),
                              e('p', { className: 'dsff-month-note' }, t('month.matchdayNote')),
                              monthState && monthTotal === 0 ? e('p', { className: 'dsff-month-empty' }, t('month.empty')) : null,
                            ),
                    e('details', { className: 'dsff-about' },
                      e('summary', null, t('action.about'), e(ChevronDown)),
                      e('div', { className: 'dsff-about-body' },
                        e('p', null, t('about.body')),
                        e('p', null, t('about.month')),
                        e('p', null, t('about.refresh')),
                        e('p', null, `${t('about.source')}: `, e('a', { href: 'https://www.espn.com/soccer/', target: '_blank', rel: 'noreferrer noopener' }, 'ESPN'), ` · ${t('about.crests')}`),
                      ),
                    ),
                    e('p', { className: 'dsff-credit' },
                      e('span', null, t('footer.credit')),
                      e('span', null, e(BallIcon, { size: 10 }), t('autoRefresh')),
                    ),
                  ),
                ),
              ),
            ),
      )
    }


