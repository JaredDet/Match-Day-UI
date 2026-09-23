export type ReportEvent = {
  id: string
  kind: string
  label: string
  minute: number
  added?: number
  side: number
  player?: string
  incoming?: string
  assistPlayer?: string
  goalkeeper?: string
  description?: string
  score?: string
  sequence?: number
  outcome?: 'scored' | 'missed'
}
