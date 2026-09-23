export interface TeamRegistrationDraft {
  name: string
  head_coach_name: string
  players: {
    name: string
    preferred_position: string
    preferred_shirt_number: number | null
  }[]
}
