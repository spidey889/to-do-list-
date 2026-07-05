// ============================================
// 3D NEON TO-DO LIST - Futuristic & Aesthetic UI
// WITH 3D ANIMATIONS & FLOATING OBJECTS
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
let scene, camera, renderer, objects = [];

// Initialize
window.onload = function () {
  loadTheme();
  loadTasks();
  initThreeJS();
  animateThreeJS();
  
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
  updateThreeJSTheme();
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
// 3D ANIMATIONS WITH THREE.JS
// ============================================

function initThreeJS() {
  // Scene
  scene = new THREE.Scene();
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('three-canvas'),
    alpha: true,
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Create 3D objects
  create3DObjects();
  
  // Handle window resize
  onWindowResize();
}

function create3DObjects() {
  // Clear existing objects
  objects.forEach(obj => scene.remove(obj));
  objects = [];
  
  // Colors based on theme
  const primaryColor = theme === 'dark' ? 0x00ff88 : 0x00a368;
  const secondaryColor = theme === 'dark' ? 0x00d4ff : 0x0077b6;
  const tertiaryColor = theme === 'dark' ? 0xff00aa : 0xcc0077;
  
  // Create geometric shapes
  const geometries = [
    new THREE.IcosahedronGeometry(0.3, 0),
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.TorusGeometry(0.3, 0.1, 8, 16),
    new THREE.SphereGeometry(0.25, 16, 16)
  ];
  
  const colors = [primaryColor, secondaryColor, tertiaryColor];
  
  // Create 15 floating objects
  for (let i = 0; i < 15; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshPhongMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.7,
      shininess: 100,
      specular: 0x111111
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Random position
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10 - 5;
    
    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    // Random scale
    const scale = Math.random() * 0.5 + 0.3;
    mesh.scale.set(scale, scale, scale);
    
    // Add to scene and objects array
    scene.add(mesh);
    objects.push(mesh);
    
    // Add to animation data
    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      },
      floatSpeed: Math.random() * 0.5 + 0.1,
      floatOffset: Math.random() * Math.PI * 2,
      floatDistance: Math.random() * 2 + 1
    };
  }
  
  // Add glowing particles
  for (let i = 0; i < 50; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    
    particle.position.x = (Math.random() - 0.5) * 20;
    particle.position.y = (Math.random() - 0.5) * 20;
    particle.position.z = (Math.random() - 0.5) * 20 - 10;
    
    scene.add(particle);
    objects.push(particle);
    
    particle.userData = {
      floatSpeed: Math.random() * 0.2 + 0.05,
      floatOffset: Math.random() * Math.PI * 2,
      floatDistance: Math.random() * 5 + 2
    };
  }
}

function updateThreeJSTheme() {
  const primaryColor = theme === 'dark' ? 0x00ff88 : 0x00a368;
  const secondaryColor = theme === 'dark' ? 0x00d4ff : 0x0077b6;
  const tertiaryColor = theme === 'dark' ? 0xff00aa : 0xcc0077;
  const colors = [primaryColor, secondaryColor, tertiaryColor];
  
  objects.forEach((obj, index) => {
    if (obj.material) {
      obj.material.color.set(colors[index % colors.length]);
    }
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);
  
  const time = Date.now() * 0.001;
  
  objects.forEach((obj, index) => {
    if (obj.userData.rotationSpeed) {
      // Rotate objects
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
    }
    
    if (obj.userData.floatSpeed) {
      // Float objects up and down
      obj.position.y += Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.01 * obj.userData.floatDistance;
    }
  });
  
  renderer.render(scene, camera);
}

function onWindowResize() {
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
    // Shake animation for empty input
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
