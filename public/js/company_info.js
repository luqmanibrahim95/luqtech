function loadSyarikatInfo() {
  console.log('⏳ Memuatkan maklumat syarikat...');

  fetch('/api/company-info')
    .then(res => {
      if (!res.ok) throw new Error('HTTP status bukan 200');
      return res.json();
    })
    .then(data => {
      console.log('📦 Data syarikat:', data);

      if (!data.success) {
        alert(data.message || "Gagal ambil maklumat syarikat.");
        return;
      }

      const { company, extraInfos } = data;
      const isAdmin = window.isAdmin;

      let html = `
        <form id="editCompanyForm">
          <label><strong>Nama:</strong></label><br>
          <input type="text" value="${company.company_name}" disabled><br><br>

          <label><strong>Alamat:</strong></label><br>
          <input type="text" name="address" value="${company.address || ''}" ${!isAdmin ? 'disabled' : ''}><br><br>

          <label><strong>Email:</strong></label><br>
          <input type="email" name="email" value="${company.email || ''}" ${!isAdmin ? 'disabled' : ''}><br><br>

          <label><strong>Telefon:</strong></label><br>
          <input type="text" name="phone" value="${company.phone || ''}" ${!isAdmin ? 'disabled' : ''}><br><br>

          <label><strong>About:</strong></label><br>
          <textarea name="about" rows="3" ${!isAdmin ? 'disabled' : ''}>${company.about || ''}</textarea><br><br>

          ${isAdmin ? '<button type="submit">💾 Simpan</button>' : '<p><em>Hanya admin boleh kemaskini maklumat syarikat.</em></p>'}
        </form>
        <div id="updateStatus" style="margin-top:10px;"></div>

        <hr style="margin: 20px 0;">

        <h3>📌 Info Tambahan</h3>
        <ul id="extraInfos">
        ${extraInfos.length === 0
            ? '<li>Tiada info tambahan</li>'
            : extraInfos.map(info => `
                <li data-id="${info.id}">
                <strong>${info.label}:</strong> 
                <span class="info-value">${info.value}</span>
                ${isAdmin ? `
                    <button class="edit-info">✏️</button>
                    <button class="delete-info">🗑️</button>
                ` : ''}
                </li>
            `).join('')}
        </ul>

        <h4 style="margin-top:20px;">➕ Tambah Info</h4>
        ${isAdmin ? `
        <form id="addCompanyInfoForm">
          <label>Nama Info:</label><br>
          <input type="text" name="label" required><br><br>

          <label>Data:</label><br>
          <input type="text" name="value" required><br><br>

          <button type="submit">Tambah</button>
        </form>
        <div id="addInfoStatus" style="margin-top:10px;"></div>
        ` : '<p><em>Hanya admin boleh tambah info tambahan.</em></p>'}

        <hr style="margin: 20px 0;">
        <button id="btnLeaveCompany">Keluar dari syarikat</button>
        <div id="leaveStatus" style="margin-top:10px;"></div>
      `;

      document.querySelector('.center-panel').innerHTML = html;

      // Jika admin, aktifkan form
      if (isAdmin) {
        document.getElementById('editCompanyForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const formData = new FormData(this);
          const data = Object.fromEntries(formData.entries());

          fetch('/api/update-company', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
            .then(res => res.json())
            .then(result => {
              const box = document.getElementById('updateStatus');
              if (result.success) {
                box.textContent = '✅ Maklumat berjaya dikemaskini.';
                loadSyarikatInfo();
              } else {
                box.textContent = '❌ ' + (result.message || 'Gagal kemaskini.');
              }
            })
            .catch(err => {
              console.error('❌ Error kemaskini syarikat:', err);
              document.getElementById('updateStatus').textContent = '❌ Ralat sambungan semasa kemaskini.';
            });
        });

        document.getElementById('addCompanyInfoForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const formData = new FormData(this);
          const infoData = Object.fromEntries(formData.entries());

          fetch('/api/add-company-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infoData)
          })
            .then(res => res.json())
            .then(result => {
              const box = document.getElementById('addInfoStatus');
              if (result.success) {
                box.textContent = '✅ Info berjaya ditambah.';
                loadSyarikatInfo();
              } else {
                box.textContent = '❌ ' + (result.message || 'Gagal tambah info.');
              }
            })
            .catch(err => {
              console.error('❌ Gagal tambah info:', err);
              document.getElementById('addInfoStatus').textContent = '❌ Ralat sambungan semasa tambah info.';
            });
        });
      }

      // Listener keluar syarikat
      document.getElementById('btnLeaveCompany').addEventListener('click', () => {
        if (confirm('Adakah anda pasti mahu keluar dari syarikat ini?')) {
          leaveCompany();
        }
      });
    })
    .catch(err => {
      console.error('❌ Gagal fetch syarikat:', err);
      alert('Ralat sistem atau sambungan semasa memuatkan maklumat syarikat.');
    });
}

function leaveCompany() {
  fetch('/api/leave-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(result => {
      const statusBox = document.getElementById('leaveStatus');
      if (result.success) {
        statusBox.textContent = '✅ Anda telah keluar dari syarikat.';
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        statusBox.textContent = '❌ ' + (result.message || 'Gagal keluar dari syarikat.');
      }
    })
    .catch(err => {
      console.error('❌ Ralat keluar syarikat:', err);
      document.getElementById('leaveStatus').textContent = '❌ Ralat sambungan semasa keluar syarikat.';
    });
}

// Auto load kalau flag diset
document.addEventListener('DOMContentLoaded', () => {
  if (window.autoLoadCompanyInfo) {
    loadSyarikatInfo();
  }
});