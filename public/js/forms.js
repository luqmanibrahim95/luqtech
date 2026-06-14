async function loadFormList() {

    const centerPanel =
        document.querySelector('.center-panel');

    centerPanel.innerHTML = `
        <div class="form-page">

            <h2>📋 Senarai Form</h2>

            <button onclick="showAddForm()">
                ➕ Tambah Form
            </button>

            <hr>

            <p>
                Tiada form lagi.
            </p>

        </div>
    `;
}