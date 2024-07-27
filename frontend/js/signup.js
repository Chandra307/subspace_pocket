document.getElementById('signup-form').addEventListener('submit', async function(event) {
    try {

        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const response = await axios.post('http://localhost:3000/user/signup', { username, email, password });
        console.log(response);
        
        if (response.status === 201) {
            alert('Signup successful!');
            window.location.href = './login.html'; 
        } else {
            alert('Signup failed!');
        }
    }
    catch (err) {
        console.log(err);
        alert(err.response.data.reason);
    }
});
