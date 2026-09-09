/* Image-based camera travel and pigment dissolve. Runs only between scenes. */
(function () {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;

  window.ResearchSceneTransition = function (stage, backdrop, reducedMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'rs-transition-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.hidden = true;
    backdrop.after(canvas);
    const context = canvas.getContext('2d');
    let active = null;

    function load(scene) {
      return new Promise(resolve => {
        const image = new Image();
        let settled = false;
        const done = value => {
          if (settled) return;
          settled = true; clearTimeout(timeout);
          image.onload = image.onerror = null;
          resolve(value);
        };
        const timeout = setTimeout(() => done(null), 2500);
        image.onload = () => done(image);
        image.onerror = () => done(null);
        image.src = scene.background;
        if (image.complete && image.naturalWidth) done(image);
      });
    }

    function capture(image, position, width, height) {
      const buffer = document.createElement('canvas');
      buffer.width = width; buffer.height = height;
      const ctx = buffer.getContext('2d', {willReadFrequently: true});
      if (!ctx || !image.naturalWidth) return null;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const [px, py] = (position || '50% 50%').split(' ').map(value => parseFloat(value) / 100);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      ctx.filter = 'saturate(.95) brightness(.9)';
      ctx.drawImage(image, (width - w) * px, (height - h) * py, w, h);
      return {canvas: buffer, pixels: ctx.getImageData(0, 0, width, height).data};
    }

    function paintImage(buffer, width, height, scale, shift, alpha) {
      context.globalAlpha = alpha;
      context.drawImage(buffer, (width - width * scale) / 2 + shift, (height - height * scale) / 2, width * scale, height * scale);
    }

    function settle(state) {
      if (active !== state) return;
      active = null;
      cancelAnimationFrame(state.frame);
      clearTimeout(state.deadline);
      canvas.hidden = true;
      try {
        if (!state.committed) { state.committed = true; state.commit(state.image); }
        state.resolve();
      } catch (error) { state.reject(error); }
    }

    function animate(state, from, to, width, height) {
      const particles = [];
      const cell = Math.max(10, Math.sqrt(width * height / 1700));
      const color = (pixels, x, y) => {
        const at = (Math.floor(y) * width + Math.floor(x)) * 4;
        return [pixels[at], pixels[at + 1], pixels[at + 2]];
      };
      for (let y = cell / 2; y < height; y += cell) {
        for (let x = cell / 2; x < width; x += cell) {
          const seed = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          particles.push({x, y, seed, a: color(from.pixels, x, y), b: color(to.pixels, x, y)});
        }
      }
      const duration = width < 650 ? 1250 : 1450;
      const start = performance.now();
      const direction = state.direction;
      function frame(now) {
        if (active !== state) return;
        const p = clamp((now - start) / duration);
        const travel = smooth(p);
        context.globalAlpha = 1;
        context.fillStyle = '#1b102b';
        context.fillRect(0, 0, width, height);
        // The old camera moves forward while the next view comes into focus.
        paintImage(from.canvas, width, height, 1 + .18 * travel, -direction * width * .025 * travel, 1 - smooth((p - .12) / .58));
        paintImage(to.canvas, width, height, 1.15 - .15 * travel, direction * width * .025 * (1 - travel), smooth((p - .28) / .66));
        const colorPhase = smooth((p - .3) / .4);
        for (const dot of particles) {
          const wave = direction > 0 ? dot.x / width : 1 - dot.x / width;
          const local = clamp((p - wave * .14) / .86);
          const life = Math.sin(local * Math.PI);
          if (life <= .015) continue;
          const drift = life * (18 + Math.abs(dot.seed) * 34);
          const angle = dot.y / height * 7 + dot.seed * 4 + p * 3;
          const x = dot.x + direction * drift + Math.cos(angle) * life * 12;
          const y = dot.y + Math.sin(angle) * life * 24;
          const size = cell * (.2 + life * .8) * (.7 + Math.abs(dot.seed) * .3);
          context.globalAlpha = life * .8;
          context.fillStyle = `rgb(${dot.a.map((value, i) => Math.round(mix(value, dot.b[i], colorPhase))).join(',')})`;
          context.fillRect(x - size / 2, y - size / 2, size, size);
        }
        context.globalAlpha = 1;
        if (p < 1) state.frame = requestAnimationFrame(frame);
        else settle(state);
      }
      frame(start);
    }

    return {
      play({from, to, direction, commit}) {
        if (active) settle(active);
        return new Promise((resolve, reject) => {
          const state = {commit, resolve, reject, direction, frame: 0, image: null, committed: false};
          active = state;
          // A hidden tab or stalled frame must never leave navigation locked.
          state.deadline = setTimeout(() => settle(state), 4500);
          load(to).then(image => {
            if (active !== state) return;
            state.image = image;
            if (!context || !image || !backdrop.naturalWidth || reducedMotion.matches || document.hidden) { settle(state); return; }
            try {
              const rect = stage.getBoundingClientRect();
              const width = Math.max(1, Math.min(1100, Math.round(rect.width)));
              const height = Math.max(1, Math.round(width * rect.height / Math.max(1, rect.width)));
              const oldImage = capture(backdrop, from.position, width, height);
              const newImage = capture(image, to.position, width, height);
              if (!oldImage || !newImage) { settle(state); return; }
              canvas.width = width; canvas.height = height;
              context.drawImage(oldImage.canvas, 0, 0);
              canvas.hidden = false;
              state.committed = true;
              commit(image);
              animate(state, oldImage, newImage, width, height);
            } catch { settle(state); }
          });
        });
      },
      finish() { if (active) settle(active); }
    };
  };
})();
