function toggleAdmin(event, userId, companyId, makeAdmin) {
    event.preventDefault();

    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('company_id', companyId);
    formData.append('make_admin', makeAdmin);

    fetch('toggle_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(response => response.text())
    .then(data => {
        if (data.trim() === "success") {
            alert("Status admin dikemaskini!");
            location.reload();
        } else {
            alert("Ralat: " + data);
        }
    })
    .catch(error => {
        alert("Ralat: " + error);
    });
}
