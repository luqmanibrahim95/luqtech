document.addEventListener('DOMContentLoaded', () => {
  loadPlanningCalendar();
});

function loadPlanningCalendar() {
  const container = document.querySelector('.center-panel');
  container.innerHTML = `
    <h2 style="margin-bottom: 10px;">📅 Perancangan Bulanan</h2>
    <label for="projectFilter">Tapis Projek:</label>
    <select id="projectFilter" style="margin-left: 10px; margin-bottom: 20px;">
      <option value="">Semua Projek</option>
    </select>
    <div id="calendar"></div>
  `;

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
  });

  calendar.render();
  window.myCalendar = calendar;

  fetch('/api/planning-tasks')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const allTasks = data.tasks;
        populateProjectFilter(allTasks);
        renderFilteredTasks(allTasks);

        // Bila user tukar filter projek
        document.getElementById('projectFilter').addEventListener('change', () => {
          renderFilteredTasks(allTasks);
        });
      }
    });
}

function populateProjectFilter(tasks) {
  const projectNames = [...new Set(tasks.map(task => task.project_name).filter(Boolean))];
  const filterEl = document.getElementById('projectFilter');

  projectNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    filterEl.appendChild(option);
  });
}

function renderFilteredTasks(tasks) {
  const calendar = window.myCalendar;
  const filterValue = document.getElementById('projectFilter').value;
  calendar.removeAllEvents();

  const filtered = filterValue
    ? tasks.filter(task => task.project_name === filterValue)
    : tasks;

  filtered.forEach(task => {
    if (!task.end) return;

    const adjustedEnd = new Date(task.end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1); // Adjust supaya event penuh

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
