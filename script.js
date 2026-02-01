addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value;

  if (taskText !== "") {
    const li = document.createElement("li");
    li.textContent = taskText;

    li.addEventListener("click", function () {
      li.style.textDecoration = "line-through";
    });

    taskList.appendChild(li);
    taskInput.value = "";
  }
});
