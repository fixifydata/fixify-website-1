import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export { THREE, RoundedBoxGeometry };
export const C = { navy: 0x0a1a47, deep: 0x071233, gold: 0xffc21a, ember: 0xf2780c, green: 0x19c37d, red: 0xff5a5f, white: 0xffffff, blue: 0x5b8cff, ice: 0xbcd0ff };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- renderer, lights, stage ---------- */
export function createStage(canvas, labelsEl, opts = {}) {
  const small = opts.small;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc21a, 1.3); rim.position.set(-6, 3, -5); scene.add(rim);
  const fill = new THREE.PointLight(0x5b8cff, 22, 22, 2); fill.position.set(-5, 2.5, 5); scene.add(fill);

  // reflective stage
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.6, 0.22, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x102463, roughness: 0.34, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.45 }));
  floor.position.y = -0.11; floor.receiveShadow = true; scene.add(floor);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.022, 12, 160), new THREE.MeshBasicMaterial({ color: C.gold, toneMapped: false }));
  rimRing.rotation.x = Math.PI / 2; rimRing.position.y = 0.0; scene.add(rimRing);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(7.2, 64), new THREE.MeshBasicMaterial({ map: radialTex('rgba(91,140,255,.4)', 'rgba(91,140,255,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -0.2; scene.add(glow);
  // fine grid on the stage
  const grid = new THREE.GridHelper(12.8, 32, 0x2f52b8, 0x1d3680); grid.position.y = 0.012; grid.material.transparent = true; grid.material.opacity = 0.28; scene.add(grid);

  const loader = new THREE.TextureLoader();
  const stage = { renderer, scene, camera, loader, labels: [], labelsEl, size: { w: 1, h: 1 }, pointer: { x: 0, y: 0 }, focus: V(0, 1.15, 0), halfW: 5.5, halfH: 2.1, pending: 0, built: false, tex: {} };
  // "ready" = the scene is built and every logo texture has finished loading (or failed, or 5 s passed)
  stage.ready = new Promise(res => {
    stage.check = () => { if (stage.built && stage.pending === 0) res(); };
    setTimeout(res, 5000);
  });
  return stage;
}

export function resize(stage, w, h, dpr) {
  const { renderer, camera } = stage;
  stage.size = { w, h };
  renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  stage.dist = Math.max(stage.halfH / t, stage.halfW / (t * camera.aspect)) + 0.2;
}

export function placeCamera(stage, t) {
  const { camera, pointer, focus } = stage;
  const a = Math.sin(t * 0.18) * 0.22 + pointer.x * 0.28;
  const e = 0.25 + Math.sin(t * 0.13) * 0.025 - pointer.y * 0.06;
  const d = stage.dist;
  camera.position.set(focus.x + Math.sin(a) * d * Math.cos(e), focus.y + Math.sin(e) * d, focus.z + Math.cos(a) * d * Math.cos(e));
  camera.lookAt(focus);
}

export function updateLabels(stage) {
  const { labels, camera, size } = stage;
  stage.scene.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  for (const L of labels) {
    (L.obj ? L.obj.getWorldPosition(p) : p.copy(L.pos));
    p.y += L.dy || 0;
    p.project(camera);
    const x = (p.x * 0.5 + 0.5) * size.w, y = (-p.y * 0.5 + 0.5) * size.h;
    L.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
    L.el.style.opacity = p.z < 1 ? '1' : '0';
  }
}

export function addLabel(stage, text, target, dy = 0.9, n, cls = '') {
  const el = document.createElement('div');
  el.className = 'v3-label' + (cls ? ' ' + cls : '');
  el.innerHTML = (n ? `<span>${n}</span>` : '') + text;
  stage.labelsEl.appendChild(el);
  const L = { el, dy };
  if (target.isObject3D) L.obj = target; else L.pos = target.clone();
  stage.labels.push(L);
  return L;
}

/* ---------- textures ---------- */
export function radialTex(inner, outer, size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function logoTex(stage, id) {
  if (stage.tex[id]) return stage.tex[id];
  stage.pending++;
  const done = () => { stage.pending--; stage.check && stage.check(); };
  const t = stage.loader.load('/assets/logos/carousel/' + id + '.webp', done, undefined, done);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return (stage.tex[id] = t);
}
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const api = { tex, canvas: c, ctx, redraw(t) { draw(ctx, w, h, t); tex.needsUpdate = true; } };
  api.redraw(0); return api;
}

/* ---------- materials ---------- */
export const M = {
  white: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 }),
  navy: () => new THREE.MeshPhysicalMaterial({ color: 0x0f1f55, roughness: 0.35, metalness: 0.5, clearcoat: 0.7 }),
  metal: (c = 0xc8ccd6) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.28, metalness: 1, clearcoat: 0.3 }),
  dark: () => new THREE.MeshPhysicalMaterial({ color: 0x151a2c, roughness: 0.3, metalness: 0.7, clearcoat: 0.8 }),
  glass: (c = 0xa9c2ff, o = 0.2) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, metalness: 0, transparent: true, opacity: o, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide, depthWrite: false }),
  glow: (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: o < 1, opacity: o }),
  emis: (c, i = 1.6) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 })
};
export const rbox = (w, h, d, r = 0.06, m = M.white()) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), m); o.castShadow = o.receiveShadow = true; return o; };

