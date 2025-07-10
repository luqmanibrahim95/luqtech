document.querySelector('#signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageBox = document.getElementById('message');

  const data = {
    first_name: document.querySelector('[name=first_name]').value,
    last_name: document.querySelector('[name=last_name]').value,
    gender: document.querySelector('[name=gender]').value,
    email: document.querySelector('[name=email]').value,
    password: document.querySelector('[name=password]').value,
    repassword: document.querySelector('[name=repassword]').value
  };

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      messageBox.innerHTML = `<span style='color:green;'>${result.message}</span>`;
      document.getElementById('signupForm').reset();
    } else {
      messageBox.innerHTML = `<span style='color:red;'>${result.message}</span>`;
    }

  } catch (err) {
    console.error(err);
    messageBox.innerHTML = `<span style='color:red;'>Ralat semasa sambungan ke server 😢</span>`;
  }
});
