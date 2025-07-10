// edit_profile.js

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function openProfile() {
  Promise.all([
    fetch('/api/check-user').then(res => res.json()),
    fetch('/api/profile').then(res => res.json())
  ])
  .then(([userRes, profileRes]) => {
    const user = userRes.user;
    const profile = profileRes.profile || {};

    document.querySelector('.center-panel').innerHTML = `
      <h2>🧑 Profil Pengguna</h2>
      <form id="profileForm">
        <label>Nama Penuh:</label>
        <input type="text" name="fullname" value="${user.fullname}" readonly><br><br>

        <label>Email:</label>
        <input type="email" name="email" value="${user.email}" readonly><br><br>

        <label>Nombor Telefon:</label>
        <input type="text" name="phone" value="${profile.phone || ''}"><br><br>

        <label>Tarikh Lahir:</label>
        <input type="date" name="birthdate" value="${formatDateForInput(profile.birthdate)}"><br><br>

        <label>Alamat:</label>
        <textarea name="address">${profile.address || ''}</textarea><br><br>

        <label>Jawatan:</label>
        <input type="text" name="position" value="${profile.position || ''}"><br><br>

        <button type="submit">💾 Simpan</button>
      </form>
    `;

    document.getElementById('profileForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert('Maklumat profil berjaya dikemaskini!');
        } else {
          alert('Ralat: ' + result.message);
        }
      });
    });
  })
  .catch(err => {
    console.error('❌ Gagal buka profile:', err);
  });
}
