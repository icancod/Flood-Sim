import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================
// FLOOD MONITORING TESTBED — 3D REFERENCE-BASED RECONSTRUCTION
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9eef2);

const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(11, 10, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.style.cssText =
  'margin:0;overflow:hidden;font-family:Arial,sans-serif;';
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 7;
controls.maxDistance = 27;
controls.maxPolarAngle = Math.PI / 2.05;

// ============================================================
// LIGHTING
// ============================================================

scene.add(new THREE.HemisphereLight(0xffffff, 0x8495a5, 2.2));

const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-5, 14, 9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd9edff, 1.3);
fillLight.position.set(8, 8, -8);
scene.add(fillLight);

// ============================================================
// MATERIALS
// ============================================================

const M = {
  frame: new THREE.MeshStandardMaterial({
    color: 0x202a35,
    metalness: 0.72,
    roughness: 0.32,
  }),
  metal: new THREE.MeshStandardMaterial({
    color: 0x9aa9b4,
    metalness: 0.72,
    roughness: 0.3,
  }),
  acrylic: new THREE.MeshPhysicalMaterial({
    color: 0xc9e6f3,
    transparent: true,
    opacity: 0.24,
    roughness: 0.12,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  water: new THREE.MeshPhysicalMaterial({
    color: 0x159bd1,
    transparent: true,
    opacity: 0.76,
    roughness: 0.12,
    metalness: 0.04,
    side: THREE.DoubleSide,
  }),
  waterDark: new THREE.MeshStandardMaterial({
    color: 0x0876a8,
    transparent: true,
    opacity: 0.83,
  }),
  bluePipe: new THREE.MeshStandardMaterial({
    color: 0x287ac4,
    metalness: 0.25,
    roughness: 0.32,
  }),
  greyPipe: new THREE.MeshStandardMaterial({
    color: 0x929da6,
    metalness: 0.6,
    roughness: 0.32,
  }),
  black: new THREE.MeshStandardMaterial({ color: 0x222a31 }),
  road: new THREE.MeshStandardMaterial({ color: 0x343a40, roughness: 0.9 }),
  soil: new THREE.MeshStandardMaterial({ color: 0x80583b, roughness: 1 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x63894d }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2b92d }),
  red: new THREE.MeshStandardMaterial({ color: 0xd8483e }),
  green: new THREE.MeshStandardMaterial({ color: 0x2ba66b }),
  white: new THREE.MeshStandardMaterial({ color: 0xf5f5f1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb28a60, roughness: 0.8 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x13734c }),
  darkGlass: new THREE.MeshPhysicalMaterial({
    color: 0x142331,
    transparent: true,
    opacity: 0.3,
    roughness: 0.15,
    side: THREE.DoubleSide,
  }),
};

// ============================================================
// GEOMETRY HELPERS
// ============================================================

function box(name, x, y, z, w, h, d, material, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(name, x, y, z, radius, height, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 24),
    material
  );
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function pipe(name, points, radius = 0.075, material = M.greyPipe) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p))
  );
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, radius, 12, false),
    material
  );
  mesh.name = name;
  mesh.castShadow = true;
  scene.add(mesh);
  return mesh;
}

function label3D(text, x, y, z, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 110;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#102f50';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 70);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthTest: false,
    })
  );
  sprite.position.set(x, y, z);
  sprite.scale.set(2.5 * scale, 0.55 * scale, 1);
  scene.add(sprite);
  return sprite;
}

function acrylicTank(name, x, y, z, w, h, d, waterLevel) {
  // Bottom
  box(name + ' bottom', x, y, z, w, 0.1, d, M.acrylic);

  // Four transparent sides
  box(name + ' front', x, y + h / 2, z + d / 2, w, h, 0.055, M.acrylic);

  box(name + ' back', x, y + h / 2, z - d / 2, w, h, 0.055, M.acrylic);

  box(name + ' left', x - w / 2, y + h / 2, z, 0.055, h, d, M.acrylic);

  box(name + ' right', x + w / 2, y + h / 2, z, 0.055, h, d, M.acrylic);

  const water = box(
    name + ' water',
    x,
    y + 0.08 + waterLevel / 2,
    z,
    w - 0.13,
    waterLevel,
    d - 0.13,
    M.water
  );

  water.userData.baseY = y + 0.08;
  water.userData.maxLevel = h - 0.16;
  water.userData.initialLevel = waterLevel;

  return water;
}

