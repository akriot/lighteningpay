$(function(){
    $("#menu").load("header.html");
    // $("#footer").load("footer.html");
  });
document.getElementById('receiveForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const token = localStorage.getItem('token');

    try {
        const response = await axios.post('/api/invoice', {
            invoice: {
                amount: amount,
                type: "lightning"
            }
        }, {
            headers: {
                Authorization: `${token}`
            }
        });
        console.log("Response : ", response.data.qr_code_image);
        $(".container-success").css('visibility', 'visible');
        $("#text-to-copy").text(response.data.hash);
        $("#qr-code").attr("src", response.data.qr_code_image);
    } catch (error) {
        alert('Failed to create invoice');
        console.error(error);
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = "/";
}

function copyText() {
        var text = document.getElementById("text-to-copy").innerText;
        navigator.clipboard.writeText(text).then(function() {
            alert('Text copied to clipboard');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }