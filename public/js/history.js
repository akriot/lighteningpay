$(function(){
    $("#menu").load("header.html");
  });

$(document).ready(function() {
    const token = localStorage.getItem('token');
    $.ajax({
        url: '/api/payments',
        type: 'GET',
        headers: {
            Authorization: token
        },
        success: function(response) {
            const payments = response.payments;
            if (payments.length > 0) {
                const $table = $('#paymentsTable');
                const $tbody = $table.find('tbody');
                $tbody.empty(); // Clear any existing rows

                payments.forEach(payment => {
                    const $row = $('<tr>');
                    $row.append(`<td>${payment.id}</td>`);
                    $row.append(`<td>${payment.amount}</td>`);
                    $row.append(`<td>${payment.rate}</td>`);
                    $row.append(`<td>${payment.confirmed}</td>`);
                    $row.append(`<td>${new Date(payment.created).toLocaleString()}</td>`);
                    $tbody.append($row);
                });

                $table.show();
                
                $('#message').hide();
            } else {
                $('#message').text('No transactions available').show();
                $('#paymentsTable').hide();
            }
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = "/";
}
