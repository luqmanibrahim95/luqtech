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

                        <button
                            onclick="deleteForm(${form.id})">

                            🗑 Delete

                        </button>

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

        <br><br>

        <label>Linked Procedure</label>
        <br>

        <select id="linkedProcedure">

            <option value="">
                -- Tiada --
            </option>

        </select>

        <button
            onclick="saveForm()">

            Simpan

        </button>

        <button
            onclick="loadFormList()">

            Batal

        </button>

    `;
    loadProcedureOptions();
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

    const linkedProcedure =
    document.getElementById(
        'linkedProcedure'
    ).value;

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
                        form_name: formName,
                        linked_procedure_id:
                            linkedProcedure || null
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

                        <button
                            onclick="
                                deleteField(
                                    ${field.id},
                                    ${form.id}
                                )
                            ">

                            🗑 Delete

                        </button>

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

            <br><br>

            <button
                onclick="previewForm(${form.id})">

                👁 Preview Form

            </button>

            <button
                onclick="viewRecords(${form.id})">

                📝 Records

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

async function previewForm(id) {

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

        `;

        result.fields.forEach(field => {

            html += `
                <div>

                    <label>
                        ${field.field_label}
                    </label>

                    <br>
            `;

            if (
                field.field_type === 'text'
            ) {

                html += `
                    <input
                        type="text"
                        data-field-id="${field.id}"
                        class="form-input"
                        style="
                            width:300px;
                        ">
                `;

            }

            else if (
                field.field_type === 'textarea'
            ) {

                html += `
                    <textarea
                        data-field-id="${field.id}"
                        class="form-input"
                        style="
                            width:500px;
                            height:100px;
                        ">
                    </textarea>
                `;

            }

            else if (
                field.field_type === 'date'
            ) {

                html += `
                    <input
                        type="date"
                        data-field-id="${field.id}"
                        class="form-input">
                `;

            }

            else if (
                field.field_type === 'dropdown'
            ) {

                html += `
                    <select
                    data-field-id="${field.id}"
                    class="form-input">
                        <option>
                            Pilih
                        </option>
                    </select>
                `;

            }

            html += `
                    <br><br>

                </div>
            `;

        });

        html += `

            <button
                onclick="submitForm(${form.id})">

                Submit

            </button>

            <button
                onclick="openForm(${form.id})">

                ← Builder

            </button>

        `;

        document.querySelector(
            '.center-panel'
        ).innerHTML = html;

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}

async function submitForm(formId) {

    const inputs =
        document.querySelectorAll(
            '.form-input'
        );

    const values = [];

    inputs.forEach(input => {

        values.push({

            field_id:
                input.dataset.fieldId,

            value:
                input.value

        });

    });

    try {

        const response =
            await fetch(
                '/api/forms/submit',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({

                        form_id: formId,

                        values

                    })
                }
            );

        const result =
            await response.json();

        if (result.success) {

            alert(
                'Form berjaya dihantar.'
            );

        } else {

            alert(
                'Gagal submit.'
            );

        }

    } catch (err) {

        console.error(err);

        alert(
            'Ralat sistem.'
        );

    }

}

async function viewRecords(formId) {

    try {

        const response =
            await fetch(
                `/api/forms/records/${formId}`
            );

        const result =
            await response.json();

        let html = `

            <h2>
                📝 Records
            </h2>

            <hr>

        `;

        if (
            result.records.length === 0
        ) {

            html += `
                <p>
                    Tiada record.
                </p>
            `;

        } else {

            result.records.forEach(record => {

                html += `

                    <div>

                        Record #${record.id}

                        <br>

                        ${record.submitted_at}

                        <br><br>

                        <button
                            onclick="
                                openRecord(
                                    ${record.id},
                                    ${formId}
                                )
                            ">

                            👁 View

                        </button>

                        <hr>

                    </div>

                `;

            });

        }

        html += `

            <button
                onclick="openForm(${formId})">

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

async function openRecord(
    recordId,
    formId
) {

    try {

        const response =
            await fetch(
                `/api/forms/record/${recordId}`
            );

        const result =
            await response.json();

        let html = `

            <h2>
                📝 Record Detail
            </h2>

            <hr>

        `;

        result.values.forEach(item => {

            html += `

                <p>

                    <strong>

                        ${item.field_label}

                    </strong>

                    <br>

                    ${item.field_value}

                </p>

                <hr>

            `;

        });

        html += `

            <button
                onclick="
                    viewRecords(
                        ${formId}
                    )
                ">

                ← Records

            </button>

        `;

        document.querySelector(
            '.center-panel'
        ).innerHTML = html;

    } catch (err) {

        console.error(err);

    }

}

async function loadProcedureOptions() {

    try {

        const response =
            await fetch(
                '/api/procedures/list'
            );

        const result =
            await response.json();

        const select =
            document.getElementById(
                'linkedProcedure'
            );

        result.procedures.forEach(proc => {

            select.innerHTML += `
                <option value="${proc.id}">
                    ${proc.procedure_code}
                    -
                    ${proc.procedure_name}
                </option>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

async function deleteField(
    fieldId,
    formId
) {

    if (
        !confirm(
            'Padam field ini?'
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/forms/field/delete/${fieldId}`,
                {
                    method: 'DELETE'
                }
            );

        const result =
            await response.json();

        if (result.success) {

            openForm(formId);

        } else {

            alert(
                'Gagal padam field.'
            );

        }

    } catch (err) {

        console.error(err);

        alert(
            'Ralat sistem.'
        );

    }

}

async function deleteForm(id) {

    if (
        !confirm(
            'Padam form ini?'
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/forms/delete/${id}`,
                {
                    method: 'DELETE'
                }
            );

        const result =
            await response.json();

        if (result.success) {

            loadFormList();

        } else {

            alert('Gagal padam.');

        }

    } catch (err) {

        console.error(err);

        alert('Ralat sistem.');

    }

}