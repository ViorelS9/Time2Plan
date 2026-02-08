const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const complexityInput = document.getElementById("complexityInput");
const typeInput = document.getElementById("typeInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ---------------- PRIORIDAD ----------------
function calculatePriority(task) {
  const today = new Date();
  const due = new Date(task.dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  let score = 0;

  if (diffDays <= 1) score += 4;
  else if (diffDays <= 3) score += 3;
  else if (diffDays <= 6) score += 2;
  else score += 1;

  if (task.complexity === "Alta") score += 2;
  if (task.complexity === "Media") score += 1;
  if (task.type === "Escolar") score += 2;

  if (score >= 7) return "Muy Alta";
  if (score >= 5) return "Alta";
  if (score >= 3) return "Media";
  return "Baja";
}

// ---------------- GUARDAR ----------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------------- RENDER TAREAS ----------------
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    task.priority = calculatePriority(task);

    if (task.priority === "Muy Alta" && !task.notified) {
      alert("La tarea '" + task.text + "' es muy prioritaria.");
      task.notified = true;
      saveTasks();
    }

    const li = document.createElement("li");

    const title = document.createElement("div");
    title.textContent = task.text + " | Prioridad: " + task.priority;
    title.className = "task-title";
    if (task.completed) title.classList.add("completed");

    const desc = document.createElement("div");
    desc.textContent = task.description;
    desc.className = "description";

    title.onclick = () => {
      desc.style.display = desc.style.display === "none" ? "block" : "none";
    };

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

    li.appendChild(title);
    li.appendChild(desc);
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

// ---------------- AGREGAR TAREA ----------------
addTaskBtn.onclick = () => {
  if (!taskInput.value || !dateInput.value) return;

  tasks.push({
    text: taskInput.value,
    description: descriptionInput.value,
    dueDate: dateInput.value,
    complexity: complexityInput.value,
    type: typeInput.value,
    completed: false,
    notified: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";
};

// ---------------- HORARIO SEMANAL ----------------
function generateWeeklySchedule() {
  const preferences = prompt(
    "¿Algo a tomar en cuenta?\nEj: martes ocupado, jueves pocas horas"
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
    .filter(t => !t.completed)
    .sort((a, b) => {
      const val = { "Muy Alta":4,"Alta":3,"Media":2,"Baja":1 };
      return val[calculatePriority(b)] - val[calculatePriority(a)];
    });

  let schedule = {};
  weekDays.forEach(d => schedule[d] = []);

  let i = 0;
  pendingTasks.forEach(task => {
    let attempts = 0;
    while (reducedDays.includes(weekDays[i]) && attempts < 7) {
      i = (i + 1) % 7;
      attempts++;
    }
    schedule[weekDays[i]].push(task.text);
    i = (i + 1) % 7;
  });

  renderSchedule(schedule);
}

// ---------------- MOSTRAR HORARIO ----------------
function renderSchedule(schedule) {
  const div = document.getElementById("schedule");
  div.innerHTML = "<h3>Horario semanal</h3>";

  weekDays.forEach(day => {
    const block = document.createElement("div");
    block.innerHTML = "<strong>" + day + "</strong>";

    if (schedule[day].length === 0) {
      block.innerHTML += "<p>Sin tareas</p>";
    } else {
      const ul = document.createElement("ul");
      schedule[day].forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      });
      block.appendChild(ul);
    }

    div.appendChild(block);
  });
}

// Inicializar
renderTasks();
