function loadOrgChart() {
  const center = document.querySelector('.center-panel');
  center.innerHTML = `
    <h2>📊 Carta Organisasi</h2>
    <div id="orgChartContainer"></div>
    <div style="margin-top:20px;">
      <button onclick="showAddMemberForm()">➕ Tambah Ahli</button>
    </div>
    <div id="addMemberForm" style="display:none; margin-top:20px;">
      <h3>Tambah Ahli Carta</h3>
      <label>Nama:</label><br>
      <input type="text" id="memberName"><br><br>

      <label>Jawatan:</label><br>
      <input type="text" id="memberPosition"><br><br>

      <label>ID Parent (jika ada):</label><br>
      <input type="number" id="parentId"><br><br>

      <button onclick="saveOrgMember()">Simpan</button>
    </div>
  `;

  fetch('/api/org-chart')
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        document.getElementById('orgChartContainer').innerHTML = `<p>⚠️ Tiada data carta organisasi.</p>`;
      } else {
        const html = buildOrgHTML(data);
        document.getElementById('orgChartContainer').innerHTML = html;
      }
    });
}

function showAddMemberForm() {
  document.getElementById('addMemberForm').style.display = 'block';
}

function saveOrgMember() {
  const name = document.getElementById('memberName').value;
  const position = document.getElementById('memberPosition').value;
  const parent_id = document.getElementById('parentId').value || null;

  fetch('/api/org-chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, position, parent_id })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        loadOrgChart();
      } else {
        alert('❌ Gagal simpan ahli.');
      }
    });
}

function buildOrgHTML(data, parentId = null) {
  const children = data.filter(item => item.parent_id == parentId);
  if (children.length === 0) return '';

  let html = '<ul>';
  for (const child of children) {
    html += `<li><strong>${child.name}</strong><br><small>${child.position}</small>`;
    html += buildOrgHTML(data, child.id); // Rekursif
    html += '</li>';
  }
  html += '</ul>';
  return html;
}
