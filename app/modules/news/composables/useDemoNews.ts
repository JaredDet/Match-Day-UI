import { news, type DemoNews } from '~/modules/news/data/news'
import { newsPreview, plainNewsText } from '~/modules/news/utils/preview'
export type NewsPreview = Omit<DemoNews, 'content'> & { preview: string }
export function useDemoNews() {
  const items = useState<DemoNews[]>('demo-news', () => news.map(item => ({ ...item, content: { children: [...item.content.children] } })))
  const publishedNews = computed<NewsPreview[]>(() => items.value.filter(item => item.status === 'PUBLISHED').sort((a,b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')).map(({ content, ...item }) => ({ ...item, preview: newsPreview(content.children) })))
  function save(input: Pick<DemoNews, 'title' | 'team_id' | 'cover_image' | 'content'>, id?: string) {
    const current = id ? items.value.find(item => item.id === id) : undefined
    if (id && (!current || current.status !== 'DRAFT')) throw new Error('Solo se pueden editar borradores.')
    if (!input.title.trim() || Array.from(input.title.trim()).length > 200) throw new Error('El título debe tener entre 1 y 200 caracteres.')
    if (input.content.children.reduce((total, p) => total + Array.from(plainNewsText(p)).length, 0) > 500) throw new Error('El contenido admite un máximo de 500 caracteres de texto.')
    for (const paragraph of input.content.children) {
      const tags: string[] = []
      for (const token of paragraph.match(/<[^>]*>/g) ?? []) {
        if (!/^<\/?[bi]>$/.test(token)) throw new Error('Solo se permite formato <b> y <i>, sin atributos.')
        if (token.startsWith('</')) { if (tags.pop() !== token[2]) throw new Error('Revisa el cierre de las etiquetas de formato.') }
        else tags.push(token[1]!)
      }
      if (tags.length) throw new Error('Cierra las etiquetas de formato en cada párrafo.')
    }
    if (current) Object.assign(current, input, { team_id: current.team_id, title: input.title.trim() })
    else items.value.unshift({ ...input, title: input.title.trim(), id: `news-${crypto.randomUUID()}`, status: 'DRAFT', scheduled_at: null, published_at: null })
  }
  function act(id: string, action: 'publish' | 'schedule' | 'unschedule' | 'delete', date?: string) {
    const item = items.value.find(item => item.id === id)
    if (!item || item.status === 'PUBLISHED') throw new Error('La noticia publicada es de solo lectura.')
    if (action === 'unschedule') { if (item.status !== 'SCHEDULED') throw new Error('La noticia no está programada.'); item.status = 'DRAFT'; item.scheduled_at = null; return }
    if (action === 'delete') { if (item.status !== 'DRAFT') throw new Error('Solo se pueden eliminar borradores.'); items.value = items.value.filter(n => n.id !== id); return }
    if (!item.content.children.some(p => plainNewsText(p))) throw new Error('Añade contenido antes de publicar o programar.')
    if (action === 'schedule') {
      if (item.status !== 'DRAFT' || !date || !Number.isFinite(Date.parse(date)) || Date.parse(date) <= Date.now()) throw new Error('Selecciona una fecha futura para el borrador.')
      item.status = 'SCHEDULED'; item.scheduled_at = new Date(date).toISOString()
    } else { item.status = 'PUBLISHED'; item.published_at = new Date().toISOString(); item.scheduled_at = null }
  }
  function publishDue() { const due = items.value.filter(item => item.status === 'SCHEDULED' && Date.parse(item.scheduled_at!) <= Date.now()); due.forEach(item => act(item.id, 'publish')); return due.length }
  return { items, publishedNews, save, act, publishDue }
}
