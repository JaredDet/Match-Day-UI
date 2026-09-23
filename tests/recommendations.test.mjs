import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

const source = await readFile(new URL('../app/modules/recommendations/utils/ranking.ts', import.meta.url), 'utf8')
const { cleanHistory, recordNavigation, rankContent, recommendationSections } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`)
const now = Date.parse('2026-09-21T12:00:00Z')
const candidate = (key, kind, teams = [], tournaments = []) => ({ key, kind, teams, tournaments, title: key, path: `/${key}`, description: '' })
const catalog = [candidate('team:a','team',['a']),candidate('team:b','team',['b']),candidate('news:a','news',['a']),candidate('news:b','news',['b']),candidate('match:a','match',['a','c']),candidate('tournament:cup','tournament',[],['cup'])]

test('navigation produces related news and matches without explicit interests', () => {
  const history = recordNavigation([], 'team:a', 30, now)
  const ranked = rankContent(catalog,history,now)
  assert.ok(ranked.find(c => c.key === 'news:a').score > ranked.find(c => c.key === 'news:b').score)
  assert.ok(ranked.find(c => c.key === 'match:a').affinity > 0)
  assert.match(ranked.find(c => c.key === 'news:a').reason,/consultado/)
})
test('repeated reloads do not inflate visits; attention and daily visits are capped', () => {
  let history = []
  for(let i=0;i<50;i++) history = recordNavigation(history,'team:a',5,now+i*5000)
  assert.equal(history.length,1)
  assert.equal(history[0].visits,1)
  assert.equal(history[0].seconds,120)
  for(let i=1;i<=5;i++) history = recordNavigation(history,'team:a',5,now+i*3600000)
  assert.equal(history[0].visits,3)
})
test('interests decay and visits across days accumulate', () => {
  const day = 86400000
  const old = recordNavigation([],'team:a',30,now-14*day)
  const recent = recordNavigation([],'team:b',30,now)
  const ranked = rankContent(catalog,[...old,...recent],now)
  assert.ok(ranked.find(c => c.key === 'news:b').affinity > ranked.find(c => c.key === 'news:a').affinity)
  const repeated = recordNavigation(recent,'team:b',30,now+day)
  assert.equal(repeated.length,2)
})
test('invalid, expired and future storage entries are ignored safely', () => {
  const valid = recordNavigation([],'team:a',5,now)[0]
  assert.deepEqual(cleanHistory(null,now),[])
  assert.equal(cleanHistory([valid,{...valid,lastAt:'bad'}, {...valid,lastAt:Infinity}, {...valid,visits:999}, {...valid,lastAt:now+1000}, {...valid,lastAt:now-31*86400000}],now).length,1)
})
test('cold start, clearing and discovery do not fabricate personalized reasons or repeat cards', () => {
  const ranked = rankContent(catalog,[],now)
  assert.ok(ranked.every(item => item.affinity === 0 && !item.reason.includes('consultado')))
  const sections = recommendationSections(ranked,[])
  const all = Object.values(sections).flat()
  assert.equal(new Set(all.map(c => c.key)).size,all.length)
  const visited = recordNavigation([],'team:a',5,now)
  assert.ok(recommendationSections(rankContent(catalog,visited,now),visited).discovery.every(c => c.key !== 'team:a'))
})
test('tournament interest reaches content associated with that tournament; unknown demo IDs have no effect', () => {
  const content = [...catalog,candidate('news:cup','news',[],['cup'])]
  const history = recordNavigation([],'tournament:cup',30,now)
  assert.ok(rankContent(content,history,now).find(c => c.key === 'news:cup').affinity > 0)
  assert.ok(rankContent(content,recordNavigation([],'team:deleted',30,now),now).every(c => c.affinity === 0))
})

test('match recommendations mix direct affinity with other content and discovery excludes isolated teams', () => {
  const content = [
    ...catalog,
    candidate('match:a2','match',['a','d']),
    candidate('match:a3','match',['a','e']),
    candidate('match:b2','match',['b','f']),
    candidate('match:c2','match',['c','g']),
  ]
  const history = recordNavigation([], 'team:a', 30, now)
  const sections = recommendationSections(rankContent(content, history, now), history)
  assert.ok(sections.matches.filter(item => item.preferredTeam).length <= 2)
  assert.ok(sections.matches.some(item => !item.preferredTeam))
  assert.ok(sections.discovery.every(item => item.kind !== 'team'))
  assert.ok(sections.discovery.every(item => !item.preferredTeam))
})
