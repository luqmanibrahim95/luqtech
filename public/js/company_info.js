function loadSyarikatInfo() {
  fetch('/api/company-info')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "Gagal ambil maklumat syarikat.");
        return;
      }

      const { company, extraInfos } = data;

      let html = `
        <h2>🏢 Maklumat Syarikat</h2>
        <p><strong>Nama:</strong> ${company.company_name || '-'}</p>
        <p><strong>Alamat:</strong> ${company.address || '-'}</p>
        <p><strong>Email:</strong> ${company.email || '-'}</p>
        <p><strong>Telefon:</strong> ${company.phone || '-'}</p>
        <p><strong>About:</strong> ${company.about || '-'}</p>

        <hr style="margin: 20px 0;">

        <h3>📌 Info Tambahan</h3>
        <ul id="extraInfos">
          ${extraInfos.length === 0 ? '<li>Tiada info tambahan</li>' :
            extraInfos.map(info => `<li><strong>${info.label}:</strong> ${info.value}</li>`).join('')
          }
        </ul>

        <h4 style="margin-top:20px;">➕ Tambah Info</h4>
        <form id="addCompanyInfoForm">
          <label>Nama Info:</label><br>
          <input type="text" name="label" required><br><br>

          <label>Data:</label><br>
          <input type="text" name="value" required><br><br>

          <button type="submit">Tambah</button>
        </form>
        <div id="addInfoStatus" style="margin-top:10px;"></div>

        <hr style="margin: 20px 0;">
        <button id="btnLeaveCompany">Keluar dari syarikat</button>
        <div id="leaveStatus" style="margin-top:10px;"></div>
      `;

      document.querySelector('.center-panel').innerHTML = html;

      document.getElementById('addCompanyInfoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        fetch('/api/add-company-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(res => res.json())
          .then(result => {
            const box = document.getElementById('addInfoStatus');
            if (result.success) {
              box.textContent = '✅ Info berjaya ditambah.';
              loadSyarikatInfo(); // reload panel
            } else {
              box.textContent = '❌ ' + (result.message || 'Gagal tambah info.');
            }
          });
      });

      document.getElementById('btnLeaveCompany').addEventListener('click', () => {
        if (confirm('Adakah anda pasti mahu keluar dari syarikat ini?')) {
          leaveCompany();
        }
      });
    });
}