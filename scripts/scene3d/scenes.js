import { THREE, C, V, hash, clamp, smooth, M, rbox, card, curve, pipe, stream, browserWindow, phone, monitor, pedestal, ring, column, canvasTex, addLabel, radialTex } from './engine.js';

const face = (obj, ry) => { obj.rotation.y = ry; return obj; };
const pulse = (t, period) => Math.exp(-5 * ((t / period) % 1));
const lit = (card_, on) => { card_.userData.slab.material.color.setScalar(on ? 1 : 0.55); card_.children[1].material.color.setScalar(on ? 1 : 0.4); card_.glow(on ? 1 : 0, C.green); };
const wire = (geo, color) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }));

/* 1. Analytics and tag management: events -> data layer -> tag manager -> analytics */
export function analytics(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const win = browserWindow(2.5, 1.6); win.position.set(-3.9, 1.25, 0.3); win.rotation.y = 0.42; g.add(win);
  const plates = [];
  for (let i = 0; i < 3; i++) {
    const p = rbox(1.8, 0.05, 1.8, 0.03, M.glass(0xffd35a, 0.28 + i * 0.05)); p.castShadow = false;
    p.position.set(-1.55, 0.55 + i * 0.42, 0); p.rotation.y = 0.42; g.add(p); plates.push(p);
    const e = wire(new THREE.BoxGeometry(1.8, 0.05, 1.8), C.gold); e.position.copy(p.position); e.rotation.copy(p.rotation); g.add(e);
  }
  const cont = rbox(1.9, 1.9, 1.9, 0.14, M.glass(0x9db7ff, 0.16)); cont.castShadow = false; cont.position.set(1.0, 1.05, 0); g.add(cont);
  const contE = wire(new THREE.BoxGeometry(1.9, 1.9, 1.9), C.ice); contE.position.copy(cont.position); g.add(contE);
  const tags = []; const tc = [C.gold, C.green, C.blue, C.ember, C.red, C.ice];
  for (let i = 0; i < 6; i++) { const t = rbox(0.34, 0.34, 0.34, 0.07, M.emis(tc[i], 0.9)); g.add(t); tags.push(t); }
  const gtm = card(S, 'gtm', 1.55); gtm.position.set(1.0, 2.62, 0); face(gtm, 0.15); g.add(gtm);
  const ga = card(S, 'ga4', 1.9); ga.position.set(3.95, 1.8, -0.7); face(ga, -0.5); g.add(ga);
  const ad = card(S, 'adobe-analytics', 1.9); ad.position.set(3.95, 0.85, 0.55); face(ad, -0.5); g.add(ad);

  const cA = curve([V(-3.0, 1.25, 0.5), V(-2.2, 1.18, 0.25), V(-1.55, 1.0, 0), V(-0.6, 1.05, 0), V(0.1, 1.05, 0)]);
  const cB = curve([V(1.95, 1.1, 0), V(2.8, 1.45, -0.25), V(3.35, 1.78, -0.6)]);
  const cC = curve([V(1.95, 1.0, 0), V(2.8, 0.9, 0.3), V(3.35, 0.85, 0.5)]);
  [cA, cB, cC].forEach(c => pipe(g, c, { r: 0.055 }));
  const sA = stream(g, cA, { n: 14, speed: 0.1, size: 0.075, color: C.ice, fn: (u, i, cy, col) => {
    const dup = i % 5 === 0; if (dup) { col.set(C.red); return { s: 1 - smooth(0.78, 0.93, u), color: C.red }; }
    return { s: 1, color: u > 0.45 ? C.gold : C.ice };
  } });
  const sB = stream(g, cB, { n: 5, speed: 0.1, color: C.green, size: 0.08 });
  const sC = stream(g, cC, { n: 5, speed: 0.1, color: C.green, size: 0.08 });
  addLabel(S, 'Your site', win, 1.15, 1); addLabel(S, 'Data layer', plates[2], 0.5, 2); addLabel(S, 'Tag manager', gtm, 0.55, 3); addLabel(S, 'Analytics', ga, 0.55, 4);
  return { update(t) {
    sA.update(t); sB.update(t); sC.update(t);
    win.userData.screen.redraw(t);
    tags.forEach((m, i) => { const a = t * 0.6 + i * 1.05; m.position.set(1.0 + Math.cos(a) * 0.52, 1.05 + Math.sin(a * 1.3) * 0.3, Math.sin(a) * 0.52); m.rotation.set(a, a * 0.7, 0); });
    plates.forEach((p, i) => { p.position.y = 0.55 + i * 0.42 + Math.sin(t * 1.2 + i) * 0.025; });
    const pz = pulse(t, 1 / (0.1 * 5)); ga.glow(pz, C.green); ad.glow(pulse(t + 0.4, 1 / (0.1 * 5)), C.green);
    gtm.position.y = 2.62 + Math.sin(t * 1.1) * 0.05;
  } };
}