// Sloping channel made from a floor and two side walls.
function slopingChannel(name, start, end, width, wallHeight) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const centre = a.clone().add(b).multiplyScalar(0.5);
  const angle = Math.atan2(direction.y, direction.x);

  const group = new THREE.Group();
  group.name = name;
  scene.add(group);

  const floor = box(
    name + ' floor',
    0,
    0,
    0,
    length,
    0.13,
    width,
    M.acrylic,
    group
  );
  floor.position.copy(centre);
  floor.rotation.z = angle;

  for (const side of [-1, 1]) {
    const wall = box(
      name + ' side wall',
      0,
      0,
      0,
      length,
      wallHeight,
      0.06,
      M.acrylic,
      group
    );
    wall.position.copy(centre);
    wall.position.z += (side * width) / 2;
    wall.y += (wallHeight / 2) * Math.cos(angle);
    wall.rotation.z = angle;
  }

  const water = box(
    name + ' water',
    0,
    0,
    0,
    length - 0.15,
    0.22,
    width - 0.14,
    M.water,
    group
  );
  water.position.copy(centre);
  water.position.y += 0.12;
  water.rotation.z = angle;
  water.userData.baseY = water.position.y;
  water.userData.maxLevel = 0.62;
  water.userData.slopeAngle = angle;

  return { group, water, start, end };
}

// ============================================================
// BASE AND MULTI-LEVEL SUPPORT FRAME
// ============================================================

// Wooden tabletop
box('Wooden workbench top', 0, 0, 0, 14.5, 0.25, 7.6, M.wood);

// Main lower metal legs
for (const x of [-6.8, 6.8]) {
  for (const z of [-3.35, 3.35]) {
    box('Main support leg', x, -1.0, z, 0.16, 1.8, 0.16, M.frame);
  }
}

// Upper reservoir platform on left
box('Elevated reservoir platform', -5.0, 2.0, -1.25, 3.6, 0.16, 2.7, M.frame);

for (const x of [-6.55, -3.45]) {
  for (const z of [-2.3, -0.2]) {
    box('Elevated reservoir stand', x, 1.15, z, 0.14, 1.65, 0.14, M.frame);
  }
}

// Lower drainage support
box('Drainage support platform', 2.0, 0.85, 1.0, 5.2, 0.13, 2.1, M.frame);

// Rain tray support
box('Rain tray support', 1.0, 2.15, -2.2, 3.8, 0.12, 2.2, M.frame);

for (const x of [-0.75, 2.75]) {
  for (const z of [-3.1, -1.3]) {
    box('Rain tray support leg', x, 1.35, z, 0.11, 1.55, 0.11, M.frame);
  }
}

// ============================================================
// A. ELEVATED RESERVOIR / DAM
// ============================================================

const reservoirWater = acrylicTank(
  'A Reservoir',
  -5.0,
  2.12,
  -1.25,
  3.0,
  1.5,
  2.15,
  0.9
);

// Outlet pipe and valve
pipe(
  'Reservoir outlet pipe',
  [
    [-3.5, 2.55, -1.25],
    [-3.1, 2.55, -1.25],
    [-3.1, 1.55, -1.25],
    [-2.75, 1.55, -1.25],
  ],
  0.09,
  M.greyPipe
);

cylinder('Reservoir outlet valve', -3.0, 1.85, -1.25, 0.15, 0.12, M.red);

box('Valve handle', -3.0, 2.0, -1.25, 0.55, 0.07, 0.09, M.red);

