const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const durationInput = document.getElementById("durationInput");
const complexityInput = document.getElementById("complexityInput");
const typeInput = document.getElementById("typeInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const calendarDiv = document.getElementById("calendar");

const weekDays = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let schedule = {};

function initSchedule() {
  weekDays.forEach(day => {
    schedule[day] = {};
    hours.forEach(hour => {
      schedule[day][hour] = null;
    });
  });
}

function calculatePriority(task) {
  const today = new Date();
  const due = new Date(task.dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  let score = 0;

  if (diff <= 1) score += 4;
  else if (diff <= 3) score += 3;
  else if (diff <= 6) score += 2;
  else score += 1;

  if (task.complexity === "Alta") score += 2;
  if (task.complexity === "Media") score += 1;
  if (task.type === "Escolar") score += 2;

  if (score >= 7) return "Muy Alta";
  if (score >= 5) return "Alta";
  if (score >= 3) return "Media";
  return "Baja";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    task.priority = calculatePriority(task);

    const li = document.createElement("li");
    li.textContent = task.text + " | Prioridad: " + task.priority;
    if (task.completed) li.classList.add("completed");

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completar";
    completeBtn.onclick = () => {
      task.completed = true;
      saveTasks();
      renderTasks();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

addTaskBtn.onclick = () => {
  if (!taskInput.value || !dateInput.value) return;

  tasks.push({
    text: taskInput.value,
    description: descriptionInput.value,
    dueDate: dateInput.value,
    duration: parseInt(durationInput.value),
    complexity: complexityInput.value,
    type: typeInput.value,
    completed: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";
  durationInput.value = 1;
};

function renderCalendar() {
  calendarDiv.innerHTML = "";
  const table = document.createElement("table");

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  weekDays.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  hours.forEach((hour, hourIndex) => {
    const row = document.createElement("tr");

    const hourCell = document.createElement("td");
    hourCell.textContent = hour;
    row.appendChild(hourCell);

    weekDays.forEach(day => {
      const cell = document.createElement("td");

      if (schedule[day][hour]) {
        cell.innerHTML = '<div class="task-block">' + schedule[day][hour] + '</div>';
      }

      cell.onclick = () => assignTaskToSlot(day, hourIndex);

      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  calendarDiv.appendChild(table);
}

function assignTaskToSlot(day, hourIndex) {
  const pending = tasks.filter(t => !t.completed);

  if (pending.length === 0) {
    alert("No hay tareas pendientes.");
    return;
  }

  const taskName = prompt("Escribe el nombre exacto de la tarea que quieres asignar:");

  const task = tasks.find(t => t.text === taskName && !t.completed);

  if (!task) {
    alert("Tarea no encontrada.");
    return;
  }

  for (let i = 0; i < task.duration; i++) {
    const hour = hours[hourIndex + i];
    if (!hour) break;
    schedule[day][hour] = task.text;
  }

  renderCalendar();
}

initSchedule();
renderTasks();
renderCalendar();
