import { createStage, resize, placeCamera, updateLabels } from './engine.js';
import { SCENES } from './scenes.js';

/* Mounts a 3D scene into an element that contains <canvas> and .v3-labels.
   Returns controls; renderAt(t) draws a deterministic frame (used to make the poster images). */
export function mount(el, id) {
  const canvas = el.querySelector('canvas'), labelsEl = el.querySelector('.v3-labels');
  const small = matchMedia('(max-width: 700px)').matches;
  const stage = createStage(canvas, labelsEl, { small });
  const scn = SCENES[id](stage);
  stage.built = true; stage.check();
  const target = { x: 0, y: 0 };
  let dprCap = small ? 1.5 : 2;
  function fit() {
    const r = el.getBoundingClientRect();
    resize(stage, Math.max(200, r.width), Math.max(200, r.height), Math.min(window.devicePixelRatio || 1, dprCap));
  }
  fit();
  const ro = new ResizeObserver(fit); ro.observe(el);
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); target.x = ((e.clientX - r.left) / r.width - 0.5) * 2; target.y = ((e.clientY - r.top) / r.height - 0.5) * 2; });
  el.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });
  const frame = t => {
    stage.pointer.x += (target.x - stage.pointer.x) * 0.06; stage.pointer.y += (target.y - stage.pointer.y) * 0.06;
    scn.update(t); placeCamera(stage, t); stage.camera.updateMatrixWorld(true); updateLabels(stage); stage.renderer.render(stage.scene, stage.camera);
  };
  let raf = 0, running = false, t0 = performance.now(), visible = true;
  // Frame-rate governor: if the device can't keep up, drop the resolution once; if it still can't, hand back to the poster.
  let prev = 0, nFrames = 0, slow = 0, lowered = false;
  const loop = () => {
    if (!running) return;
    const now = performance.now();
    frame((now - t0) / 1000 + 1.2);
    if (prev && ++nFrames > 10) {
      const dt = now - prev;
      slow = dt > 45 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 14) {
        slow = 0;
        if (!lowered) { lowered = true; dprCap = 1; fit(); }
        else { stop(); el.classList.remove('is-live'); return; }
      }
    }
    prev = now;
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (running || !visible || document.hidden) return; running = true; loop(); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(en => { visible = en[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.05 }).observe(el);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); });
  // compile shaders off the main thread before the scene is revealed, so there is no visible hitch
  placeCamera(stage, 0); stage.camera.updateMatrixWorld(true);
  const ready = stage.ready.then(() => (stage.renderer.compileAsync ? stage.renderer.compileAsync(stage.scene, stage.camera) : null)).catch(() => {});
  return { stage, ready, start, stop, renderAt: t => frame(t), state: () => ({ running, visible, lost: stage.renderer.getContext().isContextLost() }) };
}
