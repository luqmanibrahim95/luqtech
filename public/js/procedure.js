// procedure.js

function loadProcedureList() {

    const centerPanel = document.querySelector('.center-panel');

    centerPanel.innerHTML = `
        <div class="procedure-page">
            <h2>📄 Senarai Prosedur</h2>
            <hr>

            <div class="procedure-container">
                <p>Tiada prosedur lagi.</p>
            </div>
        </div>
    `;
}