const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

// Calcular prioridad SOLO con fecha
function calculatePriority(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "Alta";
  if (diffDays <= 3) return "Media";
  return "Baja";
}

// Mostrar tarea en pantalla
function addTaskToList(text, dueDate, priority) {
  const li = document.createElement("li");
  li.textContent = `${text} | 📅 ${dueDate} | 🔥 ${priority}`;
  taskList.appendChild(li);
}

// Botón agregar tarea
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  const dueDateValue = dateInput.value;

  if (taskText === "" || dueDateValue === "") return;

  const priority = calculatePriority(dueDateValue);

  const task = {
    text: taskText,
    dueDate: dueDateValue,
    priority: priority
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  addTaskToList(task.text, task.dueDate, task.priority);

  taskInput.value = "";
  dateInput.value = "";
});

// Cargar tareas guardadas
window.onload = () => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    tasks.forEach(task =>
      addTaskToList(task.text, task.dueDate, task.priority)
    );
  }
};
