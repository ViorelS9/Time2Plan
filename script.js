let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};
let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

let currentNote = null;
let currentPage = 0;

const weekDays=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

function saveAll(){
localStorage.setItem("tasks",JSON.stringify(tasks));
localStorage.setItem("notes",JSON.stringify(notes));
localStorage.setItem("schedule",JSON.stringify(schedule));
}

/* ---------- NAVEGACIÓN ---------- */

function openPage(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

function goHome(){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById("home").classList.add("active");
}

/* -------- NOTIFICATIONS -------- */

function renderNotifications(){
let box=document.getElementById("notificationsBox");
box.innerHTML="";
tasks.forEach(t=>{
let daysLeft=(new Date(t.date)-new Date())/(1000*60*60*24);
if(daysLeft<=2 && !t.completed){
box.innerHTML+="Tarea '"+t.title+"' es urgente<br>";
}
});
}

/* -------- TASKS -------- */

function addTask(){
let t={
id:Date.now(),
title:tTitle.value,
desc:tDesc.value,
date:tDate.value,
days:parseInt(tDays.value)||0,
hours:parseInt(tHours.value)||0,
type:tType.value,
difficulty:tDifficulty.value,
completed:false,
show:false
};
tasks.push(t);
saveAll();
renderTasks();
}

function renderTasks(){
let list=document.getElementById("taskList");
list.innerHTML="";
tasks.forEach(t=>{
let li=document.createElement("li");
if(t.completed) li.classList.add("completed");

li.innerHTML=`
<strong>${t.title}</strong> - ${t.date}
<button onclick="toggleTask(${t.id});event.stopPropagation()">Completar</button>
<button onclick="deleteTask(${t.id});event.stopPropagation()">Eliminar</button>
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
renderNotifications();
}

function deleteTask(id){
tasks=tasks.filter(t=>t.id!==id);
saveAll();
renderTasks();
renderNotifications();
}

/* -------- SCHEDULE -------- */

function generateSchedule(){
let blocked=blockedDays.value.toLowerCase().split(",").map(d=>d.trim());
let start=parseInt(startHour.value);
let end=parseInt(endHour.value);

let hours=[];
for(let h=start;h<end;h++) hours.push(h+":00");

schedule={};
weekDays.forEach(d=>{
schedule[d]={};
hours.forEach(h=>schedule[d][h]=null);
});

let availableDays=weekDays.filter(d=>!blocked.includes(d.toLowerCase()));
let dayIndex=0;

tasks.filter(t=>!t.completed).forEach(task=>{
if(availableDays.length===0) return;
let day=availableDays[dayIndex%availableDays.length];
for(let h of hours){
if(!schedule[day][h]){
schedule[day][h]={title:task.title};
break;
}
}
dayIndex++;
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
saveAll();
};
reader.readAsDataURL(file);
});

/* INIT */
renderTasks();
renderNotes();
renderNotifications();
