import { createDemoMatches } from '~/modules/matches/data/matches'
export function useDemoMatches() {
  const today = useState('today', () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }))
  const matches = useState('demo-matches', () => createDemoMatches(today.value))
  return { today, matches }
}
