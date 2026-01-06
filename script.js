// Simple old-school to-do list
var tasks = [];

window.onload = function () {
  var input = document.getElementById('task-input');
  var addButton = document.getElementById('add-button');

  addButton.onclick = addTask;
  input.onkeypress = function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  };
};

function addTask() {
  var input = document.getElementById('task-input');
  var text = input.value.trim();
  if (!text) {
    return;
  }
  var task = { id: Date.now(), text: text, done: false };
  tasks.push(task);
  input.value = '';
  renderTasks();
}

function toggleTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].done = !tasks[i].done;
      break;
    }
  }
  renderTasks();
}

function renderTasks() {
  var list = document.getElementById('task-list');
  if (tasks.length === 0) {
    list.innerHTML = '<p class=\"empty\">No tasks yet.</p>';
    return;
  }
  var html = '';
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    var cls = 'task-item' + (task.done ? ' completed' : '');
    html += '<div class=\"' + cls + '\" onclick=\"toggleTask(' + task.id + ')\">';
    html += escapeHtml(task.text);
    html += '</div>';
  }
  list.innerHTML = html;
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

