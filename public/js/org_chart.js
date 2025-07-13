// org_chart.js

function loadOrgChart() {
  fetch('/api/org-chart/get')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        document.querySelector('.center-panel').innerHTML = '<h2>📊 Carta Organisasi</h2><p>Tiada data carta organisasi.</p>';
        return;
      }

      const orgData = data.data;
      if (!orgData || orgData.length === 0) {
        document.querySelector('.center-panel').innerHTML = '<h2>📊 Carta Organisasi</h2><p>Tiada data carta organisasi.</p>';
        return;
      }

      // Susun data jadi bentuk bersarang
      const nodeMap = {};
      orgData.forEach(item => {
        nodeMap[item.user_id] = { ...item, children: [] };
      });

      const roots = [];
      orgData.forEach(item => {
        if (item.parent_id && nodeMap[item.parent_id]) {
          nodeMap[item.parent_id].children.push(nodeMap[item.user_id]);
        } else {
          roots.push(nodeMap[item.user_id]);
        }
      });

      // Function render (recursive)
      function renderNode(node) {
        const childrenHtml = node.children.map(child => renderNode(child)).join('');

        return `
          <div class="org-node">
            <div class="org-box">
              <strong>${node.position}</strong><br/>
              ${node.fullname}
            </div>
            ${node.children.length > 0 ? `<div class="org-children">${childrenHtml}</div>` : ''}
          </div>
        `;
      }

      const chartHTML = roots.map(root => renderNode(root)).join('');

      document.querySelector('.center-panel').innerHTML = `
        <h2>📊 Carta Organisasi</h2>
        <div style="overflow-x: auto;">
          ${chartHTML}
        </div>
      `;
    })
    .catch(err => {
      console.error("Gagal ambil carta organisasi:", err);
      document.querySelector('.center-panel').innerHTML = '<h2>📊 Carta Organisasi</h2><p>Gagal paparkan carta.</p>';
    });
}

//function loadOrgChart() {
  //const center = document.querySelector('.center-panel');
  //center.innerHTML = `
    //<h2>📊 Carta Organisasi</h2>
    //<p>Sini tulis carta organisasi belum wujud.</p>
    //<div style="margin-top:20px;">
      //<button onclick="loadCompanyMembers()">➕ Buat Carta</button> 
    //</div>
  //`;
//}
