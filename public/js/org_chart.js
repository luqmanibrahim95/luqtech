function loadOrgChart() {
  const container = document.querySelector('.center-panel');
  container.innerHTML = `<h2>📊 Carta Organisasi</h2><div id="orgChartArea">⏳ Memuatkan carta...</div>`;

  fetch('/api/org-chart')
    .then(res => res.json())
    .then(data => {
      const area = document.getElementById('orgChartArea');

      if (!data.success) {
        area.innerHTML = `<p>⚠️ Tiada data carta organisasi.</p>`;
        if (window.isAdmin) {
          area.innerHTML += `<button onclick="showAddOrgMemberForm()">➕ Bina Carta Organisasi</button>`;
        }
        return;
      }

      const root = buildOrgTree(data.chart);
      area.innerHTML = '';
      area.appendChild(root);

      if (window.isAdmin) {
        area.innerHTML += `<br><button onclick="showAddOrgMemberForm()">➕ Tambah Ahli</button>`;
      }
    })
    .catch(err => {
      document.getElementById('orgChartArea').innerHTML = '❌ Ralat sambungan ke server.';
      console.error(err);
    });
}

function buildOrgTree(node) {
  const div = document.createElement('div');
  div.className = 'org-node';
  div.innerHTML = `<strong>${node.name}</strong><br><small>${node.position}</small>`;

  if (node.children && node.children.length > 0) {
    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'org-children';
    node.children.forEach(child => {
      childrenDiv.appendChild(buildOrgTree(child));
    });
    div.appendChild(childrenDiv);
  }

  return div;
}

function showAddOrgMemberForm() {
  const container = document.getElementById('orgChartArea');
  container.innerHTML = `
    <h3>Tambah Ahli Carta</h3>
    <form id="addOrgMemberForm">
      <label>Nama:</label><br><input name="name" required><br><br>
      <label>Jawatan:</label><br><input name="position" required><br><br>
      <label>ID Parent (jika ada):</label><br><input name="parent_id"><br><br>
      <button type="submit">Simpan</button>
    </form>
    <div id="formStatus"></div>
  `;

  document.getElementById('addOrgMemberForm').addEventListener('submit', e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());

    fetch('/api/org-chart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          loadOrgChart();
        } else {
          document.getElementById('formStatus').textContent = '❌ ' + (result.message || 'Gagal tambah.');
        }
      })
      .catch(err => {
        console.error(err);
        document.getElementById('formStatus').textContent = '❌ Ralat server.';
      });
  });
}
