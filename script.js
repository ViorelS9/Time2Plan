const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let documents=JSON.parse(localStorage.getItem("documents"))||{};
let currentDoc=null;
let currentSchedule=null;
let currentHours=null;

const calendarDiv=document.getElementById("calendar");
const taskList=document.getElementById("taskList");

/* =========================
   GUARDAR TODO
========================= */
function saveAll(){
  localStorage.setItem("tasks",JSON.stringify(tasks));
  localStorage.setItem("documents",JSON.stringify(documents));
}

/* =========================
   PRIORIDAD
========================= */
function calculatePriority(task){
  const diff=Math.ceil((new Date(task.dueDate)-new Date())/(1000*60*60*24));
  let score=diff<=1?4:diff<=3?3:diff<=6?2:1;
  if(task.complexity==="Alta")score+=2;
  if(task.type==="Escolar")score+=2;
  return score;
}

/* =========================
   TAREAS
========================= */
document.getElementById("addTaskBtn").onclick=()=>{
  tasks.push({
    text:taskInput.value,
    dueDate:dateInput.value,
    hoursPerDay:parseInt(hoursPerDayInput.value),
    durationDays:parseInt(durationDaysInput.value),
    complexity:complexityInput.value,
    type:typeInput.value,
    completed:false
  });
  saveAll();
  renderTasks();
};

function renderTasks(){
  taskList.innerHTML="";
  tasks.forEach(t=>{
    const li=document.createElement("li");
    li.textContent=t.text;
    taskList.appendChild(li);
  });
}

/* =========================
   GENERAR HORARIO
========================= */
generateScheduleBtn.onclick=()=>{
  scheduleConfig.style.display="block";
};

confirmScheduleBtn.onclick=()=>{
  scheduleConfig.style.display="none";
  generateSchedule();
};

function generateSchedule(){

  const blockedInput=blockedDaysInput.value;
  const start=parseInt(startHourInput.value);
  const end=parseInt(endHourInput.value);

  let blocked=[];
  weekDays.forEach(d=>{
    if(blockedInput.toLowerCase().includes(d.toLowerCase()))blocked.push(d);
  });

  let hours=[];
  for(let h=start;h<end;h++)hours.push(h+":00");

  let schedule={};
  weekDays.forEach(d=>{
    schedule[d]={};
    hours.forEach(h=>schedule[d][h]="");
  });

  let sorted=tasks.filter(t=>!t.completed).sort((a,b)=>calculatePriority(b)-calculatePriority(a));

  let dayIndex=0;

  sorted.forEach(task=>{
    let count=0;
    while(count<task.durationDays&&dayIndex<7){
      let d=weekDays[dayIndex];
      if(!blocked.includes(d)){
        for(let h=0;h<task.hoursPerDay&&h<hours.length;h++){
          schedule[d][hours[h]]=task.text;
        }
        count++;
      }
      dayIndex++;
    }
  });

  currentSchedule=schedule;
  currentHours=hours;

  renderCalendar();
}

/* =========================
   CALENDARIO DRAG REAL
========================= */
function renderCalendar(){

  calendarDiv.innerHTML="";
  const table=document.createElement("table");

  const header=document.createElement("tr");
  header.appendChild(document.createElement("th"));
  weekDays.forEach(d=>{
    const th=document.createElement("th");
    th.textContent=d;
    header.appendChild(th);
  });
  table.appendChild(header);

  currentHours.forEach(hour=>{
    const row=document.createElement("tr");

    const hourCell=document.createElement("td");
    hourCell.textContent=hour;
    row.appendChild(hourCell);

    weekDays.forEach(day=>{
      const cell=document.createElement("td");
      cell.dataset.day=day;
      cell.dataset.hour=hour;

      cell.ondragover=e=>e.preventDefault();

      cell.ondrop=e=>{
        e.preventDefault();
        const data=JSON.parse(e.dataTransfer.getData("task"));
        currentSchedule[data.day][data.hour]="";
        currentSchedule[day][hour]=data.text;
        renderCalendar();
      };

      if(currentSchedule[day][hour]){
        const div=document.createElement("div");
        div.className="task-block";
        div.textContent=currentSchedule[day][hour];
        div.draggable=true;

        div.ondragstart=e=>{
          e.dataTransfer.setData("task",JSON.stringify({
            text:currentSchedule[day][hour],
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

  calendarDiv.appendChild(table);
}

/* =========================
   DOCUMENTOS TIPO GOOGLE DOCS
========================= */
addFolderBtn.onclick=()=>{
  const name=folderInput.value;
  if(!name)return;
  documents[name]="";
  saveAll();
  renderFolders();
};

function renderFolders(){
  folders.innerHTML="";
  Object.keys(documents).forEach(name=>{
    const div=document.createElement("div");
    div.className="folder";
    div.textContent=name;
    div.onclick=()=>{
      currentDoc=name;
      documentSection.style.display="block";
      docTitle.textContent=name;
      docEditor.innerHTML=documents[name];
    };
    folders.appendChild(div);
  });
}

docEditor.addEventListener("input",()=>{
  if(currentDoc){
    documents[currentDoc]=docEditor.innerHTML;
    saveAll();
  }
});

renderTasks();
renderFolders();
