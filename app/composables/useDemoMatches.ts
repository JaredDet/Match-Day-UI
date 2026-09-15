import { createDemoMatches } from '../data/matches'
export function useDemoMatches() {
  const today = useState('today', () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }))
  const matches = computed(() => createDemoMatches(today.value))
  return { today, matches }
}
