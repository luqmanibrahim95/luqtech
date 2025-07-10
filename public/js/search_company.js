function loadSearchCompanyModule() {
  document.querySelector('.center-panel').innerHTML = `
    <h2>🔍 Cari Nama Syarikat</h2>
    <input type="text" id="searchInput" placeholder="Taip nama syarikat..." onkeyup="searchCompany()">
    <ul id="searchResults" class="company-results"></ul>
  `;
}

function searchCompany() {
  const query = document.getElementById('searchInput').value;

  if (query.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }

  fetch(`/api/search-company?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        let results = '';
        if (data.length > 0) {
            results = data.map(item => `
            <li>
                ${item.name} 
                <button onclick="requestJoinCompany('${item.name}')">Mohon Sertai</button>
            </li>
            `).join('');
        } else {
            results = '<li>Tiada padanan</li>';
        }

        results += `<li><a href="#" id="btnDaftarSyarikat">+ Daftar syarikat baru</a></li>`;
        document.getElementById('searchResults').innerHTML = results;

        const btn = document.getElementById('btnDaftarSyarikat');
        if (btn) {
            btn.addEventListener('click', e => {
            e.preventDefault();
            loadDaftarCompanyForm();
            });
        }
    })
    .catch(err => {
      console.error('Error:', err);
      document.getElementById('searchResults').innerHTML = '<li>Ralat carian</li>';
    });
}
