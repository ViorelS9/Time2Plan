let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};

let currentNote = null;
let currentPage = 0;

/* =====================
   GUARDAR
===================== */
function saveAll() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("notes", JSON.stringify(notes));
}

/* =====================
   TAREAS
===================== */
addTask.onclick = () => {

  if(!taskTitle.value || !taskDate.value) return;

  tasks.push({
    id: Date.now(),
    title: taskTitle.value,
    desc: taskDesc.value,
    date: taskDate.value,
    hours: parseInt(taskHours.value),
    days: parseInt(taskDays.value),
    complexity: taskComplexity.value,
    type: taskType.value,
    done: false
  });

  saveAll();
  renderTasks();
};

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {

    const li = document.createElement("li");

    if(task.done) li.classList.add("completed");

    li.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.desc}<br>
      Fecha: ${task.date}<br>
      <button onclick="toggleDone(${task.id})">✔</button>
      <button onclick="deleteTask(${task.id})">🗑</button>
    `;

    taskList.appendChild(li);
  });
}

function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
  saveAll();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAll();
  renderTasks();
}

/* =====================
   NOTAS CON PÁGINAS
===================== */
createNote.onclick = () => {

  const name = newNoteName.value.trim();
  if(!name) return;

  notes[name] = {
    pages: [""]
  };

  saveAll();
  renderNotes();
  newNoteName.value = "";
};

function renderNotes() {
  notesList.innerHTML = "";

  Object.keys(notes).forEach(name => {

    const div = document.createElement("div");
    div.className = "note-box";
    div.textContent = name;

    div.onclick = () => openNote(name);

    notesList.appendChild(div);
  });
}

function openNote(name) {
  currentNote = name;
  currentPage = 0;

  noteSection.style.display = "block";
  noteTitle.textContent = name;

  renderPages();
  loadPage();
}

function renderPages() {
  pagesBar.innerHTML = "";

  notes[currentNote].pages.forEach((_, index) => {

    const btn = document.createElement("div");
    btn.className = "page-btn";
    btn.textContent = "Página " + (index + 1);

    btn.onclick = () => {
      currentPage = index;
      loadPage();
    };

    pagesBar.appendChild(btn);
  });
}

function loadPage() {
  editor.innerHTML = notes[currentNote].pages[currentPage];
}

addPage.onclick = () => {

  notes[currentNote].pages.push("");
  currentPage = notes[currentNote].pages.length - 1;

  saveAll();
  renderPages();
  loadPage();
};

editor.addEventListener("input", () => {
  if(currentNote !== null) {
    notes[currentNote].pages[currentPage] = editor.innerHTML;
    saveAll();
  }
});

renderTasks();
renderNotes();
