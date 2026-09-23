export interface TeamRegistrationDraft {
  name: string;
  head_coach_name: string;
  crest: string | null;
  city: string;
  stadium_name: string;
  founded_year: number | null;
  players: {
    name: string;
    preferred_position: string;
    preferred_shirt_number: number | null;
  }[];
}
