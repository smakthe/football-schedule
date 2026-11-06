/**
 * Host-side football data service.
 *
 * ESPN's public scoreboard feed is the source of truth for kick-off instants,
 * scores and match status. The feed is converted here, on the Host, so the
 * browser never has to deal with CORS and every client sees one normalized
 * shape. Nothing in this file predicts a result or invents a kick-off time.
 */

const UPSTREAM = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
const IST_ZONE = 'Asia/Kolkata'
const CACHE_NEAR_MS = 20_000
const CACHE_PAST_MS = 10 * 60_000
const CACHE_FUTURE_MS = 4 * 60_000
const FETCH_TIMEOUT_MS = 12_000

/** The six competitions this dashboard owns, in display order. */
export const LEAGUES = Object.freeze([
  {
    key: 'premier-league',
    slug: 'eng.1',
    name: 'Premier League',
    fullName: 'English Premier League',
    chip: 'Premier League',
    shortName: 'PL',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
    timeZone: 'Europe/London',
    accent: '#7c3aed',
    accent2: '#3b0764',
    ink: '#ffffff',
  },
  {
    key: 'la-liga',
    slug: 'esp.1',
    name: 'La Liga',
    fullName: 'Spanish LALIGA',
    chip: 'La Liga',
    shortName: 'LL',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
    timeZone: 'Europe/Madrid',
    accent: '#f04438',
    accent2: '#7a1010',
    ink: '#ffffff',
  },
  {
    key: 'bundesliga',
    slug: 'ger.1',
    name: 'Bundesliga',
    fullName: 'German Bundesliga',
    chip: 'Bundesliga',
    shortName: 'BL',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png',
    timeZone: 'Europe/Berlin',
    accent: '#d70a1e',
    accent2: '#5e0710',
    ink: '#ffffff',
  },
  {
    key: 'ligue-1',
    slug: 'fra.1',
    name: 'Ligue 1',
    fullName: 'French Ligue 1',
    chip: 'Ligue 1',
    shortName: 'L1',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png',
    timeZone: 'Europe/Paris',
    accent: '#3155d4',
    accent2: '#0b1d54',
    ink: '#ffffff',
  },
  {
    key: 'serie-a',
    slug: 'ita.1',
    name: 'Serie A',
    fullName: 'Italian Serie A',
    chip: 'Serie A',
    shortName: 'SA',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png',
    timeZone: 'Europe/Rome',
    accent: '#0784c7',
    accent2: '#053a6b',
    ink: '#ffffff',
  },
  {
    key: 'champions-league',
    slug: 'uefa.champions',
    name: 'Champions League',
    fullName: 'UEFA Champions League',
    chip: 'Champions League',
    shortName: 'UCL',
    logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    timeZone: null,
    accent: '#3559d6',
    accent2: '#b9964e',
    ink: '#ffffff',
  },
])

