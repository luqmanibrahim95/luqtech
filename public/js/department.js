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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          document.getElementById("deptMsg").style.color = "red";
          document.getElementById("deptMsg").textContent = data.error;
        } else {
          document.getElementById("deptMsg").style.color = "green";
          document.getElementById("deptMsg").textContent = "Berjaya ditambah!";
          loadDepartmentList();
          document.getElementById("newDeptName").value = "";
        }
      })
      .catch(err => {
        console.error('Error hantar jabatan:', err);
        document.getElementById("deptMsg").style.color = "red";
        document.getElementById("deptMsg").textContent = "Ralat semasa hantar.";
      });
  });
}
