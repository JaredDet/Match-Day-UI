import type { ContentCandidate, NavigationSignal, Recommendation } from '~/modules/recommendations/types/recommendations'

export const HISTORY_DAYS = 30
export const MAX_SIGNALS = 500
const DAY = 86_400_000

export function cleanHistory(value: unknown, now: number): NavigationSignal[] {
  if (!Array.isArray(value)) return []
  return value.filter((s): s is NavigationSignal => !!s && typeof s === 'object'
    && typeof s.key === 'string' && /^(team|player|news|match|tournament):[\w-]+$/.test(s.key)
    && Number.isFinite(s.lastAt) && s.lastAt <= now && s.lastAt >= now - HISTORY_DAYS * DAY
    && typeof s.day === 'string' && s.day === new Date(s.lastAt).toISOString().slice(0, 10)
    && Number.isInteger(s.visits) && s.visits >= 1 && s.visits <= 3
    && Number.isFinite(s.seconds) && s.seconds >= 0 && s.seconds <= 120
  ).slice(-MAX_SIGNALS)
}

export function recordNavigation(history: NavigationSignal[], key: string, seconds: number, now: number) {
  const next = cleanHistory(history, now).map(signal => ({ ...signal }))
  const day = new Date(now).toISOString().slice(0, 10)
  const current = next.find(signal => signal.key === key && signal.day === day)
  if (current) {
    if (now - current.lastAt >= 30 * 60_000) current.visits = Math.min(3, current.visits + 1)
    current.seconds = Math.min(120, current.seconds + seconds)
    current.lastAt = now
  } else next.push({ key, day, visits: 1, seconds: Math.min(120, seconds), lastAt: now })
  return next.sort((a, b) => a.lastAt - b.lastAt).slice(-MAX_SIGNALS)
}

export function rankContent(candidates: ContentCandidate[], history: NavigationSignal[], now: number): Recommendation[] {
  const byKey = new Map(candidates.map(candidate => [candidate.key, candidate]))
  const teamInterest = new Map<string, number>(), tournamentInterest = new Map<string, number>()
  const seen = new Set<string>()
  for (const signal of cleanHistory(history, now)) {
    const candidate = byKey.get(signal.key)
    if (!candidate) continue
    seen.add(candidate.key)
    const decay = Math.pow(0.5, (now - signal.lastAt) / (7 * DAY))
    const weight = (signal.visits + Math.min(signal.seconds / 60, 2)) * decay
    candidate.teams.forEach(id => teamInterest.set(id, (teamInterest.get(id) ?? 0) + weight / Math.max(1, candidate.teams.length)))
    candidate.tournaments.forEach(id => tournamentInterest.set(id, (tournamentInterest.get(id) ?? 0) + weight))
  }
  const strongestTeamInterest = Math.max(0, ...teamInterest.values())
  return candidates.map(candidate => {
    const teamScore = Math.max(0, ...candidate.teams.map(id => teamInterest.get(id) ?? 0))
    const tournamentScore = Math.max(0, ...candidate.tournaments.map(id => tournamentInterest.get(id) ?? 0))
    const affinity = teamScore + tournamentScore * 0.7
    const date = candidate.date ? Date.parse(candidate.date) : NaN
    const freshness = Number.isFinite(date) ? 1 / (1 + Math.abs(now - date) / DAY) : 0
    const preferredTeam = strongestTeamInterest > 0 && candidate.teams.some(id => (teamInterest.get(id) ?? 0) === strongestTeamInterest)
    const reason = affinity > 0
      ? preferredTeam ? 'De uno de los equipos que más has consultado' : teamScore >= tournamentScore * 0.7 ? 'Relacionado con equipos que has consultado' : 'Relacionado con torneos que has visitado'
      : candidate.live ? 'Un partido que se está jugando' : 'Contenido para explorar'
    return { ...candidate, affinity, preferredTeam, score: affinity + freshness + (candidate.live ? 1 : 0) - (seen.has(candidate.key) ? 0.5 : 0), reason }
  }).sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
}

export function recommendationSections(ranked: Recommendation[], history: NavigationSignal[]) {
  const news = ranked.filter(item => item.kind === 'news').slice(0, 4)
  const matchCandidates = ranked.filter(item => item.kind === 'match')
  const directMatches = matchCandidates.filter(item => item.preferredTeam).slice(0, 2)
  const matches = [
    ...directMatches,
    ...matchCandidates.filter(item => !item.preferredTeam),
    ...matchCandidates.filter(item => item.preferredTeam && !directMatches.some(selected => selected.key === item.key)),
  ].slice(0, 4)
  const tournaments = ranked.filter(item => item.kind === 'tournament').slice(0, 3)
  const displayed = new Set([...news, ...matches, ...tournaments].map(item => item.key))
  const seen = new Set(history.map(signal => signal.key))
  const discoveryCandidates = ranked
    .filter(item => !['player', 'team'].includes(item.kind) && !displayed.has(item.key) && !seen.has(item.key))
    .sort((a, b) => a.affinity - b.affinity || b.score - a.score)
  const discovery = discoveryCandidates.slice(0, 4).map(item => ({
    ...item,
    preferredTeam: false,
    reason: 'Todavía no has explorado este contenido',
  }))
  return { news, matches, tournaments, discovery }
}
