window.loadPlanningCalendar = function () {
  const isAdmin = window.isAdmin;

  let formHtml = '';
  if (isAdmin) {
    formHtml = `
      <div id="taskForm" style="margin-bottom: 20px;">
        <input type="text" id="taskName" placeholder="Nama Tugasan" />
        <input type="date" id="startDate" />
        <input type="date" id="endDate" />
        <input type="number" id="period" placeholder="Tempoh (hari)" min="1" />
        <input type="color" id="colorPicker" value="#007bff" />
        <button id="submitBtn" onclick="addTask()">➕ Tambah</button>
        <button id="deleteBtn" style="display:none;" onclick="deleteTask()">🗑️ Padam</button>
      </div>
    `;
  }

  document.querySelector('.center-panel').innerHTML = `
    <h2 style="margin-bottom: 20px;">📅 Perancangan Bulanan</h2>
    ${formHtml}
    <div id="calendar"></div>
  `;

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
        data.tasks.forEach(task => {
          if (!task.end) return; // skip kalau end tak wujud

          const adjustedEnd = new Date(task.end);
          if (isNaN(adjustedEnd)) return; // skip kalau tarikh tak sah

          adjustedEnd.setDate(adjustedEnd.getDate() + 1);

          calendar.addEvent({
            title: task.title,
            start: task.start,
            end: adjustedEnd.toISOString().split('T')[0],
            color: task.color,
            allDay: true,
            id: task.id
          });
        });
      }
    });


  if (isAdmin) {
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

  function resetForm() {
    selectedEvent = null;
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

  window.addTask = function () {
    const name = document.getElementById('taskName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const color = document.getElementById('colorPicker').value;

    if (!name || !startDate || !endDate) {
      alert("Sila isi semua maklumat dengan lengkap.");
      return;
    }

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
        color: color
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
  };

  window.updateTask = function () {
    if (!selectedEvent) return;

    const updatedTitle = document.getElementById('taskName').value.trim();
    const updatedStart = document.getElementById('startDate').value;
    const updatedEndRaw = document.getElementById('endDate').value;
    const updatedColor = document.getElementById('colorPicker').value;

    if (!updatedTitle || !updatedStart || !updatedEndRaw) {
      alert("Sila isi semua maklumat dengan lengkap.");
      return;
    }

    // Padam +1 hari supaya simpan end asal
    const updatedEnd = updatedEndRaw;

    const taskId = selectedEvent.id;

    fetch(`/api/planning-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTitle,
        start: updatedStart,
        end: updatedEnd,
        color: updatedColor
      })
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
    const isAdmin = window.isAdmin;
    if (!isAdmin || !selectedEvent) return;

    const eventId = selectedEvent.id;

    if (!eventId) {
      alert("ID tugasan tidak sah.");
      return;
    }

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
