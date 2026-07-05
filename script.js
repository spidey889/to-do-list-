// ============================================
// 3D NEON TO-DO LIST - Futuristic & Aesthetic UI
// WITH DRAGONFLY ANIMATION & FLOATING OBJECTS
// ============================================

// DOM Elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const themeIcon = document.getElementById('theme-icon');

// State
let tasks = [];
let theme = localStorage.getItem('theme') || 'dark';

// Three.js Variables
let scene, camera, renderer, dragonfly, dragonflyWings = [];
let clock = new THREE.Clock();

// Initialize
window.onload = function () {
  loadTheme();
  loadTasks();
  
  // Check if Three.js is loaded
  if (typeof THREE !== 'undefined') {
    initThreeJS();
    animateThreeJS();
  } else {
    console.error('Three.js not loaded!');
    // Fallback: Show a message in the canvas area
    const canvas = document.getElementById('three-canvas');
    canvas.style.background = 'rgba(255, 0, 0, 0.1)';
  }
  
  // Event Listeners
  addButton.onclick = addTask;
  taskInput.onkeypress = function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  };
  
  themeIcon.parentElement.onclick = toggleTheme;
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
};

// ============================================
// THEME MANAGEMENT
// ============================================

function loadTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon();
  if (typeof THREE !== 'undefined') updateThreeJSTheme();
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  loadTheme();
}

function updateThemeIcon() {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// 3D ANIMATIONS WITH THREE.JS - DRAGONFLY EDITION
// ============================================

function initThreeJS() {
  // Scene
  scene = new THREE.Scene();
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('three-canvas'),
    alpha: true,
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Add point light for dragonfly glow
  const pointLight = new THREE.PointLight(0x00ff88, 1, 50);
  pointLight.position.set(0, 0, -5);
  scene.add(pointLight);
  
  // Create dragonfly
  createDragonfly();
  
  // Create some floating particles
  createParticles();
  
  // Handle window resize
  onWindowResize();
}

function createDragonfly() {
  // Colors based on theme
  const bodyColor = theme === 'dark' ? 0x00ff88 : 0x00a368;
  const wingColor = theme === 'dark' ? 0x00d4ff : 0x0077b6;
  const eyeColor = theme === 'dark' ? 0xff00aa : 0xcc0077;
  
  // Dragonfly group
  dragonfly = new THREE.Group();
  scene.add(dragonfly);
  
  // Body (long cylinder)
  const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.8, 16);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: bodyColor,
    shininess: 100,
    specular: 0x111111,
    emissive: bodyColor,
    emissiveIntensity: 0.3
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  body.position.z = 0.4;
  body.castShadow = true;
  body.receiveShadow = true;
  dragonfly.add(body);
  
  // Head (sphere)
  const headGeometry = new THREE.SphereGeometry(0.06, 16, 16);
  const headMaterial = new THREE.MeshPhongMaterial({
    color: bodyColor,
    shininess: 100,
    emissive: bodyColor,
    emissiveIntensity: 0.3
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.z = 0.8;
  head.castShadow = true;
  dragonfly.add(head);
  
  // Eyes (2 small spheres)
  const eyeGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({ 
    color: eyeColor,
    emissive: eyeColor,
    emissiveIntensity: 0.8
  });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(0.03, 0.02, 0.85);
  dragonfly.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(-0.03, 0.02, 0.85);
  dragonfly.add(rightEye);
  
  // Wings (4 transparent wings)
  const wingGeometry = new THREE.PlaneGeometry(0.3, 0.1);
  const wingMaterial = new THREE.MeshPhongMaterial({
    color: wingColor,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    shininess: 50
  });
  
  // Front wings
  const frontLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  frontLeftWing.position.set(0, 0, 0.5);
  frontLeftWing.rotation.y = Math.PI / 4;
  dragonfly.add(frontLeftWing);
  dragonflyWings.push(frontLeftWing);
  
  const frontRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  frontRightWing.position.set(0, 0, 0.5);
  frontRightWing.rotation.y = -Math.PI / 4;
  dragonfly.add(frontRightWing);
  dragonflyWings.push(frontRightWing);
  
  // Back wings
  const backLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  backLeftWing.position.set(0, 0, 0.2);
  backLeftWing.rotation.y = Math.PI / 4;
  dragonfly.add(backLeftWing);
  dragonflyWings.push(backLeftWing);
  
  const backRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  backRightWing.position.set(0, 0, 0.2);
  backRightWing.rotation.y = -Math.PI / 4;
  dragonfly.add(backRightWing);
  dragonflyWings.push(backRightWing);
  
  // Position dragonfly
  dragonfly.position.set(0, 0, -3);
  dragonfly.userData = {
    pathRadius: 4,
    pathSpeed: 0.002,
    pathOffset: Math.random() * Math.PI * 2,
    wingFlapSpeed: 0.1,
    wingFlapAmount: 0.2,
    bodyWiggleSpeed: 0.05,
    bodyWiggleAmount: 0.05
  };
}

function createParticles() {
  const particleCount = 20;
  const colors = [0x00ff88, 0x00d4ff, 0xff00aa];
  
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10 - 5
    );
    
    scene.add(particle);
    
    particle.userData = {
      floatSpeed: Math.random() * 0.2 + 0.05,
      floatOffset: Math.random() * Math.PI * 2,
      floatDistance: Math.random() * 3 + 1
    };
  }
}

