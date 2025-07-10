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
        <form id="editCompanyForm">
        <label><strong>Nama:</strong></label><br>
        <input type="text" value="${company.company_name}" disabled><br><br>

        <label><strong>Alamat:</strong></label><br>
        <input type="text" name="address" value="${company.address || ''}"><br><br>

        <label><strong>Email:</strong></label><br>
        <input type="email" name="email" value="${company.email || ''}"><br><br>

        <label><strong>Telefon:</strong></label><br>
        <input type="text" name="phone" value="${company.phone || ''}"><br><br>

        <label><strong>About:</strong></label><br>
        <textarea name="about" rows="3">${company.about || ''}</textarea><br><br>

        <button type="submit">💾 Simpan</button>
        </form>
        <div id="updateStatus" style="margin-top:10px;"></div>


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
                loadSyarikatInfo(); // Reload
            } else {
                box.textContent = '❌ ' + (result.message || 'Gagal kemaskini.');
            }
            })
            .catch(err => {
            console.error('❌ Error kemaskini syarikat:', err);
            document.getElementById('updateStatus').textContent = '❌ Ralat sambungan semasa kemaskini.';
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

// POST /api/update-company
router.post('/update-company', async (req, res) => {
  const user = req.user;
  if (!user || !user.company_id || !user.is_admin) {
    return res.status(403).json({ success: false, message: 'Tidak dibenarkan.' });
  }

  const { address = '', phone = '', email = '', about = '' } = req.body;

  try {
    await pool.query(
      `UPDATE companies SET address = ?, phone = ?, email = ?, about = ? WHERE id = ?`,
      [address, phone, email, about, user.company_id]
    );

    res.json({ success: true, message: 'Maklumat syarikat berjaya dikemaskini.' });
  } catch (err) {
    console.error('Error update company:', err);
    res.status(500).json({ success: false, message: 'Ralat server semasa kemaskini.' });
  }
});

// ✅ Ini penting: Luq MESTI panggil loadSyarikatInfo() bila perlu
// Contoh: Bila user klik nama syarikat di sidebar

// Kalau Luq nak test automatik:
document.addEventListener('DOMContentLoaded', () => {
  if (window.autoLoadCompanyInfo) {
    loadSyarikatInfo();
  }
});
