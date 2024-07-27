const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('Login again');
        window.location.href = './login.html';
    }
});

document.getElementById('create-account-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const accountType = document.getElementById('accountType').value;

    try {
        await axios.post('http://localhost:3000/user/account', { accountType }, { headers: { "Authorization": token } });

        alert('Account created successfully!');
    }
    catch (error) {
        console.error('Error creating account:', error);
    }
});

document.getElementById('logout').onclick = () => {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}