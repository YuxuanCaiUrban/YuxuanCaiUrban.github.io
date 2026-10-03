/* The night guide, 48x64, drawn without the homepage cigarette and smoke.
   A reusable character layer, never baked into a scene background.
   Light falls from the upper left: sheen on the hat crown and the left of the
   coat, shadow down the right side of the face and coat.
   Legend: K outline  H hat  h hat sheen  J hat dark  P band light  B band
   A hair  R hair/brow light  F skin  L skin light  f skin shadow  n skin deep
   W white  I iris  e glint  M mouth  m lower lip  S scarf  s scarf light
   T scarf dark  C coat  c coat light  d coat dark/seam  b button  . clear

   Optional external art: give the script tag a data-sprite attribute pointing
   at a transparent PNG (one frame, or three side by side: idle, eyes shut,
   mouth open; each frame 3:4). See assets/images/stories/GUIDE_SPRITE_PROMPT.md.
   Without the attribute nothing is requested and the drawn sprite is used. */
(function(){
  'use strict';
  const PORTRAIT=[
    '................................................',
    '...............KKKKK........KKKKK...............',
    '..............KhhhhhKKKKKKKKhhhhhK..............',
    '.............KHHHHHHhhhhhhhhHHHHHHK.............',
    '.............KhHHhHHHHHHHHHHHHJHHHK.............',
    '.............KhHHhHHHHHHHHHHHHJHHHK.............',
    '............KhHHHHhHHHHHHHHHHJHHHHJK............',
    '............KhHHHHhHHHHHHHHHHJHHHHJK............',
    '............KhHHHHHHHHHHHHHHHHHHHHJK............',
    '............KhHHHHHHHHHHHHHHHHHHHHJK............',
    '............KhHHHHHHHHHHHHHHHHHHHHJK............',
    '...........KPPPPPPPPPPPPPPPPPPPPPPPPK...........',
    '...........KBBBBBBBBBBBBBBBBBBBBBBBBK...........',
    '..........KKBBBBBBBBBBBBBBBBBBBBBBBBKK..........',
    '......KKKKHhhhhhhhhhhhhhhhhhhhhhhhhhhHKKKK......',
    '....KKHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHKK....',
    '...KJJJJJJJJJJKKKKKKKKKKKKKKKKKKKKJJJJJJJJJJK...',
    '..KJJJJKKKKKKKKAAAAAAAAAAAAAAAAAAKKKKKKKKJJJJK..',
    '...KKKK.......KARAAAAARAAAAAARAAAK.......KKKK...',
    '..............KAAAARAAAAAARAAAAAAK..............',
    '..............KAAARAAAAAAAAARAAAAK..............',
    '..............KAAAAAAFAAAAFAAAAAAK..............',
    '..............KAAFFFFFFAAFFFFFFAAK..............',
    '..............KAAFAAAAFFFFAAAAfAAK..............',
    '..............KAAFFFFFFFFFFFFFfAAK..............',
    '.............KKAALKKKKFFFFKKKKfAAKK.............',
    '............KFFAALWIIWFFFFWIIWfAAffK............',
    '............KfFAALfIIfFFFFfIIffAAFfK............',
    '............KfFAALFffFFFFFFffFfAAffK............',
    '.............KKAFLLFFFFFfFFFFFfFAKK.............',
    '..............KFFLFFFFFLfFFFFffFFK..............',
    '...............KFFFFFFFfffFFFffFK...............',
    '...............KFFFFFFFFFFFFFffFK...............',
    '................KFFFFMMMMMMffffK................',
    '.................KFFFFmmmmffffK.................',
    '..................KKFFFFffffKK..................',
    '....................KnffffnK....................',
    '....................KnnnnnnK....................',
    '....................KFffffFK....................',
    '............KKKKKKKKKKKKKKKKKKKKKKKK............',
    '...........KSssssssssFFFFFFssssssssSK...........',
    '..........KKsssssssssFFFFFFsssssssssKK..........',
    '........KKCCSSSSSSSSSSSSSSSSSSSSSSSSCCKK........',
    '......KKCCCCSSSSSSSSSSSSSSSSSSTTTTTTCCCCKK......',
    '.....KCCCCCCKKKKKKKKKKKKKKKKKKKKKKKKCCCCCCK.....',
    '....KcccccCCsSSSSSSSWWWWWWWWccCCCCCCCCCCCCCK....',
    '...KccccccdCsSSSSSSSWWWWWWWWccCCCCCCCdCCCCCCK...',
    '...KCcCCCCdCsSTTTTTTcWWWWWWccCCCCCCCddCCCCdCK...',
    '...KCcCCCCdCCsSSSSSScWWWWWWccCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCsSSSSSCccWWWWccCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCsSTTTTCccWWWWccCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCsSSSSCCccccccCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCsSSSSCCccccccCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCsSSSCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCTSTSCCCCCCCbbCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCTCTCCCCCCCbbCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCbbCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCbbCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
    '...KCccCCCdCCCCCCCCCCCCCCCCCCCCCCCCCddCCCCdCK...',
  ];
  const INK={K:'#120a18',H:'#1b1230',h:'#3b2f60',J:'#110a1c',P:'#93405f',B:'#6b2748',A:'#1b1a19',R:'#37332f',F:'#ddb5a1',L:'#ecc9b7',f:'#c8a08e',n:'#a98270',W:'#eee6f2',I:'#33282c',e:'#ffffff',M:'#b86b6f',m:'#d4a09c',S:'#6e2d4b',s:'#944068',T:'#4a1c34',C:'#2a2238',c:'#3d3360',d:'#1b1526',b:'#c9a062'};
  const W=48, H=64;
  // the pixels the animation frames repaint: eyes shut on a blink (skin, then
  // a lid line), mouth open on the odd talking frame
  const EYES=[];for(let y=25;y<=28;y++)for(const x0 of [18,26])for(let x=x0;x<=x0+3;x++)EYES.push([x,y]);
  const LIDS=[];for(const x0 of [18,26])for(let x=x0;x<=x0+3;x++)LIDS.push([x,26]);
  const MOUTH=[];for(let y=33;y<=35;y++)for(let x=22;x<=25;x++)MOUTH.push([x,y]);

  // optional external sprite sheet, enabled only by the script tag's data-sprite
  const sheet={img:null,frames:0,w:W,h:H,ready:false,waiting:[]};
  const src=document.currentScript&&document.currentScript.dataset?document.currentScript.dataset.sprite:'';
  if(src){
    const img=new Image();
    img.onload=()=>{
      sheet.h=img.naturalHeight;sheet.w=Math.max(1,Math.round(sheet.h*3/4));
      sheet.frames=Math.max(1,Math.round(img.naturalWidth/sheet.w));
      sheet.img=img;sheet.ready=true;
      sheet.waiting.splice(0).forEach(f=>{try{f();}catch(_){}});
    };
    img.src=src;
  }

  function draw(canvas, options = {}) {
    if (!canvas) return;
    const w=sheet.ready?sheet.w:W, h=sheet.ready?sheet.h:H;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0,0,w,h);
    if (sheet.ready) {
      const k=options.blink&&sheet.frames>1?1:options.frame&&sheet.frames>2?2:0;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(sheet.img,k*w,0,w,h,0,0,w,h);
      return;
    }
    for(let y=0;y<H;y++){const row=PORTRAIT[y];
      for(let x=0;x<W;x++){const ch=row[x];if(ch==='.')continue;
        ctx.fillStyle=INK[ch];ctx.fillRect(x,y,1,1);
      }
    }
    if (options.blink) {
      ctx.fillStyle=INK.F; EYES.forEach(([x,y])=>ctx.fillRect(x,y,1,1));
      ctx.fillStyle=INK.K; LIDS.forEach(([x,y])=>ctx.fillRect(x,y,1,1));
    } else if (options.frame) {
      ctx.fillStyle=INK.M; MOUTH.forEach(([x,y])=>ctx.fillRect(x,y,1,1));
    }
  }
  window.NightGuide={draw, pixels:PORTRAIT, palette:INK, size:{w:W,h:H},
    onReady:f=>{if(sheet.ready)f();else if(src)sheet.waiting.push(f);}};
})();
