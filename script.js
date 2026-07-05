// Modern To-Do List
let tasks = [];

// Load tasks from localStorage on page load
window.onload = function () {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  
  const input = document.getElementById('task-input');
  const addButton = document.getElementById('add-button');
  
  addButton.onclick = addTask;
  input.onkeypress = function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  };
  
  renderTasks();
};

// Add a new task
function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  
  if (!text) {
    input.style.borderColor = '#ff4757';
    setTimeout(() => {
      input.style.borderColor = '#e0e0e0';
    }, 1000);
    return;
  }
  
  const task = {
    id: Date.now(),
    text: text,
    done: false
  };
  
  tasks.push(task);
  saveTasks();
  input.value = '';
  renderTasks();
}

// Toggle task completion
function toggleTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].done = !tasks[taskIndex].done;
    saveTasks();
    renderTasks();
  }
}

// Delete a task
function deleteTask(id, event) {
  event.stopPropagation(); // Prevent toggling when deleting
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render all tasks
function renderTasks() {
  const list = document.getElementById('task-list');
  
  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty-message">No tasks yet. Add one above!</p>';
    return;
  }
  
  let html = '';
  tasks.forEach(task => {
    const taskClass = task.done ? 'task-item completed' : 'task-item';
    html += `
      <div class="${taskClass}" onclick="toggleTask(${task.id})">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id}, event)">×</button>
      </div>
    `;
  });
  
  list.innerHTML = html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
