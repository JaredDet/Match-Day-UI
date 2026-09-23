import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const base = process.env.DEMO_URL ?? 'http://localhost:3112'
const executable = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profile = await mkdtemp(path.join(os.tmpdir(), 'matchday-demo-browser-'))
const browser = spawn(executable, ['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${profile}`,'--remote-debugging-port=9337','about:blank'], { windowsHide:true, stdio:'ignore' })
const delay = ms => new Promise(resolve => setTimeout(resolve,ms))
let socket
try {
  let target
  for (let i=0;i<100;i++) { try { target = await (await fetch('http://localhost:9337/json/new?about:blank',{method:'PUT'})).json(); break } catch { await delay(100) } }
  assert.ok(target,'Browser did not start')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open',resolve,{once:true}))
  let sequence=0; const pending=new Map(), errors=[]
  socket.addEventListener('message',({data}) => { const result=JSON.parse(data); if(result.id){ const task=pending.get(result.id); pending.delete(result.id); result.error ? task.reject(result.error) : task.resolve(result.result) } else if(result.method==='Runtime.exceptionThrown') errors.push(result.params.exceptionDetails.text + ' ' + (result.params.exceptionDetails.exception?.description ?? '')) })
  const send = (method,params={}) => new Promise((resolve,reject) => { const id=++sequence; pending.set(id,{resolve,reject}); socket.send(JSON.stringify({id,method,params})) })
  const evaluate = async expression => { const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value }
  const wait = async expression => { for(let i=0;i<100;i++){ if(await evaluate(expression)) return; await delay(100) } throw new Error(`Timed out: ${expression}\n${errors.join('\n')}`) }
  const click = async text => { await evaluate(`(() => { const element=[...document.querySelectorAll('button,a')].find(e => e.textContent.trim() === ${JSON.stringify(text)}) ?? [...document.querySelectorAll('button,a')].find(e => e.textContent.includes(${JSON.stringify(text)})); if(!element) throw Error('Missing control: '+${JSON.stringify(text)}); element.click() })()`); await delay(300) }
  const set = async (selector,value) => { await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw Error('Missing input'); e.value=${JSON.stringify(value)}; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}))})()`); await delay(50) }
  const typeEditable = async value => { await evaluate(`document.querySelector('.content-editor').focus()`); await send('Input.insertText',{text:value}); await delay(50) }
  const navigate = async route => { await send('Page.navigate',{url:base+route}); await wait(`!!document.querySelector('main')`); await wait(`!!document.querySelector('#__nuxt')?.__vue_app__`); await delay(150) }
  await send('Runtime.enable'); await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  for(const route of ['/news','/news/manage','/tournaments/manage','/matches/manage','/tournaments/copa-matchday','/teams/register','/teams/manage','/players']) {
    await navigate(route)
    assert.equal(await evaluate(`!!document.querySelector('h1')`),true,route)
    assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth`),false,`Desktop overflow ${route}`)
  }
  await navigate('/news/manage')
  await set('input[maxlength="200"]','Noticia de prueba navegador')
  await typeEditable('Primer párrafo de la noticia.\n\nContenido completo del segundo párrafo.')
  assert.ok(await evaluate(`document.querySelector('.content-editor').innerText.includes('Contenido completo')`))
  await evaluate(`(() => { const editor=document.querySelector('.content-editor'); const range=document.createRange(); range.setStart(editor.firstChild,0); range.setEnd(editor.firstChild,6); const selection=getSelection(); selection.removeAllRanges(); selection.addRange(range); editor.dispatchEvent(new MouseEvent('mouseup',{bubbles:true})) })()`)
  await click('N')
  assert.equal(await evaluate(`document.querySelector('.content-editor b')?.textContent`),'Primer')
  await evaluate(`(() => { const editor=document.querySelector('.content-editor'); const text=[...editor.childNodes].find(node=>node.nodeType===Node.TEXT_NODE && node.textContent.includes('párrafo')); const start=text.textContent.indexOf('párrafo'); const range=document.createRange(); range.setStart(text,start); range.setEnd(text,start+7); const selection=getSelection(); selection.removeAllRanges(); selection.addRange(range); editor.dispatchEvent(new MouseEvent('mouseup',{bubbles:true})) })()`)
  await click('C')
  assert.equal(await evaluate(`document.querySelector('.content-editor i')?.textContent`),'párrafo')
  await click('Guardar borrador'); await wait(`document.querySelectorAll('.item').length === 7 || document.querySelector('[role=alert]')`)
  assert.equal(await evaluate(`document.querySelector('[role=alert]')?.textContent ?? ''`),'')
  await evaluate(`document.querySelector('.item .actions button:last-child').click()`); await delay(200)
  await click('Ver publicaciones'); await wait(`location.pathname === '/news' && document.querySelector('.demo-grid')`)
  assert.ok(await evaluate(`document.querySelector('main').textContent.includes('Noticia de prueba navegador')`))
  assert.equal(await evaluate(`document.querySelector('main').textContent.includes('Contenido completo del segundo párrafo.')`),false)
  await click('Noticia de prueba navegador'); await wait(`document.querySelector('.story-content')`)
  assert.ok(await evaluate(`document.querySelector('main').textContent.includes('Contenido completo del segundo párrafo.')`))
  console.log('News: draft → publication → preview → full detail passed')

  await navigate('/teams/register')
  await set('form input','Club del navegador'); await set('form input[autocomplete="name"]','Directora demo'); await click('Continuar')
  await wait(`document.querySelector('form h2')?.textContent.includes('Jugadores')`)
  await set('form input','Jugador demo'); await click('Continuar')
  await wait(`document.querySelector('.registration-review')`)
  const submitText=await evaluate(`document.querySelector('button[type=submit]').textContent.trim()`)
  await click(submitText); await wait(`location.pathname.includes('/success')`)
  await click('Inscribir en un torneo'); await wait(`location.pathname === '/tournaments/register' && document.querySelector('form')`)
  await click('Continuar'); await wait(`document.querySelector('select option')?.textContent.includes('Selecciona un equipo')`)
  const teamId=await evaluate(`[...document.querySelectorAll('option')].find(o=>o.textContent==='Club del navegador')?.value`)
  assert.ok(teamId)
  await set('select',teamId); await click('Continuar'); await click('Confirmar inscripción demo')
  await wait(`document.querySelector('[role=status]')?.textContent.includes('Club del navegador')`)
  console.log('Teams: create wizard → shared catalog → registration wizard passed')

  for(const route of ['/news/manage','/tournaments/manage','/matches/manage']) {
    await navigate(route)
    await evaluate(`document.querySelector('.theme-switch').click()`)
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
    await delay(200)
    assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth`),false,`Mobile overflow ${route}`)
    const screenshot = await send('Page.captureScreenshot',{format:'png'})
    await writeFile(path.join(profile,route.split('/')[1]+'-light.png'),Buffer.from(screenshot.data,'base64'))
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  }
  assert.deepEqual(errors,[])
  console.log(`Responsive light mode passed; screenshots: ${profile}`)
} finally {
  socket?.close(); browser.kill()
}
