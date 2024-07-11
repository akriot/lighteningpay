$(function(){
    $("#menu").load("header.html");
});

$(document).ready(function () { 
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
    }
    $.ajax({
        url: '/api/payments',
        type: 'GET',
        headers: {
            Authorization: token
        },
        success: function(response) {
            $('#balance').text(`₹${response.totals.INR.fiat}`);
            $('#sats_balance').text(`⚡${response.totals.INR.sats}`);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
        return;
    }
    const username = localStorage.getItem('username');
    document.getElementById('username').textContent = username;
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = "/";
}
