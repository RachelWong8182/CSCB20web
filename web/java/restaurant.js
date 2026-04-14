// ===== Load restaurant info on page load =====
document.addEventListener('DOMContentLoaded', () => {
    const restaurantId = window.location.pathname.split("/").pop();

    fetch(`/api/restaurant/${restaurantId}`)
        .then(r => r.json())
        .then(store => {
            if (!store || store.success === false) return;

            document.title = store.name || 'Restaurant';

            document.getElementById('detail-name').textContent = store.name || 'Unnamed Restaurant';

            const cuisineEl = document.getElementById('detail-cuisine');
            cuisineEl.textContent = store.cuisine || '';
            cuisineEl.style.display = store.cuisine ? 'inline-block' : 'none';

            document.querySelector('#detail-address span').textContent = store.address || 'Not provided';
            document.querySelector('#detail-price span').textContent   = store.price   || 'N/A';
            document.querySelector('#detail-hours span').textContent   = store.hours   || 'Not provided';
            document.getElementById('detail-description').textContent  = store.description || '';

            if (store.photo_url) {
                const photo = document.getElementById('detail-photo');
                const placeholder = document.getElementById('detail-photo-placeholder');
                photo.src = store.photo_url;
                photo.style.display = 'block';
                placeholder.style.display = 'none';
            }
        });
});


// ===== Comment button =====
let button = document.getElementById("first_button");
let login1 = document.getElementById("login1");

button.addEventListener('click', function(event) {
    if (login1) {
        const role = login1.getAttribute("data-role");
        if (role === "user") {
            document.getElementById("comment_form").style.display = 'block';
        } else {
            alert("Only customers can comment.");
            return;
        }
    } else {
        alert("Please login first.");
        login_popup();
    }
});


// ===== Like button =====
const likeBtn = document.getElementById("detail-like-btn");

if (likeBtn) {
    likeBtn.addEventListener("click", function () {
        const restaurantId = window.location.pathname.split("/").pop();

        fetch(`/api/restaurant/${restaurantId}`)
            .then(r => r.json())
            .then(store => {
                return fetch('/api/likes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(store)
                });
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    if (data.already_added) {
                        alert('Already added to likes.');
                    } else {
                        alert('Added to like list!');
                    }
                } else {
                    alert(data.message || 'Failed to add to like list.');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Error occurred.');
            });
    });
}