import { useRecommendationCatalog } from '~/modules/recommendations/composables/useRecommendationCatalog'
import { cleanHistory, rankContent, recommendationSections } from '~/modules/recommendations/utils/ranking'
import type { NavigationSignal } from '~/modules/recommendations/types/recommendations'

export const HISTORY_STORAGE_KEY = 'matchday-navigation-v1'

export function useRecommendations() {
  const history = useState<NavigationSignal[]>('recommendation-history', () => [])
  const now = useState('recommendation-time', () => Date.now())
  const catalog = useRecommendationCatalog()
  const sections = computed(() => recommendationSections(rankContent(catalog.value, history.value, now.value), history.value))
  const personalized = computed(() => cleanHistory(history.value, now.value).some(s => catalog.value.some(c => c.key === s.key)))
  const clearedAt = useState('recommendation-cleared-at', () => 0)
  function clearHistory() {
    history.value = []
    now.value = Date.now()
    clearedAt.value = now.value
    try { localStorage.removeItem(HISTORY_STORAGE_KEY) } catch { /* Storage may be unavailable. Session state still works. */ }
  }
  return { history, now, catalog, sections, personalized, clearedAt, clearHistory }
}
