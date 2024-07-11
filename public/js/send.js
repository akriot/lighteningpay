$(function(){
    $("#menu").load("header.html");
  });
document.getElementById('sendForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const address = document.getElementById('address').value;
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post('/api/payments', {
            payreq: address
        }, {
            headers: {
                Authorization: `${token}`
            }
        });
        alert(response.data);
    } catch (error) {
        alert(error.response.data.error);
    }
});

document.getElementById('sendToUsernameForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const amount = document.getElementById('amount').value;
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post('/api/username-payments', {
            username: username,
            amount: amount
        }, {
            headers: {
                Authorization: `${token}`
            }
        });
        if (response.data.confirmed === true) { 
            username.value = "";
            amount.value = "";
            alert("Amount sent successfully");
        }
    } catch (error) {
        alert(error.response.data.error);
    }
    
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = "/";
}

function showForm(formId) {
    const form1 = document.getElementById("sendForm");
    const form2 = document.getElementById("sendToUsernameForm");
    form1.style.display = formId === "sendForm" ? "block" : "none";
    form2.style.display = formId === "sendToUsernameForm" ? "block" : "none";
}

const form1Btn = document.getElementById("form1Btn");
const form2Btn = document.getElementById("form2Btn");
form1Btn.addEventListener("click", function () {
    showForm("sendForm");
});
form2Btn.addEventListener("click", function () {
 showForm("sendToUsernameForm");
});

showForm("sendForm");