// Dam gate inside outlet side
box('Dam gate', -3.45, 2.75, -1.25, 0.08, 0.95, 0.85, M.yellow);

label3D('A  RESERVOIR / DAM', -5.0, 4.05, -2.45);

// Water-level sensor on reservoir
box('ME201W sensor head', -4.5, 3.65, -1.25, 0.48, 0.3, 0.24, M.dark);

box('ME201W sensor indicator', -4.5, 3.65, -1.1, 0.2, 0.14, 0.04, M.green);

pipe(
  'Reservoir sensor cable',
  [
    [-4.5, 3.5, -1.25],
    [-4.5, 2.5, -1.25],
  ],
  0.025,
  M.black
);

// ============================================================
// B. SLOPING RIVER CHANNEL
// ============================================================

// River runs from elevated left to lower centre-right.
const river = slopingChannel(
  'B River channel',
  [-3.0, 1.65, 0.0],
  [2.5, 0.85, 0.0],
  1.35,
  0.62
);

label3D('B  RIVER CHANNEL', -0.3, 1.9, 0.95);

// Flow direction arrows
const flowArrows = [];

for (let i = 0; i < 4; i++) {
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 16), M.white);
  arrow.rotation.z = -Math.PI / 2;
  arrow.position.set(-2.1 + i * 1.2, 1.5 - i * 0.15, 0);
  scene.add(arrow);
  flowArrows.push(arrow);
}

// YF-DN50 flowmeter on pipe
cylinder('YF-DN50 flowmeter', -2.85, 1.55, 0.9, 0.2, 0.42, M.yellow);

box('Flowmeter display', -2.85, 1.78, 0.9, 0.28, 0.14, 0.09, M.dark);

label3D('YF-DN50 FLOW SENSOR', -2.8, 2.3, 1.1, 0.8);

// ============================================================
// RAINFALL SIMULATOR AND SOIL TRAY
// ============================================================

// Tray floor and transparent walls
const soilTrayX = 1.0;
const soilTrayZ = -2.2;

box('Soil tray base', soilTrayX, 2.35, soilTrayZ, 3.6, 0.14, 1.9, M.acrylic);

box('Soil tray soil', soilTrayX, 2.5, soilTrayZ, 3.4, 0.25, 1.72, M.soil);

box(
  'Soil tray front wall',
  soilTrayX,
  2.7,
  soilTrayZ + 0.95,
  3.6,
  0.65,
  0.06,
  M.acrylic
);

box(
  'Soil tray back wall',
  soilTrayX,
  2.7,
  soilTrayZ - 0.95,
  3.6,
  0.65,
  0.06,
  M.acrylic
);

box(
  'Soil tray left wall',
  soilTrayX - 1.8,
  2.7,
  soilTrayZ,
  0.06,
  0.65,
  1.9,
  M.acrylic
);

box(
  'Soil tray right wall',
  soilTrayX + 1.8,
  2.7,
  soilTrayZ,
  0.06,
  0.65,
  1.9,
  M.acrylic
);

// Small plants
for (let i = 0; i < 12; i++) {
  const x = 1.0 + (Math.random() - 0.5) * 2.9;
  const z = -2.2 + (Math.random() - 0.5) * 1.4;

  cylinder('Plant stem', x, 2.82, z, 0.025, 0.35, M.grass);

  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), M.grass);
  leaf.scale.set(1.6, 0.5, 0.7);
  leaf.position.set(x + 0.1, 2.98, z);
  scene.add(leaf);
}

// Rainfall frame
pipe(
  'Rainfall frame left',
  [
    [-0.7, 4.2, -2.2],
    [-0.7, 2.8, -2.2],
  ],
  0.055,
  M.frame
);

pipe(
  'Rainfall frame right',
  [
    [2.7, 4.2, -2.2],
    [2.7, 2.8, -2.2],
  ],
  0.055,
  M.frame
);

pipe(
  'Rainfall overhead bar',
  [
    [-0.7, 4.2, -2.2],
    [2.7, 4.2, -2.2],
  ],
  0.075,
  M.frame
);