const COUNTRY_ZONE_ENTRIES = {
  Albania: 'Europe/Tirane',
  Andorra: 'Europe/Andorra',
  Armenia: 'Asia/Yerevan',
  Austria: 'Europe/Vienna',
  Azerbaijan: 'Asia/Baku',
  Belarus: 'Europe/Minsk',
  Belgium: 'Europe/Brussels',
  'Bosnia and Herzegovina': 'Europe/Sarajevo',
  Bulgaria: 'Europe/Sofia',
  Croatia: 'Europe/Zagreb',
  Cyprus: 'Asia/Nicosia',
  Czechia: 'Europe/Prague',
  'Czech Republic': 'Europe/Prague',
  Denmark: 'Europe/Copenhagen',
  England: 'Europe/London',
  Estonia: 'Europe/Tallinn',
  'Faroe Islands': 'Atlantic/Faroe',
  Finland: 'Europe/Helsinki',
  France: 'Europe/Paris',
  Georgia: 'Asia/Tbilisi',
  Germany: 'Europe/Berlin',
  Gibraltar: 'Europe/Gibraltar',
  Greece: 'Europe/Athens',
  Hungary: 'Europe/Budapest',
  Iceland: 'Atlantic/Reykjavik',
  Ireland: 'Europe/Dublin',
  'Republic of Ireland': 'Europe/Dublin',
  Israel: 'Asia/Jerusalem',
  Italy: 'Europe/Rome',
  Kazakhstan: 'Asia/Almaty',
  Kosovo: 'Europe/Belgrade',
  Latvia: 'Europe/Riga',
  Liechtenstein: 'Europe/Zurich',
  Lithuania: 'Europe/Vilnius',
  Luxembourg: 'Europe/Luxembourg',
  Malta: 'Europe/Malta',
  Moldova: 'Europe/Chisinau',
  Montenegro: 'Europe/Podgorica',
  Netherlands: 'Europe/Amsterdam',
  'North Macedonia': 'Europe/Skopje',
  'Northern Ireland': 'Europe/London',
  Norway: 'Europe/Oslo',
  Poland: 'Europe/Warsaw',
  Portugal: 'Europe/Lisbon',
  Romania: 'Europe/Bucharest',
  Russia: 'Europe/Moscow',
  'San Marino': 'Europe/San_Marino',
  Scotland: 'Europe/London',
  Serbia: 'Europe/Belgrade',
  Slovakia: 'Europe/Bratislava',
  Slovenia: 'Europe/Ljubljana',
  Spain: 'Europe/Madrid',
  Sweden: 'Europe/Stockholm',
  Switzerland: 'Europe/Zurich',
  Turkey: 'Europe/Istanbul',
  'Türkiye': 'Europe/Istanbul',
  Ukraine: 'Europe/Kyiv',
  Wales: 'Europe/London',
}

const COUNTRY_ZONES = new Map(
  Object.entries(COUNTRY_ZONE_ENTRIES).map(([country, zone]) => [normalizeCountry(country), zone]),
)

const formatterCache = new Map()

/**
 * Curated derby pairings. These are display markers only; the score and status
 * remain exactly what the feed reports. Keys are built from canonicalised club
 * names, so accents and common club prefixes do not change a pairing.
 */
const DERBY_PAIRS = Object.freeze({
  'premier-league': [
    ['Arsenal', 'Tottenham Hotspur'],
    ['Liverpool', 'Everton'],
    ['Manchester United', 'Manchester City'],
    ['Manchester United', 'Liverpool'],
    ['Arsenal', 'Chelsea'],
    ['Chelsea', 'Tottenham Hotspur'],
    ['Newcastle United', 'Sunderland'],
  ],
  'la-liga': [
    ['Real Madrid', 'Barcelona'],
    ['Atletico Madrid', 'Real Madrid'],
    ['Sevilla', 'Real Betis'],
    ['Athletic Club', 'Real Sociedad'],
    ['Valencia', 'Levante'],
    ['Espanyol', 'Barcelona'],
    ['Deportivo', 'Celta Vigo'],
  ],
  bundesliga: [
    ['Borussia Dortmund', 'Schalke 04'],
    ['Bayern Munich', 'Borussia Dortmund'],
    ['Hamburg SV', 'St. Pauli'],
    ['1. FC Koln', 'Borussia Monchengladbach'],
    ['Werder Bremen', 'Hamburg SV'],
    ['Bayer Leverkusen', '1. FC Koln'],
    ['Bayer 04 Leverkusen', '1. FC Koln'],
  ],
  'ligue-1': [
    ['Paris Saint-Germain', 'Marseille'],
    ['Paris Saint-Germain', 'Olympique de Marseille'],
    ['Lyon', 'Saint-Etienne'],
    ['Olympique Lyonnais', 'Saint-Etienne'],
    ['OGC Nice', 'AS Monaco'],
    ['RC Lens', 'LOSC Lille'],
    ['FC Nantes', 'Stade Rennais'],
  ],
  'serie-a': [
    ['AC Milan', 'Internazionale'],
    ['AC Milan', 'Inter'],
    ['AS Roma', 'Lazio'],
    ['Juventus', 'Torino'],
    ['Genoa', 'Sampdoria'],
  ],
})

