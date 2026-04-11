const searchInput = document.getElementById('searchbox');
const filterButtons = document.querySelectorAll('.filter-btn');
const restaurantList = document.getElementById('restaurantList');

let restaurantCards = [];

function createLikedCard(store) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.name = store.name || '';
    card.dataset.rating = store.rating || '0';
    card.dataset.price = store.price || '$0';

    card.innerHTML = `
        <div class="restaurant-info">
            <div class="restaurant-name">${store.name || 'Unnamed Restaurant'}</div>
            <div class="restaurant-meta">📍 ${store.address || 'Address not provided'}</div>
            <div class="restaurant-meta">💰 ${store.price || 'N/A'} / person</div>
            <div class="restaurant-meta">🕐 ${store.hours || 'Hours not provided'}</div>
            ${store.description ? `<div class="restaurant-meta">${store.description}</div>` : ''}
        </div>

        <div style="margin-left:auto; display:flex; align-items:center; gap:12px;">
            ${store.photo_url ? `<img src="${store.photo_url}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;">` : ''}
            <button class="delete-like-btn" type="button" style="width:42px;height:42px;border:none;border-radius:50%;background:white;font-size:20px;cursor:pointer;">🗑️</button>
        </div>
    `;

    const deleteBtn = card.querySelector('.delete-like-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        fetch('/api/likes', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: store.name })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                card.remove();
                restaurantCards = restaurantCards.filter(c => c !== card);

                if (restaurantCards.length === 0) {
                    restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">No liked restaurants yet.</p>';
                }
            } else {
                alert(data.message || 'Failed to remove from like list');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Error occurred');
        });
    });

    card.addEventListener('click', () => {
        restaurantCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });

    return card;
}

function loadLikedRestaurants() {
    fetch('/api/likes')
        .then(r => r.json())
        .then(data => {
            restaurantList.innerHTML = '';
            restaurantCards = [];

            if (!data.success) {
                restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">Please log in to view your liked restaurants.</p>';
                return;
            }

            if (!data.likes || data.likes.length === 0) {
                restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">No liked restaurants yet.</p>';
                return;
            }

            data.likes.forEach(store => {
                const card = createLikedCard(store);
                restaurantList.appendChild(card);
                restaurantCards.push(card);
            });

            attachSearch();
        });
}

function attachSearch() {
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.trim().toLowerCase();
        restaurantCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            card.style.display = name.includes(keyword) ? 'flex' : 'none';
        });
    });
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.filter;
        const visibleCards = restaurantCards.filter(card => card.style.display !== 'none');

        visibleCards.sort((a, b) => {
            if (type === 'rating') {
                return Number(b.dataset.rating) - Number(a.dataset.rating);
            }
            if (type === 'price') {
                return extractPrice(a.dataset.price) - extractPrice(b.dataset.price);
            }
            return a.dataset.name.localeCompare(b.dataset.name, undefined, { numeric: true });
        });

        visibleCards.forEach(card => restaurantList.appendChild(card));
    });
});

function extractPrice(priceText) {
    const match = priceText ? priceText.match(/\d+/) : null;
    return match ? Number(match[0]) : 0;
}

document.addEventListener('DOMContentLoaded', () => {
    loadLikedRestaurants();
});