// Spray nozzles
for (let x = -0.35; x <= 2.35; x += 0.9) {
  cylinder('Rain spray nozzle', x, 4.0, -2.2, 0.07, 0.25, M.black);
}

// Soil moisture sensor
box('SEN17731 sensor board', 1.65, 2.95, -2.2, 0.17, 0.32, 0.12, M.green);

pipe(
  'Soil sensor probe',
  [
    [1.65, 2.8, -2.2],
    [1.65, 2.55, -2.2],
  ],
  0.035,
  M.metal
);

label3D('RAINFALL / SOIL TEST', 1.0, 4.65, -3.3);

// BME688 weather shield on raised post
cylinder('BME688 weather station post', 3.25, 3.15, -2.2, 0.045, 2.1, M.metal);

for (let i = 0; i < 5; i++) {
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42 - i * 0.025, 0.42 - i * 0.025, 0.08, 24),
    M.white
  );
  plate.position.set(3.25, 4.15 - i * 0.13, -2.2);
  scene.add(plate);
}

label3D('BME688', 3.5, 4.8, -2.2, 0.8);

// ============================================================
// C. URBAN DRAINAGE CHANNEL AND BLOCKAGE
// ============================================================

const drainageWater = acrylicTank(
  'C Urban drainage',
  3.6,
  0.92,
  0.3,
  2.6,
  0.65,
  1.35,
  0.22
);

// Drainage floor
box('Drainage channel floor', 3.6, 0.9, 0.3, 2.6, 0.12, 1.35, M.acrylic);

// Blockage cage
box('Blockage frame top', 3.1, 1.75, 0.3, 0.75, 0.08, 1.2, M.metal);

for (const z of [-0.25, 0.85]) {
  box('Blockage cage side', 3.1, 1.5, z, 0.75, 0.45, 0.06, M.metal);
}

// Red removable blockage plate
const blockagePlate = box(
  'Removable blockage plate',
  3.1,
  1.3,
  0.3,
  0.48,
  0.4,
  0.85,
  M.red
);

label3D('C  URBAN DRAINAGE', 3.6, 2.0, 1.25);

// ============================================================
// D. ROAD FLOOD ZONE
// ============================================================

box('Road foundation', 6.15, 0.9, 0.3, 2.7, 0.18, 1.8, M.concrete);

box('Road asphalt', 6.15, 1.02, 0.3, 2.58, 0.08, 1.7, M.road);

// Yellow road edges
for (const z of [-0.5, 1.1]) {
  box('Yellow road edge', 6.15, 1.08, z, 2.55, 0.025, 0.07, M.yellow);
}

// Lane markings
for (const x of [5.3, 6.15, 7.0]) {
  box('Road lane marking', x, 1.08, 0.3, 0.06, 0.02, 0.55, M.white);
}

// Flood water surface
const roadWater = box(
  'Road flood water',
  6.15,
  1.12,
  0.3,
  2.45,
  0.04,
  1.55,
  M.water
);

// Flood water boundary sensor
box('XKC Y25 sensor', 7.1, 1.65, 1.0, 0.22, 0.42, 0.22, M.dark);

box('XKC sensor indicator', 7.1, 1.8, 1.0, 0.12, 0.08, 0.05, M.yellow);

label3D('D  ROAD FLOOD ZONE', 6.15, 2.0, 1.45);

// ============================================================
// E. COLLECTION SUMP AND SUBMERSIBLE PUMP
// ============================================================

const sumpWater = acrylicTank(
  'E Collection sump',
  -4.6,
  0.28,
  2.65,
  2.7,
  1.15,
  1.9,
  0.55
);

// Pump body
cylinder('Submersible pump', -4.6, 0.68, 2.65, 0.32, 0.68, M.bluePipe);

cylinder('Pump upper housing', -4.6, 1.05, 2.65, 0.25, 0.16, M.black);