/* 2. App tracking: iOS + Android + web -> one event model -> attribution + product analytics */
export function app(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const ios = phone('ios'); ios.position.set(-4.0, 1.05, 1.6); face(ios, 0.55); g.add(ios);
  const and = phone('android'); and.position.set(-4.6, 1.05, 0.0); face(and, 0.6); g.add(and);
  const web = browserWindow(1.9, 1.25); web.position.set(-4.0, 0.85, -1.6); face(web, 0.65); g.add(web);
  const hub = new THREE.Group(); hub.position.set(0.2, 1.5, 0); g.add(hub);
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), M.glass(0x9db7ff, 0.22)); hub.add(shell);
  hub.add(wire(new THREE.IcosahedronGeometry(0.86, 1), C.gold));
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), M.emis(C.gold, 2.2)); hub.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,194,26,.9)', 'rgba(255,194,26,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3.2); hub.add(halo);
  const ped = pedestal(0.8, 0.25); ped.position.set(0.2, 0, 0); g.add(ped);
  const ids = ['appsflyer', 'firebase', 'amplitude', 'mixpanel', 'posthog'];
  const cards = column(S, ids.slice().reverse(), 3.9, 0.45, 0.72, 1.6, 1).reverse(); cards.forEach(c => g.add(c));
  const src = [ios, and, web], sCurves = [];
  src.forEach((d, i) => {
    const cv = curve([d.position.clone().add(V(0.6, 0.4, 0)), d.position.clone().lerp(hub.position, 0.55).add(V(0, 0.55, 0)), hub.position.clone().add(V(-0.9, 0, 0))]); sCurves.push(cv);
    pipe(g, cv, { r: 0.05 });
  });
  const streams = sCurves.map((cv, i) => stream(g, cv, { n: 6, speed: 0.1, size: 0.07, color: C.ice, offset: i * 0.33 }));
  const oc = cards.map((c, i) => { const tgt = c.position.clone().add(V(-0.95, 0, 0)); const cv = curve([hub.position.clone().add(V(0.8, 0, 0)), hub.position.clone().lerp(tgt, 0.5).add(V(0, 0.15, 0)), tgt]); pipe(g, cv, { r: 0.045 }); return stream(g, cv, { n: 4, speed: 0.12, size: 0.07, color: i < 2 ? C.gold : C.blue, offset: i * 0.2 }); });
  addLabel(S, 'Your apps and site', and, 1.25, 1); addLabel(S, 'One event model', hub, 1.25, 2); addLabel(S, 'Attribution', cards[0], 0.55, 3); addLabel(S, 'Product analytics', cards[4], -0.42, 4);
  return { update(t) {
    streams.forEach(s => s.update(t)); oc.forEach(s => s.update(t));
    hub.rotation.y = t * 0.5; hub.rotation.x = Math.sin(t * 0.4) * 0.15; core.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    hub.position.y = 1.5 + Math.sin(t * 1.2) * 0.06;
    ios.userData.screen.redraw(t); and.userData.screen.redraw(t + 0.4); web.userData.screen.redraw(t);
    cards.forEach((c, i) => c.glow(pulse(t + i * 0.25, 2.2) * 0.8, i < 2 ? C.gold : C.blue));
  } };
}

