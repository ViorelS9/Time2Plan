const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const assistantBtn = document.getElementById("assistantBtn");
const assistantOutput = document.getElementById("assistantOutput");
const notificationArea = document.getElementById("notificationArea");

let tasks = [];


/* ---------------- PRIORIDAD POR FECHA ---------------- */

function calculatePriority(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Muy Alta";
  if (diffDays <= 2) return "Alta";
  if (diffDays <= 5) return "Media";
  return "Baja";
}


/* ---------------- GUARDAR / CARGAR ---------------- */

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) tasks = JSON.parse(saved);
}


/* ---------------- NOTIFICACIONES INTERNAS ---------------- */

function checkNotifications() {
  notificationArea.innerHTML = "";

  tasks.forEach(task => {
    if (task.completed) return;

    const priority = calculatePriority(task.dueDate);

    if (priority === "Muy Alta" || priority === "Alta") {
      const note = document.createElement("div");
      note.textContent =
        "Aviso: La tarea '" +
        task.text +
        "' ahora es prioridad " +
        priority;

      notificationArea.appendChild(note);
    }
  });
}


/* ---------------- RENDERIZAR TAREAS ---------------- */

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {

    task.priority = calculatePriority(task.dueDate);

    const li = document.createElement("li");

    const details = document.createElement("details");
    const summary = document.createElement("summary");

    summary.textContent =
      task.text +
      " | Fecha: " +
      task.dueDate +
      " | Prioridad: " +
      task.priority;

    if (task.completed) {
      summary.style.textDecoration = "line-through";
    }

    details.appendChild(summary);

    const description = document.createElement("p");
    description.textContent = task.description || "Sin descripción";
    details.appendChild(description);

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completar";
    completeBtn.onclick = () => {
      tasks[index].completed = true;
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

    li.appendChild(details);
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });

  checkNotifications();
}


/* ---------------- AGREGAR TAREA ---------------- */

addTaskBtn.addEventListener("click", () => {

  const text = taskInput.value.trim();
  const desc = descriptionInput.value.trim();
  const date = dateInput.value;

  if (!text || !date) return;

  const task = {
    text: text,
    description: desc,
    dueDate: date,
    priority: calculatePriority(date),
    completed: false
  };

  tasks.push(task);

  saveTasks();
  renderTasks();

  taskInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";
});


/* ---------------- ASISTENTE HORARIO SEMANAL ---------------- */

function generateWeeklySchedule() {

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];

  const pending = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  let schedule = {};

  days.forEach(day => {
    schedule[day] = [];
  });

  pending.forEach((task, i) => {
    const day = days[i % 7];
    schedule[day].push(task.text);
  });

  return schedule;
}


/* ---------------- MOSTRAR HORARIO ---------------- */

assistantBtn.addEventListener("click", () => {

  const schedule = generateWeeklySchedule();

  assistantOutput.innerHTML = "<h3>Horario sugerido</h3>";

  for (let day in schedule) {

    const dayDiv = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = day;

    dayDiv.appendChild(title);

    if (schedule[day].length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Sin tareas";
      dayDiv.appendChild(empty);
    } else {
      schedule[day].forEach(task => {
        const p = document.createElement("p");
        p.textContent = task;
        dayDiv.appendChild(p);
      });
    }

    assistantOutput.appendChild(dayDiv);
  }

});

function generateWeeklySchedule() {
  const preferences = prompt(
    "¿Algo a tomar en cuenta?\nEj: martes ocupado, jueves pocas horas, finde libre"
  );

  let reducedDays = [];

  if (preferences) {
    weekDays.forEach(day => {
      if (preferences.toLowerCase().includes(day.toLowerCase())) {
        reducedDays.push(day);
      }
    });
  }

  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const values = {
        "Muy Alta": 4,
        "Alta": 3,
        "Media": 2,
        "Baja": 1
      };
      return values[b.priority] - values[a.priority];
    });

  let schedule = {};
  weekDays.forEach(day => (schedule[day] = []));

  let dayIndex = 0;

  pendingTasks.forEach(task => {
    let attempts = 0;

    while (
      reducedDays.includes(weekDays[dayIndex]) &&
      attempts < weekDays.length
    ) {
      dayIndex = (dayIndex + 1) % weekDays.length;
      attempts++;
    }

    schedule[weekDays[dayIndex]].push(task.text);
    task.assignedDay = weekDays[dayIndex];
    dayIndex = (dayIndex + 1) % weekDays.length;
  });

  renderSchedule(schedule);
}

function renderSchedule(schedule) {
  const scheduleDiv = document.getElementById("schedule");
  scheduleDiv.innerHTML = "<h3>Horario semanal</h3>";

  weekDays.forEach(day => {
    const dayBlock = document.createElement("div");
    dayBlock.innerHTML = "<strong>" + day + "</strong>";

    if (schedule[day].length === 0) {
      dayBlock.innerHTML += "<p>Sin tareas</p>";
    } else {
      const ul = document.createElement("ul");
      schedule[day].forEach(task => {
        const li = document.createElement("li");
        li.textContent = task;
        ul.appendChild(li);
      });
      dayBlock.appendChild(ul);
    }

    scheduleDiv.appendChild(dayBlock);
  });
}

/* ---------------- INICIO ---------------- */

window.onload = () => {
  loadTasks();
  renderTasks();
};
