/** Browser QA for the proof-derived Maths board; Engine Playground has separate QA. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=31047,origin='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/dev-server.js'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let output='';
server.stdout.on('data',x=>output+=x.toString());server.stderr.on('data',x=>output+=x.toString());
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
 for(let i=0;i<80;i++){
  if(server.exitCode!==null)throw Error('Server stopped: '+output);
  try{if((await fetch(origin)).ok)return;}catch{}
  await sleep(100);
 }
 throw Error('Server unavailable: '+output);
}
const cell=(page,sq)=>page.locator('#app .maths-cell[data-sq="'+sq+'"]');
const rack=(page,p)=>page.locator('#app .maths-tray-piece[data-slot="'+p+'"]').first();
async function add(page,p,sq){await rack(page,p).click();await cell(page,sq).click();}
async function geometry(page,label){
 const x=await page.locator('.maths-board').evaluate(el=>{
  const b=el.getBoundingClientRect();
  const cells=Array.from(el.querySelectorAll('.maths-cell'),n=>{
   const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};
  });
  return {board:{x:b.x,y:b.y,w:b.width,h:b.height},cells};
 });
 assert.equal(x.cells.length,64,label+' 64 squares');
 assert.ok(x.board.w>120&&Math.abs(x.board.w-x.board.h)<1,label+' square frame');
 const f=x.cells[0];
 for(const c of x.cells){
  assert.ok(Math.abs(c.w-c.h)<1&&Math.abs(c.w-f.w)<1&&Math.abs(c.h-f.h)<1,label+' square geometry');
  assert.ok(c.x>=x.board.x&&c.y>=x.board.y,label+' grid containment');
 }
 return x.board;
}
async function drag(page,from,to){
 await from.scrollIntoViewIfNeeded();
 const a=await from.boundingBox(),b=await to.boundingBox();
 assert.ok(a&&b);
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);
 await page.mouse.down();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:9});
 await page.mouse.up();
}
async function fresh(page){
 await page.goto(origin+'/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.maths-cell').count(),64);
 assert.equal(await page.locator('.maths-tray-piece').count(),32);
 assert.equal(await page.locator('.maths-board .piece-icon').count(),0);
 assert.equal(await rack(page,'wQ').isDisabled(),true);
 assert.equal(await rack(page,'wP').isDisabled(),true);
 assert.equal(await rack(page,'bR').isEnabled(),true);
 assert.equal(await page.locator('#maths-start').isDisabled(),true);
}
async function run(){
 await ready();const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:950},isMobile:width<400,hasTouch:width<400});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try{
    await fresh(page);
    await geometry(page,width+' blank');
    await add(page,'wK',4);
    await add(page,'bK',60);
    assert.equal(await page.locator('.maths-board .piece-icon').count(),2);
    assert.equal(await page.locator('.maths-outcome').innerText(),'Guaranteed draw');
    assert.equal(await page.locator('#maths-start').isEnabled(),true);
    const before=await geometry(page,width+' arranged');
    const initial=await page.locator('.maths-board').evaluate(el=>Array.from(el.querySelectorAll('.maths-cell'),c=>[c.dataset.sq,Boolean(c.querySelector('.piece-icon'))]));
    await page.locator('#maths-start').click();
    const begun=await page.locator('.maths-board').evaluate(el=>Array.from(el.querySelectorAll('.maths-cell'),c=>[c.dataset.sq,Boolean(c.querySelector('.piece-icon'))]));
    assert.deepEqual(begun,initial,'Start game must preserve exact board occupancy and orientation');
    assert.match(await page.locator('.maths-turn').innerText(),/You play White/);
    await cell(page,4).click();
    assert.match(await cell(page,4).getAttribute('class'),/maths-selected/);
    await cell(page,3).click();
    await page.waitForFunction(()=>document.querySelector('.maths-turn')?.textContent.includes('White to move'),null,{timeout:4000});
    assert.equal(await cell(page,3).locator('.piece-icon').count(),1);
    const after=await geometry(page,width+' played');
    assert.ok(Math.abs(after.w-before.w)<1,'board size stable on move');
    await page.locator('#maths-undo').click();
    assert.equal(await cell(page,4).locator('.piece-icon').count(),1);
    await page.locator('#maths-edit').click();
    assert.equal(await page.locator('#maths-start').isEnabled(),true);
    assert.deepEqual(errors,[],width+' page errors');
    console.log('PASS Maths board and play '+width+'px');
   }finally{await context.close();}
  }
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  try{
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await fresh(page);
   await drag(page,rack(page,'wK'),cell(page,4));
   assert.equal(await cell(page,4).locator('.piece-icon').count(),1,'tray drag placed white king');
   await drag(page,rack(page,'bK'),cell(page,60));
   assert.equal(await page.locator('#maths-start').isEnabled(),true);
   await drag(page,rack(page,'wR'),cell(page,0));
   assert.equal(await page.locator('.maths-outcome').innerText(),'Winning for White');
   assert.equal(await page.locator('#maths-start').isEnabled(),true,'Experimental KRK can start');
   assert.match(await page.locator('.maths-policy').innerText(),/Experimental KRK/);
   const krkPlaced=await page.locator('.maths-board').evaluate(el=>
     [...el.querySelectorAll('.maths-cell')].map(c=>[c.dataset.sq,c.querySelector('.piece-icon')?.getAttribute('class')||null]));
   await page.locator('#maths-start').click();
   const krkStarted=await page.locator('.maths-board').evaluate(el=>
     [...el.querySelectorAll('.maths-cell')].map(c=>[c.dataset.sq,c.querySelector('.piece-icon')?.getAttribute('class')||null]));
   assert.deepEqual(krkStarted,krkPlaced,'Experimental KRK preserves exact user arrangement');
   assert.match(await page.locator('.maths-turn').innerText(),/You play Black/);
   assert.equal(await page.locator('#maths-first').isVisible(),true);
   await page.locator('#maths-first').click();
   await page.waitForFunction(()=>document.querySelector('.maths-turn')?.textContent.includes('Black to move'),
     null,{timeout:5000});
   assert.equal(await page.locator('.maths-notice').innerText(),'');
   await page.locator('#maths-undo').click();
   assert.equal(await page.locator('#maths-first').isVisible(),true,
     'Undo restores initial KRK turn and source token');
   await page.locator('#maths-edit').click();
   for(const p of ['wB','bB','wN','bN','bR'])assert.equal(await rack(page,p).isDisabled(),true,p+' dim once rook is set');
   await drag(page,cell(page,0),rack(page,'wR'));
   assert.equal(await rack(page,'wB').isEnabled(),true,'tray reactivates after removal');
   await add(page,'bB',56);
   assert.equal(await page.locator('.maths-outcome').innerText(),'Guaranteed draw');
   await page.locator('#maths-turn-b').click();
   await page.locator('#maths-start').click();
   assert.match(await page.locator('.maths-turn').innerText(),/You play White/);
   assert.equal(await page.locator('#maths-first').isVisible(),true,'Opponent first move is explicit');
   assert.equal(await cell(page,56).locator('.piece-icon').count(),1,'Bishop unchanged before first move');
   await page.locator('#maths-first').click();
   await page.waitForFunction(()=>document.querySelector('.maths-turn')?.textContent.includes('White to move'),null,{timeout:4000});
   assert.equal(await page.locator('.maths-proof-steps li').count(),5,'working proof visible during game');
   await page.locator('#maths-undo').click();
   assert.equal(await cell(page,56).locator('.piece-icon').count(),1,'Opening undo restores exact placed bishop square');
   assert.equal(await page.locator('#maths-first').isVisible(),true,'Opening move can be replayed');
   await page.locator('#maths-edit').click();
   await page.locator('#maths-clear').click();
   assert.equal(await page.locator('.maths-board .piece-icon').count(),0,'Clear resets the arrangement');
   assert.deepEqual(errors,[],'main browser console');
   console.log('PASS drag trays / KRK classification / weak-side ownership');
  }finally{await context.close();}

  // Reproduce the reported bug: White bishop a6, White king b6, Black king h6,
  // White to move. Previously Start flipped to Black orientation and played instantly.
  const capturedContext=await browser.newContext({viewport:{width:1280,height:960}});
  try{
   const page=await capturedContext.newPage();
   await fresh(page);
   await add(page,'wK',41); // b6
   await add(page,'bK',47); // h6
   await add(page,'wB',40); // a6
   assert.match(await page.locator('.maths-worked').innerText(),/a6/);
   assert.equal(await page.locator('.maths-proof-steps li').count(),5);
   assert.match(await page.locator('.maths-theorem').getAttribute('href'),/EC-T0004\/v1\.md$/);
   const original=await page.locator('.maths-board').evaluate(el=>[...el.querySelectorAll('.maths-cell')].map(x=>[x.dataset.sq,x.querySelector('.piece-icon')?.getAttribute('class')||null]));
   await page.locator('#maths-start').click();
   const after=await page.locator('.maths-board').evaluate(el=>[...el.querySelectorAll('.maths-cell')].map(x=>[x.dataset.sq,x.querySelector('.piece-icon')?.getAttribute('class')||null]));
   assert.deepEqual(after,original,'EXACT screenshot arrangement and orientation must survive launch');
   assert.equal(await cell(page,40).locator('.piece-icon').count(),1,'bishop stays a6');
   assert.equal(await cell(page,41).locator('.piece-icon').count(),1,'white king stays b6');
   assert.equal(await cell(page,47).locator('.piece-icon').count(),1,'black king stays h6');
   await page.waitForTimeout(500);
   assert.deepEqual(await page.locator('.maths-board').evaluate(el=>[...el.querySelectorAll('.maths-cell')].map(x=>[x.dataset.sq,x.querySelector('.piece-icon')?.getAttribute('class')||null])),original,'No hidden automatic opponent move');
   assert.equal(await page.locator('#maths-first').isVisible(),true);
   await page.locator('#maths-first').click();
   await page.waitForFunction(()=>document.querySelector('.maths-turn')?.textContent.includes('Black to move'),null,{timeout:4000});
   assert.equal(await page.locator('#maths-first').count(),0);
   console.log('PASS reported screenshot starting arrangement and explicit first move');
  }finally{await capturedContext.close();}
 }finally{await browser.close();}
}
try{await run();console.log('Maths BROWSER QA PASS');}
catch(e){console.error('Maths BROWSER QA FAILED:',e);process.exitCode=1;}
finally{server.kill();}