/* 3. Ecommerce: parcels on a belt are scanned once; the same revenue goes to every platform */
export function ecommerce(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const BEL = { x0: -4.5, x1: 1.5, y: 0.5 }, LEN = BEL.x1 - BEL.x0, SC = -1.3, speed = 0.07, N = 6;
  const stripes = canvasTex(256, 64, (x, W, H) => { x.fillStyle = '#10163a'; x.fillRect(0, 0, W, H); x.fillStyle = '#1d2a66'; for (let i = 0; i < 8; i++) x.fillRect(i * 32, 0, 14, H); });
  stripes.tex.wrapS = stripes.tex.wrapT = THREE.RepeatWrapping; stripes.tex.repeat.set(6, 1);
  const belt = new THREE.Mesh(new RoundedBoxGeometryShim(LEN, 0.16, 1.4), new THREE.MeshStandardMaterial({ map: stripes.tex, roughness: 0.5, metalness: 0.3 })); belt.position.set((BEL.x0 + BEL.x1) / 2, BEL.y, 0); belt.receiveShadow = belt.castShadow = true; g.add(belt);
  const frame = rbox(LEN + 0.2, 0.22, 1.6, 0.06, M.metal(0x8a93ab)); frame.position.set(belt.position.x, BEL.y - 0.16, 0); g.add(frame);
  for (const sx of [-1, 1]) { const leg = rbox(0.18, 0.4, 1.5, 0.04, M.metal(0x8a93ab)); leg.position.set(belt.position.x + sx * (LEN / 2 - 0.3), 0.2, 0); g.add(leg); }
  const parcels = [];
  for (let i = 0; i < N; i++) {
    const b = rbox(0.8, 0.6, 0.72, 0.05, new THREE.MeshPhysicalMaterial({ color: i % 2 ? 0xf4f1ea : 0xd9b27a, roughness: 0.55, clearcoat: 0.1 })); g.add(b);
    const tape = rbox(0.18, 0.62, 0.74, 0.02, M.glow(C.gold)); tape.castShadow = false; b.add(tape);
    parcels.push(b);
  }
  // scanner arch
  const arch = new THREE.Group(); arch.position.set(SC, 0, 0); g.add(arch);
  for (const sz of [-0.95, 0.95]) { const p = rbox(0.2, 1.7, 0.2, 0.05, M.metal(0xb7bdcc)); p.position.set(0, 0.95, sz); arch.add(p); }
  const top = rbox(0.28, 0.24, 2.1, 0.06, M.metal(0xb7bdcc)); top.position.set(0, 1.9, 0); arch.add(top);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.5), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  beam.rotation.y = Math.PI / 2; beam.position.set(0, 1.1, 0); arch.add(beam);
  const shop = card(S, 'shopify', 1.9); shop.position.set(-4.1, 2.35, 0); face(shop, 0.35); g.add(shop);
  const ga = card(S, 'ga4', 1.8), ads = card(S, 'google-ads', 1.8), meta = card(S, 'meta', 1.8);
  [[ga, 3.7, 2.7, -1.6], [ads, 4.0, 1.75, -0.2], [meta, 3.7, 0.85, 1.3]].forEach(([c, x, y, z]) => { c.position.set(x, y, z); face(c, -0.55); g.add(c); });
  const tgt = [ga, ads, meta], f = (SC - BEL.x0) / LEN;
  const outs = tgt.map((c, k) => {
    const cv = curve([V(SC, 2.0, 0), V(SC + 1.3, 3.1 + k * 0.1, c.position.z * 0.35), V(c.position.x - 0.95, c.position.y + 0.1, c.position.z)]);
    pipe(g, cv, { r: 0.035, line: C.gold });
    return stream(g, cv, { n: N, speed, size: 0.08, color: C.gold, win: [f, 1] });
  });
  const board = canvasTex(512, 200, (x, W, H, t) => {
    const n = Math.floor(t * speed * N);
    x.fillStyle = '#071233'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2d4aa6'; x.lineWidth = 4; x.strokeRect(4, 4, W - 8, H - 8);
    x.font = '600 26px system-ui,sans-serif'; x.fillStyle = '#a9b4d6'; x.fillText('Store orders', 30, 56); x.fillText('Reports', 30, 120);
    x.font = '800 44px system-ui,sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'right'; x.fillText(String(100 + n), W - 150, 62); x.fillText(String(100 + n), W - 150, 126);
    x.fillStyle = '#19c37d'; x.font = '800 46px system-ui,sans-serif'; x.fillText('✓', W - 40, 126); x.textAlign = 'left';
    x.fillStyle = '#19c37d'; x.font = '600 24px system-ui,sans-serif'; x.fillText('Matched', 30, 176);
  });
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.9), new THREE.MeshBasicMaterial({ map: board.tex, toneMapped: false })); bd.position.set(SC, 3.05, 0); face(bd, 0.15); g.add(bd);
  addLabel(S, 'Your store', shop, 0.5, 1); addLabel(S, 'Every order tracked', arch, 2.3, 2); addLabel(S, 'Platforms', ga, 0.55, 3); addLabel(S, 'Matched to real orders', bd, 0.55, 4);
  return { update(t) {
    outs.forEach(s => s.update(t));
    stripes.tex.offset.x = -((t * speed * LEN) / (LEN / 6)) % 1;
    parcels.forEach((b, i) => { const p = (t * speed + i / N) % 1; b.position.set(BEL.x0 + p * LEN, BEL.y + 0.38, 0); b.rotation.y = Math.sin(i * 2.1) * 0.12; });
    let near = 0; parcels.forEach(b => { near = Math.max(near, 1 - clamp(Math.abs(b.position.x - SC) / 0.5)); });
    beam.material.opacity = 0.15 + near * 0.5; beam.scale.y = 0.9 + near * 0.15;
    board.redraw(t);
    [ga, ads, meta].forEach((c, i) => c.glow(pulse(t + i * 0.05, 1 / (speed * N)) * 0.9, C.gold));
  } };
}
function RoundedBoxGeometryShim(w, h, d) { return new THREE.BoxGeometry(w, h, d); }

