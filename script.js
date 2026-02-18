const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let folders=JSON.parse(localStorage.getItem("folders"))||{};
let currentFolder=null;

const calendarDiv=document.getElementById("calendar");
const taskList=document.getElementById("taskList");

function saveAll(){
  localStorage.setItem("tasks",JSON.stringify(tasks));
  localStorage.setItem("folders",JSON.stringify(folders));
}

function calculatePriority(task){
  const diff=Math.ceil((new Date(task.dueDate)-new Date())/(1000*60*60*24));
  let score=diff<=1?4:diff<=3?3:diff<=6?2:1;
  if(task.complexity==="Alta")score+=2;
  if(task.type==="Escolar")score+=2;
  return score;
}

document.getElementById("addTaskBtn").onclick=()=>{
  tasks.push({
    text:document.getElementById("taskInput").value,
    dueDate:document.getElementById("dateInput").value,
    hoursPerDay:parseInt(document.getElementById("hoursPerDayInput").value),
    durationDays:parseInt(document.getElementById("durationDaysInput").value),
    complexity:document.getElementById("complexityInput").value,
    type:document.getElementById("typeInput").value,
    completed:false
  });
  saveAll();
  renderTasks();
};

function renderTasks(){
  taskList.innerHTML="";
  tasks.forEach((t,i)=>{
    const li=document.createElement("li");
    li.textContent=t.text;
    taskList.appendChild(li);
  });
}

document.getElementById("generateScheduleBtn").onclick=()=>{
  document.getElementById("scheduleConfig").style.display="block";
};

document.getElementById("confirmScheduleBtn").onclick=()=>{
  document.getElementById("scheduleConfig").style.display="none";
  generateSchedule();
};

function generateSchedule(){

  const blockedInput=document.getElementById("blockedDaysInput").value;
  const start=parseInt(document.getElementById("startHourInput").value);
  const end=parseInt(document.getElementById("endHourInput").value);

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

  renderCalendar(schedule,hours);
}

function renderCalendar(schedule,hours){
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

  hours.forEach(h=>{
    const row=document.createElement("tr");
    const hourCell=document.createElement("td");
    hourCell.textContent=h;
    row.appendChild(hourCell);

    weekDays.forEach(d=>{
      const cell=document.createElement("td");
      cell.dataset.day=d;
      cell.dataset.hour=h;

      cell.ondragover=e=>e.preventDefault();
      cell.ondrop=e=>{
        e.preventDefault();
        const data=e.dataTransfer.getData("text");
        cell.innerHTML=data;
      };

      if(schedule[d][h]){
        const div=document.createElement("div");
        div.className="task-block";
        div.textContent=schedule[d][h];
        div.draggable=true;
        div.ondragstart=e=>{
          e.dataTransfer.setData("text",div.outerHTML);
        };
        cell.appendChild(div);
      }

      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  calendarDiv.appendChild(table);
}

document.getElementById("addFolderBtn").onclick=()=>{
  const name=document.getElementById("folderInput").value;
  if(!name)return;
  folders[name]=[];
  saveAll();
  renderFolders();
};

function renderFolders(){
  const container=document.getElementById("folders");
  container.innerHTML="";
  Object.keys(folders).forEach(name=>{
    const div=document.createElement("div");
    div.className="folder";
    div.textContent=name;
    div.onclick=()=>{
      currentFolder=name;
      document.getElementById("notesSection").style.display="block";
      document.getElementById("currentFolderTitle").textContent=name;
      renderNotes();
    };
    container.appendChild(div);
  });
}

document.getElementById("saveNoteBtn").onclick=()=>{
  if(!currentFolder)return;
  const note=document.getElementById("noteInput").value;
  folders[currentFolder].push(note);
  saveAll();
  renderNotes();
};

function renderNotes(){
  const list=document.getElementById("notesList");
  list.innerHTML="";
  folders[currentFolder].forEach(n=>{
    const div=document.createElement("div");
    div.textContent=n;
    list.appendChild(div);
  });
}

renderTasks();
renderFolders();
