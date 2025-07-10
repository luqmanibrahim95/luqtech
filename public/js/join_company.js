function joinCompany(companyName) {
  if (!confirm(`Sahkan anda ingin menyertai syarikat "${companyName}"?`)) return;

  fetch('/api/join-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_name: companyName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('✅ Berjaya menyertai syarikat!');
        location.reload(); // Refresh supaya dashboard update
      } else {
        alert('❌ ' + data.message);
      }
    })
    .catch(err => {
      console.error('Error join syarikat:', err);
      alert('❌ Ralat semasa proses join.');
    });
}
