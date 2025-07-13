// org_chart.js

async function loadOrgChart() {
  const center = document.querySelector('.center-panel');
  center.innerHTML = `<h2>📊 Carta Organisasi</h2><div id="orgTreeContainer"></div>`;

  try {
    const res = await fetch('/api/org-chart/get');
    const data = await res.json();

    if (!data.success || !Array.isArray(data.chart)) {
      center.innerHTML += `<p>Tiada data carta organisasi.</p>`;
      return;
    }

    const chartData = buildOrgTree(data.chart);
    const treeHTML = renderOrgNode(chartData);
    document.getElementById('orgTreeContainer').innerHTML = treeHTML;
  } catch (err) {
    console.error(err);
    center.innerHTML += `<p>Ralat ketika memuatkan carta organisasi.</p>`;
  }
}

function buildOrgTree(list) {
  const map = {}, roots = [];
  list.forEach(item => map[item.id] = { ...item, children: [] });
  list.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });
  return roots.length === 1 ? roots[0] : { fullname: 'Root', position: '', children: roots };
}

function renderOrgNode(node) {
  if (!node) return '';

  const name = node.fullname || '-';
  const position = node.position || '';

  const childrenHTML = (node.children || []).map(renderOrgNode).join('');
  const hasChildren = (node.children || []).length > 0;

  return `
    <div class="org-node">
      <div class="org-box">
        <strong>${position}</strong><br>${name}
      </div>
      ${hasChildren ? `<div class="org-children">${childrenHTML}</div>` : ''}
    </div>
  `;
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
