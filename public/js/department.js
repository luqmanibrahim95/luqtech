// 1. FUNCTION: loadDepartmentList
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

// 2. FUNCTION: showAddDepartmentForm
function showAddDepartmentForm() {
  const formContainer = document.getElementById("addDeptForm");

  formContainer.innerHTML = `
    <input type="text" id="newDeptName" placeholder="Nama Jabatan" style="padding: 5px; width: 200px;">
    <button id="submitDeptBtn">Simpan</button>
    <span id="deptMsg" style="margin-left: 10px; color: green;"></span>
  `;

  document.getElementById("submitDeptBtn").addEventListener("click", () => {
    const name = document.getElementById("newDeptName").value.trim();

    if (!name) {
      document.getElementById("deptMsg").textContent = "Sila masukkan nama jabatan.";
      return;
    }

    fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
      .then(res => res.json())
      .then(data => {
        const msg = document.getElementById("deptMsg");

        if (data.error) {
          msg.style.color = "red";
          msg.textContent = data.error;
        } else {
          msg.style.color = "green";
          msg.textContent = "Berjaya ditambah!";
          loadDepartmentList();
          document.getElementById("newDeptName").value = "";
        }
      })
      .catch(err => {
        console.error('Error hantar jabatan:', err);
        document.getElementById("deptMsg").textContent = "Ralat semasa hantar.";
      });
  });
}

// 3. FUNCTION: loadDepartmentPanel
function loadDepartmentPanel() {
  document.querySelector(".center-panel").innerHTML = `
    <h2>📁 Bahagian Jabatan</h2>
    <div id="departmentList">Memuatkan...</div>
    <br>
    <button id="btnAddDept">+ Tambah Jabatan</button>
    <div id="addDeptForm" style="margin-top: 15px;"></div>
  `;

  loadDepartmentList();

  document.getElementById("btnAddDept").addEventListener("click", () => {
    showAddDepartmentForm();
  });
}
