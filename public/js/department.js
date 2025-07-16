function loadDepartmentPanel() {
  document.querySelector(".center-panel").innerHTML = `
    <h2>📁 Bahagian Jabatan</h2>
    <div id="departmentList">Memuatkan...</div>
    <br>
    <button id="btnAddDept">+ Tambah Jabatan</button>
  `;

  loadDepartmentList(); // panggil senarai

  document.getElementById("btnAddDept").addEventListener("click", () => {
    alert("Modul tambah jabatan akan datang ya 🥰");
  });
}

function loadDepartmentList() {
  fetch('/api/departments')
    .then(res => res.json())
    .then(data => {
      const listDiv = document.getElementById("departmentList");

      if (!data.departments || data.departments.length === 0) {
        listDiv.innerHTML = `<i>Tiada jabatan dijumpai.</i>`;
        return;
      }

      const html = `
        <ul style="padding-left: 20px;">
          ${data.departments.map(dept => `<li>${dept.name}</li>`).join('')}
        </ul>
      `;

      listDiv.innerHTML = html;
    })
    .catch(err => {
      console.error('Gagal dapatkan jabatan:', err);
      document.getElementById("departmentList").innerHTML = "Ralat semasa memuatkan jabatan.";
    });
}
