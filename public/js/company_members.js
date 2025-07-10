function loadCompanyMembers() {
  fetch('/api/company-members')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || 'Gagal ambil senarai ahli.');
        return;
      }

      const cookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (!cookie) {
        alert('Sesi tamat. Sila login semula.');
        window.location.href = '/';
        return;
      }

      const user = JSON.parse(decodeURIComponent(cookie.split('=')[1]));

      const list = data.members.map(member => {
        const isSelf = user.id === member.id;
        const role = member.is_admin ? 'Admin' : 'Staf';

        let actions = '';

        if (!member.is_admin && !isSelf) {
          actions += `<button onclick="promoteToAdmin(${member.id})">🚀 Jadikan Admin</button> `;
          actions += `<button onclick="removeMember(${member.id})">❌</button>`;
        }

        return `
          <li>
            ${member.first_name} ${member.last_name} (${member.email}) - ${role}
            ${actions}
          </li>
        `;
      }).join('');

      document.querySelector('.center-panel').innerHTML = `
        <h2>👥 Ahli Syarikat</h2>
        <ul>${list}</ul>
      `;
    });
}

function removeMember(userId) {
  if (!confirm("Adakah anda pasti mahu keluarkan pengguna ini dari syarikat?")) return;

  fetch('/api/remove-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Pengguna telah dikeluarkan.");
        loadCompanyMembers();
      } else {
        alert(data.message || "Gagal keluarkan pengguna.");
      }
    });
}

function promoteToAdmin(userId) {
  if (!confirm("Anda pasti mahu jadikan pengguna ini sebagai admin?")) return;

  fetch('/api/promote-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Pengguna telah dijadikan admin.");
        loadCompanyMembers();
      } else {
        alert(data.message || "Gagal naik taraf.");
      }
    });
}

