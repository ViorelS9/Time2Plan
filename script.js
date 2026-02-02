const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const taskList = document.getElementById("taskList");

addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value;
  const priority = prioritySelect.value;

  if (taskText !== "") {
    const li = document.createElement("li");
    li.textContent = taskText + " (" + priority + ")";

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
