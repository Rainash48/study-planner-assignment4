const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const subjectInput = document.getElementById("subject");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const taskSummary = document.getElementById("taskSummary");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("studyPlannerTasks")) || [];
let currentFilter = "All";

function saveTasks() {
  localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks));
}

function addTask(event) {
  event.preventDefault();

  const task = {
    id: Date.now(),
    title: taskTitleInput.value.trim(),
    subject: subjectInput.value.trim(),
    priority: priorityInput.value,
    completed: false
  };

  if (!task.title || !task.subject) {
    return;
  }

  tasks.push(task);
  saveTasks();
  taskForm.reset();
  priorityInput.value = "Medium";
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === "All") {
    return tasks;
  }
  return tasks.filter((task) => task.priority === currentFilter);
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;

  if (total === 0) {
    taskSummary.textContent = "No tasks added yet.";
  } else {
    taskSummary.textContent = `${completed} of ${total} tasks completed.`;
  }
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "task-item";
    emptyItem.innerHTML = `
      <div></div>
      <div>
        <div class="task-title">No tasks to show</div>
        <div class="task-meta">Add a new task or change the priority filter.</div>
      </div>
      <div></div>
    `;
    taskList.appendChild(emptyItem);
    updateProgress();
    return;
  }

  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item ${task.completed ? "completed" : ""}`;

    item.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task as completed" />
      <div>
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          ${escapeHtml(task.subject)}
          <span class="priority ${task.priority}">${task.priority}</span>
        </div>
      </div>
      <button class="delete-btn" type="button">Delete</button>
    `;

    item.querySelector("input").addEventListener("change", () => toggleTask(task.id));
    item.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));
    taskList.appendChild(item);
  });

  updateProgress();
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (match) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[match];
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

taskForm.addEventListener("submit", addTask);
renderTasks();
