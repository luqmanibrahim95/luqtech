function loadCompanyMembers() {
  fetch('/api/check-user')
    .then(res => {
      if (!res.ok) throw new Error('Sesi tamat');
      return res.json();
    })
    .then(data => {
      const currentUser = data.user;

      fetch('/api/company-members')
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            alert(data.message || 'Gagal ambil senarai ahli.');
            return;
          }

          const members = data.members;
          const options = members.map(m => `<option value="${m.id}">${m.fullname}</option>`).join('');

          const list = members.map(member => {
            const isSelf = currentUser.id === member.id;
            const role = member.is_admin ? 'Admin' : 'Staf';

            return `
              <li style="margin-bottom: 20px;">
                <strong>${member.fullname}</strong> (${member.email}) - ${role}
                ${!member.is_admin && !isSelf ? `
                  <button onclick="promoteToAdmin(${member.id})">🚀 Jadikan Admin</button>
                  <button onclick="removeMember(${member.id})">❌</button>
                ` : ''}
                
                <div style="margin-top: 5px; padding-left: 15px;">
                  Jawatan: <input type="text" id="position_${member.id}" value="${member.position || ''}" placeholder="Contoh: Pengurus"/><br>
                  Department: <input type="text" id="department_${member.id}" value="${member.department || ''}" placeholder="Contoh: Operasi"/><br>
                  Lapor kepada: 
                  <select id="parent_${member.id}">
                    <option value="">-- Tiada --</option>
                    ${options.replace(`value="${member.id}"`, `value="${member.id}" disabled`)}
                  </select>
                  <button onclick="saveOrgInfo(${member.id})">💾 Simpan</button>
                </div>
              </li>
            `;
          }).join('');

          document.querySelector('.center-panel').innerHTML = `
            <h2>👥 Ahli Syarikat</h2>
            <ul>${list}</ul>
          `;
        });
    })
    .catch(err => {
      alert('Sesi tamat. Sila login semula.');
      window.location.href = '/';
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

function saveOrgInfo(userId) {
  const position = document.getElementById(`position_${userId}`).value.trim();
  const department = document.getElementById(`department_${userId}`).value.trim();
  const parentId = document.getElementById(`parent_${userId}`).value || null;

  fetch('/api/update-org-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      position,
      department,
      parent_id: parentId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Maklumat jawatan berjaya disimpan.");
      } else {
        alert(data.message || "Gagal simpan maklumat.");
      }
    })
    .catch(err => {
      alert("Ralat ketika menghantar maklumat.");
    });
}

