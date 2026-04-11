let button = document.getElementById("first_button")
let login1 = document.getElementById("login1")
button.addEventListener('click', function(event){
    if(login1){
        const role = login1.getAttribute("data-role")
        if(role === "user"){
            document.getElementById("comment_form").style.display = 'block'
        }
        else{
            alert("Only Customer Can Comment") 
            return;
        }
    }
    else{
        alert("Please Login First");
        login_popup();
    }
})

const likeBtn = document.getElementById("detail-like-btn");

if (likeBtn) {
    likeBtn.addEventListener("click", function () {
        const restaurantId = window.location.pathname.split("/").pop();

        fetch(`/api/restaurant/${restaurantId}`)
            .then(r => r.json())
            .then(store => {
                return fetch('/api/likes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(store)
                });
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    if (data.already_added) {
                        alert('Already added');
                    } else {
                        alert('Added to like list');
                    }
                } else {
                    alert(data.message || 'Failed to add to like list');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Error occurred');
            });
    });
}