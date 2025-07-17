document.addEventListener('DOMContentLoaded', function () {
  showCalendarView();
});

function showCalendarView() {
  const isAdmin = window.isAdmin;

  document.querySelector('.center-panel').innerHTML = `
    <h2 style="margin-bottom: 20px;">📅 Perancangan Bulanan</h2>
    <div class="filter-container" style="margin-bottom: 10px;">
      <label for="projectFilter">Filter Projek:</label>
      <select id="projectFilter">
        <option value="">Semua Projek</option>
      </select>
    </div>
    <div id="calendar"></div>
    <div class="form-container">
      <h3 id="formTitle">Tambah Tugasan</h3>
      <form id="taskForm">
        <input type="hidden" id="taskId">
        <label>Tajuk:</label>
        <input type="text" id="title" required><br>
        <label>Tarikh Mula:</label>
        <input type="date" id="start" required><br>
        <label>Tarikh Tamat:</label>
        <input type="date" id="end" required><br>
        <label>Projek:</label>
        <input type="text" id="project_name"><br>
        <label>Warna:</label>
        <input type="color" id="color" value="#3788d8"><br>
        <button type="submit">Simpan</button>
        <button type="button" id="deleteBtn" style="display:none;">Padam</button>
        <button type="button" id="resetBtn">Reset</button>
      </form>
    </div>
  `;

  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    eventClick: handleEventClick,
    dateClick: handleDateClick
  });

  calendar.render();
  window.myCalendar = calendar; // simpan calendar supaya boleh akses semula

  fetch('/api/planning-tasks')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        populateProjectFilter(data.tasks); // sekali je masa awal
        refreshCalendarEvents(data.tasks);

        // Bila user tukar filter
        document.getElementById('projectFilter').addEventListener('change', () => {
          refreshCalendarEvents(data.tasks); // tapis ikut filter baru
        });
      }
    });

  setupFormHandlers();
}

function populateProjectFilter(tasks) {
  const projectFilter = document.getElementById('projectFilter');
  const currentValue = projectFilter.value;

  // Buang semua kecuali option pertama
  projectFilter.innerHTML = `<option value="">Semua Projek</option>`;

  const uniqueProjects = [...new Set(tasks.map(task => task.project_name).filter(Boolean))];

  uniqueProjects.forEach(project => {
    const option = document.createElement('option');
    option.value = project;
    option.textContent = project;
    projectFilter.appendChild(option);
  });

  // Set balik nilai yang dipilih sebelum ni
  projectFilter.value = currentValue;
}

function getFilteredTasks(tasks) {
  const selectedProject = document.getElementById('projectFilter')?.value || '';
  return selectedProject
    ? tasks.filter(task => task.project_name === selectedProject)
    : tasks;
}

function refreshCalendarEvents(tasks) {
  const calendar = window.myCalendar;
  calendar.getEvents().forEach(event => event.remove()); // buang semua event dulu

  const filteredTasks = getFilteredTasks(tasks);
  filteredTasks.forEach(task => {
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

function handleDateClick(info) {
  document.getElementById('taskId').value = '';
  document.getElementById('title').value = '';
  document.getElementById('start').value = info.dateStr;
  document.getElementById('end').value = info.dateStr;
  document.getElementById('project_name').value = '';
  document.getElementById('color').value = '#3788d8';
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('formTitle').textContent = 'Tambah Tugasan';
}

function handleEventClick(info) {
  const event = info.event;
  document.getElementById('taskId').value = event.id;
  document.getElementById('title').value = event.title;
  document.getElementById('start').value = event.startStr;
  document.getElementById('end').value = event.endStr;
  document.getElementById('project_name').value = event.extendedProps.project_name || '';
  document.getElementById('color').value = event.backgroundColor;
  document.getElementById('deleteBtn').style.display = 'inline-block';
  document.getElementById('formTitle').textContent = 'Kemaskini Tugasan';
}

function setupFormHandlers() {
  const form = document.getElementById('taskForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/planning-tasks/${id}` : '/api/planning-tasks';
    const taskData = {
      title: document.getElementById('title').value,
      start: document.getElementById('start').value,
      end: document.getElementById('end').value,
      project_name: document.getElementById('project_name').value,
      color: document.getElementById('color').value
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showCalendarView(); // reload penuh lepas tambah/ubah
        }
      });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    form.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('color').value = '#3788d8';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('formTitle').textContent = 'Tambah Tugasan';
  });

  document.getElementById('deleteBtn').addEventListener('click', () => {
    const id = document.getElementById('taskId').value;
    if (!id) return;

    if (confirm('Padam tugasan ini?')) {
      fetch(`/api/planning-tasks/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showCalendarView(); // reload penuh lepas padam
          }
        });
    }
  });
}
