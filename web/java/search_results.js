const searchInput = document.getElementById('searchbox');
const filterButtons = document.querySelectorAll('.filter-btn');
const restaurantList = document.getElementById('restaurantList');

let restaurantCards = [];

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
}

function createCard(store) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.name = store.name || '';
    card.dataset.rating = store.rating || '0';
    card.dataset.price = store.price || '$0';

    card.innerHTML = `
        <div class="restaurant-info">
            <div class="restaurant-name">${store.name || 'Unnamed Restaurant'}</div>
            <div class="restaurant-meta">${store.cuisine || 'Unknown Cuisine'}</div>
            <div class="restaurant-meta">⭐ ${store.rating || 0}</div>
            <div class="restaurant-meta">📍 ${store.address || 'Address not provided'}</div>
            <div class="restaurant-meta">💰 ${store.price || 'N/A'} / person</div>
            <div class="restaurant-meta">🕐 ${store.hours || 'Hours not provided'}</div>
            ${store.description ? `<div class="restaurant-meta">${store.description}</div>` : ''}
        </div>

        <div style="margin-left:auto; display:flex; align-items:center; gap:12px;">
            ${store.photo_url ? `<img src="${store.photo_url}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;">` : ''}
            <button class="like-btn" type="button" style="width:42px;height:42px;border:none;border-radius:50%;background:white;font-size:24px;cursor:pointer;">♡</button>
        </div>
    `;

    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        fetch('/api/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(store)
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
        });
    });

    card.addEventListener('click', () => {
        window.location.href = '/restaurant/' + store.id;
    });

    return card;
}

function loadSearchResults() {
    const q = getQueryParam('q').trim();

    if (!q) {
        restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">Please enter a restaurant name.</p>';
        return;
    }

    searchInput.value = q;

    fetch(`/api/restaurants/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
            restaurantList.innerHTML = '';
            restaurantCards = [];

            if (!data.restaurants || data.restaurants.length === 0) {
                restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">No matching restaurants found.</p>';
                return;
            }

            data.restaurants.forEach(store => {
                const card = createCard(store);
                restaurantList.appendChild(card);
                restaurantCards.push(card);
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
    loadSearchResults();

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = searchInput.value.trim();
            window.location.href = `/search_results.html?q=${encodeURIComponent(value)}`;
        }
    });
});