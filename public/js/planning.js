let isAdmin = false;
let selectedEventId = null;

function loadPlanningCalendar(adminStatus) {
  isAdmin = adminStatus;
  document.querySelector('.center-panel').innerHTML = `
    <h2>📅 Perancangan Bulanan</h2>
    <div style="margin-bottom: 10px;">
      <label for="projectFilter">Tapis Projek:</label>
      <select id="projectFilter">
        <option value="">Semua Projek</option>
      </select>
    </div>

    <div id="planningView"></div>

    ${isAdmin ? `
      <form id="planningForm" style="margin-top: 20px;">
        <input type="text" id="taskName" placeholder="Tajuk Tugasan" required />
        <input type="date" id="startDate" required />
        <input type="date" id="endDate" required />
        <input type="text" id="period" placeholder="Tempoh (hari)" disabled />
        <input type="text" id="project_name" placeholder="Nama Projek" />
        <input type="color" id="colorPicker" value="#3788d8" />
        <button type="submit" id="submitBtn">➕ Tambah Tugasan</button>
        <button type="button" id="deleteBtn" style="display:none;">🗑️ Padam</button>
      </form>
    ` : ''}
  `;

  showCalendarView();

  if (isAdmin) {
    document.getElementById('planningForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const isUpdate = document.getElementById('submitBtn').textContent.includes('Kemaskini');
      if (isUpdate) updateTask();
      else addTask();
    });

    document.getElementById('deleteBtn').addEventListener('click', deleteTask);
  }

  document.getElementById('projectFilter').addEventListener('change', () => {
    showCalendarView(); // reload with filter applied
  });
}

function populateProjectFilter(tasks) {
  const projectSet = new Set(tasks.map(t => t.project_name).filter(p => p));
  const select = document.getElementById('projectFilter');
  select.innerHTML = `<option value="">Semua Projek</option>`;
  projectSet.forEach(project => {
    const option = document.createElement('option');
    option.value = project;
    option.textContent = project;
    select.appendChild(option);
  });
}

function getFilteredTasks(tasks) {
  const selected = document.getElementById('projectFilter').value;
  return selected ? tasks.filter(t => t.project_name === selected) : tasks;
}

function showCalendarView() {
  const container = document.getElementById('planningView');
  container.innerHTML = `<div id="calendar"></div>`;

  let selectedEvent = null;
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ms',
    height: 600,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: [],
    eventClick: function(info) {
      if (!isAdmin) return;
      selectedEvent = info.event;
      selectedEventId = selectedEvent.id;

      document.getElementById('taskName').value = selectedEvent.title;
      document.getElementById('startDate').value = selectedEvent.startStr;
      document.getElementById('endDate').value = formatDateBack(selectedEvent.end);
      document.getElementById('colorPicker').value = selectedEvent.backgroundColor;
      document.getElementById('project_name').value = selectedEvent.extendedProps.project_name || '';

      const diff = Math.ceil((new Date(selectedEvent.end) - new Date(selectedEvent.start)) / (1000 * 60 * 60 * 24));
      document.getElementById('period').value = diff;

      document.getElementById('submitBtn').textContent = '✏️ Kemaskini';
      document.getElementById('submitBtn').onclick = updateTask;
      document.getElementById('deleteBtn').style.display = 'inline-block';
    },
    dateClick: function() {
      if (!isAdmin) return;
      resetForm();
    }
  });

  window.myCalendar = calendar;
  calendar.render();

  fetch('/api/planning-tasks')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        populateProjectFilter(data.tasks);
        const filteredTasks = getFilteredTasks(data.tasks);
        filteredTasks.forEach(task => {
          if (!task.end) return;
          const adjustedEnd = new Date(task.end);
          adjustedEnd.setDate(adjustedEnd.getDate() + 1);
          calendar.addEvent({
            title: task.title,
            start: task.start,
            end: adjustedEnd.toISOString().split('T')[0],
            color: task.color,
            allDay: true,
            id: task.id,
            extendedProps: {
              project_name: task.project_name
            }
          });
        });
      }
    });
}

function formatDateBack(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1); // compensate end date +1
  return d.toISOString().split('T')[0];
}

function resetForm() {
  document.getElementById('taskName').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('colorPicker').value = '#3788d8';
  document.getElementById('period').value = '';
  document.getElementById('project_name').value = '';
  document.getElementById('submitBtn').textContent = '➕ Tambah Tugasan';
  document.getElementById('submitBtn').onclick = addTask;
  document.getElementById('deleteBtn').style.display = 'none';
  selectedEventId = null;
}

function addTask() {
  const task = collectTaskFormData();
  fetch('/api/planning-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showCalendarView();
        resetForm();
      }
    });
}

function updateTask() {
  const task = collectTaskFormData();
  task.id = selectedEventId;
  fetch(`/api/planning-tasks/${task.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showCalendarView();
        resetForm();
      }
    });
}

function deleteTask() {
  if (!selectedEventId) return;
  fetch(`/api/planning-tasks/${selectedEventId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showCalendarView();
        resetForm();
      }
    });
}

function collectTaskFormData() {
  return {
    title: document.getElementById('taskName').value,
    start: document.getElementById('startDate').value,
    end: document.getElementById('endDate').value,
    color: document.getElementById('colorPicker').value,
    project_name: document.getElementById('project_name').value
  };
}
