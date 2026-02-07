const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

// Calcular prioridad dinámica según fecha
function calculatePriority(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Muy Alta";
  if (diffDays <= 2) return "Alta";
  if (diffDays <= 5) return "Media";
  return "Baja";
}

// Guardar tareas
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Renderizar tareas
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

    details.appendChild(summary);

    const description = document.createElement("p");
    description.textContent = task.description || "Sin descripción";
    details.appendChild(description);

    if (task.completed) {
      summary.style.textDecoration = "line-through";
    }

    // Botón completar
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completar";
    completeBtn.onclick = () => {
      tasks[index].completed = true;
      saveTasks();
      renderTasks();
    };

    // Botón eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    details.appendChild(completeBtn);
    details.appendChild(deleteBtn);

    li.appendChild(details);
    taskList.appendChild(li);
  });
}

// Agregar tarea
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  const descriptionText = descriptionInput.value.trim();
  const dueDateValue = dateInput.value;

  if (taskText === "" || dueDateValue === "") return;

  const task = {
    text: taskText,
    description: descriptionText,
    dueDate: dueDateValue,
    priority: calculatePriority(dueDateValue),
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  descriptionInput.value = "";
  dateInput.value = "";
});

// Cargar tareas
window.onload = () => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
  }
};

// Asistente de prioridades
function showAssistantSuggestion() {
  const pendingTasks = tasks.filter(task => !task.completed);

  if (pendingTasks.length === 0) {
    alert("No hay tareas pendientes.");
    return;
  }

  const priorityValue = {
    "Muy Alta": 4,
    "Alta": 3,
    "Media": 2,
    "Baja": 1
  };

  pendingTasks.sort(
    (a, b) => priorityValue[b.priority] - priorityValue[a.priority]
  );

  let message = "Plan recomendado:\n\n";

  pendingTasks.slice(0, 3).forEach((task, index) => {
    message +=
      (index + 1) +
      ". " +
      task.text +
      " (" +
      task.priority +
      ")\n";
  });

  alert(message);
}
