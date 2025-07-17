// planning.js
window.loadPlanningCalendar = function () {
  const isAdmin = window.isAdmin;

  document.querySelector('.center-panel').innerHTML = `
    <h2 style="margin-bottom: 20px;">📅 Perancangan Bulanan</h2>
    <label for="viewSelect">Papar Sebagai:</label>
    <select id="viewSelect" style="margin-bottom: 20px;">
      <option value="calendar">Kalendar</option>
      <option value="table">Jadual</option>
      <option value="gantt">Gantt Chart</option>
    </select>
    <div id="taskFormContainer"></div>
    <div id="planningView"></div>
  `;

  document.getElementById('viewSelect').addEventListener('change', switchView);

  // ⬇️ Initialize with default view
  renderTaskForm();
  showCalendarView();

  function switchView() {
    const view = document.getElementById('viewSelect').value;
    renderTaskForm();
    if (view === 'calendar') {
      showCalendarView();
    } else if (view === 'table') {
      showTableView();
    } else {
      showGanttChartView();
    }
  }

  function renderTaskForm() {
    if (!isAdmin) return;
    document.getElementById('taskFormContainer').innerHTML = `
      <div id="taskForm" style="margin-bottom: 20px;">
        <select id="existingProjectSelect" style="margin-bottom: 8px;">
          <option value="">➕ (Projek Baru)</option>
        </select>
        <input type="text" id="project_name" placeholder="Projek Baru atau pilih di atas" />
        <input type="text" id="taskName" placeholder="Nama Tugasan" />
        <input type="date" id="startDate" />
        <input type="date" id="endDate" />
        <input type="number" id="period" placeholder="Tempoh (hari)" min="1" />
        <input type="color" id="colorPicker" value="#007bff" />
        <button id="submitBtn" onclick="addTask()">➕ Tambah</button>
        <button id="deleteBtn" style="display:none;" onclick="deleteTask()">🗑️ Padam</button>
      </div>
    `;

    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const periodInput = document.getElementById('period');

    startInput.addEventListener('change', updatePeriodFromStartEnd);
    endInput.addEventListener('change', updatePeriodFromStartEnd);
    periodInput.addEventListener('input', updateEndFromStartAndPeriod);

    function updatePeriodFromStartEnd() {
      const start = new Date(startInput.value);
      const end = new Date(endInput.value);
      if (startInput.value && endInput.value && end >= start) {
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        periodInput.value = diff;
      }
    }

    function updateEndFromStartAndPeriod() {
      const start = new Date(startInput.value);
      const days = parseInt(periodInput.value);
      if (startInput.value && days && days > 0) {
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);
        endInput.value = end.toISOString().split('T')[0];
      }
    }
  }

  function refreshProjectDropdown() {
    fetch('/api/planning-tasks')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const projectSet = new Set();
          const existingProjectSelect = document.getElementById('existingProjectSelect');
          if (!existingProjectSelect) return;

          existingProjectSelect.innerHTML = '<option value="">Pilih projek</option>'; // reset

          data.tasks.forEach(task => {
            const project = task.project_name;
            if (project && !projectSet.has(project)) {
              projectSet.add(project);
              const option = document.createElement('option');
              option.value = project;
              option.textContent = project;
              existingProjectSelect.appendChild(option);
            }
          });
        }
      });
  }

  function populateProjectDropdown(tasks) {
    const select = document.getElementById('existingProjectSelect');
    if (!select) return;

    const projects = [...new Set(tasks.map(t => t.project_name).filter(Boolean))];
    select.innerHTML = `<option value="">➕ (Projek Baru)</option>` + 
      projects.map(p => `<option value="${p}">${p}</option>`).join('');

    select.addEventListener('change', () => {
      const val = select.value;
      document.getElementById('project_name').value = val;
    });
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
        window.selectedEventId = selectedEvent.id;

        document.getElementById('project_name').value = selectedEvent.extendedProps.project_name || '';
        document.getElementById('taskName').value = selectedEvent.title;
        document.getElementById('startDate').value = selectedEvent.startStr;
        document.getElementById('endDate').value = formatDateBack(selectedEvent.end);
        document.getElementById('colorPicker').value = selectedEvent.backgroundColor;

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
          populateProjectDropdown(data.tasks);
          data.tasks.forEach(task => {
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
                project_name: task.project_name  // 🧠 penting!
              }
            });
          });
        }
      });
  }

  function showTableView() {
    const container = document.getElementById('planningView');
    container.innerHTML = `<table border="1" cellspacing="0" cellpadding="8">
      <thead>
        <tr>
          <th>Nama Tugasan</th>
          <th>Tarikh Mula</th>
          <th>Tarikh Tamat</th>
          <th>Tempoh (hari)</th>
          <th>Warna</th>
        </tr>
      </thead>
      <tbody id="taskTableBody"></tbody>
    </table>`;

    fetch('/api/planning-tasks')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const tbody = document.getElementById('taskTableBody');
          tbody.innerHTML = data.tasks.map(t => {
            const start = new Date(t.start);
            const end = new Date(t.end);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return `
              <tr>
                <td>${t.title}</td>
                <td>${t.start}</td>
                <td>${t.end}</td>
                <td>${diff}</td>
                <td><span style="background:${t.color}; padding: 5px 10px; display:inline-block;"></span> ${t.color}</td>
              </tr>
            `;
          }).join('');
        }
      });
  }

  function showGanttChartView() {
    const container = document.getElementById('planningView');
    container.innerHTML = `<div id="ganttChart"></div>`;
    fetch('/api/planning-tasks')
      .then(res => res.json())
      .then(data => {
        if (!data.success) return;
        const chart = document.getElementById('ganttChart');
        chart.innerHTML = data.tasks.map(task => {
          const start = new Date(task.start);
          const end = new Date(task.end);
          const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          return `
            <div style="margin: 10px 0;">
              <div>${task.title} (${task.start} → ${task.end})</div>
              <div style="height: 20px; width: ${duration * 20}px; background:${task.color}; border-radius: 4px;"></div>
            </div>
          `;
        }).join('');
      });
  }

  function resetForm() {
    document.getElementById('project_name').value = '';
    document.getElementById('taskName').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('period').value = '';
    document.getElementById('colorPicker').value = '#007bff';

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.textContent = '➕ Tambah';
      submitBtn.onclick = addTask;
    }
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.style.display = 'none';
  }

  function formatDateBack(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  // ✅ Global Task Functions (Admin Only)
  window.addTask = function () {
    const projectName = document.getElementById('project_name').value.trim();
    const name = document.getElementById('taskName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const color = document.getElementById('colorPicker').value;

    if (!name || !startDate || !endDate) {
      alert("Sila isi semua maklumat dengan lengkap.");
      return;
    }

    const calendar = window.myCalendar;
    const adjustedEnd = new Date(endDate);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);

    const newEvent = calendar.addEvent({
      title: name,
      start: startDate,
      end: adjustedEnd.toISOString().split('T')[0],
      color: color,
      allDay: true
    });

    fetch('/api/planning-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: name,
        start: startDate,
        end: endDate,
        color: color,
        project_name: projectName
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          alert('Gagal simpan ke server.');
          newEvent.remove();
        }
      });

    resetForm();
    refreshProjectDropdown();
  };

  window.updateTask = function () {
    const calendar = window.myCalendar;
    const selectedEvent = calendar.getEventById(window.selectedEventId);
    if (!selectedEvent) return;

    const updatedProject = document.getElementById('project_name').value.trim();
    const updatedTitle = document.getElementById('taskName').value.trim();
    const updatedStart = document.getElementById('startDate').value;
    const updatedEnd = document.getElementById('endDate').value;
    const updatedColor = document.getElementById('colorPicker').value;

    if (!updatedTitle || !updatedStart || !updatedEnd) {
      alert("Sila isi semua maklumat dengan lengkap.");
      return;
    }

    const taskId = selectedEvent.id;
    fetch(`/api/planning-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: updatedTitle, start: updatedStart, end: updatedEnd, color: updatedColor, project_name: updatedProject })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedEvent.setProp('title', updatedTitle);
        selectedEvent.setStart(updatedStart);

        const adjEnd = new Date(updatedEnd);
        adjEnd.setDate(adjEnd.getDate() + 1);
        selectedEvent.setEnd(adjEnd.toISOString().split('T')[0]);

        selectedEvent.setProp('backgroundColor', updatedColor);
        selectedEvent.setProp('borderColor', updatedColor);
        resetForm();
        refreshProjectDropdown();
      } else {
        alert("Gagal kemaskini tugasan di server.");
      }
    })
    .catch(err => {
      console.error("Update error:", err);
      alert("Ralat sambungan semasa kemaskini tugasan.");
    });
  };

  window.deleteTask = function () {
    const calendar = window.myCalendar;
    const selectedEvent = calendar.getEventById(window.selectedEventId);
    if (!selectedEvent) return;

    const eventId = selectedEvent.id;
    fetch(`/api/planning-tasks/${eventId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        selectedEvent.remove();
        resetForm();
      } else {
        alert('Gagal padam tugasan di server.');
      }
    })
    .catch(err => {
      console.error("Delete error:", err);
      alert("Ralat sambungan semasa cuba padam tugasan.");
    });
  };

};
