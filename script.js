// ============================================
// NEON TO-DO LIST - Futuristic & Aesthetic
// ============================================

// DOM Elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const themeIcon = document.getElementById('theme-icon');
const particlesContainer = document.getElementById('particles');

// State
let tasks = [];
let theme = localStorage.getItem('theme') || 'dark';

// Initialize
window.onload = function () {
  loadTheme();
  loadTasks();
  createParticles();
  
  // Event Listeners
  addButton.onclick = addTask;
  taskInput.onkeypress = function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  };
  
  themeIcon.parentElement.onclick = toggleTheme;
};

// ============================================
// THEME MANAGEMENT
// ============================================

function loadTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon();
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  loadTheme();
  
  // Recreate particles with new theme
  particlesContainer.innerHTML = '';
  createParticles();
}

function updateThemeIcon() {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// PARTICLES EFFECT
// ============================================

function createParticles() {
  const particleCount = 30;
  const colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-tertiary)'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 15;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;
    
    particlesContainer.appendChild(particle);
  }
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
