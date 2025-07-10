function loadJoinRequestsPanel() {
  fetch('/api/join-requests')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || 'Gagal ambil permintaan.');
        return;
      }

      const list = data.requests.map(req => `
        <li>
          ${req.fullname} (${req.email})
          <button onclick="approveRequest(${req.request_id}, true)">✅</button>
          <button onclick="approveRequest(${req.request_id}, false)">❌</button>
        </li>
      `).join('');

      document.querySelector('.center-panel').innerHTML = `
        <h2>📥 Permintaan Sertai Syarikat</h2>
        <ul>${list}</ul>
      `;
    });
}

function approveRequest(requestId, approve) {
  fetch('/api/approve-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: requestId, approve })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Berjaya!');
        loadJoinRequestsPanel(); // Refresh
      } else {
        alert(data.message || 'Gagal kemaskini.');
      }
    });
}