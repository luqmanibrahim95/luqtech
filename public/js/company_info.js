function loadSyarikatInfo() {
  console.log('⏳ Memuatkan maklumat syarikat...');

  fetch('/api/company-info')
    .then(res => {
      if (!res.ok) {
        throw new Error('HTTP status bukan 200');
      }
      return res.json();
    })
    .then(data => {
      console.log('📦 Data syarikat:', data);

      if (!data.success) {
        alert(data.message || "Gagal ambil maklumat syarikat.");
        return;
      }

      const { company, extraInfos } = data;

        let html = `
        <h2>🏢 Maklumat Syarikat</h2>
        <form id="editCompanyForm">
            <label>Nama:</label><br>
            <input type="text" value="${company.company_name}" disabled><br><br>

            <label>Alamat:</label><br>
            <input type="text" name="address" value="${company.address || ''}"><br><br>

            <label>Email:</label><br>
            <input type="email" name="email" value="${company.email || ''}"><br><br>

            <label>Telefon:</label><br>
            <input type="text" name="phone" value="${company.phone || ''}"><br><br>

            <label>About:</label><br>
            <textarea name="about" rows="3">${company.about || ''}</textarea><br><br>

            <button type="submit">💾 Simpan</button>
        </form>
        <div id="updateStatus" style="margin-top:10px;"></div>

        <hr style="margin: 20px 0;">
        ...
        `;

      document.querySelector('.center-panel').innerHTML = html;

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
                loadSyarikatInfo(); // reload info
            } else {
                box.textContent = '❌ ' + (result.message || 'Gagal kemaskini.');
            }
        });
      });

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

// ✅ Ini penting: Luq MESTI panggil loadSyarikatInfo() bila perlu
// Contoh: Bila user klik nama syarikat di sidebar

// Kalau Luq nak test automatik:
document.addEventListener('DOMContentLoaded', () => {
  if (window.autoLoadCompanyInfo) {
    loadSyarikatInfo();
  }
});
