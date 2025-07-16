// dashboard.js
// ============================
// PART 1: Load User Info
// ============================
window.addEventListener('DOMContentLoaded', () => {
  fetch('/api/check-user')
    .then(res => {
      if (!res.ok) throw new Error('Sesi tamat');
      return res.json();
    })
    .then(data => {
      const user = data.user;

      document.getElementById('user-name').textContent = user.fullname || '';
      document.getElementById('user-email').textContent = user.email || '';
      document.getElementById('user-role').textContent = user.is_admin ? 'Admin' : 'Pengguna Biasa';

      // Syarikat
      if (user.company_id) {
        document.getElementById('user-company').innerHTML = `
          Syarikat: <a href="#" id="linkSyarikat">${user.company_name}</a>
          Jabatan: ${user.department_name || 'Tiada'}
        `;
        document.getElementById('linkSyarikat').addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof loadSyarikatInfo === 'function') {
            loadSyarikatInfo();
          } else {
            alert("Modul belum dimuatkan.");
          }
        });

        // ✅ Tambah Carta Organisasi (untuk semua user yg ada syarikat)
        const panel = document.querySelector('.left-panel');
        const btnCarta = document.createElement('button');
        btnCarta.textContent = "📊 Carta Organisasi";
        btnCarta.onclick = loadOrgChart;
        panel.appendChild(document.createElement('br'));
        panel.appendChild(btnCarta);
      } else {
        document.getElementById('user-company').innerHTML = `Syarikat: <a href="#" id="linkCariSyarikat">Tiada</a>`;
        document.getElementById('linkCariSyarikat').addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof loadSearchCompanyModule === 'function') {
            loadSearchCompanyModule();
          } else {
            alert("Modul carian belum dimuatkan.");
          }
        });
      }

      // ✅ Simpan global
      window.isAdmin = user.is_admin;
      window.companyId = user.company_id;

      // ✅ Butang admin khas
      if (user.is_admin && user.company_id) {
        const panel = document.querySelector('.left-panel');

        const btnPermintaan = document.createElement('button');
        btnPermintaan.textContent = "📥 Permintaan Sertai";
        btnPermintaan.onclick = loadJoinRequestsPanel;
        panel.appendChild(document.createElement('br'));
        panel.appendChild(btnPermintaan);

        const btnAhli = document.createElement('button');
        btnAhli.textContent = "👥 Ahli Syarikat";
        btnAhli.onclick = loadCompanyMembers;
        panel.appendChild(document.createElement('br'));
        panel.appendChild(btnAhli);

        const btnJabatan = document.createElement('button');
        btnJabatan.textContent = "📁 Jabatan";
        btnJabatan.onclick = loadDepartmentPanel; // ← function kita akan buat nanti
        panel.appendChild(document.createElement('br'));
        panel.appendChild(btnJabatan);
      }

      // ✅ Auto buka calendar
      if (typeof loadPlanningCalendar === 'function') {
        loadPlanningCalendar();
      }
    })
    .catch(err => {
      console.warn('Sesi tamat, redirect ke login.');
      window.location.href = '/';
    });
});
