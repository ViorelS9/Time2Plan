const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

// Calcular prioridad según fecha
function calculatePriority(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "Alta";
  if (diffDays <= 4) return "Media";
  return "Baja";
}

// Guardar en localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Mostrar tareas
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.textContent =
      task.text +
      " | Fecha: " +
      task.dueDate +
      " | Prioridad: " +
      task.priority;

    if (task.completed) {
      li.style.textDecoration = "line-through";
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

    li.appendChild(document.createElement("br"));
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

// Agregar tarea
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  const dueDateValue = dateInput.value;

  if (taskText === "" || dueDateValue === "") return;

  const task = {
    text: taskText,
    dueDate: dueDateValue,
    priority: calculatePriority(dueDateValue),
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  dateInput.value = "";
});

// Cargar tareas al iniciar
window.onload = () => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
  }
};
