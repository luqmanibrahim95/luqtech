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

                        <strong
                            style="cursor:pointer;color:blue"
                            onclick="openForm(${form.id})">

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

async function openForm(id) {

    try {

        const response =
            await fetch(
                `/api/forms/detail/${id}`
            );

        const result =
            await response.json();

        if (!result.success) {

            alert('Form tidak dijumpai.');
            return;

        }

        const form =
            result.form;

        let html = `

            <h2>
                📋 ${form.form_name}
            </h2>

            <p>
                <strong>Code:</strong>
                ${form.form_code}
            </p>

            <hr>

            <h3>Fields</h3>

        `;

        if (result.fields.length === 0) {

            html += `
                <p>
                    Tiada field lagi.
                </p>
            `;

        } else {

            result.fields.forEach(field => {

                html += `
                    <div>

                        ${field.field_label}

                        <small>
                            (${field.field_type})
                        </small>

                    </div>

                    <br>
                `;

            });

        }

        html += `

            <hr>

            <h3>Tambah Field</h3>

            <label>Field Label</label>
            <br>

            <input
                type="text"
                id="fieldLabel">

            <br><br>

            <label>Field Type</label>
            <br>

            <select id="fieldType">

                <option value="text">
                    Text
                </option>

                <option value="textarea">
                    Text Area
                </option>

                <option value="date">
                    Date
                </option>

                <option value="dropdown">
                    Dropdown
                </option>

            </select>

            <br><br>

            <button
                onclick="saveField(${form.id})">

                ➕ Tambah Field

            </button>

            <button
                onclick="loadFormList()">

                ← Back

            </button>

        `;

        document.querySelector(
            '.center-panel'
        ).innerHTML = html;

    } catch (err) {

        console.error(err);

    }

}

async function saveField(formId) {

    const fieldLabel =
        document.getElementById(
            'fieldLabel'
        ).value.trim();

    const fieldType =
        document.getElementById(
            'fieldType'
        ).value;

    if (!fieldLabel) {

        alert('Isi nama field.');

        return;

    }

    try {

        const response =
            await fetch(
                '/api/forms/field/create',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        form_id: formId,
                        field_label: fieldLabel,
                        field_type: fieldType
                    })
                }
            );

        const result =
            await response.json();

        if (result.success) {

            openForm(formId);

        }

    } catch (err) {

        console.error(err);

    }

}