pipe(
  'Pump suction pipe',
  [
    [-4.6, 0.95, 2.65],
    [-4.6, 1.45, 2.65],
    [-3.7, 1.45, 2.65],
    [-3.7, 2.4, 2.65],
  ],
  0.075,
  M.bluePipe
);

label3D('E  COLLECTION SUMP & PUMP', -4.6, 1.9, 3.8, 0.9);

// ============================================================
// RECIRCULATION PIPEWORK
// ============================================================

// Main blue riser at left side, as in the reference image.
pipe(
  'Blue rising recirculation pipe',
  [
    [-4.6, 1.45, 2.65],
    [-6.6, 1.45, 2.65],
    [-6.6, 3.5, 2.65],
    [-6.6, 4.0, 1.5],
    [-6.6, 4.0, -1.25],
    [-6.1, 3.9, -1.25],
  ],
  0.105,
  M.bluePipe
);

// Drainage to collection sump
pipe(
  'Drain to sump pipe',
  [
    [4.9, 1.0, 0.3],
    [5.2, 0.7, 0.3],
    [5.2, 0.35, 2.0],
    [-3.2, 0.35, 2.0],
    [-3.2, 0.6, 2.65],
    [-3.3, 0.6, 2.65],
  ],
  0.075,
  M.greyPipe
);

// Rain tray runoff to drainage
pipe(
  'Soil runoff pipe',
  [
    [2.8, 2.4, -1.3],
    [3.0, 1.8, -1.3],
    [3.6, 1.4, -1.3],
    [3.6, 1.2, -0.5],
  ],
  0.055,
  M.greyPipe
);

// ============================================================
// ESP32 ELECTRONICS ENCLOSURE
// ============================================================

box('Electronics enclosure base', 0.0, 0.55, 3.0, 2.3, 0.1, 1.45, M.acrylic);

box('Electronics enclosure front', 0.0, 1.05, 3.72, 2.3, 1.0, 0.05, M.acrylic);

box('Electronics enclosure rear', 0.0, 1.05, 2.28, 2.3, 1.0, 0.05, M.acrylic);

box('Electronics enclosure left', -1.15, 1.05, 3.0, 0.05, 1.0, 1.45, M.acrylic);

box('Electronics enclosure right', 1.15, 1.05, 3.0, 0.05, 1.0, 1.45, M.acrylic);

box('ESP32 PCB', 0, 0.85, 3.0, 1.0, 0.07, 0.65, M.pcb);

box('ESP32 metal shield', 0, 0.94, 3.0, 0.42, 0.1, 0.42, M.metal);

for (let i = 0; i < 4; i++) {
  cylinder('ESP32 pin', -0.35 + i * 0.23, 0.95, 2.72, 0.025, 0.13, M.yellow);
}

label3D('ESP32 CONTROLLER', 0, 1.9, 3.9);

// ============================================================
// RAIN PARTICLES
// ============================================================

const rainGroup = new THREE.Group();
scene.add(rainGroup);

const drops = [];

for (let i = 0; i < 140; i++) {
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0x55c9f4 })
  );

  drop.position.set(
    -0.6 + Math.random() * 3.2,
    2.7 + Math.random() * 1.5,
    -3.0 + Math.random() * 1.5
  );

  rainGroup.add(drop);
  drops.push(drop);
}

// ============================================================
// WATER FLOW PARTICLES
// ============================================================

const flowParticles = [];

for (let i = 0; i < 22; i++) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xb9edff })
  );
  particle.position.set(
    -2.8 + Math.random() * 5.0,
    1.4,
    (Math.random() - 0.5) * 0.7
  );
  scene.add(particle);
  flowParticles.push(particle);
}

// ============================================================
// GROUND AND PRESENTATION
// ============================================================

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xe8e8e5, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.92;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(40, 40, 0xc1cbd3, 0xd6dde2);
grid.position.y = -1.9;
scene.add(grid);

// ============================================================
// HTML PRESENTATION AND SIMULATION PANEL
// ============================================================

const ui = document.createElement('div');

