function loadSyarikatInfo() {
  const companyName = window.user?.company_name || 'Tidak diketahui';

  document.querySelector('.center-panel').innerHTML = `
    <h2>🏢 Maklumat Syarikat</h2>
    <p><strong>Nama:</strong> ${companyName}</p>
    <button id="btnLeaveCompany">Keluar dari syarikat</button>
    <div id="leaveStatus" style="margin-top:10px;"></div>
  `;

  document.getElementById('btnLeaveCompany').addEventListener('click', () => {
    if (confirm('Adakah anda pasti mahu keluar dari syarikat ini?')) {
      leaveCompany();
    }
  });
}

function leaveCompany() {
  fetch('/api/leave-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      const msgBox = document.getElementById('leaveStatus');
      if (data.success) {
        msgBox.innerHTML = '✅ Anda telah keluar dari syarikat.';
        document.cookie = 'user=; Max-Age=0';
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);
      } else {
        msgBox.innerHTML = '❌ Gagal keluar: ' + data.message;
      }
    })
    .catch(err => {
      console.error('Error leave:', err);
      document.getElementById('leaveStatus').innerHTML = '❌ Ralat server.';
    });
}