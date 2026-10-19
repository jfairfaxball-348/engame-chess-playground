/**
 * S004 executable, real-browser QA. Run with:
 *   npm install --no-save --no-package-lock playwright
 *   npx playwright install chromium
 *   node scripts/browser-qa.mjs
 * Dependency is intentionally temporary; the deployed app has none.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const port=31047;
const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['scripts/dev-server.js'],{
  env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']
});
let output='';
child.stdout.on('data',b=>output+=b.toString());
child.stderr.on('data',b=>output+=b.toString());
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
  for(let tries=0;tries<80;tries++){
    if(child.exitCode!==null)throw Error('server exited: '+output);
    try{const res=await fetch(origin+'/');if(res.ok)return;}catch{}
    await sleep(100);
  }
  throw Error('server start timed out: '+output);
}
async function geometry(page,label,prior=null){
  const data=await page.locator('.chessboard').evaluate(el=>{
    const b=el.getBoundingClientRect();
    return {board:{x:b.x,y:b.y,width:b.width,height:b.height},
      squares:Array.from(el.querySelectorAll('.sq'),n=>{
        const r=n.getBoundingClientRect();
        return {x:r.x,y:r.y,width:r.width,height:r.height};
      })};
  });
  assert.equal(data.squares.length,64,label+' count');
  const b=data.board,s=data.squares[0];
  assert.ok(b.width>100 && Math.abs(b.width-b.height)<0.8,label+' square board '+JSON.stringify(b));
  for(const [i,r] of data.squares.entries()){
    assert.ok(Math.abs(r.width-s.width)<0.8 && Math.abs(r.height-s.height)<0.8,label+' equal square '+i);
    assert.ok(Math.abs(r.width-r.height)<0.8,label+' square aspect '+i);
    assert.ok(r.x>=b.x-0.8 && r.y>=b.y-0.8 &&
      r.x+r.width<=b.x+b.width+0.8 && r.y+r.height<=b.y+b.height+0.8,label+' contained square '+i);
  }
  if(prior){
    assert.ok(Math.abs(b.width-prior.width)<0.8,label+' board width reflow');
    assert.ok(Math.abs(b.x-prior.x)<0.8,label+' board lateral reflow');
    assert.ok(Math.abs(b.height-prior.height)<0.8,label+' board height reflow');
  }
  return b;
}
const sq=(page,n)=>page.locator('[data-sq="'+n+'"]');
async function drag(page,from,to){
  // page.mouse uses viewport coordinates and does NOT auto-scroll like
  // locator.click(). On tall 786px boards the bottom king may be offscreen.
  // The old QA thus generated zero pointer events and falsely failed drag.
  await sq(page,from).scrollIntoViewIfNeeded();
  const a=await sq(page,from).boundingBox();
  const b=typeof to==='number' ? await sq(page,to).boundingBox() : to;
  assert.ok(a&&b);
  const x=a.x+a.width/2,y=a.y+a.height/2;
  const tx=typeof to==='number'?b.x+b.width/2:b.x,ty=typeof to==='number'?b.y+b.height/2:b.y;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(tx,ty,{steps:8});
  await page.mouse.up();
}
async function ensureMoves(page,count,label){
  await page.waitForFunction(n=>document.querySelectorAll('.move-row').length===n,count,{timeout:4000});
  assert.equal(await page.locator('.move-row').count(),count,label);
}
async function fresh(page){
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.sq').count(),64);
  assert.equal(await page.locator('[data-class="krk"]').isDisabled(),true);
}
async function main(){
  await ready();
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [320,360,390,768,1280]){
      const context=await browser.newContext({viewport:{width,height:950},
        isMobile:width<=390,hasTouch:width<=390});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      try{
        await fresh(page);
        const b=await geometry(page,width+' editor');
        await sq(page,4).click(); // Editor places selected white king on its original square.
        await geometry(page,width+' edit click',b);
        await page.locator('#start').click();
        await geometry(page,width+' start',b);
        await sq(page,4).click();
        assert.match(await sq(page,4).getAttribute('class'),/selected/);
        await geometry(page,width+' selected',b);
        await sq(page,3).click(); // White Ke1-d1.
        await geometry(page,width+' after user move',b);
        await ensureMoves(page,2,width+' opponent response');
        await geometry(page,width+' after opponent',b);
        assert.equal(await page.locator('#undo').isEnabled(),true);
        await page.locator('#undo').click();
        await ensureMoves(page,0,width+' undo restores pre-human game');
        await geometry(page,width+' after undo',b);
        await page.locator('#restart').click();
        await ensureMoves(page,0,width+' restart resets history');
        assert.equal(await page.locator('#undo').isDisabled(),true);
        await geometry(page,width+' after restart',b);
        assert.equal(await page.locator('.drag-ghost').count(),0);
        assert.deepEqual(errors,[],width+' runtime errors');
        console.log('PASS geometry+click+computer @ '+width+'px, board '+b.width.toFixed(2)+'px');
      }finally{await context.close();}
    }
    {
      const context=await browser.newContext({viewport:{width:1280,height:850}});
      const page=await context.newPage();
      try{
        await fresh(page);
        let b=await geometry(page,'keyboard editor');
        await sq(page,4).focus();
        await sq(page,4).press('Enter');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'4','keyboard editor focus retained');
        await page.locator('#start').click();
        await sq(page,4).focus();
        await sq(page,4).press('Space');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'4','keyboard selected focus retained');
        assert.equal(await page.locator('.sq[tabindex="0"]').count(),1,'one board Tab stop');
        await sq(page,4).press('ArrowLeft');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'3','white view left');
        await sq(page,3).press('ArrowRight');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'4','white view right');
        await sq(page,4).press('Escape');
        assert.equal(await page.locator('.sq.selected').count(),0,'Escape deselects');
        await sq(page,4).press('Space');
        const legal=page.locator('.sq:has(.hint)').first();
        const target=await legal.getAttribute('data-sq');
        assert.ok(target);
        await legal.focus();
        await legal.press('Enter');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),target,'keyboard move focus retained');
        await ensureMoves(page,2,'keyboard turn');
        assert.equal(await page.locator('[role="status"][aria-live="polite"]').count(),1);
        await geometry(page,'keyboard after reply',b);
        console.log('PASS keyboard Enter/Space, focus retention and live status');
        await fresh(page);
        await page.locator('#start').click();
        b=await geometry(page,'mouse drag start');
        await page.evaluate(()=>{
          window.__dragTrace=[];
          for(const type of ['pointerdown','pointermove','pointerup','pointercancel','click'])
            document.getElementById('app').addEventListener(type,e=>{
              if(window.__dragTrace.length<80)
                window.__dragTrace.push([type,e.target.closest?.('[data-sq]')?.dataset.sq,e.clientX,e.clientY,e.pointerId]);
            },true);
        });
        await drag(page,4,3);
        if(await page.locator('.move-row').count()!==2){
          console.error('Mouse drag diagnostics',JSON.stringify(await page.evaluate(()=>({
            trace:window.__dragTrace,
            moves:document.querySelector('.moves')?.textContent,
            notice:document.querySelector('.validation')?.textContent,
            selection:document.querySelector('.sq.selected')?.dataset.sq,
            squares:[...document.querySelectorAll('.sq .piece-icon')].length
          }))));
        }
        await ensureMoves(page,2,'mouse drag single move');
        await geometry(page,'mouse drag after turn',b);
        assert.equal(await page.locator('.drag-ghost').count(),0);
        await fresh(page);
        await page.locator('#start').click();
        await sq(page,4).scrollIntoViewIfNeeded();
        const pos=await page.locator('.chessboard').boundingBox();
        await drag(page,4,{x:pos.x-15,y:pos.y-15});
        assert.equal(await page.locator('.move-row').count(),0,'out-of-board drop must not play');
        assert.equal(await sq(page,4).locator('.piece-icon').count(),1,'illegal drop preserves source piece');
        assert.equal(await page.locator('.drag-ghost').count(),0,'out-of-board ghost cleared');
        console.log('PASS mouse drag, single dispatch and outside-board rejection');
        await fresh(page);
        await page.locator('#start').click();
        await sq(page,4).evaluate(node=>{
          const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
          const opts={bubbles:true,isPrimary:true,pointerId:37,pointerType:'touch',button:0};
          node.dispatchEvent(new PointerEvent('pointerdown',{...opts,clientX:x,clientY:y}));
          node.dispatchEvent(new PointerEvent('pointermove',{...opts,clientX:x+20,clientY:y+20}));
          node.dispatchEvent(new PointerEvent('pointercancel',{...opts,clientX:x+20,clientY:y+20}));
        });
        assert.equal(await page.locator('.drag-ghost').count(),0,'pointercancel ghost cleanup');
        await sq(page,4).click(); // Must work immediately, not blocked for 350ms.
        assert.match(await sq(page,4).getAttribute('class'),/selected/);
        console.log('PASS pointercancel followed by immediate normal click');
        await fresh(page);
        await drag(page,4,3); // Editor move, no game dispatch.
        assert.equal(await sq(page,3).locator('.piece-icon').count(),1);
        assert.equal(await sq(page,4).locator('.piece-icon').count(),0);
        assert.equal(await page.locator('#start').count(),1,'editor still active after drag');
        await page.locator('#reset').click();
        await page.locator('[data-piece="wK"]').click();
        await sq(page,52).click(); // Adjacent kings: e7/e8.
        await page.locator('#start').click();
        assert.equal(await page.locator('#start').count(),1,'invalid editor position blocked');
        assert.match(await page.locator('.validation').allTextContents().then(x=>x.join(' ')),/Kings/i);
        await page.locator('#reset').click();
        await page.locator('#player').selectOption('b');
        await page.locator('#turn').selectOption('b');
        await sq(page,60).focus();
        await sq(page,60).press('ArrowLeft');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'61','black-view left');
        await sq(page,61).press('ArrowRight');
        assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sq),'60','black-view right');
        await page.locator('#flip').click();
        assert.equal(await page.locator('.sq').first().getAttribute('data-sq'),'56','flip does not change colour');
        await page.locator('#flip').click();
        b=await geometry(page,'black orientation editor');
        assert.equal(await page.locator('.sq').first().getAttribute('data-sq'),'7');
        await page.locator('#start').click();
        await drag(page,60,59); // Black Ke8-d8, topologically flipped.
        await ensureMoves(page,2,'black mouse drag');
        await geometry(page,'black orientation after turn',b);
        console.log('PASS editor drag/reset/invalid validation and black orientation');
      }finally{await context.close();}
    }
    {
      const context=await browser.newContext({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
      const page=await context.newPage();
      try{
        await fresh(page);
        await page.locator('#start').click();
        const from=await sq(page,4).boundingBox(),to=await sq(page,3).boundingBox();
        const pt=r=>({x:r.x+r.width/2,y:r.y+r.height/2});
        const a=pt(from),z=pt(to);
        const cdp=await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
        for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{
          type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*i/6,y:a.y+(z.y-a.y)*i/6}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await ensureMoves(page,2,'actual CDP touchscreen drag');
        assert.equal(await page.locator('.drag-ghost').count(),0);
        console.log('PASS actual Chrome touchscreen drag at 390px');
      }finally{await context.close();}
    }
  }finally{await browser.close();}
}
try{await main();console.log('S004 BROWSER QA PASS');}
catch(e){console.error('S004 BROWSER QA FAILED:',e);process.exitCode=1;}
finally{child.kill();}