/* 4. Server-side tracking: browser-only loses events; your server delivers them all */
export function serverSide(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const Z1 = -1.95, Z2 = 1.7;
  const w1 = browserWindow(1.9, 1.25); w1.position.set(-4.0, 1.0, Z1); face(w1, 0.5); g.add(w1);
  const w2 = browserWindow(1.9, 1.25); w2.position.set(-4.0, 1.0, Z2); face(w2, 0.5); g.add(w2);
  // ad blocker wall
  const wall = rbox(0.14, 1.7, 1.6, 0.05, M.glass(C.red, 0.4)); wall.castShadow = false; wall.position.set(0.7, 1.0, Z1); g.add(wall);
  const wallE = wire(new THREE.BoxGeometry(0.14, 1.7, 1.6), C.red); wallE.position.copy(wall.position); g.add(wallE);
  const warn = canvasTex(256, 256, x => { x.clearRect(0, 0, 256, 256); x.fillStyle = '#ff5a5f'; x.beginPath(); x.arc(128, 128, 100, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillRect(58, 108, 140, 40); });
  const stop = new THREE.Mesh(new THREE.CircleGeometry(0.32, 32), new THREE.MeshBasicMaterial({ map: warn.tex, transparent: true, toneMapped: false })); stop.position.set(0.7, 2.2, Z1); face(stop, 0.2); g.add(stop);
  // server rack
  const rack = rbox(1.4, 1.9, 1.2, 0.08, M.dark()); rack.position.set(-0.4, 0.95, Z2); g.add(rack);
  const leds = []; for (let i = 0; i < 6; i++) { const l = rbox(1.1, 0.07, 0.04, 0.02, M.emis(C.green, 2)); l.position.set(-0.4, 0.35 + i * 0.28, Z2 + 0.62); g.add(l); leds.push(l); }
  const gc = card(S, 'google-cloud', 1.5); gc.position.set(-0.4, 2.4, Z2); face(gc, 0.15); g.add(gc);
  const adsT = card(S, 'google-ads', 1.7); adsT.position.set(2.95, 1.1, Z1); face(adsT, -0.45); g.add(adsT);
  const dst = column(S, ['tiktok', 'meta', 'google-ads'], 4.2, 0.5, 0.7, 1.5, 1).reverse(); dst.forEach(c => { c.position.z += Z2 - 0.4; g.add(c); });
  const c1 = curve([V(-3.3, 1.1, Z1), V(-1.5, 1.1, Z1), V(0.4, 1.1, Z1), V(1.95, 1.1, Z1)]); pipe(g, c1, { r: 0.05 });
  const s1 = stream(g, c1, { n: 12, speed: 0.09, size: 0.075, color: C.ice, fn: (u, i, cy, col) => {
    const lost = hash(i * 3.1 + cy * 7.7) < 0.55;
    if (lost) { if (u > 0.6) return { s: 1 - smooth(0.64, 0.7, u), color: C.red }; }
    return { s: 1, color: C.ice };
  } });
  const c2a = curve([V(-3.3, 1.1, Z2), V(-2.0, 1.1, Z2), V(-1.1, 1.1, Z2)]); pipe(g, c2a, { r: 0.05 });
  const s2a = stream(g, c2a, { n: 6, speed: 0.09, size: 0.075, color: C.ice });
  const outs = dst.map((c, i) => { const cv = curve([V(0.3, 1.1, Z2), V(1.5, 1.2, Z2 + (c.position.z - Z2) * 0.4), V(c.position.x - 0.9, c.position.y + 0.05, c.position.z)]); pipe(g, cv, { r: 0.045 }); return stream(g, cv, { n: 4, speed: 0.09, size: 0.075, color: C.green, offset: 0.15 * i }); });
  addLabel(S, 'Every event delivered', dst[0], 0.55, 3, 'good'); addLabel(S, 'Today: browser only', w1, 1.1, 1); addLabel(S, 'Ad blockers drop events', wall, 1.5, 0, 'bad'); addLabel(S, 'Your own server', gc, 0.5, 2);
  return { update(t) {
    s1.update(t); s2a.update(t); outs.forEach(s => s.update(t));
    w1.userData.screen.redraw(t); w2.userData.screen.redraw(t + 0.5);
    leds.forEach((l, i) => { l.material.emissiveIntensity = 0.6 + 1.6 * (0.5 + 0.5 * Math.sin(t * 5 + i * 1.3)); });
    wall.material.opacity = 0.32 + 0.12 * Math.sin(t * 3); stop.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
    adsT.glow(0.25 + 0.2 * Math.sin(t * 2), C.red); dst.forEach((c, i) => c.glow(pulse(t + i * 0.2, 1 / (0.09 * 4)) * 0.8, C.green));
  } };
}

/* 5. Consent and privacy: the visitor's choice opens or closes the gate for every tag */
export function consent(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const CYC = 7;
  const banner = rbox(2.5, 1.6, 0.1, 0.1, M.white()); banner.position.set(-4.0, 1.35, 0.3); face(banner, 0.42); g.add(banner);
  const btn = canvasTex(500, 320, (x, W, H, t) => {
    const sel = Math.floor(t / CYC) % 3, ph = (t % CYC) / CYC;
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#0a1a47'; x.font = '800 36px system-ui,sans-serif'; x.fillText('Your privacy choices', 28, 62);
    x.fillStyle = '#56617d'; x.font = '24px system-ui,sans-serif'; x.fillText('Choose what this site may use.', 28, 104);
    const labels = ['Accept', 'Partial', 'Reject'], cols = ['#19c37d', '#ffc21a', '#ff5a5f'];
    labels.forEach((l, i) => { const on = i === sel && ph > 0.08; x.fillStyle = on ? cols[i] : '#e6eaf5'; x.beginPath(); x.roundRect(28 + i * 152, 170, 140, 70, 18); x.fill(); x.fillStyle = on ? '#071233' : '#56617d'; x.font = '700 28px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(l, 98 + i * 152, 215); x.textAlign = 'left'; });
  });
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.472), new THREE.MeshBasicMaterial({ map: btn.tex, toneMapped: false })); bs.position.z = 0.056; banner.add(bs);
  const ids = ['cookiebot', 'onetrust', 'usercentrics', 'termly'];
  const cmp = column(S, ids.slice().reverse(), -1.85, 0.55, 0.8, 1.5, -1).reverse(); cmp.forEach(c => g.add(c));
  const gate = new THREE.Group(); gate.position.set(0.9, 1.3, 0); gate.rotation.y = Math.PI / 2 - 0.8; g.add(gate);
  const rg = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.1, 24, 96), M.metal(0xd7dbe4)); rg.castShadow = true; gate.add(rg);
  const rgl = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.035, 12, 96), M.glow(C.green)); rgl.position.z = 0.1; gate.add(rgl);
  const spin = new THREE.Group(); gate.add(spin);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, b = rbox(0.2, 0.08, 0.14, 0.03, M.emis(C.gold, 1.2)); b.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0); b.rotation.z = a; spin.add(b); }
  const fieldMat = new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const field = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), fieldMat); gate.add(field);
  const ped = pedestal(0.7, 0.2); ped.position.set(0.9, 0, 0); g.add(ped);
  const ga = card(S, 'ga4', 1.75), ads = card(S, 'google-ads', 1.75), meta = card(S, 'meta', 1.75), tg = [ga, ads, meta];
  [[ga, 3.9, 2.1, -1.0], [ads, 4.1, 1.25, 0.2], [meta, 3.9, 0.45, 1.4]].forEach(([c, x, y, z]) => { c.position.set(x, y, z); face(c, -0.5); g.add(c); });
  const cIn = curve([V(-1.4, 1.3, 0), V(-0.2, 1.3, 0), V(0.75, 1.3, 0)]); pipe(g, cIn, { r: 0.05 });
  const cTok = curve([banner.position.clone().add(V(1.2, 0.2, 0)), V(-3.3, 1.9, 0.1), V(-2.4, 1.6, 0.0)]); const sTok = stream(g, cTok, { n: 4, speed: 0.16, size: 0.07, color: C.gold });
  const state = t => Math.floor(t / CYC) % 3;
  const colOf = s => [C.green, C.gold, C.red][s];
  const sIn = stream(g, cIn, { n: 8, speed: 0.11, size: 0.075, color: C.ice, fn: (u, i, cy, col, tt) => { const s = state(tt); if (u > 0.9 && s === 2) return { s: 1 - smooth(0.92, 1, u), color: C.red }; return { s: 1, color: u > 0.55 ? colOf(s) : C.ice }; } });
  const outs = tg.map((c, i) => { const cv = curve([V(1.05, 1.3, 0), V(2.4, 1.4 + (c.position.y - 1.3) * 0.5, c.position.z * 0.5), V(c.position.x - 0.95, c.position.y, c.position.z)]); pipe(g, cv, { r: 0.04 }); return stream(g, cv, { n: 4, speed: 0.11, size: 0.07, color: C.green, offset: i * 0.2, fn: (u, k, cy, col, tt) => { const s = state(tt); const allowed = s === 0 || (s === 1 && i === 0); return { s: allowed ? 1 : 0, color: C.green }; } }); });
  addLabel(S, 'Visitor chooses', banner, 1.1, 1); addLabel(S, 'Consent platform', cmp[3], 0.55, 2); addLabel(S, 'Consent Mode v2', rg, 1.45, 3); addLabel(S, 'Your tags', ga, 0.55, 4);
  return { update(t) {
    const s = state(t), col = colOf(s);
    sTok.update(t); sIn.update(t); outs.forEach(o => o.update(t));
    btn.redraw(t);
    fieldMat.color.set(col); rgl.material.color.set(col); fieldMat.opacity = 0.14 + 0.1 * Math.sin(t * 3);
    spin.rotation.z = t * 0.35;
    tg.forEach((c, i) => { const allowed = s === 0 || (s === 1 && i === 0); lit(c, allowed); if (allowed) c.glow(0.5 + 0.3 * Math.sin(t * 4 + i), C.green); });
    cmp.forEach((c, i) => c.glow(pulse(t + i * 0.3, 2.5) * 0.5, C.gold));
  } };
}

