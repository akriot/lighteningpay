document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('/api/register', {
            user: {
                username: username,
                password: password
            }
        });
        console.log("Register Response : ", response);
        alert('Registration successful');
        window.location.href = "/";
    } catch (error) {
        alert(error.response.data.error);
        console.error(error);
    }
});
