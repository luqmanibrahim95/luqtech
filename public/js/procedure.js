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

                        <strong>${proc.procedure_code}</strong>
                        <br>

                        ${proc.procedure_name}

                        <br>

                        Revision:
                        ${proc.revision_no}

                        |

                        Status:
                        ${proc.status}

                        <hr>

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