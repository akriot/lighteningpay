document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await axios.post('/api/login', {
            username: username,
            password: password
        });
        const token = response.data.token;
        const localusername = response.data.user.username;
        localStorage.setItem('token', token);
        localStorage.setItem('username', localusername);
        window.location.href = "/dashboard";
    } catch (error) {
        alert('Login failed', error);
        console.error(error);
    }
});
