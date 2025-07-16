async function getDepartments() {
  try {
    const res = await fetch('/api/departments');
    const data = await res.json();
    if (!data.departments) return [];
    return data.departments;
  } catch (err) {
    console.error('Gagal ambil jabatan:', err);
    return [];
  }
}

function loadCompanyMembers() {
  fetch('/api/check-user')
    .then(res => {
      if (!res.ok) throw new Error('Sesi tamat');
      return res.json();
    })
    .then(async data => {
      const currentUser = data.user;
      const departments = await getDepartments();

      fetch('/api/org-chart/company-members')
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

            const deptOptions = [`<option value="">Tiada</option>`]
              .concat(departments.map(d => `
                <option value="${d.id}" ${d.id == member.department_id ? 'selected' : ''}>${d.name}</option>
              `)).join('');

            return `
              <li style="margin-bottom: 20px;">
                <strong>${member.fullname}</strong> (${member.email}) - ${role}
                ${!member.is_admin && !isSelf ? `
                  <button onclick="promoteToAdmin(${member.id})">🚀 Jadikan Admin</button>
                  <button onclick="removeMember(${member.id})">❌</button>
                ` : ''}

                <div style="margin-top: 5px; padding-left: 15px;">
                  Jawatan: <input type="text" id="position_${member.id}" value="${member.position || ''}" placeholder="Contoh: Pengurus"/><br>
                  Department: 
                  <select id="department_${member.id}">
                    ${deptOptions}
                  </select><br>
                  Lapor kepada: 
                  <select id="parent_${member.id}">
                    <option value="NONE">Tiada</option>
                    <option value="ROOT">Higher Authority</option>
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

          members.forEach(member => {
            const select = document.getElementById(`parent_${member.id}`);
            if (select) {
              if (member.parent_user_id === 'ROOT') {
                select.value = "ROOT";
              } else if (member.parent_user_id && member.parent_user_id !== 'NONE') {
                select.value = member.parent_user_id;
              }
            }
          });
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
  const departmentId = document.getElementById(`department_${userId}`).value || null;
  let parentId = document.getElementById(`parent_${userId}`).value;

  if (parentId === "ROOT") {
    parentId = null;
  } else if (parentId === "NONE") {
    fetch('/api/org-chart/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Pengguna dikeluarkan dari carta organisasi.");
          loadCompanyMembers();
        } else {
          alert(data.message || "Gagal padam dari carta.");
        }
      });
    return;
  }

  fetch('/api/org-chart/save-org-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      position,
      department_id: departmentId === "" ? null : Number(departmentId),
      parent_user_id: parentId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Maklumat jawatan berjaya disimpan!");
      } else {
        alert(data.message || "Gagal simpan maklumat.");
      }
    })
    .catch(err => {
      console.error('Ralat:', err);
      alert("Ralat ketika menghantar maklumat.");
    });
}


