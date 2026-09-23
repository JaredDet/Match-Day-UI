export type ContentKind = 'team' | 'player' | 'news' | 'match' | 'tournament'

export interface ContentCandidate {
  key: string
  kind: ContentKind
  title: string
  path: string
  description: string
  image?: string | null
  homeTeam?: string
  awayTeam?: string
  homeScore?: number
  awayScore?: number
  teams: string[]
  tournaments: string[]
  date?: string
  live?: boolean
}

export interface NavigationSignal {
  key: string
  day: string
  visits: number
  seconds: number
  lastAt: number
}

export interface Recommendation extends ContentCandidate {
  score: number
  affinity: number
  reason: string
  preferredTeam?: boolean
}