const DERBY_KEYS = new Set()
for (const [leagueKey, pairs] of Object.entries(DERBY_PAIRS)) {
  for (const [left, right] of pairs) {
    DERBY_KEYS.add(derbyKey(leagueKey, left, right))
  }
}

function canonicalTeam(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(?:fc|cf|afc|ac|as|ss|ssc|sc|rc|ogc|losc|club|calcio|de|1)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function derbyKey(leagueKey, left, right) {
  const pair = [canonicalTeam(left), canonicalTeam(right)].sort()
  return `${leagueKey}\u0000${pair[0]}\u0000${pair[1]}`
}

function isDerby(match) {
  if (!match || match.leagueKey === 'champions-league') return false
  return DERBY_KEYS.has(derbyKey(match.leagueKey, match.home?.name, match.away?.name))
}

function normalizeCountry(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function zoneForCountry(country) {
  if (!country) return undefined
  return COUNTRY_ZONES.get(normalizeCountry(country))
}

function zoneFormatter(zone) {
  let formatter = formatterCache.get(zone)
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    formatterCache.set(zone, formatter)
  }
  return formatter
}

function formatInZone(iso, zone) {
  if (!zone || !iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  try {
    const parts = zoneFormatter(zone).formatToParts(date)
    const get = type => parts.find(part => part.type === type)?.value ?? ''
    const year = get('year')
    const month = get('month')
    const day = get('day')
    const hour = get('hour') === '24' ? '00' : get('hour')
    const minute = get('minute')
    const weekday = get('weekday')
    const dateKey = `${year}-${monthNumber(month)}-${String(Number(day)).padStart(2, '0')}`
    return {
      zone,
      date: dateKey,
      time: `${hour}:${minute}`,
      weekday,
      day: Number(day),
      month,
      year,
      label: `${weekday} ${Number(day)} ${month}`,
    }
  } catch {
    return null
  }
}

const MONTHS = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function monthNumber(month) {
  return MONTHS[month] ?? '01'
}

function utcDateKey(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

function addDays(dateKey, delta) {
  const date = new Date(`${dateKey}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

function dateDelta(from, to) {
  return Math.round((Date.parse(`${from}T00:00:00Z`) - Date.parse(`${to}T00:00:00Z`)) / 86_400_000)
}

function todayInZone(zone) {
  const parts = zoneFormatter(zone).formatToParts(new Date())
  const get = type => parts.find(part => part.type === type)?.value ?? ''
  return `${get('year')}-${String(monthNumber(get('month'))).padStart(2, '0')}-${get('day')}`
}

function normalizeDate(value) {
  const date = String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const parsed = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null
  return date
}

function ttlFor(dateKey) {
  const distance = dateDelta(dateKey, todayInZone(IST_ZONE))
  if (distance < -1) return CACHE_PAST_MS
  if (distance > 1) return CACHE_FUTURE_MS
  return CACHE_NEAR_MS
}

function normalizeMonth(value) {
  const month = String(value ?? '')
  if (!/^\d{4}-\d{2}$/.test(month)) return null
  const [year, part] = month.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(part) || part < 1 || part > 12) return null
  return `${year}-${String(part).padStart(2, '0')}`
}

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + delta, 1, 12))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthDistance(monthKey, reference) {
  const [year, month] = monthKey.split('-').map(Number)
  const [refYear, refMonth] = reference.split('-').map(Number)
  return (year - refYear) * 12 + (month - refMonth)
}

function monthTtl(monthKey) {
  const distance = monthDistance(monthKey, todayInZone(IST_ZONE).slice(0, 7))
  if (distance === 0) return CACHE_NEAR_MS
  if (distance > 0) return CACHE_FUTURE_MS
  return CACHE_PAST_MS
}

function seasonLabelFrom(info, dateKey) {
  const season = info?.season
  const year = Number(season?.year)
  if (Number.isFinite(year) && year >= 2000) {
    return `${year}/${String((year + 1) % 100).padStart(2, '0')}`
  }
  const display = String(season?.displayName ?? '')
  const match = display.match(/(\d{4})[-/](\d{2,4})/)
  if (match) {
    const start = Number(match[1])
    const end = match[2].length === 4 ? Number(match[2]) : Number(`${String(start).slice(0, 2)}${match[2]}`)
    return `${start}/${String(end % 100).padStart(2, '0')}`
  }
  const yearNow = Number(String(dateKey).slice(0, 4))
  const month = Number(String(dateKey).slice(5, 7))
  return month >= 7 ? `${yearNow}/${String((yearNow + 1) % 100).padStart(2, '0')}` : `${yearNow - 1}/${String(yearNow % 100).padStart(2, '0')}`
}

function espnLogo(info, fallback) {
  const logos = Array.isArray(info?.logos) ? info.logos : []
  const preferred = logos.find(logo => logo?.rel?.includes?.('default')) ?? logos[0]
  return preferred?.href ?? fallback
}

function cleanColor(value) {
  const color = String(value ?? '').trim()
  return /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : null
}

function initials(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

function normalizedTeam(competitor, score, shootoutScore) {
  const team = competitor?.team ?? {}
  const id = String(competitor?.id ?? team.id ?? '')
  const name = team.displayName ?? team.name ?? team.shortDisplayName ?? 'Unknown club'
  return {
    id,
    name,
    shortName: team.shortDisplayName ?? team.shortName ?? name,
    abbr: team.abbreviation ?? initials(name),
    logo: team.logo ?? team.logos?.[0]?.href ?? (id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png` : null),
    color: cleanColor(team.color),
    alternateColor: cleanColor(team.alternateColor),
    score,
    shootoutScore,
    winner: competitor?.winner === true,
    form: typeof competitor?.form === 'string' ? competitor.form.slice(0, 5).split('') : [],
  }
}

function statusFor(competition) {
  const status = competition?.status ?? {}
  const type = status?.type ?? {}
  const name = String(type.name ?? '')
  const description = String(type.description ?? '')
  const state = type.state === 'in' || type.state === 'post' || type.state === 'pre' ? type.state : 'pre'
  const specialMatch = name.match(/STATUS_(POSTPONED|CANCELED|CANCELLED|SUSPENDED|ABANDONED|DELAYED)/)
  const special = specialMatch
    ? { POSTPONED: 'Postponed', CANCELED: 'Canceled', CANCELLED: 'Canceled', SUSPENDED: 'Suspended', ABANDONED: 'Abandoned', DELAYED: 'Delayed' }[specialMatch[1]]
    : null
  const live = state === 'in' && special === null
  const finished = state === 'post' && type.completed === true && special === null
  const bucket = special !== null ? 'special' : live ? 'live' : finished ? 'finished' : 'upcoming'
  const clock = live
    ? (/HALF.?TIME/i.test(name) ? 'HT' : (status.displayClock && status.displayClock !== "0'" ? String(status.displayClock) : (status.period ? String(status.period) : null)))
    : null
  const short = special !== null
    ? ({ Postponed: 'PP', Canceled: 'CANC', Suspended: 'SUSP', Abandoned: 'ABD', Delayed: 'DELAY' }[special] ?? 'N/A')
    : live
      ? 'LIVE'
      : finished
        ? (/PEN/i.test(name) ? 'PENS' : /AET|OT/i.test(name) ? 'AET' : 'FT')
        : 'UPCOMING'
  return {
    state,
    completed: finished,
    live,
    finished,
    bucket,
    name,
    description,
    special,
    short,
    clock,
    period: Number.isFinite(Number(status.period)) ? Number(status.period) : null,
  }
}

function normalizeEvent(event, league) {
  const competition = Array.isArray(event?.competitions) ? event.competitions[0] : null
  const competitors = Array.isArray(competition?.competitors) ? competition.competitors : []
  const homeRaw = competitors.find(competitor => competitor?.homeAway === 'home')
  const awayRaw = competitors.find(competitor => competitor?.homeAway === 'away')
  if (!competition || !homeRaw || !awayRaw || !event?.date) return null

  const status = statusFor(competition)
  const showScore = status.bucket === 'live' || status.bucket === 'finished'
  const numericScore = (competitor, field) => {
    if (!showScore) return null
    const value = Number.parseInt(competitor?.[field], 10)
    return Number.isFinite(value) ? value : null
  }
  const venue = competition.venue ?? {}
  const country = venue?.address?.country ?? ''
  const city = venue?.address?.city ?? ''
  const localZone = zoneForCountry(country) ?? league.timeZone ?? null
  const local = localZone ? formatInZone(event.date, localZone) : null
  const utc = formatInZone(event.date, 'UTC')
  const ist = formatInZone(event.date, IST_ZONE) ?? utc
  const matchday = local?.date ?? utcDateKey(event.date)
  if (!ist || !matchday) return null

  return {
    id: String(event.id ?? competition.id ?? ''),
    leagueKey: league.key,
    kickoff: new Date(event.date).toISOString(),
    matchday,
    status,
    home: normalizedTeam(homeRaw, numericScore(homeRaw, 'score'), numericScore(homeRaw, 'shootoutScore')),
    away: normalizedTeam(awayRaw, numericScore(awayRaw, 'score'), numericScore(awayRaw, 'shootoutScore')),
    venue: {
      name: venue.fullName ?? null,
      city: city || null,
      country: country || null,
    },
    local: local
      ? {
          ...local,
          city: city || local.zone.split('/').pop()?.replaceAll('_', ' '),
        }
      : null,
    ist: {
      ...ist,
      offsetDays: dateDelta(ist.date, matchday),
    },
    round: competition?.notes?.[0]?.headline ?? null,
  }
}

function compareMatches(a, b) {
  const byKickoff = Date.parse(a.kickoff) - Date.parse(b.kickoff)
  if (byKickoff !== 0) return byKickoff
  return a.id.localeCompare(b.id)
}

/**
 * Create one long-lived service with its own short-lived upstream cache.
 * @param {{ fetch?: typeof fetch }} [options] - injectable fetch for tests.
 * @returns {{ handle(request: Request): Promise<Response>, dispose(): void }}
 */
export function createFootballService(options = {}) {
  const fetchImpl = options.fetch ?? globalThis.fetch
  if (typeof fetchImpl !== 'function') throw new Error('Football hub needs a fetch implementation')

  const cache = new Map()
  const pending = new Map()

  async function fetchLeagueDay(league, dateKey, force) {
    const key = `${league.slug}:${dateKey}`
    const now = Date.now()
    const cached = cache.get(key)
    if (!force && cached && now - cached.at < ttlFor(dateKey)) return cached.value
    if (!force && pending.has(key)) return pending.get(key)

    const upstreamDate = dateKey.replaceAll('-', '')
    const url = `${UPSTREAM}/${league.slug}/scoreboard?dates=${upstreamDate}`
    const promise = (async () => {
      const response = await fetchImpl(url, {
        headers: {
          accept: 'application/json',
          'accept-language': 'en',
          'user-agent': 'DSH Football Hub/1.0',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!response.ok) throw new Error(`ESPN returned ${response.status} for ${league.slug}`)
      const json = await response.json()
      const info = Array.isArray(json?.leagues) ? json.leagues[0] : null
      const value = {
        events: Array.isArray(json?.events) ? json.events : [],
        logo: espnLogo(info, league.logo),
        season: seasonLabelFrom(info, dateKey),
      }
      cache.set(key, { at: Date.now(), value })
      return value
    })().finally(() => pending.delete(key))

    pending.set(key, promise)
    return promise
  }

  async function buildMatchday(dateKey, force) {
    const results = await Promise.all(LEAGUES.map(async league => {
      const upstreamDates = [dateKey, addDays(dateKey, -1)]
      const settled = await Promise.allSettled(upstreamDates.map(day => fetchLeagueDay(league, day, force)))
      const events = []
      const errors = []
      let logo = league.logo
      let season = null

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          events.push(...result.value.events)
          logo = result.value.logo || logo
          season = season ?? result.value.season
        } else {
          errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
        }
      }

      const unique = new Map()
      for (const event of events) {
        if (event?.id !== undefined) unique.set(String(event.id), event)
      }

      const matches = []
      for (const event of unique.values()) {
        try {
          const match = normalizeEvent(event, league)
          if (match && match.matchday === dateKey) matches.push(match)
        } catch {
          // A malformed upstream event is skipped rather than poisoning the day.
        }
      }
      matches.sort(compareMatches)

      return {
        league: {
          ...league,
          logo,
          hasMatches: matches.length > 0,
        },
        matches,
        errors,
        season,
      }
    }))

    const unavailable = results
      .filter(result => result.errors.length > 0)
      .map(result => result.league.name)
    const allFailed = results.every(result => result.errors.length === 2)
    if (allFailed) throw new Error('Every competition feed failed')

    const leagues = results.map(result => result.league)
    const matches = results.flatMap(result => result.matches).sort(compareMatches)
    const season = results.find(result => result.season)?.season ?? seasonLabelFrom(null, dateKey)

    return {
      date: dateKey,
      timezone: IST_ZONE,
      season,
      source: {
        name: 'ESPN',
        url: 'https://www.espn.com/soccer/',
      },
      partial: unavailable.length > 0,
      unavailable,
      leagues,
      matches,
    }
  }


  async function fetchLeagueMonth(league, monthKey, force) {
    const key = `${league.slug}:month:${monthKey}`
    const now = Date.now()
    const cached = cache.get(key)
    if (!force && cached && now - cached.at < monthTtl(monthKey)) return cached.value
    if (!force && pending.has(key)) return pending.get(key)

    const upstreamMonth = monthKey.replaceAll('-', '')
    const url = `${UPSTREAM}/${league.slug}/scoreboard?dates=${upstreamMonth}`
    const promise = (async () => {
      const response = await fetchImpl(url, {
        headers: {
          accept: 'application/json',
          'accept-language': 'en',
          'user-agent': 'DSH Football Hub/1.0',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!response.ok) throw new Error(`ESPN returned ${response.status} for ${league.slug}`)
      const json = await response.json()
      const info = Array.isArray(json?.leagues) ? json.leagues[0] : null
      const value = {
        events: Array.isArray(json?.events) ? json.events : [],
        logo: espnLogo(info, league.logo),
        season: seasonLabelFrom(info, `${monthKey}-01`),
      }
      cache.set(key, { at: Date.now(), value })
      return value
    })().finally(() => pending.delete(key))

    pending.set(key, promise)
    return promise
  }

  async function buildMonth(monthKey, force) {
    const months = [-1, 0, 1].map(offset => shiftMonth(monthKey, offset))
    const monthSet = new Set(months)
    const results = await Promise.all(LEAGUES.map(async league => {
      const settled = await Promise.allSettled(months.map(month => fetchLeagueMonth(league, month, force)))
      const events = []
      const errors = []
      let logo = league.logo
      let season = null

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          events.push(...result.value.events)
          logo = result.value.logo || logo
          season = season ?? result.value.season
        } else {
          errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
        }
      }

      const unique = new Map()
      for (const event of events) {
        if (event?.id !== undefined) unique.set(String(event.id), event)
      }

      const matches = []
      for (const event of unique.values()) {
        try {
          const match = normalizeEvent(event, league)
          if (match && monthSet.has(match.matchday.slice(0, 7))) matches.push(match)
        } catch {
          // A malformed upstream event is skipped rather than poisoning the month.
        }
      }

      return {
        league: {
          ...league,
          logo,
          hasMatches: matches.some(match => match.matchday.startsWith(monthKey)),
        },
        matches,
        errors,
        season,
      }
    }))

    const unavailable = results
      .filter(result => result.errors.length > 0)
      .map(result => result.league.name)
    const allFailed = results.every(result => result.errors.length === months.length)
    if (allFailed) throw new Error('Every competition feed failed')

    const leagues = results.map(result => result.league)
    const season = results.find(result => result.season)?.season ?? seasonLabelFrom(null, `${monthKey}-01`)
    const days = new Map()

    for (const result of results) {
      for (const match of result.matches) {
        const dateKey = match.matchday
        let day = days.get(dateKey)
        if (day === undefined) {
          day = {
            date: dateKey,
            total: 0,
            byLeague: {},
            live: 0,
            finished: 0,
            upcoming: 0,
            special: 0,
            derby: false,
            derbyLeagues: [],
          }
          days.set(dateKey, day)
        }
        day.total += 1
        day.byLeague[match.leagueKey] = (day.byLeague[match.leagueKey] ?? 0) + 1
        if (match.status.bucket === 'live') day.live += 1
        else if (match.status.bucket === 'finished') day.finished += 1
        else if (match.status.bucket === 'upcoming') day.upcoming += 1
        else day.special += 1
        if (isDerby(match)) {
          day.derby = true
          if (!day.derbyLeagues.includes(match.leagueKey)) day.derbyLeagues.push(match.leagueKey)
        }
      }
    }

    return {
      month: monthKey,
      months,
      timezone: IST_ZONE,
      season,
      source: {
        name: 'ESPN',
        url: 'https://www.espn.com/soccer/',
      },
      partial: unavailable.length > 0,
      unavailable,
      leagues,
      days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date)),
    }
  }

  function respond(payload, status = 200, extraHeaders = {}) {
    const body = JSON.stringify(payload)
    const bytes = new TextEncoder().encode(body).byteLength
    return new Response(status === 204 ? null : body, {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'content-length': String(bytes),
        'x-content-type-options': 'nosniff',
        ...extraHeaders,
      },
    })
  }

  async function handle(request) {
    const method = String(request?.method ?? 'GET').toUpperCase()
    if (method !== 'GET' && method !== 'HEAD') {
      return respond({ error: 'Use GET for the football scoreboard.' }, 405, { allow: 'GET, HEAD' })
    }

    let url
    try {
      url = new URL(request.url)
    } catch {
      return respond({ error: 'Invalid request URL.' }, 400)
    }

    const requestedDate = url.searchParams.get('date')
    const dateKey = normalizeDate(requestedDate ?? todayInZone(IST_ZONE))
    if (!dateKey) return respond({ error: 'date must be a real calendar date in YYYY-MM-DD form.' }, 400)

    const force = url.searchParams.get('refresh') === '1'
    try {
      const payload = await buildMatchday(dateKey, force)
      const enriched = { ...payload, generatedAt: new Date().toISOString() }
      const response = respond(enriched)
      if (method === 'HEAD') {
        return new Response(null, { status: response.status, headers: response.headers })
      }
      return response
    } catch (error) {
      return respond({
        error: 'Live football data is temporarily unavailable.',
        detail: error instanceof Error ? error.message : String(error),
      }, 502)
    }
  }

  async function handleMonth(request) {
    const method = String(request?.method ?? 'GET').toUpperCase()
    if (method !== 'GET' && method !== 'HEAD') {
      return respond({ error: 'Use GET for the football month overview.' }, 405, { allow: 'GET, HEAD' })
    }

    let url
    try {
      url = new URL(request.url)
    } catch {
      return respond({ error: 'Invalid request URL.' }, 400)
    }

    const requestedMonth = url.searchParams.get('month')
    const monthKey = normalizeMonth(requestedMonth ?? todayInZone(IST_ZONE).slice(0, 7))
    if (!monthKey) return respond({ error: 'month must be a real calendar month in YYYY-MM form.' }, 400)

    const force = url.searchParams.get('refresh') === '1'
    try {
      const payload = await buildMonth(monthKey, force)
      const enriched = { ...payload, generatedAt: new Date().toISOString() }
      const response = respond(enriched)
      if (method === 'HEAD') {
        return new Response(null, { status: response.status, headers: response.headers })
      }
      return response
    } catch (error) {
      return respond({
        error: 'The month overview is temporarily unavailable.',
        detail: error instanceof Error ? error.message : String(error),
      }, 502)
    }
  }

  return {
    handle,
    handleMonth,
    dispose() {
      cache.clear()
      pending.clear()
      formatterCache.clear()
    },
  }
}
