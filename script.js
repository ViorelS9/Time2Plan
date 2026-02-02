const dueDateInput = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const taskList = document.getElementById("taskList");

addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value;
  const dueDateValue = dueDateInput.value;
const today = new Date();
const dueDate = new Date(dueDateValue);

const diffTime = dueDate - today;
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

let priority = "baja";

if (diffDays <= 1) {
  priority = "alta";
} else if (diffDays <= 4) {
  priority = "media";
}

  if (taskText !== "") {
    const li = document.createElement("li");
    li.textContent = taskText + " - vence: " + dueDateValue + " (" + priority + ")";

    if (priority === "alta") {
      li.style.color = "red";
    } else if (priority === "media") {
      li.style.color = "orange";
    } else {
      li.style.color = "green";
    }

    li.addEventListener("click", function () {
      li.style.textDecoration = "line-through";
    });

    taskList.appendChild(li);
    taskInput.value = "";
  }
});
