function requestJoinCompany(companyName) {
  fetch('/api/join-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_name: companyName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message || "Permintaan berjaya dihantar.");
      } else {
        alert(data.message || "Permintaan gagal.");
      }
    })
    .catch(err => {
      console.error('Ralat hantar permintaan:', err);
      alert("Ralat semasa menghantar permintaan.");
    });
}
