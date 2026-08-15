/* ── Procedural publication covers ─────────────────────────────────────────
   Draws a typographic cover for a paper from its own metadata, so a new
   publication never needs an image asset. Deterministic: the same paper
   always renders the same cover.

   Shared by the portfolio SPA (project cards) and the standalone detail
   pages under /projects, so both stay visually identical.

   window.makePubCover({ title, venue, year, category, tags, seed, w, h })
     → data: URL (PNG)
   ------------------------------------------------------------------------ */
(function () {
  'use strict';

  var ACCENT = {
    vlm:      { key: '#3ee6ff', warm: '#7cb4e4', label: 'VISION-LANGUAGE' },
    llm:      { key: '#ff4d9d', warm: '#ff8c6a', label: 'LLM AGENTS' },
    mobility: { key: '#ffd23a', warm: '#ffb066', label: 'URBAN MOBILITY' },
    nature:   { key: '#5cffb0', warm: '#8ce6c0', label: 'URBAN NATURE' },
    health:   { key: '#ff8c3c', warm: '#ffb877', label: 'ENVIRONMENT, HEALTH & EQUITY' },
    design:   { key: '#b07bff', warm: '#d08cff', label: 'DESIGN & PRACTICE' },
    platforms:{ key: '#6f8cff', warm: '#93a7ff', label: 'PLATFORMS & INFRASTRUCTURE' }
  };
  var BG = ['#0a0618', '#100a24', '#161030', '#1c163c'];
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }
  function rngFrom(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // wrap text to a pixel width, at most `maxLines` lines
  function wrap(g, text, maxW, maxLines) {
    var words = String(text).split(/\s+/);
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = words[i];
        if (lines.length === maxLines - 1 && i < words.length - 1) break;
      } else {
        cur = test;
      }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    // if we ran out of room, ellipsise the final line
    var consumed = lines.join(' ').split(/\s+/).length;
    if (consumed < words.length && lines.length) {
      var last = lines[lines.length - 1];
      while (g.measureText(last + '…').width > maxW && last.indexOf(' ') > 0) {
        last = last.slice(0, last.lastIndexOf(' '));
      }
      lines[lines.length - 1] = last + '…';
    }
    return lines;
  }

  // ── motifs: an abstract data figure keyed to the paper's method ──
  function motifGrid(g, x, y, w, h, PX, rnd, col) {   // feature map / attention
    var cell = PX * 3, gap = PX;
    for (var gy = y; gy + cell <= y + h; gy += cell + gap) {
      for (var gx = x; gx + cell <= x + w; gx += cell + gap) {
        var r = rnd();
        if (r < 0.42) continue;
        g.globalAlpha = r > 0.9 ? 0.95 : r > 0.72 ? 0.45 : 0.16;
        g.fillStyle = col;
        g.fillRect(gx, gy, cell, cell);
      }
    }
    g.globalAlpha = 1;
  }
  function motifNetwork(g, x, y, w, h, PX, rnd, col) { // multi-agent graph
    var n = 7, pts = [];
    for (var i = 0; i < n; i++) {
      pts.push([x + PX * 2 + rnd() * (w - PX * 4), y + PX * 2 + rnd() * (h - PX * 4)]);
    }
    g.strokeStyle = col;
    g.lineWidth = Math.max(1, PX / 2);
    for (var a = 0; a < n; a++) {
      for (var b = a + 1; b < n; b++) {
        if (rnd() > 0.34) continue;
        g.globalAlpha = 0.20;
        g.beginPath();
        g.moveTo(pts[a][0], pts[a][1]);
        g.lineTo(pts[b][0], pts[b][1]);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    for (var k = 0; k < n; k++) {
      var s = PX * (k % 3 === 0 ? 3 : 2);
      g.fillStyle = col;
      g.globalAlpha = k % 3 === 0 ? 0.95 : 0.55;
      g.fillRect(pts[k][0] - s / 2, pts[k][1] - s / 2, s, s);
    }
    g.globalAlpha = 1;
  }
  function motifRoutes(g, x, y, w, h, PX, rnd, col) {  // route / flow lines
    for (var i = 0; i < 5; i++) {
      var yy = y + h * (0.12 + i * 0.19);
      var amp = h * (0.05 + rnd() * 0.09);
      var ph = rnd() * 6.28;
      g.globalAlpha = i % 2 === 0 ? 0.75 : 0.32;
      g.fillStyle = col;
      for (var xx = x; xx < x + w; xx += PX) {
        var t = (xx - x) / w;
        var oy = Math.sin(t * 5.5 + ph) * amp;
        g.fillRect(xx, Math.round((yy + oy) / PX) * PX, PX, PX);
      }
    }
    g.globalAlpha = 1;
  }
  function motifScatter(g, x, y, w, h, PX, rnd, col) { // canopy / spatial clusters
    var clusters = 4;
    for (var c = 0; c < clusters; c++) {
      var cx = x + PX * 4 + rnd() * (w - PX * 8);
      var cy = y + PX * 4 + rnd() * (h - PX * 8);
      var n = 8 + Math.floor(rnd() * 12);
      var spread = PX * (5 + rnd() * 9);
      for (var i = 0; i < n; i++) {
        var a = rnd() * 6.28, r = rnd() * spread;
        var px = Math.round((cx + Math.cos(a) * r) / PX) * PX;
        var py = Math.round((cy + Math.sin(a) * r * 0.7) / PX) * PX;
        if (px < x || px > x + w - PX || py < y || py > y + h - PX) continue;
        var s = PX * (rnd() < 0.25 ? 2 : 1);
        g.globalAlpha = rnd() < 0.3 ? 0.85 : 0.30;
        g.fillStyle = col;
        g.fillRect(px, py, s, s);
      }
    }
    g.globalAlpha = 1;
  }
  function motifBars(g, x, y, w, h, PX, rnd, col) {    // distribution / effects
    var n = 9, bw = Math.floor(w / n / PX) * PX;
    for (var i = 0; i < n; i++) {
      var bh = Math.round((h * (0.15 + Math.pow(rnd(), 1.6) * 0.8)) / PX) * PX;
      var bx = x + i * (bw + PX);
      g.globalAlpha = i === 3 || i === 6 ? 0.9 : 0.34;
      g.fillStyle = col;
      g.fillRect(bx, y + h - bh, bw - PX, bh);
      g.globalAlpha = 0.9;
      g.fillRect(bx, y + h - bh, bw - PX, PX);
    }
    g.globalAlpha = 1;
  }

  function motifStack(g, x, y, w, h, PX, rnd, col) {   // layered platforms
    var layers = 4;
    var lh = Math.max(PX * 3, Math.round(h / (layers * 2.1) / PX) * PX);
    for (var i = 0; i < layers; i++) {
      var ly = y + Math.round((i * (h - lh)) / (layers - 1) / PX) * PX;
      var inset = PX * i * 2;
      var lw = w - inset * 2;
      if (lw < PX * 8) break;
      g.fillStyle = col;
      g.globalAlpha = 0.07;
      g.fillRect(x + inset, ly, lw, lh);              // the slab body
      g.globalAlpha = 0.18 + i * 0.22;
      g.fillRect(x + inset, ly, lw, PX);              // its lit top edge
      g.globalAlpha = 0.85;
      for (var n = 0; n < 3; n++) {                   // services riding the slab
        var span = lw - PX * 6;
        if (span <= 0) break;
        var nx = x + inset + PX * 2 + Math.round((rnd() * span) / PX) * PX;
        g.fillRect(nx, ly - PX, PX * 2, PX * 2);
      }
    }
    g.globalAlpha = 1;
  }

  window.makePubCover = function (opts) {
    opts = opts || {};
    var W = opts.w || 800, H = opts.h || 450;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    if (!g) return '';

    var acc = ACCENT[opts.category] || ACCENT.design;
    var seedStr = (opts.seed || opts.title || 'paper') + '|' + (opts.year || '');
    var rnd = rngFrom(hash(seedStr));
    var PX = Math.max(2, Math.round(W / 200));   // chunky, matches the hero city

    // ── background: quantised bands + dithered seams ──
    var bandH = Math.ceil(H / BG.length / PX) * PX;
    for (var i = 0; i < BG.length; i++) {
      g.fillStyle = BG[i];
      g.fillRect(0, i * bandH, W, bandH + PX);
    }
    for (var s = 1; s < BG.length; s++) {
      var by = s * bandH, zone = PX * 5;
      for (var yy = by - zone; yy < by + zone; yy += PX) {
        if (yy < 0 || yy >= H) continue;
        var row = Math.round(yy / PX);
        var f = (yy - (by - zone)) / (zone * 2);
        for (var xx = 0; xx < W; xx += PX) {
          var col2 = Math.round(xx / PX);
          var th = (BAYER[(row & 3) * 4 + (col2 & 3)] + 0.5) / 16;
          if (f < 0.5) { if (0.5 - f > th * 0.5) continue; g.fillStyle = BG[s]; }
          else { if (f - 0.5 > th * 0.5) continue; g.fillStyle = BG[s - 1]; }
          g.fillRect(xx, yy, PX, PX);
        }
      }
    }

    // ── motif panel on the right ──
    var mx = Math.round(W * 0.58), mw = W - mx - PX * 6, my = PX * 8, mh = H - PX * 26;
    var motif = opts.category === 'llm' ? motifNetwork
              : opts.category === 'mobility' ? motifRoutes
              : opts.category === 'nature' ? motifScatter
              : opts.category === 'health' ? motifBars
              : opts.category === 'platforms' ? motifStack
              : motifGrid;
    motif(g, mx, my, mw, mh, PX, rnd, acc.key);

    // soft vignette so the type stays legible over the motif
    var grad = g.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(10,6,24,0.96)');
    grad.addColorStop(0.55, 'rgba(10,6,24,0.82)');
    grad.addColorStop(1, 'rgba(10,6,24,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // ── type ──
    var padX = PX * 6, padY = PX * 8;
    var mono = '"Share Tech Mono","Courier New",monospace';
    var disp = '"Space Grotesk",system-ui,-apple-system,sans-serif';

    // category rail
    g.fillStyle = acc.key;
    g.fillRect(padX, padY, PX * 12, PX);

    // venue
    g.font = Math.round(W * 0.019) + 'px ' + mono;
    g.fillStyle = acc.key;
    g.textBaseline = 'top';
    var venue = String(opts.venue || '').toUpperCase();
    g.fillText(venue.length > 46 ? venue.slice(0, 45) + '…' : venue, padX, padY + PX * 4);

    // title
    var tSize = Math.round(W * 0.052);
    g.font = '600 ' + tSize + 'px ' + disp;
    g.fillStyle = '#f4f5f6';
    var lines = wrap(g, opts.title || '', W * 0.52, 4);
    var ty = padY + PX * 13;
    for (var li = 0; li < lines.length; li++) {
      g.fillText(lines[li], padX, ty + li * tSize * 1.22);
    }

    // year, oversized and low-contrast in the corner
    g.font = '700 ' + Math.round(W * 0.16) + 'px ' + disp;
    g.fillStyle = acc.key;
    g.globalAlpha = 0.10;
    g.textAlign = 'right';
    g.fillText(String(opts.year || ''), W - padX, H - Math.round(W * 0.19));
    g.textAlign = 'left';
    g.globalAlpha = 1;

    // tag rail along the bottom
    var tags = (opts.tags || []).slice(0, 3);
    g.font = Math.round(W * 0.017) + 'px ' + mono;
    var tx = padX;
    var tyy = H - PX * 9;
    for (var t2 = 0; t2 < tags.length; t2++) {
      var label = String(tags[t2]).toUpperCase();
      var tw = g.measureText(label).width + PX * 5;
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(tx, tyy - PX * 2, tw, PX * 6);
      g.fillStyle = t2 === 0 ? acc.key : acc.warm;
      g.fillRect(tx, tyy - PX * 2, PX, PX * 6);
      g.fillStyle = '#a9b0c0';
      g.fillText(label, tx + PX * 3, tyy);
      tx += tw + PX * 3;
      if (tx > W * 0.86) break;
    }

    // frame
    g.strokeStyle = 'rgba(255,255,255,0.07)';
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, W - 1, H - 1);

    return cv.toDataURL('image/png');
  };

  // Convenience: fill every <img data-pubcover='{...}'> on the page.
  window.applyPubCovers = function (root) {
    var nodes = (root || document).querySelectorAll('img[data-pubcover]');
    for (var i = 0; i < nodes.length; i++) {
      try {
        var cfg = JSON.parse(nodes[i].getAttribute('data-pubcover'));
        nodes[i].src = window.makePubCover(cfg);
      } catch (e) { /* leave the element as-is */ }
    }
  };
})();
