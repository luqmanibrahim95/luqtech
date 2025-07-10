function loadDaftarCompanyForm() {
  document.querySelector('.center-panel').innerHTML = `
    <h2>🏢 Daftar Syarikat Baru</h2>
    <form id="registerCompanyForm">
      <label>Nama Syarikat:</label><br>
      <input type="text" name="company_name" required><br><br>

      <label>Alamat:</label><br>
      <input type="text" name="address" required><br><br>

      <label>No. Telefon:</label><br>
      <input type="text" name="phone"><br><br>

      <label>Email Syarikat:</label><br>
      <input type="email" name="email"><br><br>

      <button type="submit">Daftar</button>
    </form>
    <div id="registerStatus" style="margin-top: 10px;"></div>
  `;

  document.getElementById('registerCompanyForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/register-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(result => {
        const statusBox = document.getElementById('registerStatus');

        if (result.success) {
          statusBox.innerHTML = '✅ Syarikat berjaya didaftarkan!';
          setTimeout(() => location.reload(), 1000); // ✅ Tambah reload
        } else {
          statusBox.innerHTML = '❌ Gagal daftar: ' + result.message;
        }
      })
      .catch(err => {
        console.error('Error daftar syarikat:', err);
        document.getElementById('registerStatus').innerHTML = '❌ Ralat semasa proses daftar';
      });
  });
}
