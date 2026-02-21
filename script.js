const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let documents=JSON.parse(localStorage.getItem("documents"))||{};
let currentDoc=null;
let currentSchedule=null;
let currentHours=null;

/* ========= GUARDAR ========= */
function saveAll(){
  localStorage.setItem("tasks",JSON.stringify(tasks));
  localStorage.setItem("documents",JSON.stringify(documents));
}

/* ========= PRIORIDAD ========= */
function calculatePriority(task){
  const diff=Math.ceil((new Date(task.dueDate)-new Date())/(1000*60*60*24));
  let score=diff<=1?4:diff<=3?3:diff<=6?2:1;
  if(task.complexity==="Alta")score+=2;
  if(task.type==="Escolar")score+=2;
  return score;
}

/* ========= TAREAS ========= */
addTaskBtn.onclick=()=>{
  if(!taskInput.value || !dateInput.value) return;

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

/* ========= HORARIO ========= */
generateScheduleBtn.onclick=()=>{
  scheduleConfig.style.display="block";
};

confirmScheduleBtn.onclick=()=>{
  scheduleConfig.style.display="none";
  generateSchedule();
};

function generateSchedule(){

  const blockedInput=blockedDaysInput.value.toLowerCase();
  const start=parseInt(startHourInput.value);
  const end=parseInt(endHourInput.value);

  let blocked=[];
  weekDays.forEach(d=>{
    if(blockedInput.includes(d.toLowerCase())) blocked.push(d);
  });

  let hours=[];
  for(let h=start;h<end;h++) hours.push(h+":00");

  let schedule={};
  weekDays.forEach(d=>{
    schedule[d]={};
    hours.forEach(h=>schedule[d][h]=null);
  });

  let sorted=tasks.sort((a,b)=>calculatePriority(b)-calculatePriority(a));

  let dayIndex=0;

  sorted.forEach(task=>{
    let daysAssigned=0;
    while(daysAssigned<task.durationDays && dayIndex<7){
      let d=weekDays[dayIndex];
      if(!blocked.includes(d)){
        for(let h=0;h<task.hoursPerDay && h<hours.length;h++){
          schedule[d][hours[h]]={ text:task.text };
        }
        daysAssigned++;
      }
      dayIndex++;
    }
  });

  currentSchedule=schedule;
  currentHours=hours;

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

  currentHours.forEach(hour=>{
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

        currentSchedule[data.day][data.hour]=null;
        currentSchedule[day][hour]={ text:data.text };

        renderCalendar();
      };

      const task=currentSchedule[day][hour];

      if(task){
        const div=document.createElement("div");
        div.className="task-block";
        div.textContent=task.text;
        div.draggable=true;

        div.ondragstart=e=>{
          e.dataTransfer.setData("task",JSON.stringify({
            text:task.text,
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

/* ========= DOCUMENTOS ========= */
createDocBtn.onclick=()=>{
  const name=newDocInput.value.trim();
  if(!name) return;

  documents[name]="";
  saveAll();
  renderDocs();
  newDocInput.value="";
};

function renderDocs(){
  docList.innerHTML="";
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

    docList.appendChild(div);
  });
}

docEditor.addEventListener("input",()=>{
  if(currentDoc){
    documents[currentDoc]=docEditor.innerHTML;
    saveAll();
  }
});

renderTasks();
renderDocs();
