function loadProcedureList() {

    const centerPanel = document.querySelector('.center-panel');

    centerPanel.innerHTML = `
        <div class="procedure-page">

            <h2>📄 Senarai Prosedur</h2>

            <button onclick="showAddProcedureForm()">
                ➕ Tambah Prosedur
            </button>

            <hr>

            <div class="procedure-container">
                <p>Tiada prosedur lagi.</p>
            </div>

        </div>
    `;
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

function saveProcedure() {

    alert("Simpan prosedur belum dibuat lagi.");

}