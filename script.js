const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const durationInput = document.getElementById("durationInput");
const complexityInput = document.getElementById("complexityInput");
const typeInput = document.getElementById("typeInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const generateBtn = document.getElementById("generateScheduleBtn");
const calendarDiv = document.getElementById("calendar");

const weekDays = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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

generateBtn.onclick = () => {
  generateSchedule();
};

function generateSchedule() {
  const pending = tasks
    .filter(t => !t.completed)
    .sort((a,b) => {
      const val = { "Muy Alta":4,"Alta":3,"Media":2,"Baja":1 };
      return val[calculatePriority(b)] - val[calculatePriority(a)];
    });

  let schedule = {};
  weekDays.forEach(day => schedule[day] = "");

  let dayIndex = 0;

  pending.forEach(task => {
    for (let i = 0; i < task.duration; i++) {
      if (dayIndex >= 7) break;
      schedule[weekDays[dayIndex]] = task.text;
      dayIndex++;
    }
  });

  renderCalendar(schedule);
}

function renderCalendar(schedule) {
  calendarDiv.innerHTML = "";
  const table = document.createElement("table");

  const row = document.createElement("tr");

  weekDays.forEach(day => {
    const cell = document.createElement("td");
    if (schedule[day]) {
      cell.innerHTML = "<div class='task-block'>" + schedule[day] + "</div>";
    } else {
      cell.textContent = "Libre";
    }
    row.appendChild(cell);
  });

  table.appendChild(row);
  calendarDiv.appendChild(table);
}

renderTasks();
