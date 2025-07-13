function loadOrgChart() {
  const container = document.querySelector('.center-panel');
  container.innerHTML = `
    <h2>📊 Carta Organisasi</h2>
    <div id="orgChartBox">⏳ Memuatkan carta organisasi...</div>
  `;

  fetch('/api/org-chart')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        document.getElementById('orgChartBox').innerHTML = '<p>❌ Gagal dapatkan carta organisasi.</p>';
        return;
      }

      const orgData = data.chart;
      if (!orgData || orgData.length === 0) {
        document.getElementById('orgChartBox').innerHTML = `
          <p>⚠️ Tiada data carta organisasi.</p>
          ${window.isAdmin ? '<button id="btnBinaCarta">➕ Bina Carta Organisasi</button>' : ''}
        `;
        if (window.isAdmin) {
          document.getElementById('btnBinaCarta').addEventListener('click', () => {
            alert('🛠️ Cipta carta akan dibuat nanti!');
            // Di sinilah nanti kita akan buka form untuk tambah jawatan
          });
        }
        return;
      }

      // ✅ Nanti kat sini kita akan render carta guna template atau library
      document.getElementById('orgChartBox').innerHTML = JSON.stringify(orgData);
    })
    .catch(err => {
      console.error('❌ Ralat:', err);
      document.getElementById('orgChartBox').innerHTML = '<p>❌ Ralat sambungan.</p>';
    });
}