ui.innerHTML = `
<style>
#header {
  position:absolute;top:12px;left:16px;
  background:linear-gradient(110deg,#102f57,#164d7d);
  color:white;padding:12px 20px;border-radius:10px;
  box-shadow:0 4px 15px #0003;pointer-events:none;
}
#header h1 {font-size:20px;margin:0 0 4px}
#header p {font-size:12px;margin:0;opacity:.9}
#rightPanel {
  position:absolute;right:12px;top:12px;width:285px;
  max-height:calc(100vh - 24px);overflow-y:auto;
  color:#17283a;font-family:Arial,sans-serif;
}
.panel {
  background:rgba(255,255,255,.96);
  border:1px solid #9aafc2;border-radius:10px;
  margin-bottom:10px;overflow:hidden;
  box-shadow:0 3px 12px #0002;
}
.panelTitle {
  background:#123c68;color:white;padding:9px 12px;
  font-size:15px;font-weight:bold;
}
.panelBody {padding:10px 12px;font-size:11px;line-height:1.5}
.panelBody strong {color:#123c68}
.sensorRow {
  display:flex;justify-content:space-between;gap:8px;
  border-bottom:1px solid #dce2e8;padding:5px 0;
}
#simControls {
  position:absolute;left:12px;bottom:12px;width:265px;
  background:rgba(17,42,65,.96);color:white;
  padding:14px;border-radius:10px;
  font-family:Arial,sans-serif;box-shadow:0 4px 18px #0004;
}
#simControls h3 {font-size:15px;margin:0 0 10px}
#simControls label {display:flex;justify-content:space-between;
  font-size:11px;margin:10px 0 4px}
#simControls input {width:100%;accent-color:#36b9ed}
#simControls button {
  padding:9px;border:0;border-radius:6px;
  font-weight:bold;cursor:pointer;margin-top:9px;
}
#pumpButton {width:100%;background:#39ae7a;color:white}
#resetButton {width:100%;background:#e4edf4;color:#173b5a}
#readings {
  background:#284964;border-radius:7px;padding:9px;
  margin-top:10px;font-size:11px;line-height:1.8;
}
#risk {font-weight:bold;font-size:15px}
#footer {
  position:absolute;bottom:12px;left:300px;
  background:rgba(255,255,255,.94);padding:9px 14px;
  border:1px solid #b7c4d0;border-radius:8px;
  font-size:10px;color:#19344d;
}
@media(max-width:850px) {
  #rightPanel {width:225px}
  #header {max-width:55%}
  #header h1 {font-size:14px}
  #simControls {width:210px}
  #footer {display:none}
}
</style>

<div id="header">
  <h1>IoT-Based Flood Monitoring & Prediction Testbed</h1>
  <p>A Scalable Water Flow, Drainage and Urban Flood Simulation Model</p>
</div>

<div id="rightPanel">

  <div class="panel">
    <div class="panelTitle">System Layout</div>
    <div class="panelBody">
      <strong>A.</strong> Reservoir / Dam
      <br>↓
      <strong>B.</strong> River Channel
      <br>↓
      <strong>C.</strong> Urban Drainage
      <br>↓
      <strong>D.</strong> Road Flood Zone
      <br>↓
      <strong>E.</strong> Collection Sump + Pump
      <br><br>
      <strong>Rainfall and soil runoff</strong> feed the drainage system.
    </div>
  </div>

  <div class="panel">
    <div class="panelTitle">Working Flow</div>
    <div class="panelBody">
      ① Pump lifts water to reservoir A.<br>
      ② Water is released to river B and measured by the flow sensor.<br>
      ③ Water moves through drainage C.<br>
      ④ Blockage can cause water to accumulate in road zone D.<br>
      ⑤ Water is collected in sump E and recirculated.
    </div>
  </div>

  <div class="panel">
    <div class="panelTitle">Sensors & Purpose</div>
    <div class="panelBody">
      <div class="sensorRow"><strong>ME201W</strong><span>Water level*</span></div>
      <div class="sensorRow"><strong>YF-DN50</strong><span>Water flow</span></div>
      <div class="sensorRow"><strong>SEN-17731</strong><span>Soil moisture</span></div>
      <div class="sensorRow"><strong>BME688</strong><span>Environment</span></div>
      <div class="sensorRow"><strong>XKC-Y25</strong><span>Water presence</span></div>
      <div style="font-size:9px;color:#607080;margin-top:6px">
        *Confirm ME201W sensing principle and placement against the actual purchased module.
      </div>
    </div>
  </div>

</div>

<div id="simControls">
  <h3>LIVE FLOOD SIMULATOR</h3>

  <label>Rainfall intensity <b id="rainValue">30%</b></label>
  <input id="rainSlider" type="range" min="0" max="100" value="30">

  <label>Drain blockage <b id="blockValue">10%</b></label>
  <input id="blockSlider" type="range" min="0" max="100" value="10">

  <label>Dam release <b id="releaseValue">40%</b></label>
  <input id="releaseSlider" type="range" min="0" max="100" value="40">

  <label>Soil saturation <b id="soilValue">40%</b></label>
  <input id="soilSlider" type="range" min="0" max="100" value="40">

  <button id="pumpButton">PUMP: ON</button>
  <button id="resetButton">RESET SCENARIO</button>

  <div id="readings">
    <strong>SIMULATED READINGS</strong><br>
    River level: <span id="riverValue">40</span>%<br>
    Drain level: <span id="drainValue">20</span>%<br>
    Road water: <span id="roadValue">0</span>%<br>
    Sump level: <span id="sumpValue">50</span>%<br>
    Flood risk: <span id="risk">LOW</span>
  </div>
</div>

<div id="footer">
  Drag to rotate · Scroll to zoom · Right-click to pan
  &nbsp; | &nbsp; Conceptual hydraulic simulation
</div>
`;

