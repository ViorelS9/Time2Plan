const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const dateInput = document.getElementById("dateInput");
const hoursPerDayInput = document.getElementById("hoursPerDayInput");
const durationDaysInput = document.getElementById("durationDaysInput");
const complexityInput = document.getElementById("complexityInput");
const typeInput = document.getElementById("typeInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const generateBtn = document.getElementById("generateScheduleBtn");
const calendarDiv = document.getElementById("calendar");

const configDiv = document.getElementById("scheduleConfig");
const confirmBtn = document.getElementById("confirmScheduleBtn");

const weekDays = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function calculatePriority(task) {
  const today = new Date();
  const due = new Date(task.dueDate);
  const diff = Math.ceil((due - today)/(1000*60*60*24));

  let score = 0;

  if (diff <= 1) score += 4;
  else if (diff <= 3) score += 3;
  else if (diff <= 6) score += 2;
  else score += 1;

  if (task.complexity === "Alta") score += 2;
  if (task.type === "Escolar") score += 2;

  if (score >= 7) return "Muy Alta";
  if (score >= 5) return "Alta";
  if (score >= 3) return "Media";
  return "Baja";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task,index) => {

    const li = document.createElement("li");
    li.textContent = task.text + " | Prioridad: " + calculatePriority(task);

    if (task.completed) li.classList.add("completed");

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completar";
    completeBtn.onclick = () => {
      task.completed = true;
      saveTasks();
      renderTasks();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = () => {
      tasks.splice(index,1);
      saveTasks();
      renderTasks();
    };

    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

addTaskBtn.onclick = () => {

  if (!taskInput.value || !dateInput.value) return;

  tasks.push({
    text: taskInput.value,
    description: descriptionInput.value,
    dueDate: dateInput.value,
    hoursPerDay: parseInt(hoursPerDayInput.value),
    durationDays: parseInt(durationDaysInput.value),
    complexity: complexityInput.value,
    type: typeInput.value,
    completed:false
  });

  saveTasks();
  renderTasks();
};

generateBtn.onclick = () => {
  configDiv.style.display = "block";
};

confirmBtn.onclick = () => {
  configDiv.style.display = "none";
  generateSchedule();
};

function generateSchedule() {

  const preferences = document.getElementById("blockedDaysInput").value;
  const startHour = parseInt(document.getElementById("startHourInput").value);
  const endHour = parseInt(document.getElementById("endHourInput").value);

  if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) {
    alert("Horas inválidas");
    return;
  }

  let blockedDays = [];

  if (preferences) {
    weekDays.forEach(day => {
      if (preferences.toLowerCase().includes(day.toLowerCase())) {
        blockedDays.push(day);
      }
    });
  }

  let hours = [];
  for (let h=startHour; h<endHour; h++) {
    hours.push(h + ":00");
  }

  const pending = tasks
    .filter(t=>!t.completed)
    .sort((a,b)=>{
      const val = {"Muy Alta":4,"Alta":3,"Media":2,"Baja":1};
      return val[calculatePriority(b)] - val[calculatePriority(a)];
    });

  let schedule = {};
  weekDays.forEach(day=>{
    schedule[day]={};
    hours.forEach(hour=>schedule[day][hour]="");
  });

  let dayIndex = 0;

  pending.forEach(task=>{
    let assignedDays=0;

    while (assignedDays<task.durationDays && dayIndex<7) {

      let currentDay=weekDays[dayIndex];

      if (!blockedDays.includes(currentDay)) {

        for (let h=0; h<task.hoursPerDay && h<hours.length; h++) {
          schedule[currentDay][hours[h]] = task.text;
        }

        assignedDays++;
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

  weekDays.forEach(day=>{
    const th=document.createElement("th");
    th.textContent=day;
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

      if (schedule[day][hour]) {
        cell.innerHTML="<div class='task-block'>"+schedule[day][hour]+"</div>";
      }

      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  calendarDiv.appendChild(table);
}

renderTasks();
