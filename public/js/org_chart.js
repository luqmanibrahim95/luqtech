function loadOrgChart() {
  const center = document.querySelector('.center-panel');
  center.innerHTML = `
    <h2>📊 Carta Organisasi</h2>
    <p>Sini tulis carta organisasi belum wujud.</p>
    <div style="margin-top:20px;">
      <button onclick="alert('Fungsi tambah ahli belum disediakan.')">➕ Tambah Ahli</button>
    </div>
  `;
}