document.body.appendChild(ui);

// ============================================================
// SIMULATION STATE
// ============================================================

const state = {
  rain: 30,
  blockage: 10,
  release: 40,
  soil: 40,
  pump: true,
  river: 0.4,
  drain: 0.2,
  road: 0.015,
  sump: 0.5,
};

const byId = (id) => document.getElementById(id);

function slider(id, key, display) {
  byId(id).addEventListener('input', (event) => {
    state[key] = Number(event.target.value);
    byId(display).textContent = state[key] + '%';
  });
}

slider('rainSlider', 'rain', 'rainValue');
slider('blockSlider', 'blockage', 'blockValue');
slider('releaseSlider', 'release', 'releaseValue');
slider('soilSlider', 'soil', 'soilValue');

byId('pumpButton').addEventListener('click', () => {
  state.pump = !state.pump;
  byId('pumpButton').textContent = state.pump ? 'PUMP: ON' : 'PUMP: OFF';
  byId('pumpButton').style.background = state.pump ? '#39ae7a' : '#d84b42';
});

byId('resetButton').addEventListener('click', () => {
  Object.assign(state, {
    rain: 30,
    blockage: 10,
    release: 40,
    soil: 40,
    pump: true,
    river: 0.4,
    drain: 0.2,
    road: 0.015,
    sump: 0.5,
  });

  for (const [id, value, display] of [
    ['rainSlider', 30, 'rainValue'],
    ['blockSlider', 10, 'blockValue'],
    ['releaseSlider', 40, 'releaseValue'],
    ['soilSlider', 40, 'soilValue'],
  ]) {
    byId(id).value = value;
    byId(display).textContent = value + '%';
  }

  byId('pumpButton').textContent = 'PUMP: ON';
  byId('pumpButton').style.background = '#39ae7a';
});

// ============================================================
// SIMULATION ENGINE
// ============================================================

function setTankWater(mesh, level) {
  const h = THREE.MathUtils.clamp(level, 0.04, mesh.userData.maxLevel);
  mesh.scale.y = h / mesh.userData.initialLevel;
  mesh.position.y = mesh.userData.baseY + h / 2;
}

