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