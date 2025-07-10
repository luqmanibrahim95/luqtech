document.querySelector('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('[name=email]').value;
  const password = document.querySelector('[name=password]').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (result.success) {
      window.location.href = '/dashboard.html';
    } else {
      document.getElementById('error').textContent = result.message;
    }
  } catch (err) {
    document.getElementById('error').textContent = 'Ralat pelayan 😢';
  }
});
