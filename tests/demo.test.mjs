import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { createContext, SourceTextModule } from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ref, computed, watch } from 'vue'

// Each test gets the same reactive primitives as the app and an isolated Nuxt session.
async function session() {
  const root = fileURLToPath(new URL('../app/', import.meta.url)), states = new Map(), cache = new Map()
  const context = createContext({ ref, computed, watch, crypto, Date, console, useState(key, factory) { if (!states.has(key)) states.set(key, ref(factory())); return states.get(key) } })
  async function load(specifier) {
    const file = path.join(root, specifier.replace(/^~\//, '')) + '.ts'
    if (cache.has(file)) return cache.get(file)
    const pending = (async () => {
      const source = stripTypeScriptTypes(await readFile(file,'utf8'))
      const module = new SourceTextModule(source, { context, identifier:file })
      await module.link(load); return module
    })()
    cache.set(file,pending); return pending
  }
  async function use(specifier) { const module = await load(specifier); if (module.status !== 'evaluated') await module.evaluate(); return module.namespace }
  const teams = (await use('~/modules/teams/composables/useDemoTeams')).useDemoTeams()
  const news = (await use('~/modules/news/composables/useDemoNews')).useDemoNews()
  const ops = (await use('~/modules/matches/composables/useMatchOperations')).useMatchOperations()
  const tournaments = (await use('~/modules/tournaments/composables/useTournamentManagement')).useTournamentManagement()
  return { teams, news, ops, tournaments, use }
}
const date = '2030-01-10T12:00:00Z'
function setupMatch(ops, home='0', away='1') {
  const id = ops.create(home,away,date)
  for (const side of ['home','away']) ops.lineup(id,side,ops.roster(side === 'home' ? home : away).slice(0,11).map(p => p.id))
  ops.period(id,'next'); return id
}
function finishMatch(ops,id,goal=true) {
  const match = ops.matches.value.find(m => m.id === id)
  if (match.status === 'scheduled') {
    for (const side of ['home','away']) ops.lineup(id,side,ops.roster(match[`${side}_team`].id).slice(0,11).map(p => p.id))
    ops.period(id,'next')
  }
  if (goal) ops.event(id,'home','goal',ops.activePlayers(id,'home')[0],1)
  ops.period(id,'next',45); ops.period(id,'next'); ops.period(id,'next'); ops.period(id,'next',90); ops.period(id,'finish')
}

test('created teams share a catalog, roster and season membership without mutating seed sessions', async () => {
  const { teams, ops, tournaments } = await session()
  const id = teams.create({ name:'Nuevo club',head_coach_name:'Ana',players:[{name:'Jugadora',preferred_position:'goalkeeper',preferred_shirt_number:1}] })
  assert.equal(ops.roster(id).length,1)
  assert.equal(ops.roster(id)[0].name,'Jugadora')
  tournaments.enroll('season-2027',id)
  assert.ok(tournaments.registrations.value['season-2027'].includes(id))
  assert.throws(() => tournaments.enroll('season-2027',id), /ya está inscrito/)
  assert.throws(() => teams.create({name:' NUEVO CLUB ',head_coach_name:'',players:[]}), /Ya existe/)
  const other = await session(); assert.equal(other.teams.teamById(id),undefined)
})
test('news lifecycle, covers, public previews and immutable publications', async () => {
  const { news } = await session()
  news.save({title:'Noticia',team_id:'0',cover_image:'data:image/png;base64,AA==',content:{children:['<b>Hola</b> &amp; mundo','Segundo párrafo']}})
  const item = news.items.value[0]
  assert.equal(news.publishedNews.value.some(n => n.id === item.id),false)
  news.act(item.id,'schedule',date)
  assert.throws(() => news.act(item.id,'delete'), /borradores/)
  assert.throws(() => news.save(item,item.id), /borradores/)
  news.act(item.id,'unschedule'); assert.equal(item.scheduled_at,null)
  news.act(item.id,'publish')
  const preview = news.publishedNews.value.find(n => n.id === item.id)
  assert.equal(preview.preview,'Hola & mundo'); assert.equal('content' in preview,false)
  assert.equal(item.content.children.length,2); assert.ok(preview.cover_image)
  assert.throws(() => news.act(item.id,'unschedule'), /solo lectura/)
  assert.throws(() => news.save({ ...item, content:{children:['<img src=x onerror=alert(1)>']} }), /Solo se permite/)
  assert.throws(() => news.save({ ...item, content:{children:['x'.repeat(501)]} }), /500/)
})
test('preview counts Unicode characters and skips blank paragraphs', async () => {
  const { use } = await session(), { newsPreview } = await use('~/modules/news/utils/preview')
  assert.equal(newsPreview(['<b> </b>','<i>Texto</i> &lt;seguro&gt;','otro']),'Texto <seguro>')
  assert.equal(Array.from(newsPreview(['😀'.repeat(201)])).length,200)
  assert.ok(newsPreview(['😀'.repeat(201)]).endsWith('…'))
})
test('groups enforce membership, phase uniqueness, capacity and match relationships', async () => {
  const { tournaments:t,ops } = await session()
  const tournament = t.createTournament('Copa pequeña',2), season = t.createSeason(tournament,'2030')
  for (const id of ['0','1','2']) t.enroll(season,id)
  const phaseId = t.createPhase(season,'Grupos',1,2); t.addGroup(phaseId,'A'); t.addGroup(phaseId,'B')
  const p = t.phases.value.find(p => p.id === phaseId), [a,b] = p.groups
  t.assign(phaseId,a.id,'0'); t.assign(phaseId,a.id,'1')
  assert.throws(() => t.assign(phaseId,b.id,'0'), /ya pertenece/)
  assert.throws(() => t.assign(phaseId,a.id,'2'), /completo/)
  assert.throws(() => t.assign(phaseId,b.id,'3'), /inscrito/)
  assert.throws(() => t.configure(tournament,'Copa pequeña',1), /menor/)
  const m = ops.create('0','1',date); t.fixture(phaseId,a.id,m,1)
  assert.throws(() => t.fixture(phaseId,a.id,m,2), /ya está vinculado/)
  assert.throws(() => t.withdraw(season,'0'), /asignaciones/)
  assert.throws(() => t.finishGroups(phaseId), /finalizados/)
  t.removeGroup(phaseId,b.id); finishMatch(ops,m,false); t.finishGroups(phaseId)
  assert.ok(t.standings(phaseId,a.id).every(r => r.tied))
  t.manualOrder(phaseId,a.id,['1','0']); assert.equal(t.standings(phaseId,a.id)[0].id,'1')
  assert.ok(t.standings(phaseId,a.id).every(r => !r.tied))
})
test('knockouts seed first versus last, lock registrations and advance winners and losers', async () => {
  const { tournaments:t,ops } = await session()
  for (const id of ['0','1','2','3']) t.enroll('season-2027',id)
  t.generate('season-2027',['0','1','2','3'],date,7,true)
  assert.throws(() => t.enroll('season-2027','4'), /cerradas/)
  const rounds = t.phases.value.filter(p => p.season === 'season-2027'), semi=rounds[0], final=rounds[1], third=rounds[2]
  const first = ops.matches.value.find(m => m.id === semi.fixtures[0].match)
  assert.equal(first.home_team.id,'0'); assert.equal(first.away_team.id,'3')
  assert.equal(t.advance('season-2027'),0)
  semi.fixtures.forEach(f => finishMatch(ops,f.match))
  assert.equal(t.advance('season-2027'),2); assert.equal(t.advance('season-2027'),0)
  const finalMatch = ops.matches.value.find(m => m.id === final.fixtures[0].match), thirdMatch = ops.matches.value.find(m => m.id === third.fixtures[0].match)
  assert.equal(finalMatch.home_team.id,'0'); assert.equal(finalMatch.away_team.id,'1')
  assert.equal(thirdMatch.home_team.id,'3'); assert.equal(thirdMatch.away_team.id,'2')
})
test('match events validate active players, substitutions, goal cancellation and locked lineups', async () => {
  const { ops } = await session()
  const id = setupMatch(ops), match = ops.matches.value.find(m => m.id === id), player = ops.activePlayers(id,'home')[0]
  assert.throws(() => ops.lineup(id,'home',[]), /bloqueada/)
  ops.event(id,'home','goal',player,4); assert.equal(match.home_team.score,1)
  ops.cancel(id,ops.operations.value[id].events[0].id); assert.equal(match.home_team.score,0)
  ops.event(id,'home','own_goal',player,5); assert.equal(match.away_team.score,1)
  ops.event(id,'home','yellow_card',player,6); ops.event(id,'home','yellow_card',player,7)
  assert.throws(() => ops.event(id,'home','goal',player,8), /en el campo/)
  const out = ops.activePlayers(id,'home')[0], replacement = ops.roster('0')[11].id
  ops.event(id,'home','substitution',out,8,replacement)
  assert.ok(ops.activePlayers(id,'home').includes(replacement)); assert.ok(!ops.activePlayers(id,'home').includes(out))
  assert.throws(() => ops.period(id,'finish'), /Cierra/)
  assert.throws(() => ops.period(id,'next',20), /al menos 45/)
})
test('shootouts alternate kickers, reject repeated players and end when decided', async () => {
  const { ops } = await session(), id = setupMatch(ops)
  ops.period(id,'next',45); ops.period(id,'next'); ops.period(id,'next'); ops.period(id,'next',90)
  ops.shootout(id)
  const home = ops.activePlayers(id,'home'), away = ops.activePlayers(id,'away')
  ops.kick(id,home[0],true); ops.kick(id,away[0],false)
  assert.throws(() => ops.kick(id,home[0],true), /antes de repetir/)
  for (let i=1;i<3;i++) { ops.kick(id,home[i],true); ops.kick(id,away[i],false) }
  const m=ops.matches.value.find(m => m.id === id)
  assert.equal(m.shootout.status,'finished'); assert.equal(m.status,'finished'); assert.equal(m.home_team.penalty_score,3)
})
