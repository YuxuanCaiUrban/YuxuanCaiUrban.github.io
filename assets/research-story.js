/* Visual research novel: dialogue, choices, scene reveals, and source notebook. */
(function(){
  'use strict';
  const data=window.RESEARCH_STORY, root=document.getElementById('research-story'), brief=document.getElementById('research-brief');
  if(!data||!root||!brief||!data.scenes?.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let index=0, cursor=0, route=[], timer=null, typing=false, fullText='', chartMode='quartile', returnFocus=null, artToken=0, portraitTimer=null, frame=0;
  const decisions=new Map(), earned=new Set(), readBeats=new Set();
  root.innerHTML=`
  <a class="rs-skip" href="#rs-dialogue">Skip to dialogue</a>
  <main class="rs-shell" aria-label="The air we share: a visual research novel">
    <header class="rs-topbar"><a class="rs-brand" href="../index.html#projects"><b>Y</b><span>Yuxuan Cai <small>AFTER HOURS / RESEARCH STORIES</small></span></a><div class="rs-top-actions"><button type="button" id="rs-casebook">Casebook <span id="rs-clue-count">0/9</span></button><button type="button" id="rs-scenes-button">Scenes</button><button type="button" id="rs-brief-button">Research brief ↗</button><a href="${esc(data.paper)}" target="_blank" rel="noopener noreferrer">Paper ↗</a></div></header>
    <section class="rs-stage" aria-label="Illustrated investigation scene">
      <img class="rs-backdrop" id="rs-backdrop" alt="" decoding="async"><div class="rs-shade" aria-hidden="true"></div>
      <div class="rs-scene-heading"><p id="rs-chapter-label"></p><h1 id="rs-title" tabindex="-1"></h1><p class="rs-location" id="rs-location"></p></div>
      <div class="rs-question"><span>THE QUESTION WE ARE FOLLOWING</span><p id="rs-question"></p></div>
      <div class="rs-guide" id="rs-guide" aria-label="The pixel guide from the homepage"><canvas id="rs-guide-stage" width="24" height="32" aria-hidden="true"></canvas><span>NIGHT GUIDE</span></div>
      <aside class="rs-exhibit" id="rs-exhibit" hidden aria-label="Evidence revealed in the scene"><div class="rs-exhibit-top"><span>ON THE DESK / EVIDENCE</span><button type="button" id="rs-hide-exhibit" aria-label="Put the evidence away">×</button></div><div class="rs-artifact" id="rs-artifact"></div><button class="rs-inspect-source" id="rs-exhibit-source" type="button">Read the source note ↗</button></aside>
      <div class="rs-stage-foot"><span>ILLUSTRATED SETTING · PUBLISHED RESEARCH</span><button type="button" id="rs-show-exhibit" hidden>Inspect the evidence +</button></div>
      <div class="rs-clue-toast" id="rs-clue-toast" hidden><span>TAKE THIS WITH YOU</span><p id="rs-clue-text"></p></div>
    </section>
    <section class="rs-dialogue" id="rs-dialogue" tabindex="-1" aria-label="Dialogue and investigation choices">
      <div class="rs-portrait"><canvas id="rs-guide-portrait" width="24" height="32" aria-hidden="true"></canvas><span id="rs-visitor-mark" hidden>YOU</span></div>
      <div class="rs-dialogue-body"><div class="rs-speaker-row"><span id="rs-speaker"></span><span id="rs-line-label"></span></div><p id="rs-narration" aria-hidden="true"></p><p class="rs-sr-only" id="rs-accessible-narration" aria-live="polite" aria-atomic="true"></p><div class="rs-decisions" id="rs-decisions" aria-label="Choose which evidence to follow"></div><div class="rs-dialogue-links"><button id="rs-source" type="button">Source note ↗</button><span id="rs-branch-status"></span></div></div>
      <div class="rs-controls"><button id="rs-prev" type="button" aria-label="Previous dialogue line">←</button><button id="rs-next" type="button">Continue →</button><span id="rs-keyhint">SPACE TO REVEAL · ← → TO MOVE</span></div>
    </section>
    <footer class="rs-footer"><span id="rs-progress-label"></span><nav id="rs-chapters" aria-label="Investigation scenes"></nav><span class="rs-foot-title">THE AIR WE SHARE</span></footer>
  </main>
  <dialog class="rs-notebook" id="rs-notebook" aria-labelledby="rs-note-title"><div class="rs-note-top"><span>THE CASEBOOK</span><button id="rs-close-note" type="button">Close ×</button></div><h2 id="rs-note-title"></h2><div id="rs-note-content"></div><p class="rs-note-source" id="rs-note-source"></p><a href="${esc(data.paper)}" target="_blank" rel="noopener noreferrer">Published article & supplementary materials ↗</a></dialog>`;
  const byId=id=>document.getElementById(id), next=byId('rs-next'), prev=byId('rs-prev'), notebook=byId('rs-notebook'), narration=byId('rs-narration');
  const back=document.createElement('button');back.type='button';back.className='rs-return';back.textContent='← Return to the investigation';brief.prepend(back);
  function scene(){return data.scenes[index];}
  function beat(){return route[cursor];}
  function makeRoute(){
    route=[];
    const beats=scene().beats||[{id:scene().id+'-1',speaker:'GUIDE',text:scene().text,exhibit:true}];
    beats.forEach(b=>{
      route.push(b);
      const chosen=b.choices?.find(c=>c.id===decisions.get(b.id));
      if(chosen)route.push({id:b.id+'--'+chosen.id,speaker:'GUIDE',text:chosen.response,exhibit:chosen.exhibit,branchLabel:chosen.label,decisionId:b.id,artifact:chosen.artifact});
    });
  }
  function drawGuide(){
    const draw=window.NightGuide?.draw;if(!draw)return;
    const options={frame:typing?frame%2:0,blink:frame%19===18};
    draw(byId('rs-guide-stage'),options);draw(byId('rs-guide-portrait'),options);
  }
  function animateGuide(){
    clearInterval(portraitTimer);drawGuide();
    if(!reduce.matches&&!document.hidden&&!root.hidden)portraitTimer=setInterval(()=>{frame++;drawGuide();},240);
  }
  function stopTyping(){clearTimeout(timer);typing=false;timer=null;}
  function updateControls(){
    const b=beat(), needsChoice=!!b.choices&&!decisions.has(b.id);
    prev.disabled=index===0&&cursor===0;
    next.disabled=!typing&&needsChoice;
    next.textContent=typing?'Reveal line ▸':needsChoice?'Choose a lead':cursor<route.length-1?'Continue →':(scene().exitLabel||'Next scene →');
    byId('rs-keyhint').textContent=needsChoice?'CHOOSE WHAT TO INVESTIGATE':'SPACE TO REVEAL · ← → TO MOVE';
  }
  function earnClue(){
    if(cursor!==route.length-1||beat().choices&&!decisions.has(beat().id))return;
    const base=scene().beats||[];
    if(!base.every(b=>readBeats.has(b.id)&&(!b.choices||decisions.has(b.id))))return;
    if(!route.every(b=>readBeats.has(b.id)))return;
    earned.add(scene().id);byId('rs-clue-count').textContent=`${earned.size}/${data.scenes.length}`;
    byId('rs-clue-text').textContent=scene().conclusion||scene().subtitle;
    byId('rs-clue-toast').hidden=false;
    byId('rs-chapters').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('is-earned',earned.has(data.scenes[i].id)));
  }
  function finishTyping(){stopTyping();narration.textContent=fullText;readBeats.add(beat().id);updateControls();earnClue();drawGuide();}
  function type(text,instant){
    stopTyping();fullText=text;byId('rs-accessible-narration').textContent=text;
    if(instant||reduce.matches||document.hidden){narration.textContent=text;readBeats.add(beat().id);updateControls();earnClue();return;}
    const chars=Array.from(text);let at=0;typing=true;narration.textContent='';updateControls();
    function tick(){at=Math.min(chars.length,at+3);narration.textContent=chars.slice(0,at).join('');if(at<chars.length)timer=setTimeout(tick,24);else finishTyping();}tick();
  }
  function forest(rows, label) {
    const compact = rows.every(r => r.high < 1.8);
    const min = compact ? 0.8 : 0, max = compact ? 1.8 : Math.max(3.5, ...rows.map(r => r.high + 0.2));
    const ticks = compact ? [0.8, 1, 1.2, 1.4, 1.6, 1.8] : [0, 1, 2, 3];
    const x = n => 6 + ((n - min) / (max - min)) * 288;
    const desc = rows.map(r => `${r.label}: hazard ratio ${r.hr}, 95 percent confidence interval ${r.low} to ${r.high}`).join('; ');
    return `<div class="rs-chart-unit">${esc(label)}</div><div class="rs-forest" role="img" aria-label="${esc(desc)}">${rows.map((r,i) => `<div class="rs-forest-row"><div class="rs-forest-label"><span>${esc(r.label)}</span><strong>${r.hr.toFixed(2)} <small>(${r.low.toFixed(2)}–${r.high.toFixed(2)})</small></strong></div><svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><line x1="6" x2="294" y1="12" y2="12" class="rs-plot-track"/><line x1="${x(1)}" x2="${x(1)}" y1="0" y2="24" class="rs-reference"/><line x1="${x(r.low)}" x2="${x(r.high)}" y1="12" y2="12" class="rs-ci rs-ci-${i}"/><line x1="${x(r.low)}" x2="${x(r.low)}" y1="6" y2="18" class="rs-ci rs-ci-${i}"/><line x1="${x(r.high)}" x2="${x(r.high)}" y1="6" y2="18" class="rs-ci rs-ci-${i}"/><rect x="${x(r.hr)-4}" y="8" width="8" height="8" class="rs-point-${i}"/></svg></div>`).join('')}<div class="rs-forest-axis">${ticks.map(n => `<span style="left:${x(n)/3}%">${n}</span>`).join('')}</div><p class="rs-forest-caption">Hazard ratio · line = 95% CI</p></div>`;
  }
  function artifactHTML(a) {
    let body = '';
    if (a.type === 'cohorts' || a.type === 'metrics') {
      body = `<div class="rs-metrics">${a.rows.map(row => `<div><span>${esc(row.label)}</span><strong>${esc(row.value)}</strong><small>${esc(row.detail)}</small></div>`).join('')}</div>`;
    } else if (a.type === 'forest') {
      const group = a.modes[chartMode];
      body = `<div class="rs-chart-switch" role="group" aria-label="Exposure comparison"><button type="button" data-chart="continuous" aria-pressed="${chartMode === 'continuous'}">Per 10 µg/m³</button><button type="button" data-chart="quartile" aria-pressed="${chartMode === 'quartile'}">Highest vs lowest quarter</button></div>${forest(group.rows, group.label)}<p class="rs-chart-caution">${esc(group.note)}</p>`;
    } else if (a.type === 'steps') {
      body = `<ol class="rs-evidence-steps">${a.steps.map(step => `<li><span>${esc(step.title)}</span><p>${esc(step.text)}</p></li>`).join('')}</ol>`;
    } else if (a.type === 'findings') {
      body = `<div class="rs-findings">${a.rows.map(row => `<div><span>${esc(row.label)}</span><p>${esc(row.text)}</p></div>`).join('')}</div>`;
    } else {
      body = `<p class="rs-artifact-copy">${esc(a.body || '')}</p>`;
    }
    return `<span class="rs-artifact-eyebrow">${esc(a.eyebrow)}</span><h2>${esc(a.heading)}</h2>${body}<p class="rs-artifact-foot">${esc(a.foot || '')}</p>`;
  }


  function setExhibit(open){byId('rs-exhibit').hidden=!open;byId('rs-show-exhibit').hidden=open;root.classList.toggle('has-exhibit',open);}
  function setArt(){
    const img=byId('rs-backdrop'), url=scene().background, token=++artToken;
    img.style.objectPosition=scene().position||'center';
    if(img.getAttribute('src')===url)return;
    const preload=new Image();
    preload.onload=()=>{if(token!==artToken)return;img.src=url;if(!reduce.matches&&img.animate)img.animate([{opacity:.25},{opacity:1}],{duration:650});};
    preload.onerror=()=>{if(token===artToken)img.src='../assets/images/research/proj_health_pm25.jpg';};
    preload.src=url;
    const upcoming=data.scenes[index+1];if(upcoming){const warm=new Image();warm.src=upcoming.background;}
  }
  function renderBeat(instant=false){
    const b=beat(), s=scene();root.dataset.speaker=b.speaker;byId('rs-guide').classList.toggle('is-listening',b.speaker==='YOU');
    byId('rs-guide-portrait').hidden=b.speaker==='YOU';byId('rs-visitor-mark').hidden=b.speaker!=='YOU';
    byId('rs-speaker').textContent=b.speaker==='YOU'?'YOU / THE VISITOR':'THE NIGHT GUIDE';
    byId('rs-line-label').textContent=`${String(cursor+1).padStart(2,'0')} / ${String(route.length).padStart(2,'0')}`;
    byId('rs-branch-status').textContent=b.branchLabel?'Following your lead: '+b.branchLabel:'';
    byId('rs-clue-toast').hidden=true;
    const options=byId('rs-decisions');options.replaceChildren();
    (b.choices||[]).forEach((choice,i)=>{
      const button=document.createElement('button');button.type='button';button.className='rs-decision';
      button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${esc(choice.label)}<b>↗</b>`;
      button.setAttribute('aria-pressed',String(decisions.get(b.id)===choice.id));
      button.addEventListener('click',()=>{
        finishTyping();decisions.set(b.id,choice.id);makeRoute();cursor=route.findIndex(r=>r.id===b.id)+1;renderBeat();focusDialogue();
      });options.appendChild(button);
    });
    chartMode='quartile';byId('rs-artifact').innerHTML=artifactHTML(b.artifact||s.artifact);byId('rs-exhibit').scrollTop=0;
    setExhibit(!!b.exhibit);type(b.text,instant);drawGuide();
  }
  function focusDialogue(){byId('rs-dialogue').focus({preventScroll:true});}
  function show(i,at=0,instant=false){
    stopTyping();index=Math.max(0,Math.min(i,data.scenes.length-1));makeRoute();cursor=at==='last'?route.length-1:Math.min(at,route.length-1);
    const s=scene();chartMode='quartile';root.dataset.scene=s.id;
    const act=data.acts?.find(a=>a.id===s.act);
    byId('rs-chapter-label').textContent=`ACT ${String(s.act||index+1).padStart(2,'0')} / ${act?.title||s.chapter}`;
    byId('rs-title').textContent=index===0?'The air we share.':s.chapter;
    byId('rs-location').textContent=s.location;
    byId('rs-question').textContent=s.question||s.subtitle;
    byId('rs-progress-label').textContent=`${String(index+1).padStart(2,'0')} / ${String(data.scenes.length).padStart(2,'0')}`;
    byId('rs-artifact').innerHTML=artifactHTML(s.artifact);
    byId('rs-chapters').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('is-current',i===index);if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    setArt();renderBeat(instant);if(!instant)focusDialogue();
  }
  function advance(){
    if(typing){finishTyping();return;}
    if(beat().choices&&!decisions.has(beat().id)){byId('rs-decisions').querySelector('button')?.focus();return;}
    if(cursor<route.length-1){cursor++;renderBeat();focusDialogue();}
    else if(index<data.scenes.length-1)show(index+1);else openBrief();
  }
  function previous(){if(cursor>0){cursor--;renderBeat(true);focusDialogue();}else if(index>0)show(index-1,'last',true);}
  function openBrief(){stopTyping();root.hidden=true;brief.hidden=false;document.body.classList.remove('story-active');clearInterval(portraitTimer);window.scrollTo(0,0);back.focus();}
  function openStory(){brief.hidden=true;root.hidden=false;document.body.classList.add('story-active');window.scrollTo(0,0);finishTyping();animateGuide();focusDialogue();}
  function beginNotebook(title){
    finishTyping();if(!notebook.open)returnFocus=document.activeElement;
    byId('rs-note-title').textContent=title;byId('rs-note-content').replaceChildren();byId('rs-note-source').textContent='';
    if(!notebook.open)notebook.showModal();byId('rs-close-note').focus();return byId('rs-note-content');
  }
  function fillNote(note,content){
    (Array.isArray(note.text)?note.text:[note.text]).forEach(text=>{const p=document.createElement('p');p.textContent=text;content.appendChild(p);});
    if(note.image){const figure=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=note.image;img.alt=note.alt||note.title;cap.textContent=note.caption||'';figure.append(img,cap);content.appendChild(figure);}
  }
  function openNote(note){const content=beginNotebook(note.title);fillNote(note,content);byId('rs-note-source').textContent=note.source;}
  function openSource(){
    const s=scene(), note=s.evidence||{title:s.chapter+' / source notes',text:s.text,source:s.source};
    const content=beginNotebook(note.title);fillNote(note,content);byId('rs-note-source').textContent=note.source;
    if(s.choices?.length){const h=document.createElement('h3');h.textContent='Look further';content.appendChild(h);s.choices.forEach(note=>{const b=document.createElement('button');b.type='button';b.className='rs-note-link';b.textContent=note.label+' ↗';b.addEventListener('click',()=>openNote(note));content.appendChild(b);});}
  }
  function openSceneList(casebook){
    const content=beginNotebook(casebook?'What the investigation has established':'Choose a scene');
    data.scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='rs-case-row';b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div><strong>${esc(s.chapter)}</strong><p>${esc(casebook?(earned.has(s.id)?s.conclusion:'Not yet recorded in your casebook.'):s.question||s.subtitle)}</p></div><b>${earned.has(s.id)?'✓':'→'}</b>`;b.addEventListener('click',()=>{returnFocus=null;notebook.close();show(i);});content.appendChild(b);});
    byId('rs-note-source').textContent='Illustrated dialogue connects the published evidence. No scene represents an observed participant or an individual health prediction.';
  }
  data.scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><small>${esc(s.chapter)}</small>`;b.setAttribute('aria-label','Scene '+(i+1)+': '+s.chapter);b.addEventListener('click',()=>show(i));byId('rs-chapters').appendChild(b);});
  prev.addEventListener('click',previous);next.addEventListener('click',advance);narration.addEventListener('click',finishTyping);
  byId('rs-brief-button').addEventListener('click',openBrief);back.addEventListener('click',openStory);
  byId('rs-source').addEventListener('click',openSource);byId('rs-exhibit-source').addEventListener('click',openSource);
  byId('rs-show-exhibit').addEventListener('click',()=>{finishTyping();setExhibit(true);byId('rs-hide-exhibit').focus({preventScroll:true});});
  byId('rs-hide-exhibit').addEventListener('click',()=>{setExhibit(false);byId('rs-show-exhibit').focus({preventScroll:true});});
  byId('rs-casebook').addEventListener('click',()=>openSceneList(true));byId('rs-scenes-button').addEventListener('click',()=>openSceneList(false));
  byId('rs-close-note').addEventListener('click',()=>notebook.close());
  notebook.addEventListener('close',()=>{if(returnFocus?.isConnected&&!root.hidden)returnFocus.focus({preventScroll:true});});
  notebook.addEventListener('click',e=>{if(e.target!==notebook)return;const r=notebook.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)notebook.close();});
  byId('rs-artifact').addEventListener('click',e=>{const b=e.target.closest('[data-chart]');if(!b)return;chartMode=b.dataset.chart;byId('rs-artifact').innerHTML=artifactHTML(beat().artifact||scene().artifact);byId('rs-artifact').querySelector(`[data-chart="${chartMode}"]`).focus({preventScroll:true});});
  root.addEventListener('research-story:pause',finishTyping);
  document.addEventListener('keydown',e=>{if(root.hidden||document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.target.closest('input,textarea,select,[contenteditable="true"],[data-chart]'))return;if(e.key==='ArrowRight'){e.preventDefault();advance();}else if(e.key==='ArrowLeft'){e.preventDefault();previous();}else if(e.key===' '&&!e.target.closest('button,a')){e.preventDefault();advance();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){finishTyping();clearInterval(portraitTimer);}else animateGuide();});
  reduce.addEventListener('change',()=>{if(reduce.matches)finishTyping();animateGuide();});
  brief.hidden=true;root.hidden=false;document.body.classList.add('story-active');show(0,0,true);animateGuide();
})();
