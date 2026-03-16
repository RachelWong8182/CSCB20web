// ===== LOGIN STATE =====
let loggedIn = false;


// ===== LOGIN POPUP =====
function login_popup(){

    fetch('pop_up.html')
        .then(rawfile => rawfile.text())
        .then(html => {

            document.getElementById('modal-container').innerHTML = html;

            document.getElementById('login-popup').style.display = 'flex';

        });

}


// ===== REGISTER POPUP =====
function register_popup(){

    document.getElementById("login-popup").style.display = "none";

    document.getElementById("register-popup").style.display = "flex";

}

function back_to_login(){

    document.getElementById("login-popup").style.display = "flex";

    document.getElementById("register-popup").style.display = "none";

}


// ===== LOGIN SUCCESS =====
function login_success(){

    loggedIn = true;

    document.getElementById("login-popup").style.display = "none";

}


// ===== WAIT UNTIL PAGE LOAD =====
window.onload = function(){

    const loginButton = document.getElementById("login-button");

    const settingMenu = document.getElementById("settingMenu");


    loginButton.addEventListener("click", function(event){

        event.stopPropagation();

        // Guest user
        if(!loggedIn){

            login_popup();

            return;

        }

        // Logged in user
        if(settingMenu.style.display === "block"){

            settingMenu.style.display = "none";

        } else {

            settingMenu.style.display = "block";

        }

    });


    // Close menu if click outside
    document.addEventListener("click", function(event){

        if(!loginButton.contains(event.target) &&
           !settingMenu.contains(event.target)){

            settingMenu.style.display = "none";

        }

    });

}