const taskInput = document.getElementById("task-input");
const addButton = document.getElementById("add-button");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const themeIcon = document.getElementById("theme-icon");

let tasks = [];
let theme = localStorage.getItem("theme") || "dark";

let scene;
let camera;
let renderer;
let dragon;
let dragonMaterials;
let sparks = [];

window.addEventListener("load", () => {
  loadTheme();
  loadTasks();

  if (typeof THREE !== "undefined") {
    initThreeJS();
    animateThreeJS();
  } else {
    document.getElementById("three-canvas").style.opacity = "0";
    console.error("Three.js not loaded.");
  }

  addButton.addEventListener("click", addTask);
  taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addTask();
    }
  });
  themeIcon.closest(".theme-toggle").addEventListener("click", toggleTheme);
  window.addEventListener("resize", onWindowResize);
});

function loadTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  updateThreeJSTheme();
}

function toggleTheme() {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  loadTheme();
}

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0.4, 8);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("three-canvas"),
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const keyLight = new THREE.DirectionalLight(0xffd08a, 1.2);
  keyLight.position.set(-3, 4, 6);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x4fd6a3, 1.5, 18);
  rimLight.position.set(4, 1.5, 2);
  scene.add(rimLight);

  createDragon();
  createSparks();
  onWindowResize();
}

function palette() {
  return theme === "dark"
    ? { body: 0x25352f, belly: 0xf4ad4c, wing: 0x4fd6a3, horn: 0xf3efe4, fire: 0xe86f7c }
    : { body: 0x47604f, belly: 0xc57124, wing: 0x157d65, horn: 0x3b3328, fire: 0xb84758 };
}

function createDragon() {
  const colors = palette();
  dragon = new THREE.Group();
  dragon.position.set(1.8, 0.2, -3.4);
  dragon.userData = { baseX: 1.1, travelX: 1.35 };
  scene.add(dragon);

  const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.36, metalness: 0.12 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly, roughness: 0.48, metalness: 0.05 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: colors.wing,
    transparent: true,
    opacity: 0.54,
    side: THREE.DoubleSide,
    roughness: 0.28,
    metalness: 0.08
  });
  const hornMat = new THREE.MeshStandardMaterial({ color: colors.horn, roughness: 0.42 });
  const fireMat = new THREE.MeshBasicMaterial({ color: colors.fire, transparent: true, opacity: 0.72 });
  dragonMaterials = { bodyMat, bellyMat, wingMat, hornMat, fireMat };

  const body = mesh(new THREE.SphereGeometry(0.7, 28, 18), bodyMat, [0, 0, 0], [1.4, 0.65, 0.75]);
  const chest = mesh(new THREE.SphereGeometry(0.46, 24, 14), bellyMat, [0.48, -0.06, 0.08], [0.85, 0.55, 0.46]);
  const neck = mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.95, 18), bodyMat, [0.78, 0.34, 0], [1, 1, 1], [0, 0, -0.9]);
  const head = mesh(new THREE.SphereGeometry(0.36, 24, 16), bodyMat, [1.34, 0.78, 0], [1.15, 0.75, 0.82]);
  const snout = mesh(new THREE.ConeGeometry(0.2, 0.44, 16), bellyMat, [1.78, 0.78, 0], [1, 0.68, 0.78], [0, 0, -Math.PI / 2]);
  const tail = mesh(new THREE.ConeGeometry(0.28, 1.65, 18), bodyMat, [-1.12, 0.02, 0], [1, 0.72, 0.72], [0, 0, Math.PI / 2]);

  dragon.add(body, chest, neck, head, snout, tail);

  addHorn(1.26, 1.04, 0.18, hornMat);
  addHorn(1.26, 1.04, -0.18, hornMat);
  addWing(0.12, 0.24, 0.5, 1, wingMat);
  addWing(0.12, 0.24, -0.5, -1, wingMat);
  addLegs(bodyMat, hornMat);

  for (let i = 0; i < 7; i += 1) {
    const scale = 0.22 - i * 0.015;
    const spine = mesh(new THREE.ConeGeometry(scale, 0.34, 10), hornMat, [-0.55 + i * 0.28, 0.52 + i * 0.04, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    dragon.add(spine);
  }

  for (let i = 0; i < 7; i += 1) {
    const flame = mesh(new THREE.SphereGeometry(0.06 + i * 0.01, 10, 8), fireMat, [2.08 + i * 0.17, 0.78 + Math.sin(i) * 0.04, 0], [1.25, 0.62, 0.62]);
    flame.userData.flame = true;
    dragon.add(flame);
  }
}

function addHorn(x, y, z, material) {
  const horn = mesh(new THREE.ConeGeometry(0.07, 0.34, 12), material, [x, y, z], [1, 1, 1], [0.35, 0, -0.35]);
  dragon.add(horn);
}

function addWing(x, y, z, side, material) {
  const wing = new THREE.Group();
  wing.position.set(x, y, z);
  wing.userData.side = side;

  const membrane = mesh(new THREE.ConeGeometry(0.82, 1.55, 3), material, [0, 0, side * 0.34], [1.25, 0.62, 0.1], [0.2, side * 0.35, -1.55]);
  const bone = mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.35, 10), material, [0, 0.08, side * 0.25], [1, 1, 1], [1.1, 0, side * 0.82]);

  wing.add(membrane, bone);
  dragon.add(wing);
}

