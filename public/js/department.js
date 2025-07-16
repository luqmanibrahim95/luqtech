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

      let html = '';
      data.departments.forEach(dept => {
        html += `
        <div style="margin-bottom: 10px;">
            <div style="
                height: 40px;
                width: 200px;
                border: 1px solid #ccc;
                border-radius: 6px;
                overflow: hidden;
                ">
            <div style="height: 50%; background-color: ${dept.color_top};"></div>
            <div style="height: 50%; background-color: ${dept.color_bottom};"></div>
            </div>
            <div style="font-weight: bold; margin-top: 5px;">
                ${dept.name}
                <button onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.color_top}', '${dept.color_bottom}')" style="margin-left: 10px;">✏️</button>
                <button onclick="deleteDepartment(${dept.id})" style="margin-left: 5px; color: red;">🗑️</button>
            </div>
            <small>${dept.color_top} → ${dept.color_bottom}</small>
        </div>
        `;
      });

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
    <input type="text" id="newDeptName" placeholder="Nama Jabatan" style="padding: 5px; width: 200px;"><br><br>
    <label>Warna Atas: <input type="color" id="colorTop" value="#ffffff" /></label><br><br>
    <label>Warna Bawah: <input type="color" id="colorBottom" value="#f0f0f0" /></label><br><br>
    <button id="submitDeptBtn">Simpan</button>
    <span id="deptMsg" style="margin-left: 10px; color: green;"></span>
  `;

  document.getElementById("submitDeptBtn").addEventListener("click", () => {
    const name = document.getElementById("newDeptName").value.trim();
    const color_top = document.getElementById("colorTop").value;
    const color_bottom = document.getElementById("colorBottom").value;

    if (!name) {
      document.getElementById("deptMsg").textContent = "Sila masukkan nama jabatan.";
      return;
    }

    fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color_top, color_bottom })
    })
      .then(res => res.json())
      .then(data => {
        const msg = document.getElementById("deptMsg");

        if (data.message) {
          msg.style.color = "green";
          msg.textContent = "Berjaya ditambah!";
          loadDepartmentList();
          document.getElementById("newDeptName").value = "";
        } else {
          msg.style.color = "red";
          msg.textContent = data.error || 'Ralat tidak diketahui';
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

function editDepartment(id, name, colorTop, colorBottom) {
  const formContainer = document.getElementById("addDeptForm");

  formContainer.innerHTML = `
    <h4>Kemaskini Jabatan</h4>
    <input type="text" id="editDeptName" value="${name}" style="padding: 5px; width: 200px;"><br><br>
    <label>Warna Atas: <input type="color" id="editColorTop" value="${colorTop}" /></label><br><br>
    <label>Warna Bawah: <input type="color" id="editColorBottom" value="${colorBottom}" /></label><br><br>
    <button onclick="submitUpdateDept(${id})">Kemaskini</button>
    <span id="editDeptMsg" style="margin-left: 10px;"></span>
  `;
}

function submitUpdateDept(id) {
  const name = document.getElementById("editDeptName").value.trim();
  const color_top = document.getElementById("editColorTop").value;
  const color_bottom = document.getElementById("editColorBottom").value;

  if (!name) {
    document.getElementById("editDeptMsg").textContent = "Nama diperlukan";
    return;
  }

  fetch(`/api/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color_top, color_bottom })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("editDeptMsg").style.color = "green";
      document.getElementById("editDeptMsg").textContent = "Berjaya dikemaskini!";
      loadDepartmentList();
    })
    .catch(err => {
      console.error('Kemaskini gagal:', err);
      document.getElementById("editDeptMsg").style.color = "red";
      document.getElementById("editDeptMsg").textContent = "Gagal kemaskini";
    });
}

function deleteDepartment(id) {
  if (!confirm("Adakah anda pasti mahu padam jabatan ini?")) return;

  fetch(`/api/departments/${id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Dipadam!');
      loadDepartmentList();
    })
    .catch(err => {
      console.error('Gagal padam:', err);
      alert('Ralat padam jabatan.');
    });
}

