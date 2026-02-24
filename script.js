/* ===========================
   VARIABLES GLOBALES
=========================== */

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};
let schedule = JSON.parse(localStorage.getItem("schedule")) || [];

let currentNote = null;
let currentPage = 0;

const weekDays = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];

/* ===========================
   GUARDADO
=========================== */

function saveAll(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("schedule", JSON.stringify(schedule));
}

/* ===========================
   NAVEGACIÓN
=========================== */

function openPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goHome(){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("home").classList.add("active");
}

/* ===========================
   PRIORIDAD
=========================== */

function calculatePriority(task){
  let score = 0;

  let today = new Date();
  let due = new Date(task.date);
  let daysLeft = Math.ceil((due - today)/(1000*60*60*24));

  if(daysLeft <= 2) score += 4;
  else if(daysLeft <= 5) score += 3;
  else if(daysLeft <= 10) score += 2;

  if(task.type === "Escolar") score += 3;

  if(task.difficulty === "Alta") score += 3;
  else if(task.difficulty === "Media") score += 2;
  else score += 1;

  return score;
}

/* ===========================
   TAREAS
=========================== */

function addTask(){
  let t = {
    id: Date.now(),
    title: tTitle.value,
    desc: tDesc.value,
    date: tDate.value,
    days: parseInt(tDays.value)||0,
    hours: parseInt(tHours.value)||0,
    type: tType.value,
    difficulty: tDifficulty.value,
    completed:false,
    show:false
  };

  tasks.push(t);
  saveAll();
  renderTasks();
}

function renderTasks(){
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(t=>{
    let div = document.createElement("div");
    div.className = "task-item";
    if(t.completed) div.classList.add("completed");

    div.innerHTML = `
      <strong>${t.title}</strong> - ${t.date}
      <br>
      <button onclick="toggleTask(${t.id})">Completar</button>
      <button onclick="deleteTask(${t.id})">Eliminar</button>
    `;

    div.onclick = ()=>{
      t.show = !t.show;
      renderTasks();
    };

    if(t.show){
      let p = document.createElement("p");
      p.textContent = t.desc;
      div.appendChild(p);
    }

    list.appendChild(div);
  });
}

function toggleTask(id){
  tasks = tasks.map(t=>t.id===id?{...t,completed:!t.completed}:t);
  saveAll();
  renderTasks();
}

function deleteTask(id){
  tasks = tasks.filter(t=>t.id!==id);
  saveAll();
  renderTasks();
}

/* ===========================
   GENERAR HORARIO INTELIGENTE
=========================== */

function generateSchedule(){

  schedule = [];

  let blockedInput = document.getElementById("blockedDays").value.toLowerCase();
  let startHour = parseInt(document.getElementById("startHour").value);
  let endHour = parseInt(document.getElementById("endHour").value);

  if(isNaN(startHour) || isNaN(endHour)) return;

  let blockedDays = blockedInput.split(",").map(d=>d.trim());

  let orderedTasks = tasks
    .filter(t=>!t.completed)
    .sort((a,b)=> calculatePriority(b) - calculatePriority(a));

  orderedTasks.forEach(task=>{

    let daysLeft = task.days;

    for(let d=0; d<weekDays.length && daysLeft>0; d++){

      let day = weekDays[d];

      if(blockedDays.includes(day)) continue;

      let available = endHour - startHour;
      if(available < task.hours) continue;

      schedule.push({
        id: Date.now() + Math.random(),
        taskId: task.id,
        title: task.title,
        day: day,
        start: startHour,
        end: startHour + task.hours
      });

      daysLeft--;
    }
  });

  saveAll();
  renderSchedule();
}

/* ===========================
   RENDER HORARIO
=========================== */

function renderSchedule(){

  let calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  let blockedInput = document.getElementById("blockedDays").value.toLowerCase();
  let blockedDays = blockedInput.split(",").map(d=>d.trim());

  let startHour = parseInt(document.getElementById("startHour").value);
  let endHour = parseInt(document.getElementById("endHour").value);

  let table = document.createElement("table");

  let header = document.createElement("tr");
  header.innerHTML = "<th>Hora</th>";
  weekDays.forEach(day=>{
    header.innerHTML += `<th>${day}</th>`;
  });
  table.appendChild(header);

  for(let h=startHour; h<endHour; h++){

    let row = document.createElement("tr");
    row.innerHTML = `<td>${h}:00</td>`;

    weekDays.forEach(day=>{
      let cell = document.createElement("td");

      if(blockedDays.includes(day)){
        cell.style.background = "#ffe0e0"; // rojo suave día ocupado
      }

      cell.ondragover = e=>e.preventDefault();

      cell.ondrop = e=>{
        let id = e.dataTransfer.getData("id");
        let item = schedule.find(s=>s.id==id);

        if(item && !blockedDays.includes(day)){
          item.day = day;
          item.start = h;
          item.end = h + (item.end - item.start);
          saveAll();
          renderSchedule();
        }
      };

      schedule.forEach(item=>{
        if(item.day===day && item.start===h){
          let block = document.createElement("div");
          block.className="task-block";
          block.textContent=item.title;
          block.draggable=true;

          block.ondragstart = e=>{
            e.dataTransfer.setData("id", item.id);
          };

          cell.appendChild(block);
        }
      });

      row.appendChild(cell);
    });

    table.appendChild(row);
  }

  calendar.appendChild(table);
}

/* ===========================
   NOTIFICACIONES
=========================== */

function renderNotifications(){
  let box=document.getElementById("notificationsBox");
  box.innerHTML="";

  tasks.forEach(t=>{
    let daysLeft=(new Date(t.date)-new Date())/(1000*60*60*24);
    if(daysLeft<=2 && !t.completed){
      box.innerHTML+=`Tarea "${t.title}" es urgente<br>`;
    }
  });
}

/* ===========================
   INIT
=========================== */

renderTasks();
renderSchedule();
renderNotifications();