/* 6. Ad platforms: one definition of a conversion, sent identically to every platform */
export function adPlatforms(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const cr = new THREE.Group(); cr.position.set(0.4, 1.7, 0); g.add(cr);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), new THREE.MeshPhysicalMaterial({ color: 0xffc21a, roughness: 0.06, metalness: 0.2, clearcoat: 1, emissive: 0xf2780c, emissiveIntensity: 0.55, flatShading: true })); gem.castShadow = true; cr.add(gem);
  cr.add(wire(new THREE.OctahedronGeometry(1.2, 0), C.ice));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,194,26,.95)', 'rgba(255,194,26,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(4.2); cr.add(halo);
  const ped = pedestal(0.85, 0.25); ped.position.set(0.4, 0, 0); g.add(ped);
  const rg = ring(0.95, 0.03, C.gold); rg.rotation.x = Math.PI / 2; rg.position.set(0.4, 0.3, 0); g.add(rg);
  const ids = ['google-ads', 'meta', 'tiktok', 'snapchat', 'linkedin', 'pinterest'];
  const cards = column(S, ids.slice().reverse(), 4.0, 0.35, 0.62, 1.5, 1).reverse(); cards.forEach(c => g.add(c));
  const outs = cards.map((c, i) => { const tgt = c.position.clone().add(V(-0.95, 0, 0)); const cv = curve([cr.position.clone().add(V(0.9, 0, 0)), cr.position.clone().lerp(tgt, 0.5).add(V(0, 0.2, 0)), tgt]); pipe(g, cv, { r: 0.04 }); return stream(g, cv, { n: 4, speed: 0.12, size: 0.07, color: C.gold, offset: i * 0.17 }); });
  const web = browserWindow(1.7, 1.1); web.position.set(-4.3, 1.0, 1.7); face(web, 0.55); g.add(web);
  const ph = phone('ios'); ph.position.set(-4.7, 1.0, -0.2); face(ph, 0.6); ph.scale.setScalar(0.85); g.add(ph);
  const crm = rbox(1.2, 0.9, 1.0, 0.08, M.navy()); crm.position.set(-4.2, 0.45, -1.9); face(crm, 0.5); g.add(crm);
  const crmT = canvasTex(256, 128, x => { x.fillStyle = '#0f1f55'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#ffc21a'; x.font = '800 70px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('CRM', 128, 90); });
  const crmF = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshBasicMaterial({ map: crmT.tex, toneMapped: false })); crmF.position.set(0, 0.0, 0.51); crm.add(crmF);
  const src = [web, ph, crm].map((d, i) => { const cv = curve([d.position.clone().add(V(0.7, 0.5, 0)), d.position.clone().lerp(cr.position, 0.5).add(V(0, 0.6, 0)), cr.position.clone().add(V(-1.0, 0, 0))]); pipe(g, cv, { r: 0.045 }); return stream(g, cv, { n: 5, speed: 0.1, size: 0.07, color: i === 2 ? C.green : C.ice, offset: i * 0.25 }); });
  addLabel(S, 'Your sources', ph, 1.35, 1); addLabel(S, 'One definition of a sale', cr, 1.55, 2); addLabel(S, 'Ad platforms', cards[0], 0.55, 3); addLabel(S, 'Closed deals flow back', crm, 0.6);
  return { update(t) {
    outs.forEach(s => s.update(t)); src.forEach(s => s.update(t));
    cr.rotation.y = t * 0.7; cr.position.y = 1.7 + Math.sin(t * 1.3) * 0.08; halo.scale.setScalar(4 + Math.sin(t * 2.4) * 0.3);
    gem.material.emissiveIntensity = 0.45 + 0.2 * Math.sin(t * 2.4);
    web.userData.screen.redraw(t); ph.userData.screen.redraw(t);
    cards.forEach((c, i) => c.glow(pulse(t + i * 0.17, 1 / (0.12 * 4)) * 0.8, C.gold));
  } };
}

/* 7. Data and reporting: scattered sources -> warehouse -> one dashboard */
export function reporting(S) {
  const g = new THREE.Group(); S.scene.add(g);
  const wh = new THREE.Group(); wh.position.set(0.0, 0, 0); g.add(wh);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.5, 64), M.navy()); d.position.y = 0.3 + i * 0.66; d.castShadow = d.receiveShadow = true; wh.add(d);
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.01, 0.035, 12, 96), M.glow(i === 1 ? C.gold : C.ice)); r.rotation.x = Math.PI / 2; r.position.y = d.position.y + 0.12; wh.add(r); rings.push(r);
    const led = rbox(0.5, 0.06, 0.05, 0.02, M.emis(C.green, 2)); led.position.set(0, d.position.y - 0.05, 1.01); wh.add(led);
  }
  const bq = card(S, 'bigquery', 1.45), sf = card(S, 'snowflake', 1.45); bq.position.set(-1.0, 0.5, 1.6); sf.position.set(1.0, 0.5, 1.6); face(bq, 0.1); face(sf, -0.1); g.add(bq, sf);
  const ids = ['ga4', 'google-ads', 'meta', 'shopify'];
  const cards = column(S, ids.slice().reverse(), -4.1, 0.55, 0.9, 1.6, -1).reverse(); cards.forEach(c => g.add(c));
  const ins = cards.map((c, i) => { const src = c.position.clone().add(V(0.95, 0, 0)); const cv = curve([src, src.clone().lerp(V(0, 2.1, 0), 0.5).add(V(0, 0.5, 0)), V(0.0, 2.15, 0)]); pipe(g, cv, { r: 0.045 }); return stream(g, cv, { n: 5, speed: 0.1, size: 0.07, color: [C.ice, C.blue, C.ice, C.green][i], offset: i * 0.2 }); });
  const dash = monitor(3.1, 1.95, (x, W, H, t) => {
    x.fillStyle = '#0b1636'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffc21a'; x.fillRect(28, 26, 140, 16); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(28, 56, 360, 10);
    const bars = [0.5, 0.7, 0.45, 0.85, 0.65, 0.95, 0.75];
    for (let i = 0; i < bars.length; i++) { const k = clamp(((t * 0.35 - i * 0.06) % 3), 0, 1), h = bars[i] * 260 * (0.6 + 0.4 * Math.sin(t * 0.8 + i)) * smooth(0, 1, k + 0.3); x.fillStyle = i % 2 ? '#5b8cff' : '#ffc21a'; x.fillRect(40 + i * 52, 330 - h, 36, h); }
    x.strokeStyle = '#19c37d'; x.lineWidth = 5; x.beginPath(); for (let i = 0; i <= 20; i++) { const px = 440 + i * 14, py = 120 - Math.sin(i * 0.5 + t * 1.4) * 30 - i * 2; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    const a = (t * 0.5) % (Math.PI * 2); x.lineWidth = 26; x.strokeStyle = '#ffc21a'; x.beginPath(); x.arc(560, 280, 52, -1.57, a - 1.57); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(560, 280, 52, a - 1.57, 4.7); x.stroke();
    x.fillStyle = '#fff'; x.font = '800 40px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(String(Math.floor(40 + (t * 3) % 60)) + '%', 560, 292); x.textAlign = 'left';
  });
  dash.position.set(3.75, 1.7, 0.2); face(dash, -0.55); g.add(dash);
  const tabs = ['looker', 'powerbi', 'tableau'].map((id, i) => { const c = card(S, id, 1.0); c.position.set(2.3 + i * 1.15, 3.35 - i * 0.1, -0.6 + i * 0.3); face(c, -0.5); g.add(c); return c; });
  const co = curve([V(1.1, 1.35, 0), V(1.8, 1.5, 0.1), V(2.55, 1.6, 0.25)]); pipe(g, co, { r: 0.06, line: C.gold });
  const so = stream(g, co, { n: 6, speed: 0.12, size: 0.08, color: C.gold });
  const dict = ring(1.4, 0.03, C.gold); dict.rotation.x = Math.PI / 2; dict.position.set(0, 1.0, 0); g.add(dict);
  addLabel(S, 'Your data', cards[0], 0.55, 1); addLabel(S, 'Warehouse', wh, 2.2, 2); addLabel(S, 'One set of definitions', V(0, 1.0, 1.45), 0, 3); addLabel(S, 'Dashboards', dash, 2.1, 4);
  return { update(t) {
    ins.forEach(s => s.update(t)); so.update(t); dash.userData.screen.redraw(t);
    rings.forEach((r, i) => { r.material.opacity = 1; r.scale.setScalar(1 + 0.012 * Math.sin(t * 3 + i)); });
    dict.rotation.z = t * 0.5; dict.scale.setScalar(1 + 0.03 * Math.sin(t * 2));
    cards.forEach((c, i) => c.glow(pulse(t + i * 0.2, 1 / 0.5) * 0.4, C.ice)); tabs.forEach((c, i) => c.position.y = 3.35 - i * 0.1 + Math.sin(t * 1.3 + i) * 0.05);
  } };
}

export const SCENES = { analytics, app, ecommerce, 'server-side': serverSide, consent, 'ad-platforms': adPlatforms, reporting };
