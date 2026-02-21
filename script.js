const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let notes=JSON.parse(localStorage.getItem("notes"))||{};
let schedule=null;
let hoursRange=[];

let currentNote=null;
let currentPage=0;

/* ========= GUARDAR ========= */
function saveAll(){
  localStorage.setItem("tasks",JSON.stringify(tasks));
  localStorage.setItem("notes",JSON.stringify(notes));
}

/* ========= TAREAS ========= */
document.getElementById("addTaskBtn").onclick=()=>{
  if(!taskTitle.value || !taskDate.value) return;

  tasks.push({
    id:Date.now(),
    title:taskTitle.value,
    desc:taskDesc.value,
    date:taskDate.value,
    hours:parseInt(taskHours.value),
    days:parseInt(taskDays.value),
    complexity:taskComplexity.value,
    type:taskType.value,
    done:false
  });

  saveAll();
  renderTasks();
};

function renderTasks(){
  taskList.innerHTML="";
  tasks.forEach(t=>{
    const li=document.createElement("li");
    if(t.done) li.classList.add("completed");

    li.innerHTML=`
      <strong>${t.title}</strong><br>
      ${t.desc}<br>
      Fecha: ${t.date}<br>
      <button onclick="toggleDone(${t.id})">✔</button>
      <button onclick="deleteTask(${t.id})">🗑</button>
    `;

    taskList.appendChild(li);
  });
}

function toggleDone(id){
  tasks=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);
  saveAll();
  renderTasks();
}

function deleteTask(id){
  tasks=tasks.filter(t=>t.id!==id);
  saveAll();
  renderTasks();
}

/* ========= HORARIO ========= */
document.getElementById("generateScheduleBtn").onclick=generateSchedule;

function generateSchedule(){

  const blockedInput=blockedDays.value.toLowerCase();
  const start=parseInt(startHour.value);
  const end=parseInt(endHour.value);

  hoursRange=[];
  for(let h=start;h<end;h++) hoursRange.push(h+":00");

  schedule={};
  weekDays.forEach(d=>{
    schedule[d]={};
    hoursRange.forEach(h=>schedule[d][h]=null);
  });

  let dayIndex=0;

  tasks.filter(t=>!t.done).forEach(task=>{
    let assigned=0;
    while(assigned<task.days && dayIndex<7){
      let day=weekDays[dayIndex];
      if(!blockedInput.includes(day.toLowerCase())){
        for(let i=0;i<task.hours && i<hoursRange.length;i++){
          schedule[day][hoursRange[i]]={title:task.title};
        }
        assigned++;
      }
      dayIndex++;
    }
  });

  renderCalendar();
}

function renderCalendar(){
  calendar.innerHTML="";
  const table=document.createElement("table");

  const header=document.createElement("tr");
  header.appendChild(document.createElement("th"));
  weekDays.forEach(d=>{
    const th=document.createElement("th");
    th.textContent=d;
    header.appendChild(th);
  });
  table.appendChild(header);

  hoursRange.forEach(hour=>{
    const row=document.createElement("tr");
    const hourCell=document.createElement("td");
    hourCell.textContent=hour;
    row.appendChild(hourCell);

    weekDays.forEach(day=>{
      const cell=document.createElement("td");
      cell.ondragover=e=>e.preventDefault();

      cell.ondrop=e=>{
        e.preventDefault();
        const data=JSON.parse(e.dataTransfer.getData("task"));
        schedule[data.day][data.hour]=null;
        schedule[day][hour]={title:data.title};
        renderCalendar();
      };

      const task=schedule[day][hour];
      if(task){
        const div=document.createElement("div");
        div.className="task-block";
        div.textContent=task.title;
        div.draggable=true;

        div.ondragstart=e=>{
          e.dataTransfer.setData("task",JSON.stringify({
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

  calendar.appendChild(table);
}

/* ========= NOTAS ========= */
document.getElementById("createNoteBtn").onclick=()=>{
  const name=newNoteName.value.trim();
  if(!name) return;

  notes[name]={pages:[""]};
  saveAll();
  renderNotes();
  newNoteName.value="";
};

function renderNotes(){
  notesList.innerHTML="";
  Object.keys(notes).forEach(name=>{
    const div=document.createElement("div");
    div.className="note-box";
    div.textContent=name;
    div.onclick=()=>openNote(name);
    notesList.appendChild(div);
  });
}

function openNote(name){
  currentNote=name;
  currentPage=0;
  noteSection.style.display="block";
  noteTitle.textContent=name;
  renderPages();
  loadPage();
}

function renderPages(){
  pagesBar.innerHTML="";
  notes[currentNote].pages.forEach((_,i)=>{
    const btn=document.createElement("div");
    btn.className="page-btn";
    btn.textContent="Página "+(i+1);
    btn.onclick=()=>{currentPage=i;loadPage();};
    pagesBar.appendChild(btn);
  });
}

function loadPage(){
  editor.innerHTML=notes[currentNote].pages[currentPage];
}

document.getElementById("addPageBtn").onclick=()=>{
  notes[currentNote].pages.push("");
  currentPage=notes[currentNote].pages.length-1;
  saveAll();
  renderPages();
  loadPage();
};

editor.addEventListener("input",()=>{
  if(currentNote!==null){
    notes[currentNote].pages[currentPage]=editor.innerHTML;
    saveAll();
  }
});

renderTasks();
renderNotes();
