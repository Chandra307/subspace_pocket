document.getElementById('login-form').addEventListener('submit', async function(event) {
    try {

        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const response = await axios.post('/user/login',{ email, password });
        
        if (response.status === 200) {
            alert('Login successful!');
            localStorage.setItem("token", response.data.token);
            window.location.href = './dashboard.html'; // Redirect to user dashboard
        } else {
            alert('Login failed!');
        }
    } catch (err) {
        console.log(err);
        alert(err.response.data.reason);
    }
});