/* ---------- logo card ---------- */
export function card(stage, id, w = 1.9) {
  const g = new THREE.Group(), h = w * 0.37;
  const slab = rbox(w, h, 0.09, 0.05, M.white()); g.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, w * 0.9 / 3.636), new THREE.MeshBasicMaterial({ map: logoTex(stage, id), toneMapped: false }));
  face.position.z = 0.047; g.add(face);
  g.userData = { slab, w, h, pulse: 0 };
  g.glow = (a, color = C.gold) => { slab.material.emissive.set(color); slab.material.emissiveIntensity = a * 0.5; };
  return g;
}

/* ---------- curves, pipes, streams ---------- */
export const curve = (pts, tension = 0.5) => new THREE.CatmullRomCurve3(pts, false, 'catmullrom', tension);
export function pipe(parent, cv, { r = 0.07, color = 0xa9c2ff, line = C.ice } = {}) {
  const geo = new THREE.TubeGeometry(cv, 80, r, 14, false);
  const m = new THREE.Mesh(geo, M.glass(color, 0.16)); m.renderOrder = 2; parent.add(m);
  const l = new THREE.Mesh(new THREE.TubeGeometry(cv, 80, r * 0.14, 6, false), M.glow(line, 0.55)); parent.add(l);
  return m;
}
let _glowTex;
export function stream(parent, cv, { n = 10, speed = 0.12, color = C.ice, size = 0.085, shape = 'sphere', glow = 0.55, fn, offset = 0, win } = {}) {
  const geo = shape === 'cube' ? new RoundedBoxGeometry(size * 1.7, size * 1.7, size * 1.7, 2, size * 0.3) : new THREE.SphereGeometry(size, 16, 12);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.9, roughness: 0.3, metalness: 0.1 });
  const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false; parent.add(mesh);
  const col = new THREE.Color(color);
  for (let i = 0; i < n; i++) mesh.setColorAt(i, col);
  _glowTex = _glowTex || radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 64);
  const pos = new Float32Array(n * 3), colA = new Float32Array(n * 3);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(colA, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: _glowTex, size: size * 7 * glow / 0.55, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.9 }));
  pts.frustumCulled = false; parent.add(pts);
  const d = new THREE.Object3D(), p = new THREE.Vector3(), c2 = new THREE.Color();
  return {
    mesh, pts, curve: cv,
    update(t) {
      for (let i = 0; i < n; i++) {
        const raw = t * speed + i / n + offset, u = raw - Math.floor(raw), cycle = Math.floor(raw);
        let uu = u, vis = 1;
        if (win) { vis = u < win[0] ? 0 : 1; uu = clamp((u - win[0]) / (win[1] - win[0])); }
        cv.getPointAt(uu, p);
        let s = fn ? fn(uu, i, cycle, c2.copy(col), t) : 1;
        if (!vis) s = 0;
        const sc = s === undefined ? 1 : (typeof s === 'number' ? s : s.s);
        d.position.copy(p); d.scale.setScalar(Math.max(sc, 0.0001)); d.rotation.set(u * 9, u * 7, 0); d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
        if (s && s.color) c2.set(s.color); else c2.copy(col);
        mesh.setColorAt(i, c2);
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        colA[i * 3] = c2.r * sc; colA[i * 3 + 1] = c2.g * sc; colA[i * 3 + 2] = c2.b * sc;
      }
      mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    }
  };
}

