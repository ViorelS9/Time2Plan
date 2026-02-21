document.addEventListener("DOMContentLoaded", function(){

const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let schedule=JSON.parse(localStorage.getItem("schedule"))||null;
let notes=JSON.parse(localStorage.getItem("notes"))||{};

let currentFolder=null;
let currentPage=0;

/* ================= SAVE ================= */
function saveAll(){
  localStorage.setItem("tasks",JSON.stringify(tasks));
  localStorage.setItem("schedule",JSON.stringify(schedule));
  localStorage.setItem("notes",JSON.stringify(notes));
}

/* ================= TAREAS ================= */
document.getElementById("btnAddTask").addEventListener("click",function(){

  const title=document.getElementById("tTitle").value;
  const desc=document.getElementById("tDesc").value;
  const date=document.getElementById("tDate").value;
  const days=parseInt(document.getElementById("tDays").value);
  const hours=parseInt(document.getElementById("tHours").value);
  const type=document.getElementById("tType").value;

  if(!title || !date) return alert("Faltan datos");

  tasks.push({
    id:Date.now(),
    title,desc,date,days,hours,type,
    completed:false
  });

  saveAll();
  renderTasks();
});

function renderTasks(){
  const list=document.getElementById("taskList");
  list.innerHTML="";
  tasks.forEach(t=>{
    const li=document.createElement("li");

    if(t.completed) li.classList.add("completed");

    li.innerHTML=`
      <strong>${t.title}</strong> (${t.type})
      <br>
      <button onclick="toggleComplete(${t.id})">✔ Completar</button>
      <button onclick="deleteTask(${t.id})">🗑 Eliminar</button>
    `;

    list.appendChild(li);
  });
}

window.toggleComplete=function(id){
  tasks=tasks.map(t=>t.id===id?{...t,completed:!t.completed}:t);
  saveAll();
  renderTasks();
}

window.deleteTask=function(id){
  tasks=tasks.filter(t=>t.id!==id);
  saveAll();
  renderTasks();
}

/* ================= PRIORIDAD IA ================= */
function priorityScore(task){
  const daysLeft=(new Date(task.date)-new Date())/(1000*60*60*24);
  let score=100-daysLeft;
  if(task.type==="Escolar") score+=20;
  return score;
}

/* ================= HORARIO ================= */
document.getElementById("btnGenerateSchedule").addEventListener("click",function(){

  const blockedInput=document.getElementById("blockedDays").value.toLowerCase();
  const start=parseInt(document.getElementById("startHour").value);
  const end=parseInt(document.getElementById("endHour").value);

  let hours=[];
  for(let h=start;h<end;h++) hours.push(h+":00");

  schedule={};
  weekDays.forEach(d=>{
    schedule[d]={};
    hours.forEach(h=>schedule[d][h]=null);
  });

  let sorted=[...tasks]
    .filter(t=>!t.completed)
    .sort((a,b)=>priorityScore(b)-priorityScore(a));

  let dayIndex=0;

  sorted.forEach(task=>{
    let assigned=0;
    while(assigned<task.days && dayIndex<7){
      let day=weekDays[dayIndex];
      if(!blockedInput.includes(day.toLowerCase())){
        for(let i=0;i<task.hours && i<hours.length;i++){
          schedule[day][hours[i]]={title:task.title};
        }
        assigned++;
      }
      dayIndex++;
    }
  });

  saveAll();
  renderCalendar(hours);
});

function renderCalendar(hours){

  const cal=document.getElementById("calendar");
  cal.innerHTML="";
  const table=document.createElement("table");

  const header=document.createElement("tr");
  header.appendChild(document.createElement("th"));
  weekDays.forEach(d=>{
    const th=document.createElement("th");
    th.textContent=d;
    header.appendChild(th);
  });
  table.appendChild(header);

  hours.forEach(hour=>{
    const row=document.createElement("tr");
    const hourCell=document.createElement("td");
    hourCell.textContent=hour;
    row.appendChild(hourCell);

    weekDays.forEach(day=>{
      const cell=document.createElement("td");
      cell.ondragover=e=>e.preventDefault();

      cell.ondrop=e=>{
        e.preventDefault();
        const data=JSON.parse(e.dataTransfer.getData("text"));
        schedule[data.day][data.hour]=null;
        schedule[day][hour]={title:data.title};
        saveAll();
        renderCalendar(hours);
      };

      const task=schedule[day][hour];
      if(task){
        const div=document.createElement("div");
        div.className="task-block";
        div.textContent=task.title;
        div.draggable=true;

        div.ondragstart=e=>{
          e.dataTransfer.setData("text",JSON.stringify({
            title:task.title,
            day:day,
            hour:hour
          }));
        };

        cell.appendChild(div);
      }

      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  cal.appendChild(table);
}

/* ================= NOTAS ================= */
document.getElementById("btnCreateFolder").addEventListener("click",function(){
  const name=document.getElementById("folderName").value;
  if(!name) return;
  notes[name]={pages:[""]};
  saveAll();
  renderFolders();
});

function renderFolders(){
  const container=document.getElementById("folders");
  container.innerHTML="";
  Object.keys(notes).forEach(name=>{
    const div=document.createElement("div");
    div.className="note-folder";
    div.textContent=name;
    div.onclick=()=>openFolder(name);
    container.appendChild(div);
  });
}

function openFolder(name){
  currentFolder=name;
  currentPage=0;
  document.getElementById("noteArea").style.display="block";
  document.getElementById("folderTitle").textContent=name;
  renderPages();
  loadPage();
}

function renderPages(){
  const bar=document.getElementById("pagesBar");
  bar.innerHTML="";
  notes[currentFolder].pages.forEach((_,i)=>{
    const btn=document.createElement("div");
    btn.className="page-btn";
    btn.textContent="Página "+(i+1);
    btn.onclick=()=>{currentPage=i;loadPage();};
    bar.appendChild(btn);
  });
}

function loadPage(){
  document.getElementById("editor").innerHTML=
    notes[currentFolder].pages[currentPage];
}

document.getElementById("btnAddPage").addEventListener("click",function(){
  notes[currentFolder].pages.push("");
  currentPage=notes[currentFolder].pages.length-1;
  saveAll();
  renderPages();
  loadPage();
});

document.getElementById("editor").addEventListener("input",function(){
  if(currentFolder!==null){
    notes[currentFolder].pages[currentPage]=this.innerHTML;
    saveAll();
  }
});

document.getElementById("imageUpload").addEventListener("change",function(e){
  const file=e.target.files[0];
  const reader=new FileReader();
  reader.onload=function(){
    document.getElementById("editor").innerHTML+=
      "<img src='"+reader.result+"' width='200'><br>";
  };
  if(file) reader.readAsDataURL(file);
});

renderTasks();
renderFolders();

});