function updateThreeJSTheme() {
  if (!dragonfly) return;
  
  const bodyColor = theme === 'dark' ? 0x00ff88 : 0x00a368;
  const wingColor = theme === 'dark' ? 0x00d4ff : 0x0077b6;
  const eyeColor = theme === 'dark' ? 0xff00aa : 0xcc0077;
  
  dragonfly.children.forEach(child => {
    if (child.geometry && child.geometry.type === 'CylinderGeometry') {
      child.material.color.set(bodyColor);
      child.material.emissive.set(bodyColor);
    } else if (child.geometry && child.geometry.type === 'SphereGeometry') {
      if (Math.abs(child.position.z - 0.85) < 0.06) {
        child.material.color.set(eyeColor);
      } else {
        child.material.color.set(bodyColor);
        if (child.material.emissive) {
          child.material.emissive.set(bodyColor);
        }
      }
    } else if (child.geometry && child.geometry.type === 'PlaneGeometry') {
      child.material.color.set(wingColor);
    }
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);
  
  const delta = clock.getDelta();
  const time = Date.now() * 0.001;
  
  // Animate dragonfly
  if (dragonfly) {
    const data = dragonfly.userData;
    
    // Circular path
    dragonfly.position.x = Math.cos(time * data.pathSpeed + data.pathOffset) * data.pathRadius;
    dragonfly.position.y = Math.sin(time * data.pathSpeed * 0.7 + data.pathOffset) * data.pathRadius * 0.5;
    dragonfly.position.z = -3 + Math.sin(time * data.pathSpeed * 0.5 + data.pathOffset) * data.pathRadius * 0.3;
    
    // Rotate dragonfly to face direction of motion
    const angle = Math.atan2(
      Math.sin(time * data.pathSpeed + data.pathOffset) * data.pathSpeed * 0.7,
      Math.cos(time * data.pathSpeed + data.pathOffset) * data.pathSpeed
    );
    dragonfly.rotation.y = angle;
    
    // Wing flapping
    const wingFlap = Math.sin(time * data.wingFlapSpeed * 2) * data.wingFlapAmount;
    dragonflyWings.forEach((wing, index) => {
      if (index % 2 === 0) {
        wing.rotation.x = wingFlap;
      } else {
        wing.rotation.x = -wingFlap;
      }
    });
    
    // Body wiggle
    dragonfly.children.forEach(child => {
      if (child.geometry && child.geometry.type === 'CylinderGeometry') {
        child.rotation.z = Math.sin(time * data.bodyWiggleSpeed) * data.bodyWiggleAmount;
      }
    });
  }
  
  // Animate particles
  scene.children.forEach(child => {
    if (child.userData.floatSpeed) {
      child.position.y += Math.sin(time * child.userData.floatSpeed + child.userData.floatOffset) * 0.01 * child.userData.floatDistance;
    }
  });
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// TASK MANAGEMENT
// ============================================

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();
  
  if (!text) {
    taskInput.style.animation = 'shake 0.5s';
    setTimeout(() => {
      taskInput.style.animation = '';
    }, 500);
    return;
  }
  
  const task = {
    id: Date.now(),
    text: text,
    done: false
  };
  
  tasks.push(task);
  saveTasks();
  taskInput.value = '';
  renderTasks();
}

function toggleTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].done = !tasks[taskIndex].done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id, event) {
  event.stopPropagation();
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="empty-message">No tasks yet. Add one above!</p>';
    taskCount.textContent = '0';
    return;
  }
  
  taskCount.textContent = tasks.length;
  
  let html = '';
  tasks.forEach(task => {
    const taskClass = task.done ? 'task-item completed' : 'task-item';
    html += `
      <div class="${taskClass}" onclick="toggleTask(${task.id})">
        <div class="task-checkbox">
          ${task.done ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id}, event)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });
  
  taskList.innerHTML = html;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add shake animation for empty input
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