/* ---------- devices ---------- */
export function browserWindow(w = 2.5, h = 1.6) {
  const g = new THREE.Group();
  const body = rbox(w, h, 0.1, 0.08, M.dark()); g.add(body);
  const screen = canvasTex(512, Math.round(512 * (h - 0.2) / (w - 0.2)), (x, W, H, t) => {
    x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#0a1a47'; x.fillRect(0, 0, W, 34);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(18 + i * 18, 17, 5, 0, 7); x.fill(); });
    x.fillStyle = '#1d3170'; x.fillRect(86, 8, W - 110, 18);
    x.fillStyle = '#dfe5f5'; x.fillRect(24, 56, W * 0.55, 22); x.fillStyle = '#0a1a47'; x.fillRect(24, 56, W * 0.3, 22);
    for (let i = 0; i < 3; i++) { x.fillStyle = '#fff'; x.fillRect(24 + i * (W - 48) / 3, 100, (W - 48) / 3 - 12, 110); x.fillStyle = '#dfe5f5'; x.fillRect(32 + i * (W - 48) / 3, 108, (W - 48) / 3 - 28, 60); }
    x.fillStyle = '#ffc21a'; x.fillRect(24, H - 70, 120, 34);
    const k = (t * 1.3) % 1, cx = 70 + k * 220, cy = H - 53 - k * 40;
    x.fillStyle = 'rgba(25,195,125,' + (1 - k) + ')'; x.beginPath(); x.arc(cx, cy, 6 + k * 34, 0, 7); x.fill();
    x.fillStyle = '#0a1a47'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + 12, cy + 22); x.lineTo(cx + 4, cy + 19); x.lineTo(cx - 1, cy + 28); x.closePath(); x.fill();
  });
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, h - 0.2), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); sc.position.z = 0.052; g.add(sc);
  g.userData.screen = screen; return g;
}
export function phone(kind = 'ios', draw) {
  const g = new THREE.Group();
  const body = rbox(0.95, 1.9, 0.11, 0.16, kind === 'ios' ? M.metal(0xd7dbe4) : M.dark()); g.add(body);
  const screen = canvasTex(256, 512, draw || ((x, W, H, t) => {
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a1a47'); gr.addColorStop(1, '#1d3a9a'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffc21a'; x.fillRect(24, 40, 90, 14); x.fillStyle = 'rgba(255,255,255,.14)'; for (let i = 0; i < 4; i++) x.fillRect(24, 90 + i * 84, W - 48, 64);
    const k = (t * 0.9) % 1; x.fillStyle = 'rgba(25,195,125,' + (1 - k) + ')'; x.beginPath(); x.arc(W / 2, 90 + 64 * 1.5 + 84, 10 + k * 60, 0, 7); x.fill();
  }));
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.83, 1.78), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); sc.position.z = 0.058; g.add(sc);
  g.userData.screen = screen; return g;
}
export function monitor(w = 3.0, h = 1.85, draw) {
  const g = new THREE.Group();
  const frame = rbox(w, h, 0.12, 0.1, M.dark()); g.add(frame);
  const screen = canvasTex(768, Math.round(768 * (h - 0.16) / (w - 0.16)), draw);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.16, h - 0.16), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); sc.position.z = 0.062; g.add(sc);
  const stand = rbox(0.28, 0.5, 0.16, 0.05, M.metal(0x9aa3b8)); stand.position.set(0, -h / 2 - 0.2, -0.05); g.add(stand);
  const base = rbox(1.1, 0.07, 0.6, 0.03, M.metal(0x9aa3b8)); base.position.set(0, -h / 2 - 0.46, 0); g.add(base);
  g.userData.screen = screen; return g;
}
export function pedestal(r = 0.9, h = 0.28, color = 0x12276b) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 64), new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.6, clearcoat: 0.8 }));
  m.castShadow = m.receiveShadow = true; m.position.y = h / 2; return m;
}
export function ring(r = 0.9, tube = 0.04, color = C.gold) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 96), M.glow(color)); return m;
}
export function arc(stage, ids, center, radius, a0, a1, w = 1.6, y = 1.2, stagger = 0.0) {
  const out = [];
  ids.forEach((id, i) => {
    const a = THREE.MathUtils.degToRad(a0 + (a1 - a0) * (ids.length === 1 ? 0.5 : i / (ids.length - 1)));
    const c = card(stage, id, w);
    c.position.set(center.x + Math.cos(a) * radius, y + (i % 2) * stagger, center.z + Math.sin(a) * radius);
    // face the viewer (+z), turned slightly toward the middle of the arc, so logos are always legible
    c.lookAt(c.position.x + (center.x - c.position.x) * 0.25, c.position.y, c.position.z + 6);
    out.push(c);
  });
  return out;
}

/* a vertical column of logo cards, gently curved toward the viewer; side = +1 on the right, -1 on the left */
export function column(stage, ids, x, y0, dy, w = 1.5, side = 1) {
  return ids.map((id, i) => {
    const c = card(stage, id, w), y = y0 + i * dy;
    c.position.set(x, y, -Math.pow((y - (y0 + (ids.length - 1) * dy / 2)) * 0.5, 2) * 0.35);
    c.rotation.y = -0.32 * side; return c;
  });
}
