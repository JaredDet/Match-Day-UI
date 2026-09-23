import { useRecommendations, HISTORY_STORAGE_KEY } from '~/modules/recommendations/composables/useRecommendations'
import { cleanHistory, recordNavigation } from '~/modules/recommendations/utils/ranking'

export function useNavigationTracking() {
  const route = useRoute()
  const { history, catalog, now, clearedAt } = useRecommendations()
  let timer: ReturnType<typeof setInterval> | undefined
  let lastActivity = 0, lastTick = 0, routeStarted = 0, mounted = false
  const activity = () => { lastActivity = Date.now() }
  const events = ['pointerdown', 'keydown', 'scroll', 'pointermove'] as const
  function resetClock() { lastTick = Date.now(); lastActivity = lastTick; routeStarted = lastTick }
  function tick() {
    const time = Date.now(), elapsed = time - lastTick
    lastTick = time
    now.value = time
    if (time - routeStarted < 5000 || document.visibilityState !== 'visible' || !document.hasFocus() || time - lastActivity > 30_000 || elapsed > 10_000) return
    const candidate = catalog.value.find(item => item.path === route.path)
    if (!candidate) return
    history.value = recordNavigation(history.value, candidate.key, Math.max(0, elapsed / 1000), time)
    try { localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.value)) } catch { /* Keep working in memory. */ }
  }
  watch(() => route.path, () => { if (mounted) resetClock() })
  watch(clearedAt, resetClock)
  onMounted(() => {
    mounted = true
    resetClock()
    now.value = Date.now()
    try {
      history.value = cleanHistory(JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]'), now.value)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.value))
    } catch { history.value = [] }
    events.forEach(event => window.addEventListener(event, activity, { passive: true }))
    timer = setInterval(tick, 5000)
  })
  onBeforeUnmount(() => {
    mounted = false
    if (timer) clearInterval(timer)
    events.forEach(event => window.removeEventListener(event, activity))
  })
}