function updateSimulation(dt, time) {
  const rain = state.rain / 100;
  const blockage = state.blockage / 100;
  const release = state.release / 100;
  const soil = state.soil / 100;

  // Rainfall runoff increases with soil saturation.
  const runoff = rain * (0.15 + 0.85 * soil);

  // Water balance: river.
  const riverInput = release * 0.12 + runoff * 0.035;
  const riverOutput = state.river * 0.08;

  state.river += (riverInput - riverOutput) * dt;
  state.river = THREE.MathUtils.clamp(state.river, 0.08, 0.9);

  // Drain capacity is reduced by blockage.
  const drainCapacity = 0.15 * (1 - blockage);
  const drainInput = state.river * 0.07 + runoff * 0.08;
  const drainOutput = Math.min(state.drain, drainCapacity);

  state.drain += (drainInput - drainOutput) * dt;
  state.drain = THREE.MathUtils.clamp(state.drain, 0.08, 0.95);

  // Overflow moves onto road when drainage is overloaded.
  const overflow = Math.max(0, state.drain - 0.48) * 0.13;
  const roadDrain = state.road * 0.035;

  state.road += (overflow - roadDrain) * dt;
  state.road = THREE.MathUtils.clamp(state.road, 0.015, 0.85);

  // Sump receives water; pump recirculates it.
  const pumpRate = state.pump ? 0.1 : 0;
  state.sump += (drainOutput * 0.35 - pumpRate * state.sump) * dt;
  state.sump = THREE.MathUtils.clamp(state.sump, 0.08, 0.9);

  // Visual water surfaces.
  setTankWater(reservoirWater, 0.25 + state.sump * 0.9);
  setTankWater(drainageWater, 0.1 + state.drain * 0.48);
  setTankWater(sumpWater, 0.15 + state.sump * 0.7);

  // Road flood water rises from road surface.
  const roadHeight = 0.025 + state.road * 0.45;
  roadWater.scale.y = roadHeight / 0.04;
  roadWater.position.y = 1.08 + roadHeight / 2;

  // River surface undulation and water-flow animation.
  river.water.position.y =
    river.water.userData.baseY + Math.sin(time * 2.2) * 0.025;

  for (let i = 0; i < flowParticles.length; i++) {
    const p = flowParticles[i];
    p.position.x += dt * (0.8 + release * 1.5);
    if (p.position.x > 2.3) p.position.x = -2.9;
    p.position.y = 1.55 - (p.position.x + 2.9) * 0.145;
  }

  // Rain animation.
  rainGroup.visible = state.rain > 0;

  for (const drop of drops) {
    drop.position.y -= dt * (1 + rain * 5);
    if (drop.position.y < 2.65) {
      drop.position.y = 4.15;
    }
  }

  // Blockage visual response.
  blockagePlate.material.color.setHSL(0.12 - blockage * 0.12, 0.85, 0.48);
  blockagePlate.scale.y = 0.65 + blockage * 0.45;

  // Illustrative risk score.
  const score = state.river * 22 + state.drain * 28 + state.road * 50;

  const risk =
    score < 30
      ? 'LOW'
      : score < 50
      ? 'MODERATE'
      : score < 70
      ? 'HIGH'
      : 'CRITICAL';

  byId('riverValue').textContent = Math.round(state.river * 100);
  byId('drainValue').textContent = Math.round(state.drain * 100);
  byId('roadValue').textContent = Math.round(state.road * 100);
  byId('sumpValue').textContent = Math.round(state.sump * 100);
  byId('risk').textContent = risk;

  byId('risk').style.color =
    risk === 'LOW'
      ? '#6de69a'
      : risk === 'MODERATE'
      ? '#f4d15d'
      : risk === 'HIGH'
      ? '#ff9c54'
      : '#ff6464';
}

// ============================================================
// ANIMATION LOOP
// ============================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  updateSimulation(dt, time);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ============================================================
// RESPONSIVE RESIZE
// ============================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
