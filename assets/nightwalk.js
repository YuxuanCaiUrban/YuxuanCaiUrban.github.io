// ── NIGHT WALK — guided camera tour over the hero city (preview build) ──
// Two modes. Free-roam: signs pulse under the pointer and a click on a tour
// sign starts the walk at that stop. Walk: the stage (canvas + vignette) is
// zoomed 2x/3x onto one sign at a time by CSS transform, a caption box types a
// line per stop, and the last stop hands off to the Projects page.
// Nothing here re-bakes the canvas; the renderer keeps animating underneath.
(function(){
  'use strict';
  const REDUCE=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const screen=document.getElementById('city-screen');
  const stage=document.querySelector('.city-stage');
  const heroContent=document.querySelector('.hero-content');
  const cta=document.querySelector('.hero-cta');
  if(!screen||!stage||!window.cityTour)return;
  const api=window.cityTour;
  const topbar=document.querySelector('.topbar');
  const MOBILE_BP=640;                                   // must match nightwalk.css
  // a landscape phone is short, not narrow: either dimension puts us in the phone layout
  const isMobile=()=>window.innerWidth<=MOBILE_BP||window.innerHeight<=MOBILE_BP;

  // ── the route ──────────────────────────────────────────────────────────
  // anchors are resolved at run time against the live sign list: placement
  // varies with viewport and DPR, so nothing here is a coordinate. Each stop
  // tries its anchors in order and is skipped if none is on screen.
  const TOUR=[
    {id:'urban', label:'URBAN AI', anchor:[{txt:'URBAN AI'},{roof:true,kind:undefined}], zoom:2, ay:0.40,
     copy:'This city is a model. Every lit word on it is a research direction; I will point at six.',
     to:{page:'research',name:'Research'}},
    {id:'vision', label:'VISION', anchor:[{txt:'VISION'}], zoom:3, ground:true,
     copy:'VISION. Cameras on every corner, and models that learn to read a street the way people do.',
     cat:'vlm'},
    {id:'sense', label:'SENSE', anchor:[{txt:'SENSE'}], zoom:2, ay:0.44,
     copy:'SENSE. The mast on that roof logs heat, air and noise. Exposure is where policy meets a person.',
     cat:'health'},
    {id:'plan', label:'PLAN', anchor:[{kind:'spire'}], zoom:2, ay:0.46,
     copy:'PLAN. Agents that argue like a planning meeting; we read how they reason, not just what they pick.',
     cat:'llm'},
    {id:'open', label:'OPEN DATA', anchor:[{txt:'OPEN DATA'},{kind:'led'}], zoom:3,
     copy:'OPEN DATA. The ticker never stops: probes, APIs and datasets, all of it built in the open.',
     cat:'platforms'},
    {id:'geo', label:'GEOAI', anchor:[{txt:'GEOAI'}], zoom:2, ay:0.28, ground:true,
     copy:'GEOAI. The bikes under this sign are the data. Where people actually go, block by block.',
     cat:'mobility'},
    {id:'green', label:'GREEN', anchor:[{txt:'GREEN'}], zoom:3, ay:0.38, ground:true,
     copy:'GREEN. The only trees on the street, and who gets to sit under them. Vitality is measurable.',
     cat:'nature'},
    {id:'street', label:'24H', anchor:[{txt:'24H'}], zoom:3, ay:0.36, flip:true, ground:true,
     copy:'24H. The walk home. That is the whole city; the rest of this page is the work.',
     to:{page:'projects',name:'All projects'}, finale:true},
  ];
  // signs that answer a click with a wink rather than a jump: the little icon
  // plates, and any tour-vocabulary sign the current route did not claim
  const FLASH_KIND=new Set(['picto','bare','hex','spire','pattern','round','led','poster','rooftext','box']);

  function matches(s,q){for(const k in q){if(q[k]===undefined){if(s[k]!==undefined)return false;continue;}if(s[k]!==q[k])return false;}return true;}
  function boxOf(s){
    if(s.box)return s.box;
    const h=s.spr&&s.spr.img?s.spr.img.height-2*s.spr.pad:0;
    return {x:s.x,y:s.y,w:s.w,h:h};
  }
  function resolve(stop){
    const signs=api.signs();
    for(const q of stop.anchor){
      const idx=signs.findIndex(s=>matches(s,q));
      if(idx>=0)return Object.assign({},stop,{sign:signs[idx],signIdx:idx});
    }
    return null;
  }
  function buildRoute(){return TOUR.map(resolve).filter(Boolean);}
  // the clickable set is whatever the route actually resolved to — never a
  // vocabulary guess, so a sign that glows is always a sign that does something
  let idleRoute=buildRoute();
  let routeIdx=new Map(idleRoute.map((r,i)=>[r.signIdx,i]));
  function refreshIdleRoute(){idleRoute=buildRoute();routeIdx=new Map(idleRoute.map((r,i)=>[r.signIdx,i]));}

  // ── DOM ────────────────────────────────────────────────────────────────
  const el=(tag,cls)=>{const e=document.createElement(tag);e.className=cls;return e;};
  const bandT=el('div','nw-band top'),bandB=el('div','nw-band bot');
  const cap=el('div','nw-cap');cap.setAttribute('role','dialog');cap.setAttribute('aria-label','Night walk');cap.tabIndex=-1;
  cap.innerHTML=
    '<div class="nw-panel">'+
      '<canvas class="nw-port" width="24" height="32" aria-hidden="true"></canvas>'+
      '<div class="nw-body">'+
        '<div class="nw-eyebrow"><span class="nw-stopno"></span><b class="nw-label"></b>'+
          '<button class="nw-close" type="button" aria-label="Leave the walk" title="Leave (Esc)">×</button></div>'+
        '<div class="nw-text" aria-hidden="true"></div>'+
        '<div class="nw-live" aria-live="polite"></div>'+
        '<div class="nw-card" id="nw-card" hidden></div>'+
        '<div class="nw-foot"><div class="nw-dots" role="group" aria-label="Stops"></div>'+
          '<button class="nw-more" type="button" hidden aria-expanded="false" aria-controls="nw-card">Details ▾</button>'+
          '<button class="nw-go" type="button" hidden></button>'+
          '<div class="nw-hint"><kbd>space</kbd> next · <kbd>esc</kbd> leave</div></div>'+
      '</div>'+
    '</div>';
  screen.appendChild(bandT);screen.appendChild(bandB);screen.appendChild(cap);
  const port=cap.querySelector('.nw-port'),textEl=cap.querySelector('.nw-text'),liveEl=cap.querySelector('.nw-live'),
        dotsEl=cap.querySelector('.nw-dots'),goBtn=cap.querySelector('.nw-go'),closeBtn=cap.querySelector('.nw-close'),
        cardEl=cap.querySelector('.nw-card'),moreBtn=cap.querySelector('.nw-more'),hintEl=cap.querySelector('.nw-hint'),
        labelEl=cap.querySelector('.nw-label'),stopnoEl=cap.querySelector('.nw-stopno');

  let enterBtn=null;
  if(cta){
    enterBtn=document.createElement('button');
    enterBtn.type='button';enterBtn.className='btn nw-enter';
    enterBtn.innerHTML='<span class="nw-long">Take a </span>night walk →';
    enterBtn.addEventListener('click',()=>{if(!on)start(0);});
    const first=cta.querySelector('.btn-primary');
    if(first&&first.nextSibling)cta.insertBefore(enterBtn,first.nextSibling);else cta.appendChild(enterBtn);
  }

  // ── the guide: the smoker from the konbini door, 24x32, two idle frames ──
  // legend: H hat  h hat sheen  F face  f face shadow  E eye  C coat  c coat
  // sheen  S collar  W shirt  G cigarette  O ember  s smoke  . clear
  const PORTRAIT=[
    '........................',
    '........................',
    '.....................s..',
    '....................s...',
    '......HHHHHHHHHH........',
    '.....HHHHHHHHHHHH.......',
    '.....HhhHHHHHHHHH...s...',
    '.....HHHHHHHHHHHH.......',
    '...HHHHHHHHHHHHHHHHH....',
    '...HHHHHHHHHHHHHHHHH.s..',
    '......ffffffffff........',
    '......FFFFFFFFFF....s...',
    '......FFEEFFFEEF........',
    '......FFFFFFFFFF...s....',
    '......FFFFfFFFFF........',
    '......FFFFFFffGGGGO.....',
    '.......FFFFFFFF.........',
    '........FFFFFF..........',
    '.....SSSFFFFFFSSS.......',
    '....SSSSSFFFFSSSSS......',
    '...CCSSSSSWWSSSSSCC.....',
    '..CCCCSSSSWWSSSSCCCC....',
    '.CCCCCCSSSWWSSSCCCCCC...',
    '.CCCCCCCSSWWSSCCCCCCC...',
    '.CCCCCCCCSWWSCCCCCCCC...',
    'CCCCCCCCCCWWCCCCCCCCCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
    'CCCcCCCCCCWWCCCCCCCcCC..',
  ];
  const INK={H:'#1a1028',h:'#3a2e5c',F:'#d9a889',f:'#b07f66',E:'#1a1028',C:'#2a2236',c:'#3f3560',
             S:'#6a2c4a',W:'#e8e0f0',G:'#e8e0f0',O:'#ff8c3c',s:'rgba(170,158,200,0.55)'};
  const pctx=port.getContext('2d');
  function drawPortrait(frame){
    if(!pctx)return;
    pctx.clearRect(0,0,24,32);
    for(let y=0;y<32;y++){const row=PORTRAIT[y];
      for(let x=0;x<24;x++){const ch=row[x];if(ch==='.')continue;
        let px=x;
        if(ch==='s'){if(frame)px=x+((y%2)?1:-1);pctx.fillStyle=frame&&y<6?'rgba(170,158,200,0.3)':INK.s;}
        else if(ch==='O'){pctx.fillStyle=frame?'#c85a20':INK.O;}
        else pctx.fillStyle=INK[ch]||'#ff00ff';
        pctx.fillRect(px,y,1,1);
      }
    }
  }
  drawPortrait(0);
  let portTimer=null,portFrame=0;
  function startPortrait(){stopPortrait();if(REDUCE)return;portTimer=setInterval(()=>{portFrame^=1;drawPortrait(portFrame);},700);}
  function stopPortrait(){if(portTimer)clearInterval(portTimer);portTimer=null;}

  // ── camera ─────────────────────────────────────────────────────────────
  let cam={z:1,tx:0,ty:0};
  function camTo(stop){
    const g=api.geom();const vw=window.innerWidth,vh=window.innerHeight;
    const mobile=isMobile();
    const z=mobile?Math.min(stop.zoom,2):stop.zoom;
    const b=boxOf(stop.sign);
    const cx=(b.x+b.w/2)*vw/g.W, cy=(b.y+b.h/2)*vh/g.H, hh=(b.h/2)*vh/g.H*z;
    // desktop: the sign sits above the bottom-docked caption. phones: below the
    // top-docked one, however tall it is right now (the Details card grows it)
    let ay=stop.ay||0.42;
    if(mobile){const cb=cap.getBoundingClientRect().bottom;ay=Math.min(0.84,Math.max(0.5,(cb+20+hh)/vh));}
    let tx=vw*0.5-z*cx, ty=vh*ay-z*cy;
    // stops whose detail sits on the pavement keep the ground line in frame,
    // whatever the window's aspect ratio
    if(stop.ground&&!mobile){const gcss=g.gY*vh/g.H;ty=Math.min(ty,vh-16-z*gcss);}
    tx=Math.min(0,Math.max(vw-z*vw,tx));
    ty=Math.min(0,Math.max(vh-z*vh,ty));
    cam={z,tx,ty};
    stage.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+z+')';
  }
  function camReset(){cam={z:1,tx:0,ty:0};stage.style.transform='';}
  // the transform actually painted right now (mid-transition it lags `cam`)
  function liveCam(){
    try{
      const t=getComputedStyle(stage).transform;
      if(!t||t==='none')return {z:1,tx:0,ty:0};
      const m=new DOMMatrix(t);return {z:m.a||1,tx:m.e||0,ty:m.f||0};
    }catch(_){return cam;}
  }
  // pointer (CSS px, viewport) → canvas device px, through the live transform
  function toCanvas(clientX,clientY){
    const g=api.geom();const vw=window.innerWidth,vh=window.innerHeight;const c=liveCam();
    const sx=(clientX-c.tx)/c.z, sy=(clientY-c.ty)/c.z;
    return {x:sx*g.W/vw,y:sy*g.H/vh};
  }
  function hitSign(clientX,clientY){
    const p=toCanvas(clientX,clientY);const g=api.geom();const pad=g.PX*3;
    const signs=api.signs();let hit=-1;
    for(let i=0;i<signs.length;i++){const b=boxOf(signs[i]);
      if(p.x>=b.x-pad&&p.x<=b.x+b.w+pad&&p.y>=b.y-pad&&p.y<=b.y+b.h+pad)hit=i;}
    return hit;
  }

  // ── caption typewriter ─────────────────────────────────────────────────
  // the visible text types; the screen-reader copy lands once, whole
  let typeTimer=null,typing=false,fullText='',typeDone=null;
  const setHint=()=>{if(hintEl)hintEl.innerHTML='<kbd>space</kbd> '+(typing?'skip':'next')+' · <kbd>esc</kbd> leave';};
  const fireDone=()=>{const cb=typeDone;typeDone=null;if(cb)cb();};
  function typeText(text,onDone){
    clearTimeout(typeTimer);fullText=text;liveEl.textContent=text;typeDone=onDone||null;
    if(REDUCE){textEl.textContent=text;typing=false;setHint();fireDone();return;}
    typing=true;setHint();let i=0;textEl.innerHTML='<span class="caret"></span>';
    const step=()=>{i++;textEl.textContent=text.slice(0,i);
      if(i<text.length){const c=text[i-1];const caret=document.createElement('span');caret.className='caret';textEl.appendChild(caret);
        typeTimer=setTimeout(step,33+(/[,.:;]/.test(c)?140:0));}
      else{typing=false;setHint();fireDone();}};
    typeTimer=setTimeout(step,420);
  }
  function finishTyping(){clearTimeout(typeTimer);textEl.textContent=fullText;typing=false;setHint();fireDone();}

  // ── category detail, read from the Projects grid the page already has ──
  function catInfo(cat){
    const card=document.querySelector('.proj-cat-card[data-cat="'+cat+'"]');
    const info={cat,title:'',desc:'',icon:'',projects:[]};
    if(card){
      const t=card.querySelector('.proj-cat-title'), d=card.querySelector('.proj-cat-desc'), ic=card.querySelector('.cat-ico');
      info.title=t?t.textContent.trim():'';info.desc=d?d.textContent.trim():'';info.icon=ic?ic.innerHTML:'';
    }
    try{if(typeof PROJECTS_DATA!=='undefined')info.projects=PROJECTS_DATA.filter(p=>p.category===cat);}catch(_){}
    return info;
  }
  const esc=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  function renderCard(info){
    const list=info.projects.slice(0,3).map(p=>'<li>'+esc(p.title)+'<span>'+esc(p.venue||'')+'</span></li>').join('');
    const more=info.projects.length>3?'<li class="nw-card-more">+'+(info.projects.length-3)+' more</li>':'';
    cardEl.innerHTML='<div class="nw-card-head"><span class="nw-card-ico">'+info.icon+'</span>'+
      '<div><b>'+esc(info.title)+'</b><p>'+esc(info.desc)+'</p></div></div>'+
      (list?'<ul>'+list+more+'</ul>':'');
  }
  let cardOpen=false;
  function setCard(open){
    cardOpen=!!open;cardEl.hidden=!cardOpen;
    moreBtn.setAttribute('aria-expanded',cardOpen?'true':'false');
    moreBtn.textContent=cardOpen?'Less ▴':'Details ▾';
    if(on&&isMobile()&&route[idx]&&!atEnd)camTo(route[idx]);   // the taller panel must not cover the sign
  }
  // a stop's destination comes from its category; derive it wherever a stop
  // object is fresh (buildRoute() runs on start and on every city:rebuilt)
  function ensureTo(st){if(st&&!st.to&&st.cat){const info=catInfo(st.cat);st.to={page:'projects',cat:st.cat,name:info.title||st.label};}return st?st.to:null;}
  // never hide the control that holds focus: focus would drop to <body>
  function guardFocus(btn){if(document.activeElement===btn){try{cap.focus({preventScroll:true});}catch(_){}}}

  // ── state ──────────────────────────────────────────────────────────────
  let on=false,idx=-1,route=[],hot=-1,flashTimer=null,leaveTimer=null,atEnd=false,resizing=false;
  function glowOf(hex){
    const m=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');
    return m?'rgba('+parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16)+',.55)':'rgba(255,77,157,.55)';
  }
  // the dots are a map you can tap: any stop, back or forward (arrows stay for keyboards)
  function renderDots(){
    dotsEl.innerHTML='';
    route.forEach((r,i)=>{const d=document.createElement('button');d.type='button';d.tabIndex=-1;
      d.className='nw-dot'+(i<idx?' done':i===idx?' on':'');
      d.setAttribute('aria-label','Stop '+(i+1)+' of '+route.length+': '+r.label);
      d.addEventListener('click',e=>{e.stopPropagation();if(!on)return;if(typing)finishTyping();if(i!==idx||atEnd)show(i);});
      dotsEl.appendChild(d);});
  }
  function show(i){
    idx=i;atEnd=false;const st=route[i];
    camTo(st);
    const col=st.sign.col||'#ff4d9d';
    cap.style.setProperty('--nw',col);cap.style.setProperty('--nw-glow',glowOf(col));
    stopnoEl.textContent=String(i+1).padStart(2,'0')+' / '+String(route.length).padStart(2,'0');
    labelEl.textContent=st.label;
    port.style.transform=st.flip?'scaleX(-1)':'';
    setCard(false);
    ensureTo(st);
    if(st.cat){renderCard(catInfo(st.cat));moreBtn.hidden=false;}
    else{guardFocus(moreBtn);moreBtn.hidden=true;}
    if(st.to){goBtn.hidden=false;goBtn.textContent=st.to.name+' →';}else{guardFocus(goBtn);goBtn.hidden=true;}
    renderDots();
    typeText(st.copy);
    api.setHot(st.signIdx);
  }
  function start(at){
    route=buildRoute();if(!route.length)return;
    clearTimeout(leaveTimer);
    on=true;document.body.classList.add('nw-on');document.body.classList.remove('nw-hover');hot=-1;
    if(heroContent)heroContent.inert=true;
    if(topbar)topbar.inert=true;                          // the dialog owns focus while the walk is on
    api.mute(true);
    startPortrait();
    show(Math.max(0,Math.min(at,route.length-1)));
    try{cap.focus({preventScroll:true});}catch(_){}
  }
  function exit(){
    if(!on)return;
    on=false;atEnd=false;clearTimeout(typeTimer);clearTimeout(leaveTimer);typing=false;typeDone=null;setHint();
    document.body.classList.remove('nw-on');document.body.classList.remove('nw-hover');
    if(heroContent)heroContent.inert=false;
    if(topbar)topbar.inert=false;
    goBtn.hidden=true;moreBtn.hidden=true;setCard(false);hot=-1;
    camReset();api.setHot(-1);api.mute(false);stopPortrait();
    if(enterBtn){try{enterBtn.focus({preventScroll:true});}catch(_){}}
  }
  function next(){
    if(!on)return;
    if(typing){finishTyping();return;}
    if(atEnd){clearTimeout(leaveTimer);leaveTo(route[idx]&&route[idx].to);return;}
    if(idx>=route.length-1){finale();return;}
    show(idx+1);
  }
  function prev(){if(!on)return;if(typing){finishTyping();return;}if(atEnd){show(idx);return;}if(idx>0)show(idx-1);}
  function finale(){
    // pull back to the whole skyline for the hand-off, then leave for Projects
    if(atEnd)return;
    atEnd=true;clearTimeout(leaveTimer);
    const st=route[idx];
    camReset();api.setHot(-1);
    stopnoEl.textContent='END';labelEl.textContent='→ PROJECTS';
    setCard(false);guardFocus(moreBtn);moreBtn.hidden=true;
    goBtn.hidden=false;goBtn.textContent='Open '+(st.to?st.to.name:'Projects')+' →';
    // the leave countdown starts once the line has been read, not once it starts typing
    typeText('That is the walk. The work is one click away.',()=>{clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(on&&atEnd)leaveTo(st.to);},2400);});
    try{goBtn.focus({preventScroll:true});}catch(_){}
  }
  function leaveTo(to){
    const target=to||{page:'projects'};
    exit();
    // hashchange is delivered asynchronously and showPage('projects') resets
    // the category grid, so the category opens only after that has run
    const openCat=()=>{if(target.cat&&typeof window.openProjectCategory==='function'){try{window.openProjectCategory(target.cat);}catch(_){}}};
    if(location.hash==='#'+target.page){openCat();return;}
    const once=()=>{window.removeEventListener('hashchange',once);setTimeout(openCat,0);};
    window.addEventListener('hashchange',once);
    location.hash=target.page;
  }
  goBtn.addEventListener('click',e=>{e.stopPropagation();if(!on)return;clearTimeout(leaveTimer);const st=route[idx];leaveTo(st&&st.to);});
  moreBtn.addEventListener('click',e=>{e.stopPropagation();if(!on)return;if(typing)finishTyping();setCard(!cardOpen);});
  closeBtn.addEventListener('click',e=>{e.stopPropagation();exit();});

  // ── input ──────────────────────────────────────────────────────────────
  function ignoreTarget(t){return !!(t&&t.closest&&t.closest('.nw-cap,.topbar,.hero-content,.scroll-hint,#boot-overlay'));}
  function classify(h){                                  // 'route' | 'flash' | null
    if(h<0)return null;
    if(routeIdx.has(h))return 'route';
    const s=api.signs()[h];
    return s&&FLASH_KIND.has(s.kind)?'flash':null;
  }
  function setHover(h){
    if(resizing)h=-1;
    const kind=classify(h);
    if(on){ // in the walk the current stop stays lit; hover only marks other route stops
      const ok=kind==='route'&&h!==(route[idx]&&route[idx].signIdx);
      document.body.classList.toggle('nw-hover',!!ok);hot=ok?h:-1;return;
    }
    if(h===hot)return;hot=h;
    api.setHot(kind?h:-1);
    document.body.classList.toggle('nw-hover',!!kind);
  }
  screen.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    if(ignoreTarget(e.target)){setHover(-1);return;}
    setHover(hitSign(e.clientX,e.clientY));
  });
  screen.addEventListener('pointerleave',()=>setHover(-1));
  screen.addEventListener('click',e=>{
    if(ignoreTarget(e.target)||resizing)return;
    const h=hitSign(e.clientX,e.clientY);
    const kind=classify(h);
    if(on){
      if(kind==='route'){const j=route.findIndex(r=>r.signIdx===h);if(j>=0&&j!==idx){show(j);return;}}
      next();return;
    }
    if(kind==='route'){start(routeIdx.get(h));return;}
    if(kind==='flash'){ // a wink: hold the hot state a beat, then let go
      clearTimeout(flashTimer);api.setHot(h);
      flashTimer=setTimeout(()=>{if(!on&&hot!==h)api.setHot(-1);},650);
    }
  });
  document.addEventListener('keydown',e=>{
    if(!on)return;
    if(e.key==='Escape'){e.preventDefault();exit();return;}
    // a focused button keeps its native Enter/Space; only the arrow is ours there
    if((e.target===goBtn||e.target===closeBtn||e.target===moreBtn)&&e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    if(e.key===' '||e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();next();}
    else if(e.key==='ArrowLeft'){e.preventDefault();prev();}
  });
  window.addEventListener('hashchange',()=>{if(on)exit();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&on)clearTimeout(leaveTimer);});
  // the renderer re-places every sign 150ms after a resize; pointer work waits
  // for the new geometry, then the camera returns to the same stop
  window.addEventListener('resize',()=>{resizing=true;hot=-1;});
  window.addEventListener('city:rebuilt',()=>{
    resizing=false;hot=-1;refreshIdleRoute();
    if(!on)return;
    const id=route[idx]&&route[idx].id;
    route=buildRoute();if(!route.length){exit();return;}
    let j=route.findIndex(r=>r.id===id);
    if(j<0){show(Math.min(idx,route.length-1));return;}   // the stop is gone: land properly on another
    idx=j;const st=route[j];
    ensureTo(st);if(!atEnd&&st.to)goBtn.textContent=st.to.name+' →';   // the fresh stop object needs its destination back
    if(atEnd){camReset();renderDots();return;}
    camTo(st);api.setHot(st.signIdx);renderDots();
  });

  window.nightWalk={start,exit,next,prev,
    route:()=>buildRoute().map(r=>({id:r.id,label:r.label,sign:r.signIdx,kind:r.sign.kind||'tube',txt:r.sign.txt||null,box:boxOf(r.sign)})),
    cam:()=>cam,liveCam,card:()=>setCard(!cardOpen),state:()=>({on,idx,atEnd,typing,cardOpen})};
})();