function addLegs(bodyMaterial, clawMaterial) {
  [[0.28, -0.42, 0.32], [-0.46, -0.42, 0.34], [0.28, -0.42, -0.32], [-0.46, -0.42, -0.34]].forEach(([x, y, z]) => {
    const leg = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.48, 12), bodyMaterial, [x, y, z], [1, 1, 1], [0.2, 0, 0.25]);
    const claw = mesh(new THREE.ConeGeometry(0.045, 0.18, 10), clawMaterial, [x + 0.08, y - 0.24, z], [1, 1, 1], [0, 0, -Math.PI / 2]);
    dragon.add(leg, claw);
  });
}

function createSparks() {
  const colors = palette();
  for (let i = 0; i < 42; i += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? colors.ember : colors.wing,
      transparent: true,
      opacity: 0.38
    });
    const spark = mesh(new THREE.SphereGeometry(Math.random() * 0.025 + 0.012, 8, 8), material, [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 7,
      Math.random() * -5 - 2
    ]);
    spark.userData = {
      speed: Math.random() * 0.35 + 0.12,
      drift: Math.random() * Math.PI * 2
    };
    scene.add(spark);
    sparks.push(spark);
  }
}

function mesh(geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.scale.set(...scale);
  item.rotation.set(...rotation);
  return item;
}

function updateThreeJSTheme() {
  if (!dragonMaterials) {
    return;
  }

  const colors = palette();
  dragonMaterials.bodyMat.color.set(colors.body);
  dragonMaterials.bellyMat.color.set(colors.belly);
  dragonMaterials.wingMat.color.set(colors.wing);
  dragonMaterials.hornMat.color.set(colors.horn);
  dragonMaterials.fireMat.color.set(colors.fire);

  sparks.forEach((spark, index) => {
    spark.material.color.set(index % 3 === 0 ? colors.ember : colors.wing);
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  const time = performance.now() * 0.001;

  if (dragon) {
    const baseX = dragon.userData.baseX || 1.1;
    const travelX = dragon.userData.travelX || 1.35;
    dragon.position.x = Math.sin(time * 0.32) * travelX + baseX;
    dragon.position.y = Math.sin(time * 0.5) * 0.34 + 0.18;
    dragon.rotation.y = Math.sin(time * 0.28) * 0.22 - 0.34;
    dragon.rotation.z = Math.sin(time * 0.42) * 0.05;

    dragon.children.forEach(child => {
      if (child.userData.side) {
        child.rotation.x = Math.sin(time * 3.1) * 0.18;
        child.rotation.z = child.userData.side * (0.18 + Math.sin(time * 2.4) * 0.06);
      }
      if (child.userData.flame) {
        const pulse = 0.7 + Math.sin(time * 5 + child.position.x * 4) * 0.25;
        child.scale.set(pulse * 1.25, pulse * 0.62, pulse * 0.62);
        child.material.opacity = 0.42 + pulse * 0.25;
      }
    });
  }

  sparks.forEach((spark, index) => {
    spark.position.y += 0.006 * spark.userData.speed;
    spark.position.x += Math.sin(time + spark.userData.drift) * 0.002;
    spark.material.opacity = 0.18 + Math.sin(time * 1.3 + index) * 0.12;
    if (spark.position.y > 4) {
      spark.position.y = -4;
    }
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) {
    return;
  }

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (dragon) {
    const compact = window.innerWidth < 640;
    dragon.scale.setScalar(compact ? 0.78 : 1);
    dragon.position.z = compact ? -4.2 : -3.4;
    dragon.userData.baseX = compact ? 0.8 : 1.1;
    dragon.userData.travelX = compact ? 0.62 : 1.35;
  }
}

function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  } catch {
    tasks = [];
  }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(0)" }
    ], { duration: 240 });
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  saveTasks();
  renderTasks();
}

function deleteTask(id, event) {
  event.stopPropagation();
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskCount.textContent = tasks.length;

  if (!tasks.length) {
    taskList.innerHTML = '<p class="empty-message">No tasks yet. Add one above.</p>';
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task-item${task.done ? " completed" : ""}" onclick="toggleTask(${task.id})">
      <div class="task-checkbox">${task.done ? '<i class="fas fa-check"></i>' : ""}</div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="delete-btn" type="button" aria-label="Delete task" onclick="deleteTask(${task.id}, event)">
        <i class="fas fa-xmark"></i>
      </button>
    </div>
  `).join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
