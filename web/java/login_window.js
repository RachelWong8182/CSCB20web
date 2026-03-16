function login_popup(){
    fetch('pop_up.html')
        .then(rawfile => rawfile.text())
        .then(html => {
        document.getElementById('modal-container').innerHTML = html;
        document.getElementById('login-popup').style.display = 'flex';
        });
}

function register_popup(){
    fetch('pop_up.html')
    .then(rawfile => rawfile.text())
    .then(html => {
    document.getElementById("registerForm").style.display = "block";
    });
}