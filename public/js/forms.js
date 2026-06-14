async function loadFormList() {

    const centerPanel =
        document.querySelector('.center-panel');

    centerPanel.innerHTML =
        '<p>Loading...</p>';

    try {

        const response =
            await fetch('/api/forms/list');

        const result =
            await response.json();

        let html = `
            <div class="form-page">

                <h2>📋 Senarai Form</h2>

                <button onclick="showAddForm()">
                    ➕ Tambah Form
                </button>

                <hr>
        `;

        if (
            !result.forms ||
            result.forms.length === 0
        ) {

            html += `
                <p>Tiada form lagi.</p>
            `;

        } else {

            result.forms.forEach(form => {

                html += `
                    <div class="form-item">

                        <strong>
                            ${form.form_code}
                        </strong>

                        <br>

                        ${form.form_name}

                        <hr>

                    </div>
                `;

            });

        }

        html += `
            </div>
        `;

        centerPanel.innerHTML = html;

    } catch (err) {

        console.error(err);

        centerPanel.innerHTML =
            '<p>Ralat sistem.</p>';

    }

}

function showAddForm() {

    const centerPanel =
        document.querySelector('.center-panel');

    centerPanel.innerHTML = `

        <h2>📋 Tambah Form</h2>

        <label>Kod Form</label>
        <br>

        <input
            type="text"
            id="formCode">

        <br><br>

        <label>Nama Form</label>
        <br>

        <input
            type="text"
            id="formName">

        <br><br>

        <button
            onclick="saveForm()">

            Simpan

        </button>

        <button
            onclick="loadFormList()">

            Batal

        </button>

    `;
}

async function saveForm() {

    const formCode =
        document.getElementById(
            'formCode'
        ).value.trim();

    const formName =
        document.getElementById(
            'formName'
        ).value.trim();

    if (!formCode || !formName) {

        alert(
            'Sila lengkapkan maklumat.'
        );

        return;

    }

    try {

        const response =
            await fetch(
                '/api/forms/create',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        form_code: formCode,
                        form_name: formName
                    })
                }
            );

        const result =
            await response.json();

        if (result.success) {

            alert(
                'Form berjaya disimpan.'
            );

            loadFormList();

        }

    } catch (err) {

        console.error(err);

        alert(
            'Ralat sistem.'
        );

    }

}