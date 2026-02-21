let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};
let schedule = JSON.parse(localStorage.getItem("schedule")) || null;

let currentNote = null;
let currentPage = 0;

const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

function saveAll(){
localStorage.setItem("tasks",JSON.stringify(tasks));
localStorage.setItem("notes",JSON.stringify(notes));
localStorage.setItem("schedule",JSON.stringify(schedule));
}

/* -------- NAVIGATION -------- */

function openSection(id){
document.querySelectorAll("section").forEach(s=>s.style.display="none");
document.getElementById(id).style.display="block";
}

function goHome(){
openSection("home");
renderNotifications();
}

openSection("home");

/* -------- NOTIFICATIONS -------- */

function renderNotifications(){
let box=document.getElementById("notificationsBox");
box.innerHTML="<strong>NOTIFICACIONES</strong><br>";

tasks.forEach(t=>{
let daysLeft=(new Date(t.date)-new Date())/(1000*60*60*24);
if(daysLeft<=2 && !t.completed){
box.innerHTML+="Tarea '"+t.title+"' es urgente<br>";
}
});
}

/* -------- TASKS -------- */

function showAddTask(){
document.getElementById("addTaskForm").style.display="block";
}

function addTask(){
let t={
id:Date.now(),
title:tTitle.value,
desc:tDesc.value,
date:tDate.value,
days:parseInt(tDays.value),
hours:parseInt(tHours.value),
type:tType.value,
difficulty:tDifficulty.value,
completed:false,
show:false
};
tasks.push(t);
saveAll();
renderTasks();
document.getElementById("addTaskForm").style.display="none";
}

function renderTasks(){
let list=document.getElementById("taskList");
list.innerHTML="";
tasks.forEach(t=>{
let li=document.createElement("li");
if(t.completed) li.classList.add("completed");

li.innerHTML=`
${t.title} - ${t.date}
<button onclick="toggleTask(${t.id})">Completar</button>
<button onclick="deleteTask(${t.id})">Eliminar</button>
`;

li.onclick=()=>{
t.show=!t.show;
renderTasks();
};

if(t.show){
let p=document.createElement("p");
p.textContent=t.desc;
li.appendChild(p);
}

list.appendChild(li);
});
}

function toggleTask(id){
tasks=tasks.map(t=>t.id===id?{...t,completed:!t.completed}:t);
saveAll();
renderTasks();
}

function deleteTask(id){
tasks=tasks.filter(t=>t.id!==id);
saveAll();
renderTasks();
}

/* -------- SCHEDULE -------- */

function showCreateSchedule(){
document.getElementById("createScheduleForm").style.display="block";
}

function generateSchedule(){
let blocked=document.getElementById("blockedDays").value.toLowerCase();
let start=parseInt(startHour.value);
let end=parseInt(endHour.value);

let hours=[];
for(let h=start;h<end;h++) hours.push(h+":00");

schedule={};
weekDays.forEach(d=>{
schedule[d]={};
hours.forEach(h=>schedule[d][h]=null);
});

tasks.filter(t=>!t.completed).forEach((t,i)=>{
let day=weekDays[i%7];
if(!blocked.includes(day.toLowerCase())){
schedule[day][hours[0]]={title:t.title};
}
});

saveAll();
renderCalendar(hours);
}

function renderCalendar(hours){
let cal=document.getElementById("calendar");
cal.innerHTML="";
let table=document.createElement("table");

let header=document.createElement("tr");
header.appendChild(document.createElement("th"));
weekDays.forEach(d=>{
let th=document.createElement("th");
th.textContent=d;
header.appendChild(th);
});
table.appendChild(header);

hours.forEach(hour=>{
let row=document.createElement("tr");
let hCell=document.createElement("td");
hCell.textContent=hour;
row.appendChild(hCell);

weekDays.forEach(day=>{
let cell=document.createElement("td");
let task=schedule[day][hour];
if(task){
let div=document.createElement("div");
div.className="task-block";
div.textContent=task.title;
cell.appendChild(div);
}
row.appendChild(cell);
});
table.appendChild(row);
});

cal.appendChild(table);
}

/* -------- NOTES -------- */

function createNote(){
let name=prompt("Titulo de la nota");
if(!name) return;
notes[name]={pages:[""]};
saveAll();
renderNotes();
}

function renderNotes(){
let container=document.getElementById("notesList");
container.innerHTML="";
Object.keys(notes).forEach(n=>{
let div=document.createElement("div");
div.className="note-card";
div.textContent=n;
div.onclick=()=>openNote(n);
container.appendChild(div);
});
}

function openNote(name){
currentNote=name;
currentPage=0;
document.getElementById("noteEditor").style.display="block";
noteTitle.textContent=name;
renderPages();
loadPage();
}

function deleteNote(){
delete notes[currentNote];
currentNote=null;
saveAll();
document.getElementById("noteEditor").style.display="none";
renderNotes();
}

function renderPages(){
let p=document.getElementById("pages");
p.innerHTML="";
notes[currentNote].pages.forEach((_,i)=>{
let btn=document.createElement("button");
btn.textContent="Pagina "+(i+1);
btn.onclick=()=>{currentPage=i;loadPage();}
p.appendChild(btn);
});
}

function loadPage(){
editor.innerHTML=notes[currentNote].pages[currentPage];
}

editor.addEventListener("input",()=>{
if(currentNote){
notes[currentNote].pages[currentPage]=editor.innerHTML;
saveAll();
}
});

function addPage(){
notes[currentNote].pages.push("");
currentPage=notes[currentNote].pages.length-1;
saveAll();
renderPages();
loadPage();
}

function addImage(){
imgInput.click();
}

imgInput.addEventListener("change",function(e){
let file=e.target.files[0];
let reader=new FileReader();
reader.onload=function(){
editor.innerHTML+="<img src='"+reader.result+"' width='200'><br>";
};
reader.readAsDataURL(file);
});

/* INIT */
renderTasks();
renderNotes();
renderNotifications();
