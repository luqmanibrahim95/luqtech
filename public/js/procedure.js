async function loadProcedureList() {

    const centerPanel =
        document.querySelector('.center-panel');

    centerPanel.innerHTML = `
        <h2>📄 Senarai Prosedur</h2>
        <p>Loading...</p>
    `;

    try {

        const response =
            await fetch('/api/procedures/list');

        const result =
            await response.json();

        if (!result.success) {

            centerPanel.innerHTML = `
                <p>Gagal ambil data.</p>
            `;

            return;
        }

        let html = `
            <div class="procedure-page">

                <h2>📄 Senarai Prosedur</h2>

                <button onclick="showAddProcedureForm()">
                    ➕ Tambah Prosedur
                </button>

                <hr>

                <div class="procedure-container">
        `;

        if (result.procedures.length === 0) {

            html += `
                <p>Tiada prosedur lagi.</p>
            `;

        } else {

            result.procedures.forEach(proc => {

                html += `
                    <div class="procedure-item">

                        <strong
                            style="cursor:pointer;color:blue"
                            onclick="openProcedure(${proc.id})">

                            ${proc.procedure_code}

                        </strong>
                        <br>

                        ${proc.procedure_name}

                        <br>

                        Revision:
                        ${proc.revision_no}

                        |

                        Status:
                        ${proc.status}

                        <hr>
                                                
                        <button onclick="editProcedure(${proc.id})">
                            ✏ Edit
                        </button>

                        <button onclick="editProcedure(${proc.id})">
                            ✏ Edit
                        </button>

                        <button onclick="deleteProcedure(${proc.id})">
                            🗑 Delete
                        </button>
                        <br><br>

                    </div>
                `;

            });

        }

        html += `
                </div>
            </div>
        `;

        centerPanel.innerHTML = html;

    } catch (err) {

        console.error(err);

        centerPanel.innerHTML = `
            <p>Ralat sistem.</p>
        `;
    }
}

function showAddProcedureForm() {

    const centerPanel = document.querySelector('.center-panel');

    centerPanel.innerHTML = `
        <div class="procedure-page">

            <h2>📄 Tambah Prosedur</h2>

            <hr>

            <label>Nama Prosedur</label><br>
            <input type="text" id="procedureName"><br><br>

            <label>Kod Prosedur</label><br>
            <input type="text" id="procedureCode"><br><br>

            <button onclick="saveProcedure()">
                Simpan
            </button>

            <button onclick="loadProcedureList()">
                Batal
            </button>

        </div>
    `;
}

async function saveProcedure() {

    const procedureName =
        document.getElementById('procedureName').value.trim();

    const procedureCode =
        document.getElementById('procedureCode').value.trim();

    if (!procedureName || !procedureCode) {

        alert('Sila lengkapkan maklumat.');

        return;
    }

    try {

        const response = await fetch(
            '/api/procedures/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    procedure_name: procedureName,
                    procedure_code: procedureCode
                })
            }
        );

        const result = await response.json();

        if (result.success) {

            alert('Prosedur berjaya disimpan.');

            loadProcedureList();

        } else {

            alert(result.message || 'Gagal simpan.');

        }

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function editProcedure(id) {

    try {

        const response =
            await fetch(`/api/procedures/${id}`);

        const result =
            await response.json();

        if (!result.success) {
            alert('Data tidak dijumpai.');
            return;
        }

        const proc =
            result.procedure;

        const centerPanel =
            document.querySelector('.center-panel');

        centerPanel.innerHTML = `
            <h2>✏ Edit Procedure</h2>

            <label>Nama Procedure</label>
            <br>
            <input
                type="text"
                id="procedureName"
                value="${proc.procedure_name}">
            <br><br>

            <label>Kod Procedure</label>
            <br>
            <input
                type="text"
                id="procedureCode"
                value="${proc.procedure_code}">
            <br><br>

            <button onclick="updateProcedure(${proc.id})">
                Simpan
            </button>

            <button onclick="loadProcedureList()">
                Batal
            </button>
        `;

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function updateProcedure(id) {

    const procedureName =
        document.getElementById('procedureName').value.trim();

    const procedureCode =
        document.getElementById('procedureCode').value.trim();

    try {

        const response =
            await fetch(
                `/api/procedures/update/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        procedure_name: procedureName,
                        procedure_code: procedureCode
                    })
                }
            );

        const result =
            await response.json();

        if (result.success) {

            alert('Procedure berjaya dikemaskini.');

            loadProcedureList();

        } else {

            alert('Gagal kemaskini.');

        }

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function deleteProcedure(id) {

    const confirmDelete = confirm(
        'Adakah anda pasti mahu padam prosedur ini?'
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/procedures/delete/${id}`,
                {
                    method: 'DELETE'
                }
            );

        const result =
            await response.json();

        if (result.success) {

            alert('Prosedur berjaya dipadam.');

            loadProcedureList();

        } else {

            alert('Gagal padam prosedur.');

        }

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function openProcedure(id) {

    try {

        const response =
            await fetch(
                `/api/procedures/detail/${id}`
            );

        const result =
            await response.json();

        if (!result.success) {

            alert('Procedure tidak dijumpai.');
            return;

        }

        const proc =
            result.procedure;

        const centerPanel =
            document.querySelector('.center-panel');

        centerPanel.innerHTML = `

            <h2>
                📄 ${proc.procedure_name}
            </h2>

            <p>
                <strong>Code:</strong>
                ${proc.procedure_code}
            </p>

            <p>
                <strong>Revision:</strong>
                ${proc.revision_no}
            </p>

            <p>
                <strong>Status:</strong>
                ${proc.status}
            </p>

            <hr>

            <h3>Content</h3>

            <textarea
                id="procedureContent"
                style="
                    width:100%;
                    min-height:500px;
                "
            >${proc.content || ''}</textarea>

            <br><br>

            <button
                onclick="saveProcedureContent(${proc.id})">

                💾 Save Content

            </button>

            <button
                onclick="loadProcedureList()">

                ← Back

            </button>

        `;

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function saveProcedureContent(id) {

    const content =
        document.getElementById(
            'procedureContent'
        ).value;

    try {

        const response =
            await fetch(
                `/api/procedures/content/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        content
                    })
                }
            );

        const result =
            await response.json();

        if (result.success) {

            alert(
                'Content berjaya disimpan.'
            );

        } else {

            alert(
                'Gagal simpan content.'
            );

        }

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}