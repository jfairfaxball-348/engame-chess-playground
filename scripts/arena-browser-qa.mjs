/* Real Chromium smoke test for both UCI workers, separated from maths QA. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=31048,origin='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/dev-server.js'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
async function ready(){
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw Error('Development server stopped');
    try{const r=await fetch(origin);if(r.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw Error('Development server not ready');
}
const browser=await chromium.launch({headless:true});
try{
  await ready();
  const page=await browser.newPage({viewport:{width:1100,height:850}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin,{waitUntil:'load'});
  await page.locator('#tab-arena').click();
  assert.equal(await page.locator('#engine-playground').isVisible(),true);
  assert.equal(await page.locator('.arena-cell').count(),64);
  assert.equal(await page.locator('#app').isVisible(),false);
  await page.locator('#arena-step').click();
  await page.waitForFunction(()=>document.querySelectorAll('.arena-move').length===1,{timeout:30000});
  assert.match(await page.locator('.arena-move').first().innerText(),/1\./);
  console.log('PASS Lozza opening move');
  await page.locator('#arena-step').click();
  await page.waitForFunction(()=>document.querySelectorAll('.arena-move').length===1 && document.querySelectorAll('.arena-move strong')[1]?.textContent?.length>0,{timeout:30000});
  console.log('PASS Stockfish 19 Lite reply');
  await page.locator('#arena-reset').click();
  assert.equal(await page.locator('.arena-move').count(),0);
  await page.locator('#arena-w').selectOption('stockfish');
  await page.locator('#arena-b').selectOption('lozza');
  await page.locator('#arena-play').click();
  await page.waitForFunction(()=>document.querySelectorAll('.arena-move').length>=2,{timeout:45000});
  await page.locator('#arena-pause').click();
  const frozen=await page.locator('.arena-move').count();
  await page.waitForTimeout(1700);
  assert.equal(await page.locator('.arena-move').count(),frozen);
  assert.equal(await page.locator('#arena-play').isEnabled(),true);
  await page.locator('#tab-maths').click();
  assert.equal(await page.locator('#engine-playground').isVisible(),false);
  assert.equal(await page.locator('[data-class="krk"]').isDisabled(),true);
  assert.equal(await page.locator('.sq').count(),64);
  assert.deepEqual(errors,[]);
  console.log('PASS play/pause/colour-swap/tabs; original maths gate intact');
  await page.close();
}finally{
  await browser.close();
  server.kill('SIGTERM');
}
